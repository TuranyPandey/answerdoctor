from sqlalchemy import URL, create_engine, event, inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DB_PATH = os.getenv("ANSWERDOCTOR_DB_PATH", os.path.join(os.path.dirname(__file__), "answerdoctor.db"))


def get_database_url():
    """Build a database URL without interpolating credentials into a string."""
    configured_url = os.getenv("DATABASE_URL")
    if configured_url:
        if configured_url.startswith("postgres://"):
            configured_url = configured_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif configured_url.startswith("postgresql://"):
            configured_url = configured_url.replace("postgresql://", "postgresql+psycopg://", 1)
        return configured_url

    db_host = os.getenv("DB_HOST")
    db_password = os.getenv("DB_PASSWORD")
    if db_host and db_password:
        return URL.create(
            drivername="postgresql+psycopg",
            username=os.getenv("DB_USER", "answerdoctor_admin"),
            password=db_password,
            host=db_host,
            port=int(os.getenv("DB_PORT", "5432")),
            database=os.getenv("DB_NAME", "answerdoctor"),
        )

    return f"sqlite:///{DB_PATH}"


SQLALCHEMY_DATABASE_URL = get_database_url()
IS_SQLITE = (
    SQLALCHEMY_DATABASE_URL.startswith("sqlite")
    if isinstance(SQLALCHEMY_DATABASE_URL, str)
    else SQLALCHEMY_DATABASE_URL.drivername.startswith("sqlite")
)

connect_args = {"check_same_thread": False} if IS_SQLITE else {}
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
)

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if not IS_SQLITE:
        return
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_auth_schema():
    """Apply the small additive auth migration to existing prototype databases."""
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "password_hash" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))
