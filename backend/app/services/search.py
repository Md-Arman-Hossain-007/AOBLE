from ..core.elasticsearch import es_client
from ..etl.es_indexer import INDEX_NAME
from ..models.models import OSEntityName, OSEntity
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Optional

class SearchService:
    def search_entities(
        self, 
        query: str, 
        entity_type: Optional[str] = None,
        country: Optional[str] = None,
        limit: int = 10,
        min_score: float = 0.5
    ) -> List[Dict]:
        """
        Performs an enterprise fuzzy search across names and aliases in Elasticsearch.
        """
        must = [
            {
                "multi_match": {
                    "query": query,
                    "fields": ["name^3", "aliases^2"], # Boost primary name
                    "fuzziness": "AUTO",
                    "prefix_length": 2,
                    "operator": "or"
                }
            }
        ]

        if entity_type:
            must.append({"term": {"entity_type": entity_type}})
        
        if country:
            must.append({"term": {"countries": country}})

        body = {
            "query": {
                "bool": {
                    "must": must
                }
            },
            "size": limit
        }

        response = es_client.search(index=INDEX_NAME, query=body["query"], size=body["size"])
        
        hits = []
        for hit in response["hits"]["hits"]:
            source = hit["_source"]
            hits.append({
                "entity_id": source["entity_id"],
                "name": source["name"],
                "score": hit["_score"],
                "entity_type": source["entity_type"],
                "datasets": source["datasets"],
                "source_urls": source["source_urls"],
                "countries": source["countries"],
                "birth_date": source.get("birth_date"),
                "topics": source.get("topics", []),
                "match_type": "fuzzy" # Could be more sophisticated
            })
            
        return hits

    def search_by_name_prefix(self, db: Session, prefix: str, limit: int = 10) -> List[Dict]:
        """
        Performs a fast SQL-based name prefix search using os_entity_names table.
        """
        results = (
            db.query(OSEntityName, OSEntity)
            .join(OSEntity, OSEntityName.entity_id == OSEntity.id)
            .filter(OSEntityName.name.ilike(f"{prefix}%"))
            .limit(limit)
            .all()
        )
        
        hits = []
        for name_obj, entity_obj in results:
            hits.append({
                "entity_id": entity_obj.id,
                "name": name_obj.name,
                "score": 1.0, # Exact prefix matches get a full score in this context
                "entity_type": entity_obj.schema,
                "datasets": entity_obj.datasets,
                "source_urls": entity_obj.properties.get('sourceUrl', []),
                "countries": entity_obj.properties.get('nationality', []),
                "birth_date": entity_obj.properties.get('birthDate', [None])[0],
                "match_type": "prefix"
            })
            
        return hits

search_service = SearchService()
