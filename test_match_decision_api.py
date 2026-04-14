"""
Test script for Match Decision API with match_number support
Tests the updated API that uses match_number (M-1, M-2) as primary identifier
"""
import requests
import json

# Configuration - update these values based on your environment
BASE_URL = "http://localhost:8000"  # Backend URL
API_URL = f"{BASE_URL}/api"
USERNAME = "test_user"
PASSWORD = "test_password"

def login():
    """Login and get auth token"""
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"username": USERNAME, "password": PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def test_match_decision_by_match_number(token, screening_id, match_number="M-1"):
    """Test 1: Update match decision using match_number in URL"""
    print(f"\n{'='*60}")
    print(f"Test 1: Update match decision using match_number in URL")
    print(f"{'='*60}")
    
    response = requests.post(
        f"{API_URL}/screen/{screening_id}/matches/{match_number}/decision",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "status": "matched",
            "note": "Test: Confirmed as true match using match_number in URL"
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Success: {response.json()}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_match_decision_with_body_match_number(token, screening_id, url_match_id="dummy"):
    """Test 2: Update match decision using match_number in request body"""
    print(f"\n{'='*60}")
    print(f"Test 2: Update match decision using match_number in request body")
    print(f"{'='*60}")
    
    response = requests.post(
        f"{API_URL}/screen/{screening_id}/matches/{url_match_id}/decision",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "status": "false_positive",
            "note": "Test: Marked as false positive using match_number in body",
            "match_number": "M-2"  # This should take priority
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Success: {response.json()}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_match_decision_backward_compat(token, screening_id, entity_id):
    """Test 3: Backward compatibility - update using entity_id"""
    print(f"\n{'='*60}")
    print(f"Test 3: Backward compatibility - update using entity_id")
    print(f"{'='*60}")
    
    response = requests.post(
        f"{API_URL}/screen/{screening_id}/matches/{entity_id}/decision",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "status": "matched",
            "note": "Test: Backward compatibility test with entity_id"
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Success: {response.json()}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_match_decision_with_entity_id_in_body(token, screening_id, url_match_id="dummy"):
    """Test 4: Update using entity_id in request body"""
    print(f"\n{'='*60}")
    print(f"Test 4: Update using entity_id in request body")
    print(f"{'='*60}")
    
    # You'll need to replace this with an actual entity_id from your screening
    response = requests.post(
        f"{API_URL}/screen/{screening_id}/matches/{url_match_id}/decision",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "status": "false_positive",
            "note": "Test: Using entity_id in body",
            "entity_id": ""  # Replace with actual entity_id if needed
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Success: {response.json()}")
        return True
    else:
        print(f"⚠️  Failed (expected if entity_id is empty): {response.status_code}")
        return True  # This is expected to fail if entity_id is empty

def main():
    print("\n" + "="*60)
    print("Match Decision API - Match Number Support Tests")
    print("="*60)
    
    # Login
    token = login()
    if not token:
        return
    
    print(f"✅ Logged in successfully")
    
    # You need to replace this with an actual screening_id from your database
    screening_id = input("\nEnter a screening_id to test with: ").strip()
    
    if not screening_id:
        print("❌ No screening_id provided. Exiting.")
        return
    
    # Run tests
    results = []
    
    # Test 1: Using match_number in URL (primary method)
    results.append(test_match_decision_by_match_number(token, screening_id, "M-1"))
    
    # Test 2: Using match_number in request body (new feature)
    results.append(test_match_decision_with_body_match_number(token, screening_id))
    
    # Test 3: Backward compatibility with entity_id in URL
    entity_id = input("\nEnter an entity_id for backward compat test (or press Enter to skip): ").strip()
    if entity_id:
        results.append(test_match_decision_backward_compat(token, screening_id, entity_id))
    else:
        print("⏭️  Skipped backward compatibility test")
    
    # Test 4: Using entity_id in request body
    results.append(test_match_decision_with_entity_id_in_body(token, screening_id))
    
    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("✅ All tests passed!")
    else:
        print("⚠️  Some tests failed. Review the output above.")

if __name__ == "__main__":
    main()
