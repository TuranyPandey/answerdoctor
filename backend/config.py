import os
from pathlib import Path
from functools import lru_cache
from dotenv import load_dotenv

# Load .env from backend/ or root
base_dir = Path(__file__).resolve().parent
load_dotenv(base_dir / ".env")
load_dotenv(base_dir.parent / ".env")

db_file = (base_dir / "answerdoctor.db").as_posix()

class Settings:
    def __init__(self):
        env_db = os.getenv("DATABASE_URL")
        if env_db and not env_db.startswith("sqlite:///./"):
            self.database_url: str = env_db
        else:
            self.database_url: str = f"sqlite:///{db_file}"
        self.google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", os.getenv("VITE_GOOGLE_CLIENT_ID", ""))
        self.gemini_api_key: str = os.getenv("GEMINI_API_KEY", os.getenv("VITE_GEMINI_API_KEY", ""))
        self.google_vision_api_key: str = os.getenv("GOOGLE_VISION_API_KEY", "")
        self.reka_api_key: str = os.getenv("REKA_API_KEY", "")
        self.secret_key: str = os.getenv("SECRET_KEY", "answerdoctor-secret")
        self.algorithm: str = os.getenv("ALGORITHM", "HS256")
        self.access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
        self.cmi_threshold: float = float(os.getenv("CMI_THRESHOLD", "0.88"))
        self.ras_threshold: float = float(os.getenv("RAS_THRESHOLD", "0.60"))
        self.max_file_size_mb: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
        self.gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self.embedding_model: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        self.allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

    @property
    def origins_list(self):
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

@lru_cache
def get_settings():
    return Settings()

