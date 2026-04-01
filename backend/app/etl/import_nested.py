import json
import os
import time
import httpx
from sqlalchemy.orm import Session
from ..db.session import SessionLocal
from ..models.models import OSProfile, OSImportRun
from ..core.config import settings
from .es_indexer import index_os_profile

NESTED_URL = "https://data.opensanctions.org/datasets/latest/default/profiles.nested.json"
BATCH_SIZE = 500

def import_nested():
    stats = {"processed": 0, "added": 0, "updated": 0, "skipped": 0}
    print(f"Starting import of nested profiles from {NESTED_URL}...")
    start_all = time.time()
    
    db: Session = SessionLocal()
    
    # Download file to a temporary location
    temp_file = os.path.join(settings.DATA_DIR, "profiles.nested.json")
    os.makedirs(os.path.dirname(temp_file), exist_ok=True)
    
    try:
        if not os.path.exists(temp_file) or (time.time() - os.path.getmtime(temp_file) > 86400):
            print(f"Downloading {NESTED_URL}...")
            with httpx.stream("GET", NESTED_URL, timeout=600.0) as r:
                r.raise_for_status()
                with open(temp_file, 'wb') as f:
                    for chunk in r.iter_bytes():
                        f.write(chunk)
        else:
            print(f"Using cached file: {temp_file}")
            
        start_time = time.time()
        
        with open(temp_file, 'r') as f:
            for line in f:
                if not line.strip():
                    continue
                
                stats["processed"] = stats["processed"] + 1
                import_status = None
                
                try:
                    data = json.loads(line)
                    profile_id = data.get('id')
                    
                    if not profile_id:
                        import_status = "skipped"
                    else:
                        # Try to find existing profile
                        profile = db.query(OSProfile).filter(OSProfile.id == profile_id).first()
                        
                        if not profile:
                            profile = OSProfile(id=profile_id)
                            db.add(profile)
                            import_status = "added"
                        else:
                            import_status = "updated"
                        
                        profile.schema = data.get('schema')
                        profile.caption = data.get('caption')
                        profile.datasets = data.get('datasets', [])
                        
                        properties = data.get('properties', {})
                        profile.topics = properties.get('topics', [])
                        
                        # Denormalized identity fields
                        profile.names = properties.get('name', [])
                        profile.birth_dates = properties.get('birthDate', [])
                        profile.nationalities = properties.get('nationality', [])
                        profile.countries = properties.get('country', [])
                        profile.id_numbers = properties.get('idNumber', []) + properties.get('passportNumber', [])
                        profile.positions = properties.get('position', [])
                        
                        # Full nested profile
                        profile.full_profile = data
                        
                        # Index in Elasticsearch
                        try:
                            index_os_profile(profile)
                        except Exception as e:
                            print(f"ES Indexing error for profile {profile_id}: {e}")
                        
                        if stats["processed"] % BATCH_SIZE == 0:
                            db.commit()
                            elapsed = time.time() - start_time
                            print(f"Processed {stats['processed']} profiles... ({int(stats['processed']/elapsed)} per sec)")
                            
                except json.JSONDecodeError as jde:
                    print(f"Skipping malformed JSON line {stats['processed']}: {jde}")
                    import_status = "skipped"
                except Exception as ex:
                    print(f"Error processing profile {stats['processed']}: {ex}")
                    import_status = "skipped"
                
                # Update counters
                if import_status == "added":
                    stats["added"] = stats["added"] + 1
                elif import_status == "updated":
                    stats["updated"] = stats["updated"] + 1
                elif import_status == "skipped":
                    stats["skipped"] = stats["skipped"] + 1
            
        db.commit()
        
        duration = int(time.time() - start_all)
        print(f"Import complete. Processed {stats['processed']} profiles (Skipped: {stats['skipped']}) in {duration} seconds.")
        
        # Log the run
        import_run = OSImportRun(
            file_imported="profiles",
            total_processed=stats["processed"],
            added=stats["added"],
            updated=stats["updated"],
            skipped=stats["skipped"],
            duration_seconds=duration,
            dataset_version="latest"
        )
        db.add(import_run)
        db.commit()
        
    except Exception as e:
        print(f"Error importing profiles: {e}")
        import_run = OSImportRun(
            file_imported="profiles",
            error=str(e),
            dataset_version="latest"
        )
        db.add(import_run)
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    import_nested()
