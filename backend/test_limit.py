import asyncio
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import models
from app.api.screenings import list_screenings
from app.schemas.screening import ScreeningListEntry
from typing import Optional

async def main():
    db = SessionLocal()
    try:
        # Get any user to test
        user = db.query(models.User).first()
        if not user:
            print("No users found")
            return
            
        print(f"Testing for user: {user.username}")
        
        # Call the actual function
        results = await list_screenings(
            db=db,
            limit=100,
            offset=0,
            type=None,
            current_user=user
        )
        
        print(f"Returned {len(results)} results")
        for i, r in enumerate(results[:5]):
            print(f"[{i}] {r.id} | {r.first_name} {r.last_name} | {r.company_name} | {r.timestamp} | {r.status}")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
