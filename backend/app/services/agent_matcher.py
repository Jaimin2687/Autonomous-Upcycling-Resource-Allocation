from __future__ import annotations

from datetime import datetime
from typing import Iterable

from sqlmodel import Session, select

from ..db_models import Agent, Negotiation, WasteLot, WasteLotStatus
from ..crud import create_negotiation


class AgentMatchmaker:
    """Rule-based matcher to simulate agent negotiations.

    This class inspects verified/tokenized waste lots, pairs them with
    recycler agents whose bidding constraints are satisfied, and records
    negotiation stubs that can later be accepted or countered.
    """

    def __init__(self, session: Session) -> None:
        self.session = session

    def propose_matches(self) -> list[Negotiation]:
        lots = self._eligible_lots()
        recycler_agents = self._recycler_agents()

        negotiations: list[Negotiation] = []
        for lot in lots:
            producer_agent = self._producer_agent_for_lot(lot)
            if not producer_agent:
                continue

            for recycler_agent in recycler_agents:
                if not self._meets_price_expectations(lot, recycler_agent):
                    continue

                producer_offer = producer_agent.target_price_usd_per_ton or lot.price_floor_usd_per_ton
                recycler_offer = self._suggest_recycler_offer(lot, recycler_agent)

                negotiation = create_negotiation(
                    self.session,
                    lot,
                    producer_agent,
                    recycler_agent,
                    producer_offer,
                    recycler_offer,
                )
                negotiations.append(negotiation)

                if lot.status != WasteLotStatus.NEGOTIATING:
                    lot.status = WasteLotStatus.NEGOTIATING
                    lot.updated_at = datetime.utcnow()
                    self.session.add(lot)
                    self.session.commit()

        return negotiations

    def _eligible_lots(self) -> Iterable[WasteLot]:
        statuses = {WasteLotStatus.VERIFIED, WasteLotStatus.TOKENIZED}
        return self.session.exec(
            select(WasteLot).where(WasteLot.status.in_(statuses)).order_by(WasteLot.updated_at.desc())
        ).all()

    def _producer_agent_for_lot(self, lot: WasteLot) -> Agent | None:
        return self.session.exec(
            select(Agent)
            .where(Agent.agent_type == "producer")
            .where(Agent.producer_id == lot.producer_id)
            .order_by(Agent.updated_at.desc())
        ).first()

    def _recycler_agents(self) -> list[Agent]:
        return self.session.exec(
            select(Agent).where(Agent.agent_type == "recycler").order_by(Agent.updated_at.desc())
        ).all()

    def _meets_price_expectations(self, lot: WasteLot, recycler_agent: Agent) -> bool:
        if recycler_agent.max_price_usd_per_ton is None:
            return True
        if lot.price_floor_usd_per_ton is None:
            return True
        return lot.price_floor_usd_per_ton <= recycler_agent.max_price_usd_per_ton

    def _suggest_recycler_offer(self, lot: WasteLot, recycler_agent: Agent) -> float | None:
        floor = lot.price_floor_usd_per_ton or 0
        max_bid = recycler_agent.max_price_usd_per_ton
        target = recycler_agent.target_price_usd_per_ton or max_bid

        if max_bid is None and target is None:
            return floor

        ceiling = max_bid or target or floor
        midpoint = (floor + ceiling) / 2 if ceiling is not None else floor
        return min(ceiling, midpoint)
