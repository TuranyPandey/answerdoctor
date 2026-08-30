import asyncio, sys, db_migrations
from database import SessionLocal
import models
from routers.scripts import _process_script

async def main():
    db_migrations.run_migrations()
    db = SessionLocal()
    scripts = db.query(models.Script).all()
    print(f"Found {len(scripts)} scripts in DB.")
    for s in scripts:
        print(f"Processing script {s.id} ({s.exam_name})...")
        await _process_script(s.id, b"Given: T1 = 300 K, P1 = 100 kPa. State Identification: u1 = 214.36 kJ/kg, u2 = 460.81 kJ/kg. First Law: Q - W = delta U = m*(u2 - u1). Boundary work W = 69.31 kJ. Total Heat Q = 377.37 kJ. Final Answer verified in kJ.", "text/plain")
        db.refresh(s)
        print(f" -> Result: status={s.status}, score={s.scored_marks}/{s.total_marks}, ras={s.ras}")
    db.close()

if __name__ == "__main__":
    asyncio.run(main())
