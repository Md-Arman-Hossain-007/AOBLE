from sqlalchemy.orm import Session
from ..models.models import SanctionsEntity, SanctionsAlias, SanctionsCountry, SanctionsListing
import datetime

def upsert_entity(db: Session, normalized_data: dict):
    """
    Upserts a normalized entity and its related data into PostgreSQL.
    """
    entity_id = normalized_data["id"]
    
    # Update or create entity
    entity = db.query(SanctionsEntity).filter(SanctionsEntity.id == entity_id).first()
    if not entity:
        entity = SanctionsEntity(id=entity_id)
        db.add(entity)
        
    entity.schema = normalized_data["schema"]
    entity.primary_name = normalized_data["primary_name"]
    entity.first_name = normalized_data.get("first_name")
    entity.last_name = normalized_data.get("last_name")
    entity.middle_name = normalized_data.get("middle_name")
    entity.birth_date = normalized_data["birth_date"]
    entity.gender = normalized_data.get("gender")
    entity.nationality = normalized_data.get("nationality")
    entity.entity_type = normalized_data["entity_type"]
    entity.topics = normalized_data.get("topics")
    entity.datasets = normalized_data.get("datasets")
    entity.is_target = normalized_data.get("is_target", False)
    entity.first_seen = normalized_data.get("first_seen")
    entity.last_seen = normalized_data.get("last_seen")
    entity.source_url = normalized_data["source_url"]
    entity.raw_data = normalized_data.get("raw_data") # Store the full nested data
    entity.updated_at = datetime.datetime.utcnow()

    # Clear old related data (simpler than syncing for this write-heavy task)
    db.query(SanctionsAlias).filter(SanctionsAlias.entity_id == entity_id).delete()
    db.query(SanctionsCountry).filter(SanctionsCountry.entity_id == entity_id).delete()
    db.query(SanctionsListing).filter(SanctionsListing.entity_id == entity_id).delete()

    # Add aliases
    for alias_name in normalized_data["aliases"]:
        db.add(SanctionsAlias(entity_id=entity_id, alias_name=alias_name))
        
    # Add countries
    for country_code in normalized_data["countries"]:
        db.add(SanctionsCountry(entity_id=entity_id, country_code=country_code[:3]))
        
    # Add listings
    for listing in normalized_data["listings"]:
        db.add(SanctionsListing(
            entity_id=entity_id,
            dataset=listing["dataset"],
            authority=listing["authority"],
            program=listing["program"],
            source_url=listing["source_url"]
        ))
        
    return entity
