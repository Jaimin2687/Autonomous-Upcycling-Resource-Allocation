from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    api_key: str = os.getenv("AURA_API_KEY", "local-dev-key")
    database_url: str = os.getenv(
        "AURA_DATABASE_URL",
        f"sqlite:///{(Path(__file__).resolve().parent.parent / 'data' / 'aura.db').as_posix()}"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
