from __future__ import annotations

from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .crud import (
    create_agent,
    create_producer,
    create_verification,
    create_waste_lot,
    create_upcycling_proof,
    finalize_negotiation,
    get_agent,
    get_latest_verification,
    get_negotiation,
    get_producer,
    get_waste_lot,
    list_agents,
    list_negotiations,
    list_upcycling_proofs,
    list_producers,
    list_waste_lots,
    mark_lot_verified,
    record_token_mint,
    get_upcycling_proof,
    validate_upcycling_proof,
)
from .db import get_session, init_db
from .db_models import Agent, NegotiationStatus, WasteLot, WasteLotStatus, WasteLotToken
from .models import (
    AgentCreate,
    AgentRead,
    NegotiationDecision,
    NegotiationRead,
    ProofValidationDecision,
    ProducerCreate,
    ProducerDetail,
    ProducerRead,
    TokenMintRequest,
    UpcyclingProofCreate,
    UpcyclingProofRead,
    WasteLotCreate,
    WasteLotDetail,
    WasteLotRead,
    WasteLotVerificationCreate,
    WasteLotVerificationRead,
    WasteLotTokenRead,
    VerificationApproval,
)
from .seed import seed_initial_data
from .services.aptos import AptosTokenService
from .services.agent_matcher import AgentMatchmaker

app = FastAPI(
    title="AURA Marketplace API",
    version="0.1.0",
    description="Prototype API serving Aura onboarding, verification, and tokenization workflows."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    init_db()
    seed_initial_data()


def get_aptos_service() -> AptosTokenService:
    return AptosTokenService()


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok"}


@app.post("/producers", response_model=ProducerRead, status_code=201, tags=["Producers"])
def register_producer(
    payload: ProducerCreate,
    session: Session = Depends(get_session),
):
    return create_producer(session, payload)


@app.get("/producers", response_model=list[ProducerRead], tags=["Producers"])
def list_registered_producers(session: Session = Depends(get_session)):
    return [ProducerRead.model_validate(producer) for producer in list_producers(session)]


@app.get("/producers/{producer_id}", response_model=ProducerDetail, tags=["Producers"])
def get_producer_detail_route(producer_id: int, session: Session = Depends(get_session)):
    producer = get_producer(session, producer_id)
    lots = session.exec(select(WasteLot).where(WasteLot.producer_id == producer.id)).all()
    lots_schemas = [WasteLotRead.model_validate(lot) for lot in lots]
    agents = session.exec(select(Agent).where(Agent.producer_id == producer.id)).all()
    agent_schemas = [AgentRead.model_validate(agent) for agent in agents]
    return ProducerDetail.model_validate(producer).model_copy(update={"lots": lots_schemas, "agents": agent_schemas})


@app.post("/agents", response_model=AgentRead, status_code=201, tags=["Agents"])
def create_agent_endpoint(payload: AgentCreate, session: Session = Depends(get_session)):
    agent = create_agent(session, payload)
    return AgentRead.model_validate(agent)


@app.get("/agents", response_model=list[AgentRead], tags=["Agents"])
def list_agents_endpoint(
    agent_type: str | None = Query(None, description="Filter by agent type: producer or recycler"),
    session: Session = Depends(get_session),
):
    agents = list_agents(session, agent_type=agent_type)
    return [AgentRead.model_validate(agent) for agent in agents]


@app.get("/snapshot", tags=["System"])
def marketplace_snapshot(session: Session = Depends(get_session)):
    lots = list_waste_lots(session)
    lot_payload: list[dict] = []
    for lot in lots:
        detail = _build_waste_lot_detail(session, lot.id)
        data = detail.model_dump(mode="json")
        producer = get_producer(session, detail.producer_id)
        data["producer"] = producer.name
        lot_payload.append(data)

    agents_payload: list[dict] = []
    for agent in list_agents(session):
        agent_schema = AgentRead.model_validate(agent)
        agent_dict = agent_schema.model_dump(mode="json")
        agents_payload.append(
            {
                "id": agent_dict["id"],
                "owner": agent_dict["owner_name"],
                "type": agent_dict["agent_type"],
                "strategy": {
                    "target_price_usd_per_ton": agent_dict.get("target_price_usd_per_ton"),
                    "max_price_usd_per_ton": agent_dict.get("max_price_usd_per_ton"),
                    "deadline_hours": agent_dict.get("deadline_hours"),
                    "radius_miles": agent_dict.get("radius_miles"),
                    "auto_negotiate": agent_dict.get("auto_negotiate"),
                    "bundle_preference": agent_dict.get("bundle_preference"),
                    **(agent_dict.get("strategy_metadata") or {}),
                },
            }
        )

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "lots": lot_payload,
        "agents": agents_payload,
    }


@app.post("/agents/matchmaking", response_model=list[NegotiationRead], tags=["Agents"])
def run_matchmaking(session: Session = Depends(get_session)):
    matcher = AgentMatchmaker(session)
    negotiations = matcher.propose_matches()
    return [NegotiationRead.model_validate(item) for item in negotiations]


@app.get("/negotiations", response_model=list[NegotiationRead], tags=["Agents"])
def list_negotiations_endpoint(
    status_filter: NegotiationStatus | None = Query(None, alias="status"),
    session: Session = Depends(get_session),
):
    negotiations = list_negotiations(session, status_filter=status_filter)
    return [NegotiationRead.model_validate(item) for item in negotiations]


@app.post("/negotiations/{negotiation_id}/decision", response_model=NegotiationRead, tags=["Agents"])
def decide_on_negotiation(
    negotiation_id: int,
    payload: NegotiationDecision,
    session: Session = Depends(get_session),
):
    negotiation = get_negotiation(session, negotiation_id)
    updated = finalize_negotiation(session, negotiation, agree=payload.agree, counter_offer=payload.counter_offer_usd_per_ton)
    return NegotiationRead.model_validate(updated)


