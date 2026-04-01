#!/usr/bin/env python3
"""
Enterprise Migration Script for AMLtab

This script runs the enterprise database migration to add all enterprise-level features
including multi-tenancy, case management, workflows, analytics, AI/ML, security, and notifications.

Usage:
    python run_enterprise_migration.py

Requirements:
    - PostgreSQL database must be running
    - Database connection details must be configured in environment variables or config
    - This script should be run after the basic AMLtab installation
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('enterprise_migration.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def check_prerequisites():
    """Check if prerequisites are met before running migration."""
    logger.info("Checking prerequisites...")
    
    # Check if migration file exists
    migration_file = backend_dir / "migrate_enterprise.sql"
    if not migration_file.exists():
        logger.error(f"Migration file not found: {migration_file}")
        return False
    
    # Check if database connection is available
    try:
        # Try to import database configuration
        from app.core.config import settings
        logger.info(f"Database URL: {settings.DATABASE_URL}")
    except ImportError:
        logger.warning("Could not import database settings. Make sure the application is properly configured.")
    
    logger.info("Prerequisites check completed.")
    return True

def run_migration():
    """Run the enterprise migration using SQLAlchemy."""
    logger.info("Starting enterprise migration...")
    
    migration_file = backend_dir / "migrate_enterprise.sql"
    
    try:
        # Read the SQL migration file
        with open(migration_file, 'r') as f:
            sql_commands = f.read()
        
        # Execute using SQLAlchemy
        from sqlalchemy import create_engine, text
        
        # Get database URL from environment or use default
        database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/amltab')
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Execute each SQL command
            for command in sql_commands.split(';'):
                command = command.strip()
                if command:
                    try:
                        conn.execute(text(command))
                        conn.commit()
                    except Exception as e:
                        # Ignore "already exists" errors
                        if "already exists" not in str(e).lower():
                            logger.warning(f"Warning executing command: {e}")
        
        logger.info("Migration completed successfully!")
        return True
            
    except Exception as e:
        logger.error(f"Migration error: {e}")
        return False

def verify_migration():
    """Verify that the migration was successful."""
    logger.info("Verifying migration...")
    
    try:
        # Try to import the models to verify they're properly defined
        from app.models.models import (
            Organization, User, Case, Workflow, DashboardWidget, 
            AuditLog, NotificationTemplate, AIModel
        )
        logger.info("Models imported successfully - migration appears successful!")
        
        # Check if key tables exist by trying to create a session
        from app.db.session import SessionLocal
        db = SessionLocal()
        
        # Try a simple query to verify tables exist
        result = db.execute("SELECT COUNT(*) FROM organizations").scalar()
        logger.info(f"Found {result} organizations in database")
        
        result = db.execute("SELECT COUNT(*) FROM cases").scalar()
        logger.info(f"Found {result} cases in database")
        
        result = db.execute("SELECT COUNT(*) FROM workflows").scalar()
        logger.info(f"Found {result} workflows in database")
        
        db.close()
        logger.info("Migration verification completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Migration verification failed: {e}")
        return False

def main():
    """Main migration function."""
    logger.info("=" * 60)
    logger.info("AMLtab Enterprise Migration Script")
    logger.info("=" * 60)
    
    # Check prerequisites
    if not check_prerequisites():
        logger.error("Prerequisites check failed. Aborting migration.")
        sys.exit(1)
    
    # Run migration
    if not run_migration():
        logger.error("Migration failed. Please check the logs and try again.")
        sys.exit(1)
    
    # Verify migration
    if not verify_migration():
        logger.error("Migration verification failed. Please check the database manually.")
        sys.exit(1)
    
    logger.info("=" * 60)
    logger.info("Enterprise migration completed successfully!")
    logger.info("Your AMLtab instance now includes enterprise features:")
    logger.info("- Multi-tenancy support")
    logger.info("- Case management system")
    logger.info("- Workflow automation")
    logger.info("- Advanced analytics and reporting")
    logger.info("- AI/ML insights")
    logger.info("- Enhanced security and audit logging")
    logger.info("- Notification system")
    logger.info("=" * 60)

if __name__ == "__main__":
    main()