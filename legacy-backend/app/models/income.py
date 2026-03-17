from sqlalchemy import String, Numeric, Date, ForeignKey, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from datetime import date
from decimal import Decimal
from app.models.base import Base, TimestampMixin

class IncomeEntry(Base, TimestampMixin):
    __tablename__ = "income_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    date_received: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Splits based on 50/15/15/20 engine
    split_basic: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    split_emergency: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    split_personal: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    split_invest: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    
    notes: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="income_entries")
