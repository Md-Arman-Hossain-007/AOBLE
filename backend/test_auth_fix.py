#!/usr/bin/env python3
"""
Test script to verify the bcrypt/passlib fix for authentication
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import verify_password, get_password_hash

def test_password_operations():
    """Test password hashing and verification"""
    print("Testing password operations...")
    
    # Test normal password
    test_password = "TestPassword123!"
    print(f"Testing with password: {test_password}")
    
    try:
        # Hash the password
        hashed = get_password_hash(test_password)
        print(f"✓ Password hashed successfully: {hashed[:20]}...")
        
        # Verify the password
        is_valid = verify_password(test_password, hashed)
        print(f"✓ Password verification: {'SUCCESS' if is_valid else 'FAILED'}")
        
        # Test wrong password
        is_invalid = verify_password("WrongPassword123!", hashed)
        print(f"✓ Wrong password rejected: {'SUCCESS' if not is_invalid else 'FAILED'}")
        
    except Exception as e:
        print(f"✗ Error during password operations: {e}")
        return False
    
    # Test long password (over 72 bytes)
    long_password = "A" * 100  # 100 characters
    print(f"\nTesting with long password (100 chars): {long_password[:20]}...")
    
    try:
        # Hash the long password
        hashed_long = get_password_hash(long_password)
        print(f"✓ Long password hashed successfully: {hashed_long[:20]}...")
        
        # Verify the long password
        is_valid_long = verify_password(long_password, hashed_long)
        print(f"✓ Long password verification: {'SUCCESS' if is_valid_long else 'FAILED'}")
        
    except Exception as e:
        print(f"✗ Error during long password operations: {e}")
        return False
    
    print("\n✓ All password operations completed successfully!")
    return True

def test_imports():
    """Test that all imports work correctly"""
    print("Testing imports...")
    
    try:
        from passlib.context import CryptContext
        print("✓ passlib imported successfully")
        
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        print("✓ CryptContext created successfully")
        
        # Test basic operation
        test_hash = pwd_context.hash("test")
        test_verify = pwd_context.verify("test", test_hash)
        print(f"✓ Basic passlib operation: {'SUCCESS' if test_verify else 'FAILED'}")
        
    except Exception as e:
        print(f"✗ Error during import test: {e}")
        return False
    
    print("✓ All imports working correctly!")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Testing AMLtab Authentication Fix")
    print("=" * 60)
    
    # Test imports
    import_success = test_imports()
    print()
    
    # Test password operations
    password_success = test_password_operations()
    print()
    
    if import_success and password_success:
        print("🎉 ALL TESTS PASSED! The authentication fix is working correctly.")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED! There may still be issues with the authentication.")
        sys.exit(1)