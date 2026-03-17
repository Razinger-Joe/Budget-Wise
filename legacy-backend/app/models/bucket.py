from sqlalchemy import Numeric, ForeignKey, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from decimal import Decimal
from app.models.base import Base, TimestampMixin

class BucketBalance(Base, TimestampMixin):
    __tablename__ = "bucket_balances"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    basic: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=Decimal("0.00"))
    emergency: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=Decimal("0.00"))
    personal: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=Decimal("0.00"))
    invest: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=Decimal("0.00"))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="bucket_balance")
