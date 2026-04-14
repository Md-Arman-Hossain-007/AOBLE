from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Address(BaseModel):
    address_lines: List[str]
    city: Optional[str] = None
    region: Optional[str] = None
    country: str
    postal_code: Optional[str] = None

class Registration(BaseModel):
    initial_registration_date: Optional[str] = None
    last_update_date: Optional[str] = None
    status: Optional[str] = None
    next_renewal_date: Optional[str] = None
    registration_authority_entity_id: Optional[str] = None
    validation_sources: Optional[str] = None
    validation_state: Optional[str] = None
    lei_issuer: Optional[str] = None

class Relationship(BaseModel):
    lei: Optional[str] = None
    name: Optional[str] = None
    relationship_type: str
    status: str

class FieldModification(BaseModel):
    field: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    modification_date: Optional[str] = None

class LEIEntityFull(BaseModel):
    lei: str
    legal_name: str
    other_names: List[Dict[str, str]] = []
    entity_status: str
    registration_status: str
    jurisdiction: str
    category: str
    legal_address: Address
    headquarters_address: Optional[Address] = None
    registration_authority: Dict[str, Any] = {}
    legal_form: Dict[str, Any] = {}
    registration: Registration
    entity_expiration_date: Optional[str] = None
    entity_expiration_reason: Optional[str] = None
    successor_entity: Dict[str, Any] = {}
    parents: List[Relationship] = []
    children: List[Relationship] = []
    modifications: List[FieldModification] = []

class LEIEntity(BaseModel):
    lei: str
    legal_name: str
    other_names: List[Dict[str, str]] = []
    entity_status: str
    registration_status: str
    country: str
    country_code: str
    city: Optional[str] = None
    registration_date: Optional[str] = None
    expiration_date: Optional[str] = None
    legal_address: Optional[str] = None
    full_data: Optional[LEIEntityFull] = None

class LEISearchResponse(BaseModel):
    total: int
    page: int
    page_size: int
    data: List[LEIEntity]