@app.post("/lots", response_model=WasteLotDetail, status_code=201, tags=["Waste Lots"])
def create_lot(
    payload: WasteLotCreate,
    session: Session = Depends(get_session),
):
    lot = create_waste_lot(session, payload)
    return _build_waste_lot_detail(session, lot.id)


@app.get("/lots", response_model=list[WasteLotDetail], tags=["Waste Lots"])
def list_lots(
    status_filter: WasteLotStatus | None = Query(None, alias="status"),
    session: Session = Depends(get_session),
):
    lots = list_waste_lots(session, status_filter=status_filter)
    return [_build_waste_lot_detail(session, lot.id) for lot in lots]


@app.get("/lots/{lot_id}", response_model=WasteLotDetail, tags=["Waste Lots"])
def retrieve_lot(lot_id: int, session: Session = Depends(get_session)):
    get_waste_lot(session, lot_id)
    return _build_waste_lot_detail(session, lot_id)


@app.post(
    "/lots/{lot_id}/verification",
    response_model=WasteLotDetail,
    status_code=202,
    tags=["Waste Lots"],
)
def submit_verification(
    lot_id: int,
    payload: WasteLotVerificationCreate,
    session: Session = Depends(get_session),
):
    lot = get_waste_lot(session, lot_id)
    create_verification(session, lot, payload)
    return _build_waste_lot_detail(session, lot_id)


@app.post(
    "/lots/{lot_id}/verify",
    response_model=WasteLotDetail,
    tags=["Waste Lots"],
)
def approve_verification(
    lot_id: int,
    payload: VerificationApproval | None = None,
    session: Session = Depends(get_session),
):
    lot = get_waste_lot(session, lot_id)
    notes = payload.verifier_notes if payload else None
    mark_lot_verified(session, lot, verifier_notes=notes)
    return _build_waste_lot_detail(session, lot_id)


@app.post(
    "/lots/{lot_id}/tokenize",
    response_model=WasteLotDetail,
    tags=["Waste Lots"],
)
def tokenize_lot(
    lot_id: int,
    payload: TokenMintRequest,
    session: Session = Depends(get_session),
    aptos_service: AptosTokenService = Depends(get_aptos_service),
):
    lot = get_waste_lot(session, lot_id)
    latest_verification = get_latest_verification(session, lot.id)
    if not latest_verification or latest_verification.status != "verified":
        raise HTTPException(status_code=400, detail="Waste lot must be verified before tokenization")

    token_address = payload.token_address
    transaction_hash = payload.transaction_hash

    if not token_address or not transaction_hash:
        result = aptos_service.mint_waste_lot(lot.id, payload.token_name, payload.token_symbol, payload.supply)
        token_address = result.token_address
        transaction_hash = result.transaction_hash

    if not token_address or not transaction_hash:
        raise HTTPException(status_code=500, detail="Tokenization failed to produce on-chain identifiers")

    record_token_mint(session, lot, payload, token_address, transaction_hash)
    return _build_waste_lot_detail(session, lot_id)


@app.post(
    "/lots/{lot_id}/proofs",
    response_model=UpcyclingProofRead,
    status_code=201,
    tags=["Waste Lots"],
)
def submit_upcycling_proof(
    lot_id: int,
    payload: UpcyclingProofCreate,
    session: Session = Depends(get_session),
):
    lot = get_waste_lot(session, lot_id)
    proof = create_upcycling_proof(session, lot, payload)
    return UpcyclingProofRead.model_validate(proof)


@app.post(
    "/lots/{lot_id}/proofs/{proof_id}/validate",
    response_model=UpcyclingProofRead,
    tags=["Waste Lots"],
)
def validate_upcycling_proof_endpoint(
    lot_id: int,
    proof_id: int,
    payload: ProofValidationDecision,
    session: Session = Depends(get_session),
    aptos_service: AptosTokenService = Depends(get_aptos_service),
):
    lot = get_waste_lot(session, lot_id)
    proof = get_upcycling_proof(session, proof_id)
    if proof.waste_lot_id != lot.id:
        raise HTTPException(status_code=400, detail="Proof does not belong to this waste lot")

    burn_hash = None
    if payload.approve:
        token = session.exec(
            select(WasteLotToken).where(WasteLotToken.waste_lot_id == lot.id)
        ).first()
        if token:
            burn_result = aptos_service.retire_waste_lot(token.token_address)
            burn_hash = burn_result.transaction_hash

    updated = validate_upcycling_proof(session, proof, payload, burn_transaction_hash=burn_hash)
    return UpcyclingProofRead.model_validate(updated)


def _build_waste_lot_detail(session: Session, lot_id: int) -> WasteLotDetail:
    lot = get_waste_lot(session, lot_id)
    lot_schema = WasteLotRead.model_validate(lot)

    token = session.exec(
        select(WasteLotToken).where(WasteLotToken.waste_lot_id == lot.id)
    ).first()
    token_schema = None
    if token:
        token_schema = WasteLotTokenRead.model_validate(token)

    verification = get_latest_verification(session, lot.id)
    verification_schema = None
    if verification:
        verification_schema = WasteLotVerificationRead.model_validate(verification)

    proofs = list_upcycling_proofs(session, lot.id)
    proof_schemas = [UpcyclingProofRead.model_validate(proof) for proof in proofs]

    return WasteLotDetail(
        **lot_schema.model_dump(),
        token=token_schema,
        verification=verification_schema,
        proofs=proof_schemas,
    )
