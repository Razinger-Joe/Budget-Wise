from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.savings_rule import SavingsRuleCreate, SavingsRuleRead, SavingsRuleToggle
from app.services.savings_rule_service import SavingsRuleService
from app.dependencies import get_current_user
from app.models.user import User
from typing import List
import uuid

router = APIRouter()

@router.post("/", response_model=SavingsRuleRead, status_code=status.HTTP_201_CREATED)
async def create_rule(
    data: SavingsRuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SavingsRuleService(db)
    return await service.create_rule(current_user.id, data)

@router.get("/", response_model=List[SavingsRuleRead])
async def list_rules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SavingsRuleService(db)
    return await service.list_rules(current_user.id)

@router.patch("/{rule_id}", response_model=SavingsRuleRead)
async def toggle_rule(
    rule_id: uuid.UUID,
    data: SavingsRuleToggle,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SavingsRuleService(db)
    return await service.toggle_rule(current_user.id, rule_id, data)
