from __future__ import annotations

from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


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


class NegotiationStatus(str, Enum):
    OPEN = "open"
    COUNTER = "counter"
    AGREED = "agreed"
    SETTLED = "settled"
    EXPIRED = "expired"


class Agent(BaseModel):
    id: int
    agent_identifier: str
    agent_type: str
    owner_name: str
    owner_contact: Optional[str] = None
    producer_id: Optional[int] = None
    target_price_usd_per_ton: Optional[float] = None
    max_price_usd_per_ton: Optional[float] = None
    deadline_hours: Optional[int] = None
    radius_miles: Optional[int] = None
    auto_negotiate: Optional[bool] = True
    bundle_preference: Optional[bool] = False
    strategy_metadata: dict[str, Any] = Field(default_factory=dict)


class WasteLotToken(BaseModel):
    id: int
    token_address: str
    token_name: str
    token_symbol: str
    supply: int
    transaction_hash: Optional[str] = None
    minted_at: Optional[str] = None
    retired_at: Optional[str] = None
    retire_transaction_hash: Optional[str] = None


class WasteLotVerification(BaseModel):
    id: int
    status: str
    method: str
    evidence_uri: Optional[str]
    sensor_checksum: Optional[str]
    verifier_notes: Optional[str]
    requested_at: Optional[str]
    verified_at: Optional[str]


class UpcyclingProof(BaseModel):
    id: int
    waste_lot_id: int
    recycler_agent_id: Optional[int]
    evidence_uri: Optional[str]
    sensor_checksum: Optional[str]
    processing_notes: Optional[str]
    ai_confidence: Optional[float]
    status: str
    certificate_uri: Optional[str]
    submitted_at: Optional[str]
    validated_at: Optional[str]


class WasteLot(BaseModel):
    id: int
    producer_id: int
    external_reference: Optional[str] = None
    material_type: str
    quantity_tons: float
    location: str
    price_floor_usd_per_ton: Optional[float] = None
    status: WasteLotStatus
    chemical_composition: dict[str, Any] = Field(default_factory=dict)
    photos: list[str] = Field(default_factory=list)
    token: Optional[WasteLotToken] = None
    verification: Optional[WasteLotVerification] = None
    proofs: list[UpcyclingProof] = Field(default_factory=list)


class Producer(BaseModel):
    id: int
    name: str
    contact_email: str
    organization_type: Optional[str] = None
    aptos_address: Optional[str] = None
    lots: list[WasteLot] = Field(default_factory=list)
    agents: list[Agent] = Field(default_factory=list)


class Negotiation(BaseModel):
    id: int
    waste_lot_id: int
    producer_agent_id: int
    recycler_agent_id: int
    status: NegotiationStatus
    producer_offer_usd_per_ton: Optional[float]
    recycler_offer_usd_per_ton: Optional[float]
    agreed_price_usd_per_ton: Optional[float]


class Snapshot(BaseModel):
    generated_at: str
    lots: list[dict[str, Any]]
    agents: list[dict[str, Any]]
