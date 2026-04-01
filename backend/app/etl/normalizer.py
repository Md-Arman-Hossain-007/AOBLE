from typing import List, Dict, Any, Optional

def get_first(values: List[Any], default: Any = "") -> Any:
    """
    Safely gets the first element from a list or returns a default.
    """
    if values and len(values) > 0:
        return values[0]
    return default

def normalize_entity(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes a FollowTheMoney entity into a flat structure for DB and ES.
    """
    properties = data.get("properties", {})
    schema = data.get("schema", "Thing")
    
    # Extract names
    primary_name = get_first(properties.get("name", []))
    aliases = properties.get("alias", [])
    if not primary_name and aliases:
        primary_name = aliases[0]
        aliases = aliases[1:]
        
    # Extract birth date
    birth_date = get_first(properties.get("birthDate", []))
    
    # Extract names
    first_name = get_first(properties.get("firstName", []))
    last_name = get_first(properties.get("lastName", []))
    middle_name = get_first(properties.get("middleName", []))
    gender = get_first(properties.get("gender", []))
    
    # Extract nationality with citizenship fallback
    nationality = get_first(properties.get("nationality", []))
    if not nationality:
        nationality = get_first(properties.get("citizenship", []))
    
    # Extract topics
    topics = properties.get("topics", [])

    # Extract countries
    countries = properties.get("country", [])
    
    # Extract entity type (person vs entity)
    if schema == "Person":
        entity_type = "individual"
    else:
        entity_type = "entity"

    # Extract source URLs and program info (listings/sanctions)
    listings = []
    datasets = data.get("datasets", [])
    
    # Basic listing info
    for dataset in datasets:
        listings.append({
            "dataset": dataset,
            "authority": get_first(properties.get("authority", []), "Unknown"),
            "program": get_first(properties.get("program", []), "General"),
            "source_url": get_first(data.get("referents", []), None)
        })

    return {
        "id": data.get("id"),
        "schema": schema,
        "primary_name": primary_name,
        "first_name": first_name,
        "last_name": last_name,
        "middle_name": middle_name,
        "aliases": aliases,
        "birth_date": birth_date,
        "gender": gender,
        "nationality": nationality,
        "countries": countries,
        "entity_type": entity_type,
        "topics": topics,
        "datasets": datasets,
        "is_target": data.get("target", False),
        "first_seen": data.get("first_seen"),
        "last_seen": data.get("last_seen"),
        "listings": listings,
        "source_url": f"https://www.opensanctions.org/entities/{data.get('id')}/"
    }
