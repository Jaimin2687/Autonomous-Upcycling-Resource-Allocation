from __future__ import annotations

import json
from pathlib import Path
from typing import List

from .models import AgentConfig, WasteLot

_BASE_DIR = Path(__file__).resolve().parent.parent
_DATA_DIR = _BASE_DIR / "data"


def _load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_waste_lots() -> List[WasteLot]:
    raw = _load_json(_DATA_DIR / "waste_lots.json")
    return [WasteLot.model_validate(item) for item in raw]


def load_agents() -> List[AgentConfig]:
    raw = _load_json(_DATA_DIR / "agents.json")
    return [AgentConfig.model_validate(item) for item in raw]
