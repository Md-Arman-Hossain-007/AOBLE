from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TransactionParticipant(BaseModel):
    name: str
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    country: Optional[str] = None

class TransactionScreenRequest(BaseModel):
    sender: TransactionParticipant
    receiver: TransactionParticipant
    amount: float
    currency: str = "USD"
    reference: Optional[str] = None
    transaction_date: Optional[datetime] = None

class ParticipantMatch(BaseModel):
    participant_role: str  # "sender" or "receiver"
    match_found: bool
    top_score: float = 0.0
    risk_level: str = "LOW"
    match_caption: Optional[str] = None
    entity_id: Optional[str] = None

class TransactionScreenResponse(BaseModel):
    transaction_id: str
    status: str  # "cleared", "flagged", "hold"
    risk_level: str
    sender_match: ParticipantMatch
    receiver_match: ParticipantMatch
    timestamp: datetime
