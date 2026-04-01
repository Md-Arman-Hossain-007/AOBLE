import datetime
import random
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Adjust path to import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.models.models import User, Screening, Monitoring
from app.core.security import get_password_hash

DATABASE_URL = "postgresql://postgres:postgres@db/amltab"

def seed_data():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # 1. Create tester user if not exists
        tester = db.query(User).filter(User.username == "tester").first()
        if not tester:
            tester = User(
                username="tester",
                email="tester@amltab.com",
                full_name="Tester Auditor",
                api_key="amltab_test_key_123",
                password_hash=get_password_hash("Password123!"),
                is_active=True
            )
            db.add(tester)
            db.commit()
            print("Created tester user")

        # 2. Add screenings for the last 12 months
        now = datetime.datetime.utcnow()
        statuses = ["Clear", "Review", "Match"]
        
        # Clear existing screenings for tester to avoid mess
        db.query(Screening).filter(Screening.user_id == "tester").delete()
        
        print("Seeding screenings...")
        for i in range(365): # Last year
            timestamp = now - datetime.timedelta(days=i)
            # Random number of screenings per day (gaussian-ish)
            count = random.randint(5, 25)
            for _ in range(count):
                is_company = random.random() > 0.7
                s = Screening(
                    id=str(uuid.uuid4()),
                    user_id="tester",
                    first_name=None if is_company else f"Person_{random.randint(1,1000)}",
                    last_name=None if is_company else "Doe",
                    company_name=f"Corp_{random.randint(1,500)} Ltd" if is_company else None,
                    timestamp=timestamp - datetime.timedelta(hours=random.randint(0,23)),
                    status=random.choices(statuses, weights=[70, 20, 10])[0],
                    match_count=random.randint(0, 5) if random.random() > 0.7 else 0,
                    results=[]
                )
                db.add(s)
            
            if i % 30 == 0:
                print(f"  Processed {i} days...")
                db.commit()

        # 3. Add some monitoring
        db.query(Monitoring).filter(Monitoring.user_id == "tester").delete()
        for i in range(50):
            m = Monitoring(
                monitoring_id=str(uuid.uuid4()),
                user_id="tester",
                status="active",
                entity_name=f"Monitored_Entity_{i}",
                created_at=now - datetime.timedelta(days=random.randint(1, 200)),
                total_alerts=random.randint(0, 10)
            )
            db.add(m)
        
        db.commit()
        print("Successfully seeded dummy data!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
