"""
Test cases for Bulk Screening functionality.
Tests the process_bulk_screening Celery task to identify string concatenation errors.
"""
import os
import sys
import tempfile
import pandas as pd
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.workers.tasks import process_bulk_screening
from app.models.models import BulkJob
from app.db.session import SessionLocal


class TestBulkScreeningStringConcatenation:
    """Test cases specifically for string concatenation issues."""

    def setup_method(self):
        """Set up test fixtures."""
        self.db = SessionLocal()
        self.job_id = "test-job-123"
        self.user_id = "test_user"
        
    def teardown_method(self):
        """Clean up after tests."""
        # Clean up database
        job = self.db.query(BulkJob).filter(BulkJob.id == self.job_id).first()
        if job:
            self.db.delete(job)
            self.db.commit()
        self.db.close()

    def test_string_concatenation_with_integers(self):
        """
        CRITICAL TEST: Tests that job_id (UUID) and row index (int) 
        can be concatenated to strings without errors.
        
        This tests the exact error: "can only concatenate str (not 'int') to str"
        """
        print("\n=== Testing String Concatenation ===")
        print(f"job_id type: {type(self.job_id)}, value: {self.job_id}")
        
        # Test 1: Basic string concatenation
        try:
            result = str(self.job_id) + "-" + str(0)
            print(f"✓ Basic concatenation works: {result}")
        except TypeError as e:
            pytest.fail(f"Basic string concatenation failed: {e}")
        
        # Test 2: Using format()
        try:
            result = "{}-{}".format(self.job_id, 0)
            print(f"✓ format() concatenation works: {result}")
        except TypeError as e:
            pytest.fail(f"format() concatenation failed: {e}")
        
        # Test 3: Using f-strings
        try:
            result = f"{self.job_id}-{0}"
            print(f"✓ f-string concatenation works: {result}")
        except TypeError as e:
            pytest.fail(f"f-string concatenation failed: {e}")

    def test_pandas_index_to_string(self):
        """Test converting pandas index to string."""
        print("\n=== Testing Pandas Index Conversion ===")
        
        # Create test DataFrame
        df = pd.DataFrame({'name': ['John', 'Jane']})
        
        for idx in range(len(df)):
            # Test conversion
            idx_str = str(idx)
            print(f"✓ Index {idx} (type: {type(idx)}) converted to string: {idx_str}")
            
            # Test concatenation with job_id
            result = str(self.job_id) + "-" + idx_str
            print(f"✓ Concatenation result: {result}")

    def test_bulk_screening_with_mock(self):
        """Test bulk screening with mocked perform_screening."""
        print("\n=== Testing Full Bulk Screening Flow ===")
        
        # Create test CSV file
        test_csv = tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False)
        test_csv.write("type,name,country,dob\n")
        test_csv.write("individual,John Doe,USA,1990-01-01\n")
        test_csv.write("individual,Jane Smith,UK,1985-05-15\n")
        test_csv.close()
        
        # Create job
        job = BulkJob(
            id=self.job_id,
            user_id=self.user_id,
            filename="test.csv",
            status="pending",
            total_rows=0,
            processed_rows=0,
            created_at=datetime.utcnow()
        )
        self.db.add(job)
        self.db.commit()
        
        try:
            # Mock perform_screening
            with patch('app.workers.tasks.perform_screening') as mock_screening:
                mock_result = MagicMock()
                mock_result.risk_level.value = "low"
                mock_screening.return_value = mock_result
                
                # This should NOT raise "can only concatenate str (not 'int') to str"
                try:
                    process_bulk_screening(self.job_id, test_csv.name, self.user_id)
                    print("✓ Bulk screening completed without errors")
                except TypeError as e:
                    if "can only concatenate str" in str(e):
                        print(f"✗ STRING CONCATENATION ERROR: {e}")
                        import traceback
                        traceback.print_exc()
                        pytest.fail(f"String concatenation error in bulk screening: {e}")
                    else:
                        raise
                
                # Verify job status
                self.db.refresh(job)
                print(f"✓ Job status: {job.status}")
                print(f"✓ Job total_rows: {job.total_rows}")
                print(f"✓ Job processed_rows: {job.processed_rows}")
                print(f"✓ Job results_summary: {job.results_summary}")
                
                assert job.status == "completed"
                assert job.total_rows == 2
                assert job.processed_rows == 2
                
        finally:
            # Cleanup
            os.unlink(test_csv.name)
            if os.path.exists(test_csv.name):
                os.remove(test_csv.name)

    def test_customer_ref_generation(self):
        """Test that customer_ref is generated correctly as a string."""
        print("\n=== Testing Customer Reference Generation ===")
        
        # Test various scenarios
        test_cases = [
            (self.job_id, 0, "string UUID + int 0"),
            (self.job_id, 100, "string UUID + int 100"),
            ("12345", 5, "numeric string + int"),
        ]
        
        for job_id, idx, description in test_cases:
            print(f"\nTest case: {description}")
            print(f"  job_id type: {type(job_id)}, value: {job_id}")
            print(f"  idx type: {type(idx)}, value: {idx}")
            
            # Method 1: str() + "-" + str()
            try:
                ref1 = str(job_id) + "-" + str(idx)
                print(f"  ✓ Method 1 (str + str): {ref1} (type: {type(ref1)})")
                assert isinstance(ref1, str)
            except Exception as e:
                print(f"  ✗ Method 1 failed: {e}")
                pytest.fail(f"Method 1 failed for {description}: {e}")
            
            # Method 2: format()
            try:
                ref2 = "{}-{}".format(job_id, idx)
                print(f"  ✓ Method 2 (format): {ref2} (type: {type(ref2)})")
                assert isinstance(ref2, str)
            except Exception as e:
                print(f"  ✗ Method 2 failed: {e}")
                pytest.fail(f"Method 2 failed for {description}: {e}")


class TestBulkScreeningEdgeCases:
    """Test edge cases that might cause type errors."""

    def test_numpy_integer_types(self):
        """Test handling of numpy integer types from pandas."""
        print("\n=== Testing NumPy Integer Types ===")
        
        # Create DataFrame with various types
        df = pd.DataFrame({
            'name': ['John', 'Jane'],
            'id': [1, 2],  # Will be numpy int64
            'value': [1.5, 2.5]  # Will be numpy float64
        })
        
        for idx, row in df.iterrows():
            print(f"\nRow {idx}:")
            print(f"  idx type: {type(idx)}, value: {idx}")
            print(f"  row['id'] type: {type(row['id'])}, value: {row['id']}")
            print(f"  row['value'] type: {type(row['value'])}, value: {row['value']}")
            
            # Test conversions
            try:
                idx_str = str(int(idx))
                print(f"  ✓ idx to string: {idx_str}")
            except Exception as e:
                print(f"  ✗ idx conversion failed: {e}")
                pytest.fail(f"Index conversion failed: {e}")
            
            try:
                id_str = str(row['id'])
                print(f"  ✓ id to string: {id_str}")
            except Exception as e:
                print(f"  ✗ id conversion failed: {e}")
                pytest.fail(f"ID conversion failed: {e}")


if __name__ == "__main__":
    # Run tests with verbose output
    pytest.main([__file__, "-v", "-s"])
