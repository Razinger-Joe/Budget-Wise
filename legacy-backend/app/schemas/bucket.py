from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal

class BucketRead(BaseModel):
    basic: Decimal
    emergency: Decimal
    personal: Decimal
    invest: Decimal
    
    model_config = ConfigDict(from_attributes=True)

class BucketTransfer(BaseModel):
    from_bucket: str
    to_bucket: str
    amount: Decimal = Field(..., gt=0)
