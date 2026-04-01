import httpx
import csv
import io
import os
import time
from sqlalchemy.orm import Session
from ..db.session import SessionLocal
from ..models.models import OSSource, OSImportRun
from ..core.config import settings

SOURCES_URL = "https://www.opensanctions.org/datasets/sources.csv"

def import_sources():
    stats = {"processed": 0, "added": 0, "updated": 0}
    print(f"Starting import of sources from {SOURCES_URL}...")
    start_time = time.time()
    
    db: Session = SessionLocal()
    
    try:
        response = httpx.get(SOURCES_URL, timeout=60.0)
        response.raise_for_status()
        
        content = response.text
        f = io.StringIO(content)
        reader = csv.DictReader(f)
        
        for row in reader:
            stats["processed"] = stats["processed"] + 1
            # identifier,title,publisher,publisher_country,source_url,frequency,entity_count,type
            identifier = row.get('name') or row.get('identifier') # CSV seems to use 'name' as identifier
            if not identifier:
                continue
                
            source = db.query(OSSource).filter(OSSource.identifier == identifier).first()
            
            import_status = None
            if not source:
                source = OSSource(identifier=identifier)
                db.add(source)
                import_status = "added"
            else:
                import_status = "updated"
                
            source.title = row.get('title')
            source.publisher = row.get('publisher')
            source.publisher_country = row.get('publisher_country')
            source.source_url = row.get('url') # URL column name might be 'url' in CSV
            source.frequency = row.get('frequency')
            
            entity_count_str = row.get('entity_count')
            if entity_count_str and entity_count_str.isdigit():
                source.entity_count = int(entity_count_str)
            
            source.type = row.get('type')
            
            if stats["processed"] % 100 == 0:
                db.commit()
                print(f"Processed {stats['processed']} sources...")
                
            if import_status == "added":
                stats["added"] = stats["added"] + 1
            elif import_status == "updated":
                stats["updated"] = stats["updated"] + 1
                
        db.commit()
        
        duration = int(time.time() - start_time)
        print(f"Import complete. Processed {stats['processed']} sources in {duration} seconds.")
        
        # 2. Sync with custom source registry (High-priority lists from user)
        print("Syncing with custom high-priority source registry...")
        from .source_registry import sync_source_registry
        sync_source_registry(db)
        
        # Log the run
        import_run = OSImportRun(
            file_imported="sources",
            total_processed=stats["processed"],
            added=stats["added"],
            updated=stats["updated"],
            duration_seconds=duration,
            dataset_version="latest"
        )
        db.add(import_run)
        db.commit()
        
    except Exception as e:
        print(f"Error importing sources: {e}")
        import_run = OSImportRun(
            file_imported="sources",
            error=str(e),
            dataset_version="latest"
        )
        db.add(import_run)
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    import_sources()
