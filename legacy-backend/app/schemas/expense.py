from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from decimal import Decimal
from datetime import date
from uuid import UUID

class ExpenseBase(BaseModel):
    description: str = Field(..., max_length=200)
    amount: Decimal = Field(..., gt=0)
    category: str
    bucket_source: str
    date_spent: date
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseRead(ExpenseBase):
    id: UUID
    user_id: UUID
    import_source: str
    
    model_config = ConfigDict(from_attributes=True)
