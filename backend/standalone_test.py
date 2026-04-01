import asyncio
import re
import json
import httpx
from typing import Dict, Any

async def get_entity_details(entity_id: str) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        # Strategy 2: OpenSanctions page scrape
        url = f"https://www.opensanctions.org/entities/{entity_id}/"
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}
        response = await client.get(url, timeout=12.0, follow_redirects=True, headers=headers)
        html = response.text
        
        properties = {}
        caption_match = re.search(r'<meta property="og:title" content="(.*?)"', html)
        caption = caption_match.group(1) if caption_match else entity_id
        
        # Extract properties using the source links as anchors
        prop_patterns = re.findall(r'<tr><th.*?>(.*?)<.*?href="/statements/' + re.escape(entity_id) + r'/\?prop=(.*?)".*?>(.*?)</td>', html, re.DOTALL)
        for label, prop_name, value_area in prop_patterns:
            clean_values = re.findall(r'>([^<]{2,})<', value_area)
            clean_values = [v.strip() for v in clean_values if v.strip() and v.strip() != "·" and not v.strip().startswith("[")]
            if clean_values:
                properties[prop_name] = clean_values

        if properties:
            return {
                "id": entity_id,
                "caption": caption,
                "properties": properties
            }

    return {"error": "Failed to extract"}

async def test():
    entity_id = 'Q19878' 
    print(f"Testing Scraper logic for: {entity_id}")
    result = await get_entity_details(entity_id)
    if "error" not in result:
        print("SUCCESS")
        print(f"Found Entity: {result.get('caption')}")
        print(f"Keys: {list(result.keys())}")
    else:
        print(f"FAILED: {result['error']}")

if __name__ == "__main__":
    asyncio.run(test())
