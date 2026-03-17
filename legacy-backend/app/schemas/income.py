from pydantic import BaseModel, Field, ConfigDict, model_validator
from decimal import Decimal
from datetime import date
import uuid
from typing import Optional

class IncomeBase(BaseModel):
    source: str = Field(..., max_length=100)
    amount: Decimal = Field(..., gt=0)
    date_received: date
    notes: Optional[str] = None

class IncomeCreate(IncomeBase):
    pass

class IncomeRead(IncomeBase):
    id: uuid.UUID
    user_id: uuid.UUID
    split_basic: Decimal
    split_emergency: Decimal
    split_personal: Decimal
    split_invest: Decimal
    
    model_config = ConfigDict(from_attributes=True)

class IncomeSplit(BaseModel):
    basic: Decimal
    emergency: Decimal
    personal: Decimal
    invest: Decimal

    @model_validator(mode="after")
    def validate_sum(self, info):
        # This would be validated against the original amount in a higher level schema if needed
        return self
