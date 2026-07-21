from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.bucket import BucketRead, BucketTransfer
from app.services.bucket_service import BucketService
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=BucketRead)
async def get_balances(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BucketService(db)
    return await service.get_balances(current_user.id)

@router.post("/transfer", response_model=BucketRead)
async def transfer_funds(
    data: BucketTransfer,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BucketService(db)
    return await service.transfer(current_user.id, data)
