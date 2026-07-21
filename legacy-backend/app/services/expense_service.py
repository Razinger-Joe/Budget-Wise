from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.expense import ExpenseEntry
from app.models.bucket import BucketBalance
from app.schemas.expense import ExpenseCreate
import uuid
from fastapi import HTTPException, status

class ExpenseService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_expense(self, user_id: uuid.UUID, data: ExpenseCreate) -> ExpenseEntry:
        # Create ExpenseEntry
        new_expense = ExpenseEntry(
            user_id=user_id,
            description=data.description,
            amount=data.amount,
            category=data.category,
            bucket_source=data.bucket_source,
            date_spent=data.date_spent,
            notes=data.notes
        )
        self.db.add(new_expense)
        
        # Deduct from bucket (basic or personal)
        stmt = select(BucketBalance).where(BucketBalance.user_id == user_id)
        result = await self.db.execute(stmt)
        balance = result.scalar_one_or_none()
        
        if not balance:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No bucket balance found for user.")
        
        bucket_source = data.bucket_source.lower()
        if bucket_source not in ['basic', 'personal']:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid bucket source. Must be 'basic' or 'personal'.")
            
        current_balance = getattr(balance, bucket_source)
        setattr(balance, bucket_source, current_balance - data.amount)
        
        await self.db.commit()
        await self.db.refresh(new_expense)
        return new_expense

    async def list_expenses(self, user_id: uuid.UUID) -> list:
        stmt = select(ExpenseEntry).where(ExpenseEntry.user_id == user_id).order_by(ExpenseEntry.date_spent.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
