import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/guilds", tags=["guilds"])


def _gen_guild_code(name: str) -> str:
    clean = "".join([c for c in name if c.isalnum()]).upper()[:4]
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"GUILD-{clean}-{suffix}"


def _seed_default_guilds_if_empty(db: Session):
    if db.query(models.Guild).count() == 0:
        default_guilds = [
            models.Guild(
                name="MIT Engineering Guild",
                domain="mit.edu",
                code="GUILD-MIT-1001",
                description="Massachusetts Institute of Technology — Official Academic Reasoning Guild & Exam Repository",
                icon_badge="🏛️",
            ),
            models.Guild(
                name="Stanford Academic Guild",
                domain="stanford.edu",
                code="GUILD-STAN-2002",
                description="Stanford University — School of Engineering Cohort & Rubric Bank",
                icon_badge="🌲",
            ),
            models.Guild(
                name="IIT Bombay Engineering Guild",
                domain="iitb.ac.in",
                code="GUILD-IITB-3003",
                description="Indian Institute of Technology Bombay — Department of Mechanical & Electrical Engineering",
                icon_badge="🎓",
            ),
        ]
        db.add_all(default_guilds)
        db.commit()


@router.post("", response_model=schemas.GuildOut)
def create_guild(
    body: schemas.GuildCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Create a new University Guild and auto-enroll the creator."""
    existing = db.query(models.Guild).filter(models.Guild.name.ilike(body.name)).first()
    if existing:
        raise HTTPException(409, "A University Guild with this name already exists.")

    code = _gen_guild_code(body.name)
    guild = models.Guild(
        name=body.name,
        domain=body.domain.lower(),
        code=code,
        description=body.description,
        icon_badge=body.icon_badge or "🏛️",
    )
    db.add(guild)
    db.commit()
    db.refresh(guild)

    # Auto join creator
    member = models.GuildMember(guild_id=guild.id, user_id=current_user.id)
    db.add(member)
    db.commit()

    return _enrich_guild(guild, db, current_user.id)


@router.get("", response_model=list[schemas.GuildOut])
def list_guilds(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """List all University Guilds ranked by average Rubric Alignment Score (RAS)."""
    _seed_default_guilds_if_empty(db)
    guilds = db.query(models.Guild).all()
    enriched = [_enrich_guild(g, db, current_user.id) for g in guilds]
    # Sort leaderboard by avg_ras descending
    return sorted(enriched, key=lambda x: x.avg_ras or 0.0, reverse=True)


@router.get("/my", response_model=list[schemas.GuildOut])
def list_my_guilds(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Get active user's joined University Guilds."""
    memberships = db.query(models.GuildMember).filter(models.GuildMember.user_id == current_user.id).all()
    guild_ids = [m.guild_id for m in memberships]

    if not guild_ids:
        # Check auto-suggest by domain
        user_domain = current_user.email.split("@")[-1].lower() if "@" in current_user.email else ""
        if user_domain:
            matched_guild = db.query(models.Guild).filter(models.Guild.domain == user_domain).first()
            if matched_guild:
                # Auto join
                new_m = models.GuildMember(guild_id=matched_guild.id, user_id=current_user.id)
                db.add(new_m)
                db.commit()
                guild_ids.append(matched_guild.id)

    guilds = db.query(models.Guild).filter(models.Guild.id.in_(guild_ids)).all()
    return [_enrich_guild(g, db, current_user.id) for g in guilds]


@router.post("/join", response_model=schemas.GuildOut)
def join_guild(
    body: schemas.JoinGuildRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Join a University Guild via code or ID."""
    guild = None
    if body.code:
        guild = db.query(models.Guild).filter(models.Guild.code == body.code.strip().upper()).first()
    elif body.guild_id:
        guild = db.query(models.Guild).filter(models.Guild.id == body.guild_id).first()

    if not guild:
        raise HTTPException(404, "University Guild not found. Check guild code.")

    existing = db.query(models.GuildMember).filter(
        models.GuildMember.guild_id == guild.id,
        models.GuildMember.user_id == current_user.id,
    ).first()
    if existing:
        return _enrich_guild(guild, db, current_user.id)

    member = models.GuildMember(guild_id=guild.id, user_id=current_user.id)
    db.add(member)
    db.commit()

    return _enrich_guild(guild, db, current_user.id)


def _enrich_guild(g: models.Guild, db: Session, user_id: Optional[str] = None) -> schemas.GuildOut:
    member_count = db.query(models.GuildMember).filter(models.GuildMember.guild_id == g.id).count()
    members = db.query(models.GuildMember).filter(models.GuildMember.guild_id == g.id).all()

    # Calculate average RAS across scripts submitted by members of this guild
    member_user_ids = [m.user_id for m in members]
    from sqlalchemy import func
    avg_ras = 0.85 # default rating baseline
    if member_user_ids:
        ras_val = db.query(func.avg(models.Script.ras)).filter(
            models.Script.student_id.in_(member_user_ids),
            models.Script.ras.isnot(None),
        ).scalar()
        if ras_val is not None:
            avg_ras = round(float(ras_val), 4)

    has_joined = False
    if user_id:
        has_joined = any(m.user_id == user_id for m in members)

    out = schemas.GuildOut.model_validate(g)
    out.member_count = member_count
    out.avg_ras = avg_ras
    out.has_joined = has_joined
    out.members = [schemas.GuildMemberOut.model_validate(m) for m in members]
    return out
