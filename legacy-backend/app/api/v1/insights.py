from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.schemas.insight import InsightRead, UserFinancialContext
from app.services.ai_service import AIService
from app.services.bucket_service import BucketService
from app.dependencies import get_current_user
from app.models.user import User
from app.models.income import IncomeEntry
from app.models.expense import ExpenseEntry
from app.models.savings_rule import SavingsRule
from app.models.insight import AIInsight
from app.config import settings
from anthropic import AsyncAnthropic
from typing import List
from datetime import datetime, date
from decimal import Decimal
import uuid

router = APIRouter()

@router.get("/", response_model=List[InsightRead])
async def list_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(AIInsight).where(
        AIInsight.user_id == current_user.id,
        AIInsight.expires_at > datetime.utcnow()
    ).order_by(AIInsight.generated_at.desc())
    
    result = await db.execute(stmt)
    return list(result.scalars().all())

@router.post("/generate", response_model=List[InsightRead])
async def generate_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    first_of_month = date(today.year, today.month, 1)
    
    # Total income this month
    income_result = await db.execute(
        select(func.coalesce(func.sum(IncomeEntry.amount), 0)).where(
            and_(IncomeEntry.user_id == current_user.id, IncomeEntry.date_received >= first_of_month)
        )
    )
    total_income = income_result.scalar() or Decimal("0")
    
    # Total expenses this month
    expense_result = await db.execute(
        select(func.coalesce(func.sum(ExpenseEntry.amount), 0)).where(
            and_(ExpenseEntry.user_id == current_user.id, ExpenseEntry.date_spent >= first_of_month)
        )
    )
    total_expenses = expense_result.scalar() or Decimal("0")
    
    # Expenses by category this month
    cat_result = await db.execute(
        select(ExpenseEntry.category, func.sum(ExpenseEntry.amount)).where(
            and_(ExpenseEntry.user_id == current_user.id, ExpenseEntry.date_spent >= first_of_month)
        ).group_by(ExpenseEntry.category)
    )
    expenses_by_category = {
        (row[0].value if hasattr(row[0], 'value') else str(row[0])): row[1]
        for row in cat_result.all()
    }
    
    # Bucket balances
    bucket_service = BucketService(db)
    buckets = await bucket_service.get_balances(current_user.id)
    bucket_balances = {
        "basic": buckets.basic,
        "emergency": buckets.emergency,
        "personal": buckets.personal,
        "invest": buckets.invest,
    }
    
    # Basic budget and spent
    basic_spent_result = await db.execute(
        select(func.coalesce(func.sum(ExpenseEntry.amount), 0)).where(
            and_(ExpenseEntry.user_id == current_user.id, ExpenseEntry.date_spent >= first_of_month,
                 ExpenseEntry.bucket_source == "basic")
        )
    )
    basic_spent = basic_spent_result.scalar() or Decimal("0")
    
    # Savings rate
    savings_rate = float((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
    
    # Active rules
    rules_result = await db.execute(
        select(func.count()).where(
            and_(SavingsRule.user_id == current_user.id, SavingsRule.is_active == True)
        )
    )
    active_rules = rules_result.scalar() or 0
    
    # Emergency fund coverage (months of basic expenses covered)
    avg_monthly_basic = total_expenses if total_expenses > 0 else Decimal("1")
    emergency_months = float(buckets.emergency / avg_monthly_basic) if avg_monthly_basic > 0 else 0
    
    # Legacy score (simple heuristic: 50 base + savings_rate/2 + emergency_months*3, capped at 100)
    legacy_score = min(100, int(50 + savings_rate / 2 + emergency_months * 3))
    
    context = UserFinancialContext(
        total_income_this_month=total_income,
        total_expenses_this_month=total_expenses,
        basic_budget=buckets.basic,
        basic_spent=basic_spent,
        savings_rate_pct=savings_rate,
        bucket_balances=bucket_balances,
        expenses_by_category=expenses_by_category,
        active_rules_count=active_rules,
        emergency_fund_months_covered=emergency_months,
        legacy_score=legacy_score
    )
    
    client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    service = AIService(db=db, client=client)
    
    return await service.generate_insights(current_user.id, context)
