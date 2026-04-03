from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..core.config import settings
import os

# Use PostgreSQL as the default for enterprise stability
USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() == "true"

if USE_SQLITE:
    # SQLite database path
    db_path = os.path.join(os.path.dirname(__file__), "../../amltab.db")
    db_path = os.path.abspath(db_path)
    
    # SQLite URL with check_same_thread=False for FastAPI
    SQLITE_URL = f"sqlite:///{db_path}?check_same_thread=false"
    
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
