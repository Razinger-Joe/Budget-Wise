from sqlalchemy import String, Text, ForeignKey, Enum, Integer, DateTime, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
import enum
from datetime import datetime
from app.models.base import Base

class InsightType(str, enum.Enum):
    SPENDING_ANALYSIS = "spending_analysis"
    SAVINGS_TIP = "savings_tip"
    GOAL_PROJECTION = "goal_projection"
    BUDGET_WARNING = "budget_warning"
    BEHAVIORAL = "behavioral"

class Severity(str, enum.Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    DANGER = "danger"
    TIP = "tip"

class AIInsight(Base):
    __tablename__ = "ai_insights"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    insight_type: Mapped[InsightType] = mapped_column(Enum(InsightType), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    action_label: Mapped[str] = mapped_column(String(100), nullable=True)
    action_value: Mapped[str] = mapped_column(String(200), nullable=True)
    severity: Mapped[Severity] = mapped_column(Enum(Severity), default=Severity.INFO)
    
    model_used: Mapped[str] = mapped_column(String(50))
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="ai_insights")
