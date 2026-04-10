#!/usr/bin/env python3
"""Test notification API endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_notifications():
    # First, login to get token
    print("🔐 Step 1: Login to get token...")
    login_data = {
        "username": "Arman",
        "password": "Arman123!"
    }
    
    try:
        login_res = requests.post(f"{BASE_URL}/auth/token", data=login_data)
        if login_res.status_code != 200:
            print(f"❌ Login failed: {login_res.status_code}")
            print(f"Response: {login_res.text}")
            print("\n⚠️  Please update the password in this script")
            return
        token = login_res.json().get("access_token")
        print(f"✅ Login successful! Token: {token[:20]}...")
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Test 1: Get notification count
    print("\n📊 Step 2: Get unread count...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        res = requests.get(f"{BASE_URL}/notifications/count", headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"✅ Unread count: {data.get('unread_count')}")
        else:
            print(f"❌ Response: {res.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Get notifications
    print("\n📋 Step 3: Get notifications...")
    try:
        res = requests.get(f"{BASE_URL}/notifications/?limit=5", headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"✅ Got {len(data)} notifications")
            for i, n in enumerate(data[:3], 1):
                print(f"\n  {i}. {n.get('title')}")
                print(f"     Type: {n.get('type')} | Priority: {n.get('priority')}")
                print(f"     Read: {n.get('is_read')} | Created: {n.get('created_at')}")
        else:
            print(f"❌ Response: {res.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Get only unread
    print("\n🔔 Step 4: Get only unread notifications...")
    try:
        res = requests.get(f"{BASE_URL}/notifications/?is_read=false&limit=3", headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"✅ Got {len(data)} unread notifications")
        else:
            print(f"❌ Response: {res.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_notifications()
