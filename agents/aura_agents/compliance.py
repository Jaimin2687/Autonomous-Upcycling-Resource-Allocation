from __future__ import annotations

import logging
from typing import Optional

from .base import BaseAgent
from .client import AuraBackendClient
from .config import ComplianceAgentSettings
from .models import WasteLotStatus
from .policies import proof_validation_payload, should_validate_proof


class ComplianceAgent(BaseAgent):
    def __init__(
        self,
        client: AuraBackendClient,
        settings: ComplianceAgentSettings,
        *,
        poll_interval: float,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        super().__init__(
            name="compliance-agent",
            client=client,
            poll_interval=poll_interval,
            logger=logger,
        )
        self.settings = settings

    async def step(self) -> None:
        lots = await self.client.list_lots(status=WasteLotStatus.UPCYCLING_PENDING)
        for lot in lots:
            for proof in lot.proofs:
                if not should_validate_proof(proof, self.settings):
                    continue
                payload = proof_validation_payload(proof, self.settings)
                self.logger.info(
                    "Validating proof",
                    extra={"lot_id": lot.id, "proof_id": proof.id, "approve": payload.get("approve")},
                )
                await self.client.validate_proof(lot.id, proof.id, payload)
