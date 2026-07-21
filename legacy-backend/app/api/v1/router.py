from fastapi import APIRouter
from app.api.v1 import auth, income, expenses, buckets, analytics, insights, rules

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(income.router, prefix="/income", tags=["income"])
api_v1_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_v1_router.include_router(buckets.router, prefix="/buckets", tags=["buckets"])
api_v1_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_v1_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_v1_router.include_router(rules.router, prefix="/rules", tags=["rules"])
