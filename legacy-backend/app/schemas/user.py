from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
import uuid

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserRead(UserBase):
    id: uuid.UUID
    is_active: bool
    currency: str
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserRead

class TokenData(BaseModel):
    user_id: Optional[str] = None
