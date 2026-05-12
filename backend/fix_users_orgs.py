import sys
import os
import uuid
from datetime import datetime

# Add the current directory to sys.path to allow importing from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.models import User, Organization

def fix_users():
    db = SessionLocal()
    try:
        users_without_org = db.query(User).filter(User.org_id == None).all()
        print(f"Found {len(users_without_org)} users without an organization.")
        
        for user in users_without_org:
            print(f"Fixing user: {user.username}")
            
            # Create default organization
            org_name = f"{user.full_name or user.username}'s Organization"
            org = Organization(
                id=str(uuid.uuid4()),
                name=org_name,
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(org)
            db.flush()
            
            # Link user to organization
            user.org_id = org.id
            db.add(user)
            print(f"  -> Linked to new org: {org_name}")
            
        db.commit()
        print("Successfully fixed all users.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_users()
