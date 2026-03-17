from sqlalchemy import String, Numeric, ForeignKey, Enum, Boolean, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
import enum
from decimal import Decimal
from app.models.base import Base, TimestampMixin

class RuleType(str, enum.Enum):
    PERCENT = "percent"
    FIXED = "fixed"
    SURPLUS = "surplus"
    ROUNDUP = "roundup"
    BOOST = "boost"

class BucketKey(str, enum.Enum):
    BASIC = "basic"
    EMERGENCY = "emergency"
    PERSONAL = "personal"
    INVEST = "invest"

class TriggerEvent(str, enum.Enum):
    ON_INCOME = "on_income"
    MONTHLY = "monthly"
    TRANSACTION = "transaction"

class SavingsRule(Base, TimestampMixin):
    __tablename__ = "savings_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    rule_type: Mapped[RuleType] = mapped_column(Enum(RuleType), nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=True)
    target_bucket: Mapped[BucketKey] = mapped_column(Enum(BucketKey), nullable=False)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    trigger_event: Mapped[TriggerEvent] = mapped_column(Enum(TriggerEvent), default=TriggerEvent.ON_INCOME)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="savings_rules")
