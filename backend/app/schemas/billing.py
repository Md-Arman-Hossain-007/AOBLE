from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubscriptionBase(BaseModel):
    plan: str = "starter"
    billing_cycle: str = "monthly"

class SubscriptionUpdate(BaseModel):
    plan: Optional[str] = None
    billing_cycle: Optional[str] = None

class SubscriptionResponse(BaseModel):
    id: str
    org_id: Optional[str]
    plan: str
    status: str
    billing_cycle: str
    seats_used: int
    seats_limit: int
    screenings_used: int
    screenings_limit: int
    next_billing_date: Optional[datetime]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}

class UsageResponse(BaseModel):
    seats_used: int
    seats_limit: int
    screenings_used: int
    screenings_limit: int
    plan: str
    status: str
