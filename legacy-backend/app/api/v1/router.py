from fastapi import APIRouter
from app.api.v1 import auth, income

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(income.router, prefix="/income", tags=["income"])
# TODO: Include other routers (expenses, buckets, rules, analytics, insights)
