from __future__ import annotations

import logging
from typing import Optional

from .base import BaseAgent
from .client import AuraBackendClient
from .config import ProducerAgentSettings
from .models import Agent, Producer, WasteLot, WasteLotStatus
from .policies import (
    should_auto_verify,
    should_tokenize,
    tokenization_payload,
    verification_payload,
)


class ProducerAgent(BaseAgent):
    def __init__(
        self,
        client: AuraBackendClient,
        settings: ProducerAgentSettings,
        *,
        poll_interval: float,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        super().__init__(
            name=f"producer-agent:{settings.identity.name}",
            client=client,
            poll_interval=poll_interval,
            logger=logger,
        )
        self.settings = settings
        self._producer: Producer | None = None
        self._agent: Agent | None = None

    async def initialize(self) -> None:
        self._producer = await self._ensure_producer()
        self._agent = await self._ensure_agent(self._producer)
        self.logger.info(
            "Producer agent ready", extra={"producer_id": self._producer.id, "agent_id": self._agent.id if self._agent else None}
        )

    async def step(self) -> None:
        if not self._producer:
            return
        producer = await self.client.get_producer(self._producer.id)
        self._producer = producer

        for lot in producer.lots:
            await self._process_lot(lot)

    async def _ensure_producer(self) -> Producer:
        producers = await self.client.list_producers()
        for producer in producers:
            if producer.name.lower() == self.settings.identity.name.lower():
                return producer
        payload = {
            "name": self.settings.identity.name,
            "contact_email": self.settings.identity.contact_email,
            "organization_type": self.settings.identity.organization_type,
            "aptos_address": self.settings.identity.aptos_address,
        }
        created = await self.client.create_producer(payload)
        self.logger.info("Created producer record", extra={"producer_id": created.id})
        return created

    async def _ensure_agent(self, producer: Producer) -> Agent:
        agents = await self.client.list_agents(agent_type="producer")
        for agent in agents:
            if agent.owner_name.lower() == producer.name.lower():
                return agent
        payload = {
            "owner_name": producer.name,
            "agent_type": "producer",
            "owner_contact": producer.contact_email,
            "producer_id": producer.id,
            "agent_identifier": self.settings.agent_identifier,
            "auto_negotiate": True,
        }
        created = await self.client.create_agent(payload)
        self.logger.info("Created producer agent", extra={"agent_id": created.id})
        return created

    async def _process_lot(self, lot: WasteLot) -> None:
        if lot.status == WasteLotStatus.PENDING_VERIFICATION and lot.verification is None:
            self.logger.info("Submitting verification request", extra={"lot_id": lot.id})
            await self.client.request_verification(
                lot.id,
                {
                    "method": "automated_inspection",
                    "mark_verified": False,
                    "evidence_uri": (lot.photos[0] if lot.photos else None) or "https://example.com/verification",
                },
            )
            lot = await self.client.get_lot(lot.id)

        if should_auto_verify(lot, self.settings) and lot.verification is not None:
            self.logger.info("Auto-approving verification", extra={"lot_id": lot.id})
            await self.client.approve_verification(lot.id, verification_payload(self.settings))
            lot = await self.client.get_lot(lot.id)

        if should_tokenize(lot, self.settings):
            self.logger.info("Tokenizing lot", extra={"lot_id": lot.id})
            await self.client.tokenize_lot(lot.id, tokenization_payload(lot, self.settings))