from pydantic import BaseModel
from typing import Optional

class OrganizationBase(BaseModel):
    name: str
    domain: Optional[str] = None
    is_active: bool = True

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    is_active: Optional[bool] = None

class OrganizationResponse(OrganizationBase):
    id: str

    class Config:
        from_attributes = True
