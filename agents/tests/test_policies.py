from __future__ import annotations

from datetime import datetime

from aura_agents.config import ComplianceAgentSettings, ProducerAgentSettings, ProducerIdentity, RecyclerAgentSettings
from aura_agents.models import Negotiation, NegotiationStatus, UpcyclingProof, WasteLot, WasteLotStatus
from aura_agents.policies import (
    decide_negotiation,
    proof_submission_payload,
    proof_validation_payload,
    should_submit_proof,
    should_tokenize,
    should_validate_proof,
    tokenization_payload,
)


def make_waste_lot(status: WasteLotStatus) -> WasteLot:
    return WasteLot(
        id=1,
        producer_id=1,
        material_type="Copper Wire",
        quantity_tons=5.0,
        location="Austin, TX",
        status=status,
    )


def test_tokenization_payload_uses_external_reference_when_available():
    settings = ProducerAgentSettings(identity=ProducerIdentity(name="Test", contact_email="test@example.com"))
    lot = make_waste_lot(WasteLotStatus.VERIFIED)
    lot.external_reference = "lot-123"
    assert should_tokenize(lot, settings) is True
    payload = tokenization_payload(lot, settings)
    assert payload["token_name"] == "lot-123"


def test_decide_negotiation_accepts_when_price_within_threshold():
    settings = RecyclerAgentSettings(owner_name="Recycler", owner_contact="r@example.com", max_price_usd_per_ton=250)
    negotiation = Negotiation(
        id=1,
        waste_lot_id=1,
        producer_agent_id=10,
        recycler_agent_id=20,
        status=NegotiationStatus.OPEN,
        producer_offer_usd_per_ton=240.0,
        recycler_offer_usd_per_ton=None,
        agreed_price_usd_per_ton=None,
    )
    decision = decide_negotiation(negotiation, settings)
    assert decision == {"agree": True, "notes": "Accepting offer within threshold."}


def test_decide_negotiation_counters_when_above_threshold():
    settings = RecyclerAgentSettings(owner_name="Recycler", owner_contact="r@example.com", max_price_usd_per_ton=200)
    negotiation = Negotiation(
        id=2,
        waste_lot_id=1,
        producer_agent_id=10,
        recycler_agent_id=20,
        status=NegotiationStatus.OPEN,
        producer_offer_usd_per_ton=260.0,
        recycler_offer_usd_per_ton=None,
        agreed_price_usd_per_ton=None,
    )
    decision = decide_negotiation(negotiation, settings)
    assert decision["agree"] is False
    assert decision["counter_offer_usd_per_ton"] == 200


def test_should_submit_proof_requires_no_pending_proofs():
    settings = RecyclerAgentSettings(owner_name="Recycler", owner_contact="r@example.com")
    lot = make_waste_lot(WasteLotStatus.SETTLED)
    assert should_submit_proof(lot, settings) is True

    lot.proofs.append(
        UpcyclingProof(
            id=1,
            waste_lot_id=lot.id,
            recycler_agent_id=None,
            evidence_uri=None,
            sensor_checksum=None,
            processing_notes=None,
            ai_confidence=None,
            status="pending",
            certificate_uri=None,
            submitted_at=datetime.utcnow().isoformat(),
            validated_at=None,
        )
    )
    assert should_submit_proof(lot, settings) is False


def test_compliance_policy_generates_certificate_uri():
    settings = ComplianceAgentSettings(reviewer_name="QA", approve_threshold=0.8)
    proof = UpcyclingProof(
        id=99,
        waste_lot_id=1,
        recycler_agent_id=None,
        evidence_uri=None,
        sensor_checksum=None,
        processing_notes=None,
        ai_confidence=0.9,
        status="pending",
        certificate_uri=None,
        submitted_at=datetime.utcnow().isoformat(),
        validated_at=None,
    )
    assert should_validate_proof(proof, settings) is True
    payload = proof_validation_payload(proof, settings)
    assert payload["approve"] is True
    assert payload["certificate_uri"].endswith("/99")


def test_proof_submission_payload_uses_defaults():
    settings = RecyclerAgentSettings(owner_name="Recycler", owner_contact="r@example.com")
    lot = make_waste_lot(WasteLotStatus.SETTLED)
    payload = proof_submission_payload(lot, settings, recycler_agent_id=5)
    assert payload["recycler_agent_id"] == 5
    assert payload["evidence_uri"].startswith("https://")
    assert "sensor_checksum" in payload
