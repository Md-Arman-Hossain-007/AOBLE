import os
import sys
import datetime
import random
import uuid

# Add the backend path to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models import models

def seed_notifications():
    db = SessionLocal()
    username = "Arman"
    
    # Check if user exists
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        print(f"User {username} not found. Please create it first.")
        return

    print(f"Seeding notifications for {username}...")
    
    # Delete existing data to test clearly
    db.query(models.Notification).filter(models.Notification.user_id == username).delete()
    db.query(models.Screening).filter(models.Screening.user_id == username).delete()

    # Create dummy screenings for the notifications to link to
    screenings = [
        models.Screening(
            id="SCR-1001",
            user_id=username,
            first_name="James",
            last_name="Smith",
            status="Match",
            match_count=2,
            results=[
                {"name": "James Smith", "match_score": 95, "match_type": "Sanction", "details": {"source": "OFAC"}},
                {"name": "James A. Smith", "match_score": 88, "match_type": "Sanction", "details": {"source": "UK HMT"}}
            ]
        ),
        models.Screening(
            id="SCR-1002",
            user_id=username,
            first_name="Maria",
            last_name="Garcia",
            status="Clear",
            match_count=0,
            results=[]
        ),
        models.Screening(
            id="SCR-1003",
            user_id=username,
            first_name="Robert",
            last_name="Johnson",
            status="Review",
            match_count=1,
            results=[
                {"name": "Robert Johnson", "match_score": 82, "match_type": "PEP", "details": {"source": "WorldCheck"}}
            ]
        )
    ]
    for s in screenings:
        db.add(s)
    db.flush()

    notification_templates = [
        {
            "title": "Screening Completed: James Smith",
            "message": "The screening for James Smith has been completed. 2 potential matches found in Sanctions list. Review required.",
            "type": "screening",
            "link": "/screenings/SCR-1001",
            "priority": "high"
        },
        {
            "title": "Welcome to AMLtab!",
            "message": "Your organization has been successfully set up. Start by performing your first entity screening.",
            "type": "system",
            "link": "/dashboard",
            "priority": "normal"
        },
        {
            "title": "Billing Update: Subscription Active",
            "message": "Your Professional Plan trial is active. You have 14 days remaining.",
            "type": "billing",
            "link": "/settings/billing",
            "priority": "normal"
        },
        {
            "title": "Screening Completed: Maria Garcia",
            "message": "The screening for Maria Garcia has been completed. No matches found. Profile cleared.",
            "type": "screening",
            "link": "/screenings/SCR-1002",
            "priority": "normal"
        },
        {
            "title": "Security: Password Changed",
            "message": "Your account password was successfully changed 2 hours ago. If this wasn't you, please contact support.",
            "type": "security",
            "link": "/settings/profile",
            "priority": "high"
        },
        {
            "title": "Screening Completed: Robert Johnson",
            "message": "The screening for Robert Johnson has been completed. 1 PEP match found. Enhanced due diligence recommended.",
            "type": "screening",
            "link": "/screenings/SCR-1003",
            "priority": "medium"
        }
    ]
    
    for i, temp in enumerate(notification_templates):
        # Generate some timestamps over the last 2 days
        hours_ago = i * 4 + random.randint(0, 3)
        created_at = datetime.datetime.utcnow() - datetime.timedelta(hours=hours_ago)
        
        notification = models.Notification(
            id=str(uuid.uuid4()),
            user_id=username,
            title=temp["title"],
            message=temp["message"],
            type=temp["type"],
            priority=temp["priority"],
            link=temp["link"],
            is_read=False if i < 3 else True, # Mix of read/unread
            created_at=created_at
        )
        db.add(notification)
    
    db.commit()
    print("Notification seeding complete.")
    db.close()

if __name__ == "__main__":
    seed_notifications()
