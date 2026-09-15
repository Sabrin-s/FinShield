import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinGuard AI — AML Investigation & Financial Risk Intelligence"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./finguard_aml.db"
    
    # LLM Settings (Optional - fallback to intelligent local rule/pattern engine if not provided)
    OPENAI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o"
    
    # AML Alert Thresholds
    STRUCTURING_THRESHOLD: float = 10000.0
    HIGH_RISK_GEO_THRESHOLD: float = 25000.0
    VELOCITY_WINDOW_HOURS: int = 24
    VELOCITY_COUNT_THRESHOLD: int = 4
    
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
