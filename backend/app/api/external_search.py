from fastapi import APIRouter, Depends, HTTPException, Query
import httpx
from typing import Optional, List, Dict, Any
from ..api.auth import get_current_active_user
from ..models import models
from ..schemas.external_search import LEISearchResponse, LEIEntity, LEIEntityFull, Address, Registration, Relationship, FieldModification

router = APIRouter()

GLEIF_API_URL = "https://api.gleif.org/api/v1/lei-records"

def parse_address(address_data: Dict[str, Any]) -> Address:
    return Address(
        address_lines=address_data.get("addressLines", []),
        city=address_data.get("city"),
        region=address_data.get("region"),
        country=address_data.get("country", "Unknown"),
        postal_code=address_data.get("postalCode")
    )

@router.get("/lei", response_model=LEISearchResponse)
async def search_lei(
    query: str = Query(..., min_length=2),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    country: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Proxy search request to GLEIF API with rich portal-like data.
    """
    params = {
        "filter[fulltext]": query,
        "page[number]": page,
        "page[size]": page_size
    }
    
    if country:
        params["filter[entity.legalAddress.country]"] = country

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(GLEIF_API_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            entities = []
            for item in data.get("data", []):
                attributes = item.get("attributes", {})
                entity_data = attributes.get("entity", {})
                registration_data = attributes.get("registration", {})
                lei_id = attributes.get("lei")
                
                # Addresses
                legal_address_raw = entity_data.get("legalAddress", {})
                headquarters_address_raw = entity_data.get("headquartersAddress", {})
                
                legal_address = parse_address(legal_address_raw)
                headquarters_address = parse_address(headquarters_address_raw) if headquarters_address_raw else None
                
                # Parse Other Names with Types
                other_names = []
                for on in entity_data.get("otherNames", []):
                    other_names.append({
                        "name": on.get("name"),
                        "type": on.get("type", "ALTERNATIVE_NAME")
                    })

                # Registration Details
                reg = Registration(
                    initial_registration_date=registration_data.get("initialRegistrationDate"),
                    last_update_date=registration_data.get("lastUpdateDate"),
                    status=registration_data.get("status"),
                    next_renewal_date=registration_data.get("nextRenewalDate"),
                    registration_authority_entity_id=registration_data.get("registrationAuthorityEntityID"),
                    validation_sources=registration_data.get("validationSources"),
                    validation_state=registration_data.get("validationState")
                )
                
                # Full Data Object (modifications will be empty until fetched separately)
                full_entity = LEIEntityFull(
                    lei=lei_id,
                    legal_name=entity_data.get("legalName", {}).get("name", "Unknown"),
                    other_names=other_names,
                    entity_status=entity_data.get("status", "Unknown"),
                    registration_status=registration_data.get("status", "Unknown"),
                    jurisdiction=entity_data.get("jurisdiction", "Unknown"),
                    category=entity_data.get("category", "GENERAL"),
                    legal_address=legal_address,
                    headquarters_address=headquarters_address,
                    registration_authority=entity_data.get("registrationAuthority", {}),
                    legal_form=entity_data.get("legalForm", {}),
                    registration=reg,
                    entity_expiration_date=entity_data.get("entityExpirationDate"),
                    entity_expiration_reason=entity_data.get("entityExpirationReason"),
                    successor_entity=entity_data.get("successorEntity", {}),
                    modifications=[],
                    parents=[],
                    children=[]
                )
                
                entities.append(LEIEntity(
                    lei=full_entity.lei,
                    legal_name=full_entity.legal_name,
                    other_names=other_names,
                    entity_status=full_entity.entity_status,
                    registration_status=full_entity.registration_status,
                    country=legal_address.country,
                    country_code=legal_address.country,
                    city=legal_address.city,
                    registration_date=reg.initial_registration_date,
                    expiration_date=reg.next_renewal_date,
                    legal_address=", ".join(legal_address.address_lines),
                    full_data=full_entity
                ))
            
            meta = data.get("meta", {}).get("pagination", {})
            
            return LEISearchResponse(
                total=meta.get("total", len(entities)),
                page=page,
                page_size=page_size,
                data=entities
            )
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"GLEIF API error: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{lei}/modifications", response_model=List[FieldModification])
async def get_lei_modifications(
    lei: str,
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Fetch historical field modifications for a specific LEI.
    """
    url = f"{GLEIF_API_URL}/{lei}/field-modifications"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return []
            response.raise_for_status()
            data = response.json()
            
            modifications = []
            for item in data.get("data", []):
                attrs = item.get("attributes", {})
                modifications.append(FieldModification(
                    field=attrs.get("field", "Unknown"),
                    previous_value=str(attrs.get("previousValue")) if attrs.get("previousValue") is not None else None,
                    new_value=str(attrs.get("newValue")) if attrs.get("newValue") is not None else None,
                    modification_date=attrs.get("modificationDate")
                ))
            
            return modifications
    except Exception as e:
        print(f"Error fetching modifications: {e}")
        return []
