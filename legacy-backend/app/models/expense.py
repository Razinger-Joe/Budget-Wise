from sqlalchemy import String, Numeric, Date, ForeignKey, Enum, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from datetime import date
from decimal import Decimal
import enum
from app.models.base import Base, TimestampMixin

class ExpenseCategory(str, enum.Enum):
    RENT = "rent"
    FOOD = "food"
    CLOTHING = "clothing"
    UTILITIES = "utilities"
    TRANSPORT = "transport"
    ENTERTAINMENT = "entertainment"
    DINING = "dining"
    HEALTH = "health"
    OTHER = "other"

class BucketSource(str, enum.Enum):
    BASIC = "basic"
    PERSONAL = "personal"

class ExpenseEntry(Base, TimestampMixin):
    __tablename__ = "expense_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    category: Mapped[ExpenseCategory] = mapped_column(Enum(ExpenseCategory), nullable=False)
    bucket_source: Mapped[BucketSource] = mapped_column(Enum(BucketSource), nullable=False)
    date_spent: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str] = mapped_column(String(255), nullable=True)
    import_source: Mapped[str] = mapped_column(String(20), default="manual")

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="expense_entries")
