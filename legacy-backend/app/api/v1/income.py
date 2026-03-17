from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.income import IncomeCreate, IncomeRead
from app.services.income_service import IncomeService
from app.dependencies import get_current_user
from app.models.user import User
from typing import List
import uuid

# TODO: Implement get_current_user dependency
async def get_current_user_mock():
    # Placeholder until security dependency is implemented
    return uuid.uuid4()

router = APIRouter()

@router.post("/", response_model=IncomeRead, status_code=status.HTTP_201_CREATED)
async def log_income(
    income_in: IncomeCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income_service = IncomeService(db)
    return await income_service.log_income(current_user.id, income_in)

@router.get("/", response_model=List[IncomeRead])
async def list_income(db: AsyncSession = Depends(get_db)):
    # Placeholder for list logic
    return []
