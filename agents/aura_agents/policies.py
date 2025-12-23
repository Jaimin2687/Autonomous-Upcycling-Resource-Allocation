from __future__ import annotations

from datetime import datetime
from typing import Any

from .config import ComplianceAgentSettings, ProducerAgentSettings, RecyclerAgentSettings
from .models import Negotiation, NegotiationStatus, UpcyclingProof, WasteLot, WasteLotStatus


def should_auto_verify(lot: WasteLot, settings: ProducerAgentSettings) -> bool:
    return settings.auto_verify and lot.status == WasteLotStatus.PENDING_VERIFICATION


def verification_payload(settings: ProducerAgentSettings) -> dict[str, Any]:
    return {"verifier_notes": settings.verification_notes}


def should_tokenize(lot: WasteLot, settings: ProducerAgentSettings) -> bool:
    return settings.auto_tokenize and lot.status == WasteLotStatus.VERIFIED and lot.token is None


def tokenization_payload(lot: WasteLot, settings: ProducerAgentSettings) -> dict[str, Any]:
    token_name = lot.external_reference or f"LOT-{lot.id}"
    symbol = settings.token_symbol or "AURA"
    return {"token_name": token_name, "token_symbol": symbol, "supply": settings.token_supply}


def decide_negotiation(negotiation: Negotiation, settings: RecyclerAgentSettings) -> dict[str, Any] | None:
    if negotiation.status in {NegotiationStatus.AGREED, NegotiationStatus.SETTLED}:
        return None

    reference_price = negotiation.recycler_offer_usd_per_ton or negotiation.producer_offer_usd_per_ton
    max_price = settings.max_price_usd_per_ton

    if reference_price is None:
        return {
            "agree": False,
            "counter_offer_usd_per_ton": max_price,
            "notes": "Issuing opening bid at max acceptable price.",
        }

    if reference_price <= max_price:
        return {"agree": True, "notes": "Accepting offer within threshold."}

    counter_price = max_price
    if settings.counter_offer_step > 0 and max_price < reference_price:
        counter_price = max_price

    if counter_price == reference_price:
        return {"agree": True, "notes": "Accepting counter-aligned offer."}

    return {
        "agree": False,
        "counter_offer_usd_per_ton": counter_price,
        "notes": "Countering above target price with cap.",
    }


def should_submit_proof(lot: WasteLot, settings: RecyclerAgentSettings) -> bool:
    if not settings.submit_proof:
        return False
    if lot.status not in {WasteLotStatus.SETTLED, WasteLotStatus.UPCYCLING_PENDING}:
        return False
    return all(proof.status != "pending" for proof in lot.proofs)


def proof_submission_payload(lot: WasteLot, settings: RecyclerAgentSettings, recycler_agent_id: int) -> dict[str, Any]:
    evidence_uri = settings.proof_evidence_uri or f"https://example.com/proof/{lot.id}"  # Placeholder
    checksum = f"auto-{lot.id}-{int(datetime.utcnow().timestamp())}"
    return {
        "recycler_agent_id": recycler_agent_id,
        "evidence_uri": evidence_uri,
        "sensor_checksum": checksum,
        "processing_notes": settings.proof_notes,
    }


def should_validate_proof(proof: UpcyclingProof, settings: ComplianceAgentSettings) -> bool:
    return proof.status == "pending"


def proof_validation_payload(proof: UpcyclingProof, settings: ComplianceAgentSettings) -> dict[str, Any]:
    confidence = proof.ai_confidence if proof.ai_confidence is not None else settings.approve_threshold
    approve = confidence >= settings.approve_threshold
    certificate_uri = settings.auto_certificate_uri or f"https://example.com/certificates/{proof.id}"
    notes = f"Auto-reviewed by {settings.reviewer_name}."
    return {
        "approve": approve,
        "ai_confidence": confidence,
        "certificate_uri": certificate_uri,
        "notes": notes,
    }
