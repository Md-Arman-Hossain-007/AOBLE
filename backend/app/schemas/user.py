from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None
    expires_in: Optional[int] = None
    user: Optional['UserResponse'] = None
    twofa_required: bool = Field(default=False, alias="2fa_required")
    username: Optional[str] = None

    class Config:
        populate_by_name = True

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: Optional[str] = "Compliance Officer"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    api_key: str
    is_active: bool
    is_2fa_enabled: bool
    role: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Verify2FA(BaseModel):
    code: str

class Enable2FA(BaseModel):
    code: str
    secret: str

class ForgotPassword(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserRoleUpdate(BaseModel):
    role: str

class UserStatusUpdate(BaseModel):
    is_active: bool
