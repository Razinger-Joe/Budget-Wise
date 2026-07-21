from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseRead
from app.services.expense_service import ExpenseService
from app.dependencies import get_current_user
from app.models.user import User
from typing import List

router = APIRouter()

@router.post("/", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
async def create_expense(
    data: ExpenseCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExpenseService(db)
    return await service.create_expense(current_user.id, data)

@router.get("/", response_model=List[ExpenseRead])
async def list_expenses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExpenseService(db)
    return await service.list_expenses(current_user.id)
