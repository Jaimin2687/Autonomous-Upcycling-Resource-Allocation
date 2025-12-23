from __future__ import annotations

from collections.abc import Iterable
from typing import Any

import httpx

from .models import Agent, Negotiation, Producer, WasteLot, WasteLotStatus


class AuraBackendClient:
    """Async wrapper around the Aura FastAPI backend."""

    def __init__(self, base_url: str, *, timeout: float = 10.0) -> None:
        self._client = httpx.AsyncClient(base_url=base_url, timeout=timeout)

    async def close(self) -> None:
        await self._client.aclose()

    async def list_producers(self) -> list[Producer]:
        resp = await self._client.get("/producers")
        resp.raise_for_status()
        return [Producer.model_validate(item) for item in resp.json()]

    async def create_producer(self, payload: dict[str, Any]) -> Producer:
        resp = await self._client.post("/producers", json=payload)
        resp.raise_for_status()
        return Producer.model_validate(resp.json())

    async def get_producer(self, producer_id: int) -> Producer:
        resp = await self._client.get(f"/producers/{producer_id}")
        resp.raise_for_status()
        return Producer.model_validate(resp.json())

    async def list_lots(self, *, status: WasteLotStatus | None = None) -> list[WasteLot]:
        params = {"status": status.value} if status else None
        resp = await self._client.get("/lots", params=params)
        resp.raise_for_status()
        return [WasteLot.model_validate(item) for item in resp.json()]

    async def get_lot(self, lot_id: int) -> WasteLot:
        resp = await self._client.get(f"/lots/{lot_id}")
        resp.raise_for_status()
        return WasteLot.model_validate(resp.json())

    async def request_verification(self, lot_id: int, payload: dict[str, Any]) -> WasteLot:
        resp = await self._client.post(f"/lots/{lot_id}/verification", json=payload)
        resp.raise_for_status()
        return WasteLot.model_validate(resp.json())

    async def approve_verification(self, lot_id: int, payload: dict[str, Any] | None = None) -> WasteLot:
        resp = await self._client.post(f"/lots/{lot_id}/verify", json=payload or {})
        resp.raise_for_status()
        return WasteLot.model_validate(resp.json())

    async def tokenize_lot(self, lot_id: int, payload: dict[str, Any]) -> WasteLot:
        resp = await self._client.post(f"/lots/{lot_id}/tokenize", json=payload)
        resp.raise_for_status()
        return WasteLot.model_validate(resp.json())

    async def list_agents(self, *, agent_type: str | None = None) -> list[Agent]:
        params = {"agent_type": agent_type} if agent_type else None
        resp = await self._client.get("/agents", params=params)
        resp.raise_for_status()
        return [Agent.model_validate(item) for item in resp.json()]

    async def create_agent(self, payload: dict[str, Any]) -> Agent:
        resp = await self._client.post("/agents", json=payload)
        resp.raise_for_status()
        return Agent.model_validate(resp.json())

    async def matchmaking(self) -> list[Negotiation]:
        resp = await self._client.post("/agents/matchmaking")
        resp.raise_for_status()
        return [Negotiation.model_validate(item) for item in resp.json()]

    async def list_negotiations(self, *, statuses: Iterable[str] | None = None) -> list[Negotiation]:
        negotiations: dict[int, Negotiation] = {}
        if not statuses:
            resp = await self._client.get("/negotiations")
            resp.raise_for_status()
            return [Negotiation.model_validate(item) for item in resp.json()]

        for status in statuses:
            resp = await self._client.get("/negotiations", params={"status": status})
            resp.raise_for_status()
            for payload in resp.json():
                negotiation = Negotiation.model_validate(payload)
                negotiations[negotiation.id] = negotiation
        return list(negotiations.values())

    async def decide_negotiation(self, negotiation_id: int, payload: dict[str, Any]) -> Negotiation:
        resp = await self._client.post(f"/negotiations/{negotiation_id}/decision", json=payload)
        resp.raise_for_status()
        return Negotiation.model_validate(resp.json())

    async def submit_proof(self, lot_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        resp = await self._client.post(f"/lots/{lot_id}/proofs", json=payload)
        resp.raise_for_status()
        return resp.json()

    async def validate_proof(self, lot_id: int, proof_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        resp = await self._client.post(f"/lots/{lot_id}/proofs/{proof_id}/validate", json=payload)
        resp.raise_for_status()
        return resp.json()

