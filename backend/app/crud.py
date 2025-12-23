from __future__ import annotations

from datetime import datetime, timedelta
import uuid

from fastapi import HTTPException, status
from sqlmodel import Session, select

from .db_models import (
    Agent,
    Negotiation,
    NegotiationStatus,
    Producer,
    WasteLot,
    WasteLotStatus,
    WasteLotToken,
    WasteLotVerification,
    UpcyclingProof,
)
from .models import (
    AgentCreate,
    ProofValidationDecision,
    ProducerCreate,
    TokenMintRequest,
    UpcyclingProofCreate,
    WasteLotCreate,
    WasteLotVerificationCreate,
)


def create_producer(session: Session, payload: ProducerCreate) -> Producer:
    producer = Producer.model_validate(payload.model_dump(mode="json"), update={})
    session.add(producer)
    session.commit()
    session.refresh(producer)

    existing_agent = session.exec(
        select(Agent).where(Agent.producer_id == producer.id, Agent.agent_type == "producer")
    ).first()
    if not existing_agent:
        auto_agent_payload = AgentCreate(
            agent_identifier=f"agent-producer-{producer.id}",
            owner_name=producer.name,
            owner_contact=producer.contact_email,
            agent_type="producer",
            producer_id=producer.id,
            target_price_usd_per_ton=None,
            strategy_metadata={"auto_created": True},
        )
        create_agent(session, auto_agent_payload)

    return producer


def get_producer(session: Session, producer_id: int) -> Producer:
    producer = session.get(Producer, producer_id)
    if not producer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producer not found")
    return producer


def list_producers(session: Session) -> list[Producer]:
    return session.exec(select(Producer)).all()


def create_agent(session: Session, payload: AgentCreate) -> Agent:
    data = payload.model_dump(mode="json")
    identifier = data.pop("agent_identifier", None) or f"agent-{uuid.uuid4().hex[:10]}"

    if session.exec(select(Agent).where(Agent.agent_identifier == identifier)).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Agent identifier '{identifier}' already exists",
        )

    producer_id = data.get("producer_id")
    if producer_id:
        producer = session.get(Producer, producer_id)
        if not producer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producer not found")

    agent = Agent(agent_identifier=identifier, **data)
    session.add(agent)
    session.commit()
    session.refresh(agent)
    return agent


def list_agents(session: Session, agent_type: str | None = None) -> list[Agent]:
    query = select(Agent)
    if agent_type:
        query = query.where(Agent.agent_type == agent_type)
    return session.exec(query.order_by(Agent.created_at.desc())).all()


def get_agent(session: Session, agent_id: int) -> Agent:
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return agent


def create_waste_lot(session: Session, payload: WasteLotCreate) -> WasteLot:
    producer = session.get(Producer, payload.producer_id)
    if not producer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producer not found")

    lot = WasteLot.model_validate(payload.model_dump(mode="json"), update={})
    lot.status = WasteLotStatus.PENDING_VERIFICATION

    session.add(lot)
    session.commit()
    session.refresh(lot)
    return lot


def list_waste_lots(session: Session, status_filter: WasteLotStatus | None = None) -> list[WasteLot]:
    query = select(WasteLot)
    if status_filter:
        query = query.where(WasteLot.status == status_filter)
    return session.exec(query.order_by(WasteLot.created_at.desc())).all()


