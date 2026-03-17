from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.income import IncomeEntry
from app.models.bucket import BucketBalance
from app.schemas.income import IncomeCreate, IncomeRead
import uuid

class IncomeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def calculate_splits(amount: Decimal) -> dict:
        """Core 50/15/15/20 allocation engine with rounding protection."""
        basic = (amount * Decimal("0.50")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        emergency = (amount * Decimal("0.15")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        personal = (amount * Decimal("0.15")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        
        # Use remainder method for investment to avoid rounding drift
        invest = amount - basic - emergency - personal
        
        return {
            "basic": basic,
            "emergency": emergency,
            "personal": personal,
            "invest": invest
        }

    async def log_income(self, user_id: uuid.UUID, income_data: IncomeCreate) -> IncomeEntry:
        splits = self.calculate_splits(income_data.amount)
        
        # Create IncomeEntry
        new_income = IncomeEntry(
            user_id=user_id,
            source=income_data.source,
            amount=income_data.amount,
            date_received=income_data.date_received,
            split_basic=splits["basic"],
            split_emergency=splits["emergency"],
            split_personal=splits["personal"],
            split_invest=splits["invest"],
            notes=income_data.notes
        )
        self.db.add(new_income)
        
        # Atomic Update for BucketBalance
        # First ensure balance exists
        stmt = select(BucketBalance).where(BucketBalance.user_id == user_id)
        result = await self.db.execute(stmt)
        balance = result.scalar_one_or_none()
        
        if not balance:
            balance = BucketBalance(user_id=user_id)
            self.db.add(balance)
            await self.db.flush()
        
        # Update balance values
        balance.basic += splits["basic"]
        balance.emergency += splits["emergency"]
        balance.personal += splits["personal"]
        balance.invest += splits["invest"]
        
        # TODO: Execute active savings rules
        # TODO: Invalidate AI insights cache
        
        await self.db.commit()
        await self.db.refresh(new_income)
        return new_income
