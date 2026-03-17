import json
from typing import List, Optional
from anthropic import AsyncAnthropic
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.models.insight import AIInsight, InsightType, Severity
from app.schemas.insight import InsightRead, UserFinancialContext
import uuid
from datetime import datetime, timedelta

class AIService:
    def __init__(self, db: AsyncSession, client: AsyncAnthropic):
        self.db = db
        self.client = client

    async def generate_insights(self, user_id: uuid.UUID, context: UserFinancialContext) -> List[AIInsight]:
        system_prompt = (
            "You are Legacy — a personal finance AI advisor built into a KSH-based financial tracking app. "
            "You analyze a user's financial data and provide clear, actionable, non-technical insights. "
            "Always use KSH currency. Be direct, encouraging, and specific. "
            "Respond only in valid JSON matching the mapping of InsightRead schema. "
            "Never make up numbers not present in the data provided."
        )
        
        user_prompt = f"Analyze this user's financial data and return a JSON array of 3-5 insights. Data: {context.model_dump_json()}"
        
        try:
            response = await self.client.messages.create(
                model=settings.ANTHROPIC_MODEL,
                max_tokens=settings.ANTHROPIC_MAX_TOKENS,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )
            
            content = response.content[0].text
            # Simple clean up of markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            insights_data = json.loads(content)
            
            created_insights = []
            for item in insights_data:
                insight = AIInsight(
                    user_id=user_id,
                    insight_type=InsightType(item["type"]),
                    title=item["title"],
                    body=item["body"],
                    severity=Severity(item["severity"]),
                    action_label=item.get("action_label"),
                    action_value=item.get("action_value"),
                    model_used=settings.ANTHROPIC_MODEL,
                    prompt_tokens=response.usage.input_tokens,
                    completion_tokens=response.usage.output_tokens,
                    expires_at=datetime.utcnow() + timedelta(seconds=settings.AI_INSIGHT_CACHE_TTL_SECONDS)
                )
                self.db.add(insight)
                created_insights.append(insight)
            
            await self.db.commit()
            return created_insights
            
        except Exception as e:
            # TODO: Add structured logging
            print(f"Error calling Anthropic: {e}")
            return []
