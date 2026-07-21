from pydantic import BaseModel
from decimal import Decimal

class MonthlySummary(BaseModel):
    month: str
    year: int
    total_income: Decimal
    total_expenses: Decimal
    net_savings: Decimal

class CategoryBreakdown(BaseModel):
    category: str
    total_amount: Decimal
    percentage: float
    transaction_count: int
