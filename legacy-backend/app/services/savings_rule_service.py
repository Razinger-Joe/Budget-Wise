from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.savings_rule import SavingsRule
from app.schemas.savings_rule import SavingsRuleCreate, SavingsRuleToggle
from fastapi import HTTPException, status
import uuid

class SavingsRuleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_rule(self, user_id: uuid.UUID, data: SavingsRuleCreate) -> SavingsRule:
        rule = SavingsRule(
            user_id=user_id,
            label=data.label,
            rule_type=data.rule_type,
            target_bucket=data.target_bucket,
            value=data.value,
            trigger_event=data.trigger_event
        )
        self.db.add(rule)
        await self.db.commit()
        await self.db.refresh(rule)
        return rule

    async def list_rules(self, user_id: uuid.UUID) -> list:
        stmt = select(SavingsRule).where(SavingsRule.user_id == user_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def toggle_rule(self, user_id: uuid.UUID, rule_id: uuid.UUID, data: SavingsRuleToggle) -> SavingsRule:
        stmt = select(SavingsRule).where(SavingsRule.id == rule_id, SavingsRule.user_id == user_id)
        result = await self.db.execute(stmt)
        rule = result.scalar_one_or_none()
        
        if not rule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found or not owned by user.")
            
        rule.is_active = data.is_active
        await self.db.commit()
        await self.db.refresh(rule)
        return rule
