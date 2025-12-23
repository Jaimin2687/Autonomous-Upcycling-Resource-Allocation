from __future__ import annotations

import asyncio
import logging
from typing import List

from .client import AuraBackendClient
from .compliance import ComplianceAgent
from .config import AgentServiceSettings
from .producer import ProducerAgent
from .recycler import RecyclerAgent


async def run_agents(settings: AgentServiceSettings) -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    logger = logging.getLogger("aura.agents")
    logger.info("Starting agent service", extra={"api_base_url": settings.api_base_url})

    client = AuraBackendClient(settings.api_base_url)
    agent_tasks: List[asyncio.Task] = []
    agent_instances = []

    if settings.producer and settings.producer.enabled:
        agent_instances.append(
            ProducerAgent(
                client=client,
                settings=settings.producer,
                poll_interval=settings.poll_interval_seconds,
            )
        )

    if settings.recycler and settings.recycler.enabled:
        agent_instances.append(
            RecyclerAgent(
                client=client,
                settings=settings.recycler,
                poll_interval=settings.poll_interval_seconds,
            )
        )

    if settings.compliance and settings.compliance.enabled:
        agent_instances.append(
            ComplianceAgent(
                client=client,
                settings=settings.compliance,
                poll_interval=settings.poll_interval_seconds,
            )
        )

    if not agent_instances:
        logger.warning("No agents enabled. Nothing to run.")
        await client.close()
        return

    async def matchmaking_loop() -> None:
        while True:
            await asyncio.sleep(settings.matchmaking_interval_seconds)
            try:
                logger.debug("Running matchmaking sweep")
                await client.matchmaking()
            except Exception as exc:  # pragma: no cover - defensive logging
                logger.warning("Matchmaking sweep failed: %s", exc)

    # Start agent coroutines
    for agent in agent_instances:
        agent_tasks.append(asyncio.create_task(agent.run_forever()))

    matchmaking_task: asyncio.Task | None = None
    if settings.recycler and settings.recycler.enabled:
        matchmaking_task = asyncio.create_task(matchmaking_loop())

    try:
        await asyncio.gather(*agent_tasks)
    except asyncio.CancelledError:
        logger.info("Agent service cancelled")
    finally:
        for agent in agent_instances:
            agent.stop()
        for task in agent_tasks:
            task.cancel()
        if matchmaking_task:
            matchmaking_task.cancel()
            await asyncio.gather(matchmaking_task, return_exceptions=True)
        await asyncio.gather(*agent_tasks, return_exceptions=True)
        await client.close()
        logger.info("Agent service stopped")
