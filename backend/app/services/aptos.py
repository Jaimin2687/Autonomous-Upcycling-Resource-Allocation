from __future__ import annotations

import secrets
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class MintResult:
    token_address: str
    transaction_hash: str


@dataclass(frozen=True)
class BurnResult:
    transaction_hash: str


class AptosTokenService:
    """Lightweight facade for the Aptos Move waste lot module.

    This implementation generates deterministic placeholder identifiers so the
    backend can exercise happy paths without requiring on-chain connectivity.
    When integrating with a live Aptos network, replace the `_simulate_*`
    helpers with calls into the Aptos SDK or CLI.
    """

    def __init__(self, package_path: Path | None = None, network: str = "local") -> None:
        self.package_path = package_path or Path(__file__).resolve().parents[3] / "blockchain"
        self.network = network

    def mint_waste_lot(self, lot_id: int, token_name: str, token_symbol: str, supply: int) -> MintResult:
        token_address = self._simulate_token_address(lot_id)
        transaction_hash = self._simulate_transaction_hash(token_address)
        return MintResult(token_address=token_address, transaction_hash=transaction_hash)

    def retire_waste_lot(self, token_address: str) -> BurnResult:
        transaction_hash = self._simulate_transaction_hash(token_address)
        return BurnResult(transaction_hash=transaction_hash)

    @staticmethod
    def _simulate_token_address(lot_id: int) -> str:
        random_bits = secrets.token_hex(8)
        return f"0xLOT{lot_id:06d}{random_bits}"

    @staticmethod
    def _simulate_transaction_hash(token_address: str) -> str:
        random_bits = secrets.token_hex(16)
        return f"0xTX{random_bits}{token_address[-6:]}"
