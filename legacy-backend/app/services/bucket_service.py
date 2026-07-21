from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.bucket import BucketBalance
from app.schemas.bucket import BucketTransfer
from fastapi import HTTPException, status
import uuid

class BucketService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_balances(self, user_id: uuid.UUID) -> BucketBalance:
        stmt = select(BucketBalance).where(BucketBalance.user_id == user_id)
        result = await self.db.execute(stmt)
        balance = result.scalar_one_or_none()
        
        if not balance:
            return await self.initialize_default_buckets(user_id)
            
        return balance

    async def transfer(self, user_id: uuid.UUID, data: BucketTransfer):
        if data.from_bucket.lower() == data.to_bucket.lower():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot transfer to the same bucket.")
            
        if data.from_bucket.lower() == 'emergency':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot transfer from emergency bucket (locked).")
            
        balance = await self.get_balances(user_id)
        
        from_attr = data.from_bucket.lower()
        to_attr = data.to_bucket.lower()
        
        valid_buckets = ['basic', 'emergency', 'personal', 'invest']
        if from_attr not in valid_buckets or to_attr not in valid_buckets:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid bucket name.")
            
        current_from_balance = getattr(balance, from_attr)
        if current_from_balance < data.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance for transfer.")
            
        setattr(balance, from_attr, current_from_balance - data.amount)
        current_to_balance = getattr(balance, to_attr)
        setattr(balance, to_attr, current_to_balance + data.amount)
        
        await self.db.commit()
        await self.db.refresh(balance)
        return balance

    async def initialize_default_buckets(self, user_id: uuid.UUID) -> BucketBalance:
        balance = BucketBalance(user_id=user_id, basic=0, emergency=0, personal=0, invest=0)
        self.db.add(balance)
        await self.db.commit()
        await self.db.refresh(balance)
        return balance
