from ..core.elasticsearch import es_client
from typing import Dict, Any, List

INDEX_NAME = "amltab_entities"

def create_index():
    """
    Creates the Elasticsearch index with appropriate mapping for AML screening.
    """
    if es_client.indices.exists(index=INDEX_NAME):
        return

    mapping = {
        "settings": {
            "analysis": {
                "analyzer": {
                    "names_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": ["lowercase", "asciifolding", "trim"]
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "entity_id": {"type": "keyword"},
                "name": {
                    "type": "text",
                    "analyzer": "names_analyzer",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "aliases": {
                    "type": "text",
                    "analyzer": "names_analyzer"
                },
                "countries": {"type": "keyword"},
                "birth_date": {"type": "keyword"},
                "entity_type": {"type": "keyword"},
                "datasets": {"type": "keyword"},
                "source_urls": {"type": "keyword"},
                "topics": {"type": "keyword"},
                "schema": {"type": "keyword"}
            }
        }
    }
    
    es_client.indices.create(index=INDEX_NAME, settings=mapping["settings"], mappings=mapping["mappings"])
    print(f"Index {INDEX_NAME} created.")

def index_entity(normalized_data: dict):
    """
    Legacy: Indexes a single normalized entity into Elasticsearch.
    """
    doc = {
        "entity_id": normalized_data["id"],
        "name": normalized_data["primary_name"],
        "aliases": normalized_data["aliases"],
        "countries": normalized_data["countries"],
        "birth_date": normalized_data["birth_date"],
        "entity_type": normalized_data["entity_type"],
        "datasets": [l["dataset"] for l in normalized_data["listings"]],
        "source_urls": [normalized_data["source_url"]] + [l["source_url"] for l in normalized_data["listings"] if l.get("source_url")],
        "schema": normalized_data["schema"]
    }
    
    es_client.index(index=INDEX_NAME, id=normalized_data["id"], document=doc)

def index_os_entity(entity: Any, names: list):
    """
    Indexes an OSEntity (SQLAlchemy model) into Elasticsearch.
    """
    # entity.properties is a JSONB dict
    props = entity.properties or {}
    
    doc = {
        "entity_id": entity.id,
        "name": entity.caption or (names[0] if names else entity.id),
        "aliases": names,
        "countries": props.get("nationality", []) + props.get("country", []),
        "birth_date": props.get("birthDate", [None])[0] if isinstance(props.get("birthDate"), list) else None,
        "entity_type": entity.schema.lower() if entity.schema else "unknown",
        "datasets": entity.datasets or [],
        "source_urls": props.get("sourceUrl", []),
        "topics": entity.topics or [],
        "schema": entity.schema
    }
    
    es_client.index(index=INDEX_NAME, id=entity.id, document=doc)

def index_os_profile(profile: Any):
    """
    Indexes an OSProfile (SQLAlchemy model) into Elasticsearch.
    """
    doc = {
        "entity_id": profile.id,
        "name": profile.caption or (profile.names[0] if profile.names else profile.id),
        "aliases": profile.names or [],
        "countries": (profile.nationalities or []) + (profile.countries or []),
        "birth_date": profile.birth_dates[0] if profile.birth_dates else None,
        "entity_type": profile.schema.lower() if profile.schema else "unknown",
        "datasets": profile.datasets or [],
        "source_urls": profile.full_profile.get("properties", {}).get("sourceUrl", []),
        "topics": profile.topics or [],
        "schema": profile.schema
    }
    
    es_client.index(index=INDEX_NAME, id=profile.id, document=doc)
