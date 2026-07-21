from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.income import IncomeEntry
from app.models.expense import ExpenseEntry
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
import uuid

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def monthly_summary(self, user_id: uuid.UUID, months: int = 6) -> list:
        today = date.today()
        start_date = today - relativedelta(months=months)
        
        # Monthly Income
        income_stmt = (
            select(
                func.to_char(IncomeEntry.date_received, 'YYYY-MM').label('month'),
                func.sum(IncomeEntry.amount).label('total')
            )
            .where(
                and_(IncomeEntry.user_id == user_id, IncomeEntry.date_received >= start_date)
            )
            .group_by('month')
        )
        
        # Monthly Expenses
        expense_stmt = (
            select(
                func.to_char(ExpenseEntry.date_spent, 'YYYY-MM').label('month'),
                func.sum(ExpenseEntry.amount).label('total')
            )
            .where(
                and_(ExpenseEntry.user_id == user_id, ExpenseEntry.date_spent >= start_date)
            )
            .group_by('month')
        )
        
        income_result = await self.db.execute(income_stmt)
        expense_result = await self.db.execute(expense_stmt)
        
        incomes = {row.month: row.total for row in income_result.all()}
        expenses = {row.month: row.total for row in expense_result.all()}
        
        months_set = set(incomes.keys()).union(set(expenses.keys()))
        
        results = []
        for month_str in sorted(months_set, reverse=True):
            year, month = map(int, month_str.split('-'))
            total_income = incomes.get(month_str, 0)
            total_expenses = expenses.get(month_str, 0)
            net_savings = total_income - total_expenses
            
            results.append({
                "month": datetime(year, month, 1).strftime('%B'),
                "year": year,
                "total_income": total_income,
                "total_expenses": total_expenses,
                "net_savings": net_savings
            })
            
        return results

    async def category_breakdown(self, user_id: uuid.UUID, month: int = None, year: int = None) -> list:
        query = select(
            ExpenseEntry.category,
            func.sum(ExpenseEntry.amount).label('total_amount'),
            func.count(ExpenseEntry.id).label('transaction_count')
        ).where(ExpenseEntry.user_id == user_id)
        
        if month and year:
            start_date = date(year, month, 1)
            next_month = start_date + relativedelta(months=1)
            query = query.where(and_(ExpenseEntry.date_spent >= start_date, ExpenseEntry.date_spent < next_month))
            
        query = query.group_by(ExpenseEntry.category)
        
        result = await self.db.execute(query)
        rows = result.all()
        
        total_spent = sum(row.total_amount for row in rows) if rows else 1 # avoid division by zero
        if total_spent == 0:
            total_spent = 1
            
        breakdown = []
        for row in rows:
            breakdown.append({
                "category": row.category.value if hasattr(row.category, 'value') else row.category,
                "total_amount": row.total_amount,
                "percentage": float((row.total_amount / total_spent) * 100),
                "transaction_count": row.transaction_count
            })
            
        return breakdown
