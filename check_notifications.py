#!/usr/bin/env python3
"""Debug script to check notification data in database"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app.db.session import SessionLocal
from backend.app.models import models

def check_notifications():
    db = SessionLocal()
    
    try:
        # Check total count
        total = db.query(models.Notification).count()
        print(f"\n📊 Total notifications in database: {total}")
        
        if total == 0:
            print("⚠️  No notifications found. Database is empty.")
            print("\n💡 To create test data, run:")
            print("   cd backend && python scripts/seed_notifications.py")
            return
        
        # Check by user
        from sqlalchemy import func
        user_counts = db.query(
            models.Notification.user_id,
            func.count(models.Notification.id)
        ).group_by(models.Notification.user_id).all()
        
        print("\n👥 Notifications by user:")
        for user_id, count in user_counts:
            print(f"   - {user_id}: {count}")
        
        # Show recent notifications
        recent = db.query(models.Notification).order_by(
            models.Notification.created_at.desc()
        ).limit(5).all()
        
        print("\n📋 Recent 5 notifications:")
        for n in recent:
            print(f"\n   ID: {n.id}")
            print(f"   User: {n.user_id}")
            print(f"   Title: {n.title}")
            print(f"   Type: {n.type}")
            print(f"   Priority: {n.priority}")
            print(f"   Is Read: {n.is_read}")
            print(f"   Created: {n.created_at}")
            
        # Check if user 'Arman' exists
        user = db.query(models.User).filter(models.User.username == "Arman").first()
        print(f"\n🔍 User 'Arman' exists: {user is not None}")
        
        if user:
            arman_notifs = db.query(models.Notification).filter(
                models.Notification.user_id == "Arman"
            ).count()
            print(f"   Notifications for Arman: {arman_notifs}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_notifications()
