from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict
import uuid
from decimal import Decimal

class UserFinancialContext(BaseModel):
    total_income_this_month: Decimal
    total_expenses_this_month: Decimal
    basic_budget: Decimal
    basic_spent: Decimal
    savings_rate_pct: float
    bucket_balances: Dict[str, Decimal]
    expenses_by_category: Dict[str, Decimal]
    active_rules_count: int
    emergency_fund_months_covered: float
    legacy_score: int

class InsightRead(BaseModel):
    id: uuid.UUID
    insight_type: str
    title: str
    body: str
    action_label: Optional[str] = None
    action_value: Optional[str] = None
    severity: str
    generated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
