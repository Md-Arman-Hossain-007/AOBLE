import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"

def print_result(name, success, data=None):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} | {name}")
    if not success and data:
        print(f"   Details: {data}")

def run_tests():
    print("🚀 Starting API Verification Automation...")
    print("-" * 50)
    
    # 1. Health Check
    try:
        resp = requests.get(f"{BASE_URL}/health")
        print_result("Health Check", resp.status_code == 200, resp.text)
    except Exception as e:
        print_result("Health Check", False, str(e))
        return

    # 2. Login
    token = None
    try:
        resp = requests.post(
            f"{API_V1}/auth/token",
            data={"username": "admin", "password": "password123"}
        )
        if resp.status_code == 200:
            token = resp.json().get("access_token")
            print_result("Authentication (admin login)", True)
        else:
            print_result("Authentication (admin login)", False, f"Status: {resp.status_code}, Body: {resp.text}")
            return
    except Exception as e:
        print_result("Authentication (admin login)", False, str(e))
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get Current User
    try:
        resp = requests.get(f"{API_V1}/auth/me", headers=headers)
        print_result("Get Current User (/auth/me)", resp.status_code == 200)
    except Exception as e:
        print_result("Get Current User", False, str(e))

    # 4. List Screenings (v2)
    try:
        resp = requests.get(f"{API_V1}/screen/results", headers=headers)
        print_result("List Screening Results", resp.status_code == 200)
    except Exception as e:
        print_result("List Screening Results", False, str(e))

    # 5. Perform Screening
    try:
        payload = {
            "name": "Vladimir Putin",
            "schema": "Person",
            "fuzzy": True,
            "threshold": 0.8
        }
        resp = requests.post(f"{BASE_URL}/screen", json=payload, headers=headers)
        print_result("Perform Screening (/screen)", resp.status_code == 200)
    except Exception as e:
        print_result("Perform Screening", False, str(e))

    # 6. List Monitored Entities
    try:
        resp = requests.get(f"{API_V1}/monitoring/entities", headers=headers)
        print_result("List Monitored Entities", resp.status_code == 200)
    except Exception as e:
        print_result("List Monitored Entities", False, str(e))

    # 7. Get Stats
    try:
        resp = requests.get(f"{API_V1}/stats/dashboard", headers=headers)
        print_result("Get Dashboard Stats", resp.status_code == 200)
    except Exception as e:
        print_result("Get Dashboard Stats", False, str(e))

    # 8. List Notifications
    try:
        resp = requests.get(f"{API_V1}/notifications", headers=headers)
        print_result("List Notifications", resp.status_code == 200)
    except Exception as e:
        print_result("List Notifications", False, str(e))

    # 9. List Cases
    try:
        resp = requests.get(f"{API_V1}/case-management/cases", headers=headers)
        print_result("List Cases", resp.status_code == 200)
    except Exception as e:
        print_result("List Cases", False, str(e))

    print("-" * 50)
    print("✨ Automation Complete!")

if __name__ == "__main__":
    run_tests()
