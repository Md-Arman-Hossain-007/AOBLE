from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import uuid
from typing import Union, List, Any

from ..db.session import get_db
from ..models import models
from ..schemas.screening import (
    RESTIndividualRequest, RESTCompanyRequest,
    ScreeningRequest, IndividualScreenRequest, EntityScreenRequest,
    Algorithm
)
from ..services.screening import perform_screening, screening_service

router = APIRouter(prefix="/api/v1/amltab", tags=["AMLtab REST API"])

async def verify_api_key(
    amltab_api_key: str = Header(..., alias="amltab-api-key"),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.api_key == amltab_api_key).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return user

@router.post("/screenings", summary="Unified Screening API")
@router.post("/screenings/", include_in_schema=False)
async def amltab_screening(
    payload: Union[RESTIndividualRequest, RESTCompanyRequest],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(verify_api_key)
):
    """
    Unified screening API that performs the initial match search and 
    automatically fetches deep-dive data for all identified matches.
    """
    
    # Normalize threshold (handle 0-100 or 0.0-1.0)
    threshold = payload.threshold
    if threshold > 1.0:
        threshold = threshold / 100.0

    # 1. Map to internal ScreeningRequest
    if payload.type == "individual":
        req = ScreeningRequest(
            individual=IndividualScreenRequest(
                name=f"{payload.first_name} {payload.last_name}",
                birth_date=payload.dob,
                nationality=payload.country
            ),
            customer_ref=str(uuid.uuid4()),
            threshold=threshold,
            algorithm=Algorithm.logic_v2
        )
    else:
        req = ScreeningRequest(
            entity=EntityScreenRequest(
                name=payload.name,
                country=payload.country,
                registration_number=payload.registration_number
            ),
            customer_ref=str(uuid.uuid4()),
            threshold=threshold,
            algorithm=Algorithm.logic_v2
        )
    
    # 2. Perform screening
    result = await perform_screening(db, current_user.username, req)
    
    # 3. Enhance matches with deep-dive data
    enhanced_matches = []
    for match in result.matches:
        try:
            # Fetch deep dive data from the service
            details = await screening_service.get_entity_details(match.entity_id)
            
            # Combine match overview with deep-dive details
            match_data = match.model_dump()
            match_data["name"] = match.caption  # Ensure consistent naming
            match_data["deep_dive"] = details
            enhanced_matches.append(match_data)
        except Exception as e:
            # Fallback to standard match result if deep-dive fails
            print(f"Error fetching deep-dive for {match.entity_id}: {e}")
            enhanced_matches.append(match.model_dump())
            
    # 4. Return unified response
    return {
        "screening_id": result.screening_id,
        "overall_status": result.auto_decision,
        "risk_level": result.risk_level,
        "match_count": result.match_count,
        "screened_at": result.screened_at,
        "query": {
            "name": result.query_name,
            "type": payload.type,
            "details": result.query_details
        },
        "matches": enhanced_matches
    }
