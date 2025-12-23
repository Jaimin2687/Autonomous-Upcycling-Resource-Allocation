from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Optional

import yaml
from pydantic import BaseModel, Field, field_validator

DEFAULT_API_BASE_URL = "http://127.0.0.1:8000"


class ProducerIdentity(BaseModel):
    name: str
    contact_email: str
    organization_type: str = Field(default="manufacturer")
    aptos_address: Optional[str] = None


class ProducerAgentSettings(BaseModel):
    enabled: bool = True
    identity: ProducerIdentity
    auto_verify: bool = True
    auto_tokenize: bool = True
    verification_notes: str | None = Field(
        default="Auto-approved by producer agent.",
        description="Notes appended when automatically approving verification requests.",
    )
    token_symbol: str = Field(default="AURA")
    token_supply: int = Field(default=1, ge=1)
    agent_identifier: str | None = None


class RecyclerAgentSettings(BaseModel):
    enabled: bool = True
    owner_name: str
    owner_contact: str | None = None
    max_price_usd_per_ton: float = Field(default=275.0, ge=0)
    counter_offer_step: float = Field(
        default=15.0,
        ge=0,
        description="USD increment to add when countering below the recycler max price.",
    )
    submit_proof: bool = True
    proof_evidence_uri: str | None = None
    proof_notes: str | None = "Automated upcycling batch"
    agent_identifier: str | None = None


class ComplianceAgentSettings(BaseModel):
    enabled: bool = True
    reviewer_name: str = "Automated Compliance"
    approve_threshold: float = Field(default=0.85, ge=0, le=1)
    auto_certificate_uri: str | None = None


class AgentServiceSettings(BaseModel):
    api_base_url: str = Field(default_factory=lambda: os.getenv("AURA_API_BASE_URL", DEFAULT_API_BASE_URL))
    poll_interval_seconds: float = Field(
        default_factory=lambda: float(os.getenv("AURA_AGENT_POLL_INTERVAL", "5.0")), ge=1.0
    )
    matchmaking_interval_seconds: float = Field(default=30.0, ge=5.0)
    producer: ProducerAgentSettings | None = None
    recycler: RecyclerAgentSettings | None = None
    compliance: ComplianceAgentSettings | None = None

    @field_validator("api_base_url")
    def _strip_trailing_slash(cls, value: str) -> str:  # noqa: N805 (pydantic validator signature)
        return value.rstrip("/")

    @classmethod
    def load(cls, source: str | Path | None = None) -> "AgentServiceSettings":
        if source is None:
            return cls()

        path = Path(source)
        if not path.exists():
            raise FileNotFoundError(f"Agent configuration file not found: {path}")

        raw: dict[str, Any]
        if path.suffix.lower() in {".yml", ".yaml"}:
            raw = yaml.safe_load(path.read_text()) or {}
        elif path.suffix.lower() == ".json":
            raw = json.loads(path.read_text())
        else:
            raise ValueError("Unsupported configuration format. Use YAML or JSON.")

        return cls(**raw)


def load_settings_from_env_or_file() -> AgentServiceSettings:
    config_path = os.getenv("AURA_AGENT_CONFIG")
    if config_path:
        return AgentServiceSettings.load(config_path)
    return AgentServiceSettings()
