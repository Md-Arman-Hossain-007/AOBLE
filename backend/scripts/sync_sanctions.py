import asyncio
import sys
import os

# Adjust path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.etl.tasks import run_full_sync
from app.db.session import engine, Base

def main():
    print("🚀 Starting OpenSanctions Manual Sync...")
    
    # 1. Ensure tables exist
    print("📦 Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    # 2. Run the sync
    # Since run_full_sync is a celery task, we can call the function directly
    # if we want it to run synchronously in this process.
    try:
        result = run_full_sync()
        print(f"\n✅ Sync Complete!")
        print(f"📊 Processed Entities: {result.get('processed_entities')}")
    except Exception as e:
        print(f"\n❌ Sync Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
