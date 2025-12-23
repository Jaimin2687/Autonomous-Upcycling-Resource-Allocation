from __future__ import annotations

import json
from pathlib import Path

from sqlmodel import Session, select

from .db import engine
from .db_models import Agent, Producer, WasteLot, WasteLotStatus

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def seed_initial_data() -> None:
    with Session(engine) as session:
        if session.exec(select(Producer)).first():
            return

        waste_lots_data = _load_json("waste_lots.json")
        agents_data = _load_json("agents.json")

        producer_lookup: dict[str, Producer] = {}
        for lot in waste_lots_data:
            producer_name = lot.get("producer")
            if not producer_name:
                continue
            if producer_name in producer_lookup:
                continue

            producer = Producer(
                name=producer_name,
                contact_email=_fallback_contact(producer_name),
                organization_type="producer",
            )
            session.add(producer)
            session.flush()
            producer_lookup[producer_name] = producer

        session.commit()

        status_mapping = {
            "available": WasteLotStatus.VERIFIED,
            "negotiating": WasteLotStatus.NEGOTIATING,
            "draft": WasteLotStatus.DRAFT,
        }

        for lot in waste_lots_data:
            producer = producer_lookup.get(lot.get("producer"))
            if not producer:
                continue

            waste_lot = WasteLot(
                producer_id=producer.id,
                external_reference=lot.get("id"),
                material_type=lot.get("material_type", "Unknown"),
                quantity_tons=float(lot.get("quantity_tons", 0)),
                location=lot.get("location", ""),
                price_floor_usd_per_ton=float(lot.get("price_floor_usd_per_ton", 0)),
                status=status_mapping.get(lot.get("status", ""), WasteLotStatus.PENDING_VERIFICATION),
            )

            verification = lot.get("verification") or {}
            if verification:
                waste_lot.chemical_composition = {}
                waste_lot.photos = [verification.get("evidence_uri")] if verification.get("evidence_uri") else []

            session.add(waste_lot)

        for agent in agents_data:
            owner_name = agent.get("owner", "Unknown")
            strategy = agent.get("strategy", {})
            producer = producer_lookup.get(owner_name)

            session.add(
                Agent(
                    agent_identifier=agent["id"],
                    owner_name=owner_name,
                    owner_contact=_fallback_contact(owner_name),
                    agent_type=agent.get("type", "unknown"),
                    producer_id=producer.id if producer else None,
                    target_price_usd_per_ton=strategy.get("target_price_usd_per_ton"),
                    max_price_usd_per_ton=strategy.get("max_price_usd_per_ton"),
                    deadline_hours=strategy.get("deadline_hours"),
                    radius_miles=strategy.get("radius_miles"),
                    auto_negotiate=strategy.get("auto_negotiate", True),
                    bundle_preference=strategy.get("bundle_preference", False),
                    strategy_metadata=strategy,
                )
            )

        session.commit()


def _load_json(filename: str):
    with (_DATA_DIR / filename).open("r", encoding="utf-8") as fh:
        return json.load(fh)


def _fallback_contact(name: str) -> str:
    sanitized = name.lower().replace(" ", ".").replace("/", "-")
    return f"contact@{sanitized}.example.com"
