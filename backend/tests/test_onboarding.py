from __future__ import annotations

from importlib import reload
from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


@pytest.fixture(name="client")
def client_fixture(tmp_path, monkeypatch) -> TestClient:
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("AURA_DATABASE_URL", f"sqlite:///{db_path}")

    # Reload modules that cache configuration to ensure the temp DB is used.
    from app import config, db, main, seed

    reload(config)
    reload(db)
    reload(seed)
    reload(main)

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


def test_producer_onboarding_flow(client: TestClient):
    list_resp = client.get("/producers")
    assert list_resp.status_code == 200
    initial_count = len(list_resp.json())
    assert initial_count >= 1

    create_payload = {
        "name": "Circular Chem",
        "contact_email": "ops@circular-chem.example",
        "organization_type": "chemical",
        "aptos_address": "0xC1RCULARCHEM",
    }
    create_resp = client.post("/producers", json=create_payload)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["name"] == create_payload["name"]

    list_resp_after = client.get("/producers")
    assert list_resp_after.status_code == 200
    assert len(list_resp_after.json()) == initial_count + 1


def test_waste_lot_tokenization_flow(client: TestClient):
    producer_resp = client.post(
        "/producers",
        json={
            "name": "PlastiCo",
            "contact_email": "contact@plastico.example",
            "organization_type": "manufacturer",
            "aptos_address": "0xPLASTICO",
        },
    )
    producer_resp.raise_for_status()
    producer_id = producer_resp.json()["id"]

    create_lot_payload = {
        "producer_id": producer_id,
        "material_type": "HDPE Plastic Scrap",
        "quantity_tons": 10,
        "location": "Austin, TX",
        "price_floor_usd_per_ton": 220,
        "external_reference": "lot-010",
        "chemical_composition": {"grade": "HDPE-001"},
        "photos": ["https://example.com/photo/lot-010"]
    }
    lot_resp = client.post("/lots", json=create_lot_payload)
    assert lot_resp.status_code == 201
    lot = lot_resp.json()
    assert lot["status"] == "pending_verification"
    lot_id = lot["id"]

    verification_payload = {
        "method": "video_upload",
        "evidence_uri": "https://example.com/video/lot-010",
        "sensor_checksum": "abc123",
        "mark_verified": False,
    }
    verification_resp = client.post(f"/lots/{lot_id}/verification", json=verification_payload)
    assert verification_resp.status_code == 202
    assert verification_resp.json()["verification"]["status"] == "pending"

    approval_payload = {"verifier_notes": "Matches assay"}
    approve_resp = client.post(f"/lots/{lot_id}/verify", json=approval_payload)
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "verified"

    token_payload = {"token_name": "LOT-010", "token_symbol": "LOT", "supply": 1}
    tokenize_resp = client.post(f"/lots/{lot_id}/tokenize", json=token_payload)
    assert tokenize_resp.status_code == 200
    data = tokenize_resp.json()
    assert data["status"] == "tokenized"
    assert data["token"]["token_name"] == "LOT-010"
    assert data["token"]["token_symbol"] == "LOT"
    assert data["token"]["token_address"].startswith("0xLOT")


def test_agent_matchmaking_flow(client: TestClient):
    recycler_resp = client.post(
        "/agents",
        json={
            "owner_name": "RePoly LLC",
            "agent_type": "recycler",
            "owner_contact": "trading@repoly.example",
            "max_price_usd_per_ton": 260,
            "radius_miles": 150,
            "auto_negotiate": True,
            "strategy_metadata": {"focus": "HDPE"},
        },
    )
    recycler_resp.raise_for_status()

    producer_resp = client.post(
        "/producers",
        json={
            "name": "PolyLoop Industries",
            "contact_email": "hello@polyloop.example",
            "organization_type": "manufacturer",
            "aptos_address": "0xPOLYLOOP",
        },
    )
    producer_resp.raise_for_status()
    producer_id = producer_resp.json()["id"]

    lot_resp = client.post(
        "/lots",
        json={
            "producer_id": producer_id,
            "material_type": "PET Bales",
            "quantity_tons": 8,
            "location": "Dallas, TX",
            "price_floor_usd_per_ton": 210,
            "external_reference": "lot-020",
            "chemical_composition": {"grade": "PET-200"},
            "photos": ["https://example.com/photo/lot-020"],
        },
    )
    lot_resp.raise_for_status()
    lot_id = lot_resp.json()["id"]

    verification_resp = client.post(
        f"/lots/{lot_id}/verification",
        json={
            "method": "sensor_bundle",
            "evidence_uri": "https://example.com/evidence/lot-020",
            "sensor_checksum": "sensorhash",
            "mark_verified": True,
        },
    )
    verification_resp.raise_for_status()

    matchmaking_resp = client.post("/agents/matchmaking")
    matchmaking_resp.raise_for_status()
    negotiations = matchmaking_resp.json()
    assert negotiations, "Expected at least one negotiation suggestion"
    negotiation = next(item for item in negotiations if item["waste_lot_id"] == lot_id)

    decision_resp = client.post(
        f"/negotiations/{negotiation['id']}/decision",
        json={"agree": True},
    )
    decision_resp.raise_for_status()
    assert decision_resp.json()["status"] == "agreed"

    lot_detail = client.get(f"/lots/{lot_id}")
    lot_detail.raise_for_status()
    assert lot_detail.json()["status"] == "settled"


