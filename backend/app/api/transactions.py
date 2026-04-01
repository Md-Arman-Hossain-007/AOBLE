from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from ..db.session import get_db
from ..api.auth import get_current_active_user
from ..models import models
from ..schemas import transactions as schemas
from ..schemas import screening as screening_schemas
from ..services.screening import perform_screening

router = APIRouter(prefix="/api/v1/transactions", tags=["Transaction Monitoring"])

@router.post("/screen", response_model=schemas.TransactionScreenResponse)
async def screen_transaction(
    request: schemas.TransactionScreenRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Screen a transaction by checking both sender and receiver against sanctions and PEP lists.
    """
    transaction_id = str(uuid.uuid4())
    
    # 1. Screen Sender
    sender_req = screening_schemas.ScreeningRequest(
        individual=screening_schemas.IndividualScreenRequest(
            name=request.sender.name,
            nationality=request.sender.country
        ),
        customer_ref=f"TX-{transaction_id}-SENDER",
        screening_reason="transaction",
        screened_by=current_user.username
    )
    sender_res = await perform_screening(db, current_user.username, sender_req)
    
    # 2. Screen Receiver
    receiver_req = screening_schemas.ScreeningRequest(
        individual=screening_schemas.IndividualScreenRequest(
            name=request.receiver.name,
            nationality=request.receiver.country
        ),
        customer_ref=f"TX-{transaction_id}-RECEIVER",
        screening_reason="transaction",
        screened_by=current_user.username
    )
    receiver_res = await perform_screening(db, current_user.username, receiver_req)
    
    # 3. Determine Overall Risk and Status
    overall_risk = "LOW"
    status = "cleared"
    
    # Simple logic: if either is high risk, flag it
    if sender_res.risk_level.value == "HIGH" or receiver_res.risk_level.value == "HIGH":
        overall_risk = "HIGH"
        status = "flagged"
    elif sender_res.risk_level.value == "MEDIUM" or receiver_res.risk_level.value == "MEDIUM":
        overall_risk = "MEDIUM"
        status = "hold"
        
    return schemas.TransactionScreenResponse(
        transaction_id = transaction_id,
        status         = status,
        risk_level     = overall_risk,
        sender_match = schemas.ParticipantMatch(
            participant_role = "sender",
            match_found      = sender_res.match_count > 0,
            top_score        = sender_res.top_score,
            risk_level       = sender_res.risk_level.value,
            match_caption    = sender_res.matches[0].caption if sender_res.matches else None,
            entity_id        = sender_res.matches[0].entity_id if sender_res.matches else None
        ),
        receiver_match = schemas.ParticipantMatch(
            participant_role = "receiver",
            match_found      = receiver_res.match_count > 0,
            top_score        = receiver_res.top_score,
            risk_level       = receiver_res.risk_level.value,
            match_caption    = receiver_res.matches[0].caption if receiver_res.matches else None,
            entity_id        = receiver_res.matches[0].entity_id if receiver_res.matches else None
        ),
        timestamp = datetime.utcnow()
    )
