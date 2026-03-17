from sqlalchemy import String, Boolean, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from app.models.base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="KSH")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    income_entries: Mapped[list["IncomeEntry"]] = relationship("IncomeEntry", back_populates="user", cascade="all, delete-orphan")
    expense_entries: Mapped[list["ExpenseEntry"]] = relationship("ExpenseEntry", back_populates="user", cascade="all, delete-orphan")
    bucket_balance: Mapped["BucketBalance"] = relationship("BucketBalance", back_populates="user", uselist=False, cascade="all, delete-orphan")
    savings_rules: Mapped[list["SavingsRule"]] = relationship("SavingsRule", back_populates="user", cascade="all, delete-orphan")
    ai_insights: Mapped[list["AIInsight"]] = relationship("AIInsight", back_populates="user", cascade="all, delete-orphan")
