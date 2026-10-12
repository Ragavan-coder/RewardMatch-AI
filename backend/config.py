import os
from dotenv import load_dotenv

# Load .env file from backend directory and workspace root
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
load_dotenv()


class Settings:
    """Application configuration for RewardMatch AI fintech backend."""
    APP_NAME: str = "RewardMatch AI Backend"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "rewardmatch_fintech_production_secret_2025")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: SQLite fallback, MySQL via DATABASE_URL
    DEFAULT_DB: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rewardmatch.db")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB}")

    # CORS origins
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