def get_waste_lot(session: Session, lot_id: int) -> WasteLot:
    lot = session.get(WasteLot, lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Waste lot not found")
    return lot


def create_verification(
    session: Session,
    lot: WasteLot,
    payload: WasteLotVerificationCreate,
) -> WasteLotVerification:
    verification = WasteLotVerification(
        waste_lot_id=lot.id,
        method=payload.method,
        evidence_uri=str(payload.evidence_uri) if payload.evidence_uri else None,
        sensor_checksum=payload.sensor_checksum,
        verifier_notes=payload.verifier_notes,
        status="verified" if payload.mark_verified else "pending",
        verified_at=datetime.utcnow() if payload.mark_verified else None,
    )
    session.add(verification)

    if payload.mark_verified:
        lot.status = WasteLotStatus.VERIFIED
        session.add(lot)

    session.commit()
    session.refresh(verification)
    return verification


def mark_lot_verified(session: Session, lot: WasteLot, verifier_notes: str | None = None) -> WasteLot:
    latest_verification = get_latest_verification(session, lot.id)
    if not latest_verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification submission found for this lot",
        )
    latest_verification.status = "verified"
    latest_verification.verified_at = datetime.utcnow()
    if verifier_notes:
        latest_verification.verifier_notes = verifier_notes

    lot.status = WasteLotStatus.VERIFIED
    session.add(latest_verification)
    session.add(lot)
    session.commit()
    session.refresh(lot)
    return lot


def get_latest_verification(session: Session, lot_id: int) -> WasteLotVerification | None:
    return session.exec(
        select(WasteLotVerification)
        .where(WasteLotVerification.waste_lot_id == lot_id)
        .order_by(WasteLotVerification.requested_at.desc())
    ).first()


