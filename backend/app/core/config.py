import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AMLtab API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-amltab-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "amltab")
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    
    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        
    ELASTICSEARCH_URL: str = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    
    DATA_DIR: str = os.getenv("DATA_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data")))
    
    # Email Settings
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "True") == "True"
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "info@amltab.com")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "AMLTAB Support")
    
    FRONTEND_HOST: str = os.getenv("FRONTEND_HOST", "http://localhost:3000")
    YENTE_URL: str = os.getenv("YENTE_URL", "http://localhost:8000")
    YENTE_UPDATE_TOKEN: str = os.getenv("YENTE_UPDATE_TOKEN", "")
    
    # SSO Configuration
    OIDC_ISSUER: str = os.getenv("OIDC_ISSUER", "")
    OIDC_CLIENT_ID: str = os.getenv("OIDC_CLIENT_ID", "")
    OIDC_CLIENT_SECRET: str = os.getenv("OIDC_CLIENT_SECRET", "")
    SAML_IDP_METADATA_URL: str = os.getenv("SAML_IDP_METADATA_URL", "")
    SAML_ENTITY_ID: str = os.getenv("SAML_ENTITY_ID", "")

    class Config:
        case_sensitive = True

settings = Settings()
