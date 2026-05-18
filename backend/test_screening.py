import httpx
import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
import os
import sys

# Get DB URL from env or use default for docker setup
DB_URL = "postgresql://postgres:postgres@db:5432/amltab"

def get_api_key():
    from app.models.models import User
    from app.db.session import SessionLocal
    db = SessionLocal()
    user = db.query(User).first()
    if not user:
        return None
    return user.api_key

async def run_test():
    api_key = get_api_key()
    if not api_key:
        print("No users found in database with an API key")
        return
        
    print(f"Using API Key: {api_key}")
    
    # 1. Test standard screening (No match expected for low risk country with no name match)
    headers = {
        "amltab-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    print("\n--- Testing High Risk Country Auto-Escalation ---")
    payload_high_risk = {
        "type": "individual",
        "first_name": "Test",
        "last_name": "Entity",
        "country": "vu", # Vanuatu - High Risk
        "threshold": 0.85
    }
    
    payload_low_risk = {
        "type": "individual",
        "first_name": "Test",
        "last_name": "Entity",
        "country": "us", # US - Low Risk
        "threshold": 0.85
    }
    
    async with httpx.AsyncClient() as client:
        # High Risk
        res_hr = await client.post("http://localhost:8000/api/v1/amltab/screenings/", json=payload_high_risk, headers=headers)
        print(f"High Risk (Vanuatu) response status: {res_hr.status_code}")
        data_hr = res_hr.json()
        print(f"Match Count: {data_hr.get('match_count')}")
        
        # Low Risk
        res_lr = await client.post("http://localhost:8000/api/v1/amltab/screenings/", json=payload_low_risk, headers=headers)
        print(f"\nLow Risk (US) response status: {res_lr.status_code}")
        data_lr = res_lr.json()
        print(f"Match Count: {data_lr.get('match_count')}")

if __name__ == "__main__":
    asyncio.run(run_test())
