from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Field, SQLModel


class WasteLotStatus(str, Enum):
    DRAFT = "draft"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    TOKENIZED = "tokenized"
    NEGOTIATING = "negotiating"
    SETTLED = "settled"
    UPCYCLING_PENDING = "upcycling_pending"
    UPCYCLING_VALIDATED = "upcycling_validated"
    RETIRED = "retired"


class Producer(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name: str
    contact_email: str
    organization_type: Optional[str] = None
    aptos_address: Optional[str] = Field(
        default=None, description="Aptos account responsible for holding minted waste lot tokens"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class WasteLot(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    producer_id: int = Field(foreign_key="producer.id")
    external_reference: Optional[str] = Field(
        default=None, description="Producer-supplied identifier such as bill of lading or manifest number"
    )
    material_type: str
    chemical_composition: dict[str, Any] = Field(
        sa_column=Column(JSON),
        default_factory=dict,
        description="Structured composition readings or assay results"
    )
    quantity_tons: float
    location: str
    price_floor_usd_per_ton: Optional[float] = None
    photos: list[str] = Field(
        sa_column=Column(JSON), default_factory=list, description="URIs for imagery or supporting media"
    )
    status: WasteLotStatus = Field(default=WasteLotStatus.DRAFT)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class WasteLotVerification(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    waste_lot_id: int = Field(foreign_key="wastelot.id")
    method: str
    evidence_uri: Optional[str] = None
    sensor_checksum: Optional[str] = None
    status: str = Field(default="pending")
    verifier_notes: Optional[str] = None
    requested_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    verified_at: Optional[datetime] = None


class WasteLotToken(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    waste_lot_id: int = Field(foreign_key="wastelot.id", unique=True)
    token_address: str
    token_name: str
    token_symbol: str
    supply: int = 1
    transaction_hash: Optional[str] = None
    minted_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    retired_at: Optional[datetime] = None
    retire_transaction_hash: Optional[str] = None


class Agent(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    agent_identifier: str = Field(unique=True, index=True)
    agent_type: str = Field(description="producer or recycler")
    owner_name: str
    owner_contact: Optional[str] = None
    producer_id: Optional[int] = Field(default=None, foreign_key="producer.id")
    target_price_usd_per_ton: Optional[float] = None
    max_price_usd_per_ton: Optional[float] = None
    deadline_hours: Optional[int] = None
    radius_miles: Optional[int] = None
    auto_negotiate: Optional[bool] = Field(default=True)
    bundle_preference: Optional[bool] = Field(default=False)
    strategy_metadata: dict[str, Any] = Field(sa_column=Column(JSON), default_factory=dict)
    last_heartbeat_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class NegotiationStatus(str, Enum):
    OPEN = "open"
    COUNTER = "counter"
    AGREED = "agreed"
    SETTLED = "settled"
    EXPIRED = "expired"


class Negotiation(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    waste_lot_id: int = Field(foreign_key="wastelot.id")
    producer_agent_id: int = Field(foreign_key="agent.id")
    recycler_agent_id: int = Field(foreign_key="agent.id")
    status: NegotiationStatus = Field(default=NegotiationStatus.OPEN)
    producer_offer_usd_per_ton: Optional[float] = None
    recycler_offer_usd_per_ton: Optional[float] = None
    agreed_price_usd_per_ton: Optional[float] = None
    expires_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class UpcyclingProof(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    waste_lot_id: int = Field(foreign_key="wastelot.id")
    recycler_agent_id: Optional[int] = Field(default=None, foreign_key="agent.id")
    evidence_uri: Optional[str] = None
    sensor_checksum: Optional[str] = None
    processing_notes: Optional[str] = None
    ai_confidence: Optional[float] = Field(default=None, ge=0, le=1)
    status: str = Field(default="pending")
    certificate_uri: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    validated_at: Optional[datetime] = None
