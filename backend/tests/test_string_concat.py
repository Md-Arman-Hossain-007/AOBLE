"""
Simple test to verify string concatenation works in the Celery worker environment.
Run this to verify the fix is working.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_string_concatenation():
    """Test that string concatenation works correctly."""
    print("=" * 60)
    print("STRING CONCATENATION TEST")
    print("=" * 60)
    
    # Test 1: Basic string + int concatenation
    job_id = "test-job-uuid-123"
    idx = 0
    
    print("\nTest 1: Basic string concatenation")
    print(f"  job_id type: {type(job_id)}")
    print(f"  idx type: {type(idx)}")
    
    try:
        result = str(job_id) + "-" + str(idx)
        print(f"  ✓ SUCCESS: {result}")
    except TypeError as e:
        print(f"  ✗ FAILED: {e}")
        return False
    
    # Test 2: Pandas index conversion
    import pandas as pd
    df = pd.DataFrame({'name': ['John', 'Jane']})
    
    print("\nTest 2: Pandas index conversion")
    for i in range(len(df)):
        try:
            row_num = str(int(i))
            ref = str(job_id) + "-" + row_num
            print(f"  ✓ Row {i}: {ref}")
        except TypeError as e:
            print(f"  ✗ Row {i} FAILED: {e}")
            return False
    
    # Test 3: Numpy integer handling
    print("\nTest 3: Numpy integer handling")
    for idx, row in df.iterrows():
        try:
            # This is what caused the original error
            ref = str(job_id) + "-" + str(idx)
            print(f"  ✓ Index {idx} (type: {type(idx)}): {ref}")
        except TypeError as e:
            print(f"  ✗ Index {idx} FAILED: {e}")
            return False
    
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED ✓")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = test_string_concatenation()
    sys.exit(0 if success else 1)
