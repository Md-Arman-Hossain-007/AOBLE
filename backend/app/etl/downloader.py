import httpx
import os
import json
from ..core.config import settings

OPENSANCTIONS_BASE_URL = "https://data.opensanctions.org/datasets/latest/all/"

async def download_opensanctions_dataset(dataset_name: str, target_path: str = None):
    """
    Downloads a specific dataset from OpenSanctions.
    Possible dataset_name: entities.ftm.json, targets.nested.json, relationships.ftm.json
    """
    url = f"{OPENSANCTIONS_BASE_URL}{dataset_name}"
    if target_path is None:
        target_path = os.path.join(settings.DATA_DIR, dataset_name)
        
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    
    print(f"Downloading OpenSanctions data from {url}...")
    
    async with httpx.AsyncClient(timeout=600.0) as client:
        async with client.stream("GET", url) as response:
            if response.status_code != 200:
                raise Exception(f"Failed to download {dataset_name}: HTTP {response.status_code}")
                
            with open(target_path, "wb") as f:
                async for chunk in response.aiter_bytes():
                    f.write(chunk)
                    
    print(f"Download complete: {target_path}")
    return target_path

def parse_ftm_line(line: str):
    """
    Parses a single line of FollowTheMoney (FtM) JSON.
    """
    if not line.strip():
        return None
    try:
        return json.loads(line)
    except Exception as e:
        print(f"Error parsing line: {e}")
        return None
