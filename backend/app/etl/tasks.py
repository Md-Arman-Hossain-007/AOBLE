from ..core.celery_app import celery_app
from ..db.session import SessionLocal
from ..etl.downloader import download_opensanctions_dataset, parse_ftm_line
from ..etl.normalizer import normalize_entity
from ..etl.postgres_loader import upsert_entity
from ..etl.es_indexer import create_index, index_entity
from typing import cast
import os
import asyncio

from ..etl.import_sources import import_sources
from ..etl.import_entities import import_entities
from ..etl.import_nested import import_nested

@celery_app.task(name="app.etl.run_full_sync")
def run_full_sync():
    """
    Celery task to run the complete OpenSanctions sync pipeline using the new architecture.
    """
    try:
        # 0. Ensure ES index exists
        print("Ensuring ES index exists...")
        create_index()
        
        # 1. Import Sources
        print("Starting Sources import...")
        import_sources()
        
        # 2. Import All Categorized Datasets (Sanctions, PEP, Crime, Companies)
        print("Starting Entities import for all categorized datasets...")
        from .import_entities import import_all_datasets
        import_all_datasets()
        
        # 3. Import Nested Profiles
        print("Starting Nested Profiles import...")
        import_nested()
        
        return {"status": "success", "message": "Full sync complete using multi-dataset architecture"}
    except Exception as e:
        print(f"Error during full sync: {e}")
        return {"status": "error", "message": str(e)}
        
@celery_app.task(name="app.etl.trigger_yente_update")
def trigger_yente_update():
    """
    Celery task to trigger manual data update in Yente.
    """
    from ..core.config import settings
    import httpx
    
    token = settings.YENTE_UPDATE_TOKEN
    yente_url = settings.YENTE_URL
    
    if not token:
        print("YENTE_UPDATE_TOKEN not configured. Skipping update.")
        return {"status": "error", "message": "YENTE_UPDATE_TOKEN not configured"}
        
    try:
        # We use a long timeout as re-indexing can take time
        with httpx.Client(timeout=300.0) as client:
            print(f"Triggering Yente update at {yente_url}/updatez...")
            response = client.post(
                f"{yente_url}/updatez",
                params={"token": token}
            )
            response.raise_for_status()
            result = response.json()
            print(f"Yente update triggered successfully: {result}")
            return {"status": "success", "data": result}
    except Exception as e:
        print(f"Error triggering Yente update: {e}")
        return {"status": "error", "message": str(e)}
