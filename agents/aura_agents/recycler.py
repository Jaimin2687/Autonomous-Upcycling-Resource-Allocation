from __future__ import annotations

import logging
from typing import Optional

from .base import BaseAgent
from .client import AuraBackendClient
from .config import RecyclerAgentSettings
from .models import Agent, NegotiationStatus
from .policies import (
    decide_negotiation,
    proof_submission_payload,
    should_submit_proof,
)


class RecyclerAgent(BaseAgent):
    def __init__(
        self,
        client: AuraBackendClient,
        settings: RecyclerAgentSettings,
        *,
        poll_interval: float,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        super().__init__(
            name=f"recycler-agent:{settings.owner_name}",
            client=client,
            poll_interval=poll_interval,
            logger=logger,
        )
        self.settings = settings
        self._agent: Agent | None = None

    async def initialize(self) -> None:
        self._agent = await self._ensure_agent()
        self.logger.info("Recycler agent ready", extra={"agent_id": self._agent.id})

    async def step(self) -> None:
        if not self._agent:
            return

        status_filters = [
            NegotiationStatus.OPEN.value,
            NegotiationStatus.COUNTER.value,
            NegotiationStatus.AGREED.value,
            NegotiationStatus.SETTLED.value,
        ]
        negotiations = await self.client.list_negotiations(statuses=status_filters)
        targeted = [n for n in negotiations if n.recycler_agent_id == self._agent.id]

        for negotiation in targeted:
            decision = decide_negotiation(negotiation, self.settings)
            if decision is None:
                continue
            self.logger.info(
                "Responding to negotiation",
                extra={"negotiation_id": negotiation.id, "payload": decision},
            )
            await self.client.decide_negotiation(negotiation.id, decision)

        # Proof submissions for settled lots
        lot_ids = {
            neg.waste_lot_id
            for neg in targeted
            if neg.status in {NegotiationStatus.AGREED, NegotiationStatus.SETTLED}
        }
        for lot_id in lot_ids:
            lot = await self.client.get_lot(lot_id)
            if not should_submit_proof(lot, self.settings):
                continue
            payload = proof_submission_payload(lot, self.settings, self._agent.id)
            self.logger.info("Submitting upcycling proof", extra={"lot_id": lot_id})
            await self.client.submit_proof(lot_id, payload)

    async def _ensure_agent(self) -> Agent:
        agents = await self.client.list_agents(agent_type="recycler")
        for agent in agents:
            if agent.owner_name.lower() == self.settings.owner_name.lower():
                return agent
        payload = {
            "owner_name": self.settings.owner_name,
            "agent_type": "recycler",
            "owner_contact": self.settings.owner_contact,
            "max_price_usd_per_ton": self.settings.max_price_usd_per_ton,
            "auto_negotiate": True,
            "agent_identifier": self.settings.agent_identifier,
        }
        created = await self.client.create_agent(payload)
        return created