def test_upcycling_proof_flow(client: TestClient):
    recycler_resp = client.post(
        "/agents",
        json={
            "owner_name": "LoopCycle",
            "agent_type": "recycler",
            "owner_contact": "ai@loopcycle.example",
            "max_price_usd_per_ton": 300,
            "auto_negotiate": True,
            "strategy_metadata": {"preferred_materials": ["Aluminum"]},
        },
    )
    recycler_resp.raise_for_status()
    recycler_id = recycler_resp.json()["id"]

    producer_resp = client.post(
        "/producers",
        json={
            "name": "MetalWorks",
            "contact_email": "contact@metalworks.example",
            "organization_type": "smelter",
            "aptos_address": "0xMETAL",
        },
    )
    producer_resp.raise_for_status()
    producer_id = producer_resp.json()["id"]

    lot_resp = client.post(
        "/lots",
        json={
            "producer_id": producer_id,
            "material_type": "Aluminum Shavings",
            "quantity_tons": 5.5,
            "location": "Phoenix, AZ",
            "price_floor_usd_per_ton": 180,
            "external_reference": "lot-030",
            "chemical_composition": {"purity": "98%"},
        },
    )
    lot_resp.raise_for_status()
    lot_id = lot_resp.json()["id"]

    client.post(
        f"/lots/{lot_id}/verification",
        json={
            "method": "third_party_audit",
            "evidence_uri": "https://example.com/audit/lot-030",
            "mark_verified": True,
        },
    ).raise_for_status()

    tokenize_resp = client.post(
        f"/lots/{lot_id}/tokenize",
        json={"token_name": "LOT-030", "token_symbol": "ALU", "supply": 1},
    )
    tokenize_resp.raise_for_status()

    matchmaking_resp = client.post("/agents/matchmaking")
    matchmaking_resp.raise_for_status()
    neg_resp = client.get("/negotiations")
    neg_resp.raise_for_status()
    negotiations = neg_resp.json()
    negotiation = next(item for item in negotiations if item["waste_lot_id"] == lot_id)
    client.post(
        f"/negotiations/{negotiation['id']}/decision",
        json={"agree": True},
    ).raise_for_status()

    proof_resp = client.post(
        f"/lots/{lot_id}/proofs",
        json={
            "recycler_agent_id": recycler_id,
            "evidence_uri": "https://example.com/proof/lot-030",
            "sensor_checksum": "checksum3030",
            "processing_notes": "Melt batch #483",
        },
    )
    proof_resp.raise_for_status()
    proof_id = proof_resp.json()["id"]

    validation_resp = client.post(
        f"/lots/{lot_id}/proofs/{proof_id}/validate",
        json={
            "approve": True,
            "ai_confidence": 0.92,
            "certificate_uri": "https://example.com/cert/lot-030",
        },
    )
    validation_resp.raise_for_status()
    proof_data = validation_resp.json()
    assert proof_data["status"] == "validated"
    assert proof_data["certificate_uri"] == "https://example.com/cert/lot-030"

    lot_detail = client.get(f"/lots/{lot_id}")
    lot_detail.raise_for_status()
    detail = lot_detail.json()
    assert detail["status"] == "retired"
    assert detail["proofs"][0]["status"] == "validated"
    assert detail["token"]["retired_at"] is not None