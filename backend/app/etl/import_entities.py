import json
import os
import time
import httpx
from sqlalchemy.orm import Session
from ..db.session import SessionLocal
from ..models.models import OSEntity, OSEntityName, OSImportRun
from ..core.config import settings
from .es_indexer import index_os_entity

DATASET_URLS = {
    "sanctions": "https://data.opensanctions.org/datasets/latest/sanctions/entities.ftm.json",
    "peps":      "https://data.opensanctions.org/datasets/latest/peps/entities.ftm.json",
    "crime":     "https://data.opensanctions.org/datasets/latest/crime/entities.ftm.json",
    "companies": "https://data.opensanctions.org/datasets/latest/companies/entities.ftm.json",
    "default":   "https://data.opensanctions.org/datasets/latest/default/entities.ftm.json",
}

BATCH_SIZE = 1000

def import_entities(dataset: str = "default"):
    """
    Import entities from a specific OpenSanctions dataset collection.
    """
    url = DATASET_URLS.get(dataset)
    if not url:
        print(f"Unknown dataset: {dataset}")
        return
        
    stats = {"processed": 0, "added": 0, "updated": 0, "skipped": 0}
    
    print(f"Starting import of dataset '{dataset}' from {url}...")
    start_all = time.time()
    
    db: Session = SessionLocal()
    
    # Download file to a temporary location
    filename = f"{dataset}.ftm.json"
    temp_file = os.path.join(settings.DATA_DIR, filename)
    os.makedirs(os.path.dirname(temp_file), exist_ok=True)
    
    try:
        # Cache for 24 hours
        if not os.path.exists(temp_file) or (time.time() - os.path.getmtime(temp_file) > 86400):
            print(f"Downloading {url}...")
            with httpx.stream("GET", url, timeout=1200.0) as r:
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
                    entity_id = data.get('id')
                    
                    if not entity_id:
                        import_status = "skipped"
                    else:
                        # Try to find existing entity
                        entity = db.query(OSEntity).filter(OSEntity.id == entity_id).first()
                        
                        if not entity:
                            entity = OSEntity(id=entity_id)
                            db.add(entity)
                            import_status = "added"
                        else:
                            import_status = "updated"
                        
                        entity.schema = data.get('schema')
                        entity.caption = data.get('caption')
                        
                        # Add current dataset to the list of datasets for this entity
                        datasets = set(data.get('datasets', []))
                        datasets.add(dataset)
                        entity.datasets = list(datasets)
                        
                        properties = data.get('properties', {})
                        entity.properties = properties
                        entity.topics = properties.get('topics', [])
                        entity.referents = data.get('referents', [])
                        
                        # Update index for searching
                        try:
                            names = properties.get('name', [])
                            index_os_entity(entity, names)
                        except Exception:
                            # Non-critical error
                            pass
                        
                        if stats["processed"] % BATCH_SIZE == 0:
                            db.commit()
                            elapsed = time.time() - start_time
                            print(f"[{dataset}] Processed {stats['processed']} entities... ({int(stats['processed']/elapsed)}/s)")
                            
                except json.JSONDecodeError:
                    import_status = "skipped"
                except Exception as ex:
                    print(f"Error processing entity {entity_id}: {ex}")
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
        print(f"[{dataset}] Import complete. Processed {stats['processed']} in {duration}s.")
        
        # Log the run
        import_run = OSImportRun(
            file_imported=f"entities_{dataset}",
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
        print(f"Error importing dataset {dataset}: {e}")
        import_run = OSImportRun(
            file_imported=f"entities_{dataset}",
            error=str(e),
            dataset_version="latest"
        )
        db.add(import_run)
        db.commit()
    finally:
        db.close()

def import_all_datasets():
    """
    Sequentially import all categorized datasets.
    """
    for dataset in DATASET_URLS.keys():
        if dataset == "default": continue # 'default' is the combined set
        import_entities(dataset)

if __name__ == "__main__":
    import_all_datasets()
