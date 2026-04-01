from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import time
from datetime import datetime

from ..db.session import get_db
from ..models.models import User
from ..api.auth import get_current_active_user
from ..schemas.screening import (
    ScreeningRequest, ScreeningResponse, 
    BatchScreeningRequest, BatchScreeningResponse,
    RiskLevel
)
from ..services.screening import perform_screening

router = APIRouter(prefix="/api/v1/screening", tags=["Screening"])

@router.post(
    "/screen",
    response_model=ScreeningResponse,
    summary="Screen an individual or entity",
    description="""
Screen a person or company against all OpenSanctions data.
Uses the refactored `perform_screening` service.
"""
)
async def screen(
    req: ScreeningRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await perform_screening(db, current_user.username, req)

@router.post(
    "/batch",
    response_model=BatchScreeningResponse,
    summary="Screen multiple individuals or entities in one call",
)
async def batch_screen(
    req: BatchScreeningRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if not req.screenings:
        raise HTTPException(status_code=422, detail="Provide at least one screening.")
    if len(req.screenings) > 100:
        raise HTTPException(status_code=422, detail="Maximum 100 screenings per batch.")

    start_ms = time.time()
    results  = []

    for s in req.screenings:
        if req.screening_reason:
            s.screening_reason = req.screening_reason
        
        result = await perform_screening(db, current_user.username, s)
        results.append(result)

    duration_ms = int((time.time() - start_ms) * 1000)

    return BatchScreeningResponse(
        total       = len(results),
        high_risk   = sum(1 for r in results if r.risk_level == RiskLevel.HIGH),
        medium_risk = sum(1 for r in results if r.risk_level == RiskLevel.MEDIUM),
        low_risk    = sum(1 for r in results if r.risk_level == RiskLevel.LOW),
        duration_ms = duration_ms,
        results     = results,
    )
