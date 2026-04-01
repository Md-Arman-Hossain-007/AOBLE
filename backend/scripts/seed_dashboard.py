import os
import sys
import datetime
import random
import uuid

# Add the backend path to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models import models

def seed_data():
    db = SessionLocal()
    username = "Arman"
    
    # Check if user exists
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        print(f"User {username} not found. Please create it first.")
        return

    print(f"Seeding data for {username}...")
    
    # Clear existing screenings for this user if any (optional, but good for clean seeding)
    # db.query(models.Screening).filter(models.Screening.user_id == username).delete()
    
    statuses = ["Cleared", "Review", "Rejected"]
    risks = ["Low", "Medium", "High"]
    
    first_names = ["James", "Maria", "Robert", "Elena", "Ahmed", "Li", "Sarah", "Oleg", "Aysha", "David"]
    last_names = ["Smith", "Garcia", "Johnson", "Ivanov", "Khan", "Wang", "Muller", "Petrov", "Patel", "Brown"]
    
    for i in range(50):
        screening_id = f"SCR-{1000 + i}"
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        status = random.choices(statuses, weights=[70, 20, 10])[0]
        # Generate some timestamps over the last 30 days
        days_ago = random.randint(0, 30)
        timestamp = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)
        
        screening = models.Screening(
            id=screening_id,
            first_name=first_name,
            last_name=last_name,
            company_name=f"{last_name} Holdings" if random.random() > 0.7 else None,
            date_of_birth="1980-01-01",
            timestamp=timestamp,
            status=status,
            user_id=username,
            match_count=random.randint(0, 5) if status != "Cleared" else 0,
            results={"summary": "Seeded data for dashboard visibility"}
        )
        db.add(screening)
    
    db.commit()
    print("Seeding complete.")
    db.close()

if __name__ == "__main__":
    seed_data()
