from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.analytics import MonthlySummary, CategoryBreakdown
from app.services.analytics_service import AnalyticsService
from app.dependencies import get_current_user
from app.models.user import User
from typing import List, Optional

router = APIRouter()

@router.get("/monthly", response_model=List[MonthlySummary])
async def get_monthly_summary(
    months: int = Query(6, ge=1, le=24),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService(db)
    return await service.monthly_summary(current_user.id, months)

@router.get("/categories", response_model=List[CategoryBreakdown])
async def get_category_breakdown(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AnalyticsService(db)
    return await service.category_breakdown(current_user.id, month, year)
