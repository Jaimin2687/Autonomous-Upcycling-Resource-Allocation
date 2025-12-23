from __future__ import annotations

import asyncio
import logging
from typing import Optional

from .client import AuraBackendClient


class BaseAgent:
    """Abstract base class for autonomous service agents."""

    def __init__(
        self,
        name: str,
        client: AuraBackendClient,
        *,
        poll_interval: float,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        self.name = name
        self.client = client
        self.poll_interval = poll_interval
        self.logger = logger or logging.getLogger(name)
        self._shutdown_event = asyncio.Event()
        self._initialized = False

    async def initialize(self) -> None:
        """Hook for subclasses to perform startup actions."""

    async def step(self) -> None:
        """One iteration of work for the agent."""
        raise NotImplementedError

    async def run_forever(self) -> None:
        if not self._initialized:
            await self.initialize()
            self._initialized = True
            self.logger.info("%s initialized", self.name)
        while not self._shutdown_event.is_set():
            try:
                await self.step()
            except Exception as exc:  # pragma: no cover - defensive logging
                self.logger.exception("Agent %s encountered error: %s", self.name, exc)
            try:
                await asyncio.wait_for(self._shutdown_event.wait(), timeout=self.poll_interval)
            except asyncio.TimeoutError:
                continue

    def stop(self) -> None:
        self._shutdown_event.set()
