from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from decimal import Decimal
from uuid import UUID

class SavingsRuleBase(BaseModel):
    label: str = Field(..., max_length=200)
    rule_type: str
    target_bucket: str
    value: Optional[Decimal] = None
    trigger_event: str = "on_income"

class SavingsRuleCreate(SavingsRuleBase):
    pass

class SavingsRuleRead(SavingsRuleBase):
    id: UUID
    user_id: UUID
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)

class SavingsRuleToggle(BaseModel):
    is_active: bool
