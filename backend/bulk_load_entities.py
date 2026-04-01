import json
import os
import sys
import time
from sqlalchemy import text
from sqlalchemy.orm import Session

# Add current directory to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.db.session import SessionLocal
from app.etl.normalizer import normalize_entity
from app.etl.postgres_loader import upsert_entity

def bulk_load_entities(file_path: str, batch_size: int = 1000):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return False

    print(f"Starting bulk load from {file_path}...")
    start_time = time.time()
    count = 0
    
    db = SessionLocal()
    
    try:
        with open(file_path, 'r') as f:
            for line in f:
                if not line.strip():
                    continue
                    
                try:
                    raw_data = json.loads(line)
                    if not raw_data.get("id"):
                        continue
                        
                    # 1. Normalize
                    normalized = normalize_entity(raw_data)
                    
                    # 2. Add raw nested data for the full profile view
                    normalized["raw_data"] = raw_data
                    
                    # 3. Load to PostgreSQL via shared logic
                    upsert_entity(db, normalized)
                    
                    count += 1
                    
                    if count % batch_size == 0:
                        db.commit()
                        elapsed = time.time() - start_time
                        rate = count / elapsed if elapsed > 0 else 0
                        print(f"Processed {count} entities... ({rate:.2f} entities/sec)")
                        
                except json.JSONDecodeError:
                    continue
                except Exception as e:
                    print(f"Error processing line: {e}")
                    continue
        
        db.commit()
            
        total_time = time.time() - start_time
        print(f"Successfully loaded {count} entities in {total_time:.2f} seconds.")
        return True
        
    finally:
        db.close()

if __name__ == "__main__":
    # Prioritize targets.nested.json for richer internal data if available
    files_to_try = ["data/targets.nested.json", "data/entities.ftm.json"]
    success = False
    
    for f in files_to_try:
        if os.path.exists(f):
            success = bulk_load_entities(f)
            if success:
                break
    
    if not success:
        print("Failed to find any entity source files to load.")