def record_token_mint(
    session: Session,
    lot: WasteLot,
    payload: TokenMintRequest,
    token_address: str,
    transaction_hash: str,
) -> WasteLotToken:
    if lot.status not in {WasteLotStatus.VERIFIED, WasteLotStatus.TOKENIZED}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Waste lot must be verified before tokenization",
        )

    existing = session.exec(
        select(WasteLotToken).where(WasteLotToken.waste_lot_id == lot.id)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Waste lot already tokenized")

    token = WasteLotToken(
        waste_lot_id=lot.id,
        token_address=token_address,
        token_name=payload.token_name,
        token_symbol=payload.token_symbol,
        supply=payload.supply,
        transaction_hash=transaction_hash,
    )
    lot.status = WasteLotStatus.TOKENIZED

    session.add(token)
    session.add(lot)
    session.commit()
    session.refresh(token)
    return token


def create_negotiation(
    session: Session,
    lot: WasteLot,
    producer_agent: Agent,
    recycler_agent: Agent,
    producer_offer: float | None,
    recycler_offer: float | None,
    expires_in_hours: int = 48,
) -> Negotiation:
    existing = session.exec(
        select(Negotiation)
        .where(
            Negotiation.waste_lot_id == lot.id,
            Negotiation.producer_agent_id == producer_agent.id,
            Negotiation.recycler_agent_id == recycler_agent.id,
            Negotiation.status.in_([NegotiationStatus.OPEN, NegotiationStatus.COUNTER]),
        )
    ).first()
    if existing:
        return existing

    negotiation = Negotiation(
        waste_lot_id=lot.id,
        producer_agent_id=producer_agent.id,
        recycler_agent_id=recycler_agent.id,
        producer_offer_usd_per_ton=producer_offer,
        recycler_offer_usd_per_ton=recycler_offer,
        expires_at=datetime.utcnow() + timedelta(hours=expires_in_hours),
    )
    session.add(negotiation)
    session.commit()
    session.refresh(negotiation)
    return negotiation


def list_negotiations(session: Session, status_filter: NegotiationStatus | None = None) -> list[Negotiation]:
    query = select(Negotiation)
    if status_filter:
        query = query.where(Negotiation.status == status_filter)
    return session.exec(query.order_by(Negotiation.created_at.desc())).all()


def get_negotiation(session: Session, negotiation_id: int) -> Negotiation:
    negotiation = session.get(Negotiation, negotiation_id)
    if not negotiation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Negotiation not found")
    return negotiation


def finalize_negotiation(
    session: Session,
    negotiation: Negotiation,
    agree: bool,
    counter_offer: float | None = None,
) -> Negotiation:
    lot = session.get(WasteLot, negotiation.waste_lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Waste lot not found")

    if negotiation.status in {NegotiationStatus.AGREED, NegotiationStatus.SETTLED}:
        return negotiation

    if agree:
        negotiation.status = NegotiationStatus.AGREED
        if counter_offer is not None:
            negotiation.agreed_price_usd_per_ton = counter_offer
        elif negotiation.recycler_offer_usd_per_ton is not None:
            negotiation.agreed_price_usd_per_ton = negotiation.recycler_offer_usd_per_ton
        elif negotiation.producer_offer_usd_per_ton is not None:
            negotiation.agreed_price_usd_per_ton = negotiation.producer_offer_usd_per_ton
        lot.status = WasteLotStatus.SETTLED
        lot.updated_at = datetime.utcnow()
    else:
        negotiation.status = NegotiationStatus.COUNTER
        negotiation.recycler_offer_usd_per_ton = counter_offer or negotiation.recycler_offer_usd_per_ton
        negotiation.expires_at = datetime.utcnow() + timedelta(hours=24)
        if lot.status != WasteLotStatus.NEGOTIATING:
            lot.status = WasteLotStatus.NEGOTIATING
        lot.updated_at = datetime.utcnow()

    negotiation.updated_at = datetime.utcnow()
    session.add(negotiation)
    session.add(lot)
    session.commit()
    session.refresh(negotiation)
    return negotiation


def create_upcycling_proof(
    session: Session,
    lot: WasteLot,
    payload: UpcyclingProofCreate,
) -> UpcyclingProof:
    recycler_agent = None
    if payload.recycler_agent_id:
        recycler_agent = get_agent(session, payload.recycler_agent_id)
        if recycler_agent.agent_type != "recycler":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Agent must be recycler type")

    proof = UpcyclingProof(
        waste_lot_id=lot.id,
        recycler_agent_id=recycler_agent.id if recycler_agent else None,
        evidence_uri=str(payload.evidence_uri) if payload.evidence_uri else None,
        sensor_checksum=payload.sensor_checksum,
        processing_notes=payload.processing_notes,
    )
    lot.status = WasteLotStatus.UPCYCLING_PENDING
    lot.updated_at = datetime.utcnow()

    session.add(proof)
    session.add(lot)
    session.commit()
    session.refresh(proof)
    return proof


def list_upcycling_proofs(session: Session, lot_id: int) -> list[UpcyclingProof]:
    return session.exec(
        select(UpcyclingProof).where(UpcyclingProof.waste_lot_id == lot_id).order_by(UpcyclingProof.submitted_at.desc())
    ).all()


def get_upcycling_proof(session: Session, proof_id: int) -> UpcyclingProof:
    proof = session.get(UpcyclingProof, proof_id)
    if not proof:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upcycling proof not found")
    return proof


def validate_upcycling_proof(
    session: Session,
    proof: UpcyclingProof,
    decision: ProofValidationDecision,
    burn_transaction_hash: str | None = None,
) -> UpcyclingProof:
    lot = session.get(WasteLot, proof.waste_lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Waste lot not found")

    proof.ai_confidence = decision.ai_confidence
    proof.processing_notes = decision.notes or proof.processing_notes
    proof.validated_at = datetime.utcnow()

    if decision.approve:
        proof.status = "validated"
        proof.certificate_uri = str(decision.certificate_uri) if decision.certificate_uri else proof.certificate_uri
        lot.status = WasteLotStatus.RETIRED
        lot.updated_at = datetime.utcnow()

        token = session.exec(select(WasteLotToken).where(WasteLotToken.waste_lot_id == lot.id)).first()
        if token:
            token.retired_at = datetime.utcnow()
            token.retire_transaction_hash = burn_transaction_hash
            session.add(token)
    else:
        proof.status = "rejected"
        lot.status = WasteLotStatus.SETTLED
        lot.updated_at = datetime.utcnow()

    session.add(proof)
    session.add(lot)
    session.commit()
    session.refresh(proof)
    return proof