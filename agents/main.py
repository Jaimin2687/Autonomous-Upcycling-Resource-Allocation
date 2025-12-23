from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Optional

import typer

from aura_agents.config import AgentServiceSettings, load_settings_from_env_or_file
from aura_agents.runner import run_agents

app = typer.Typer(help="Aura autonomous agent service controller")


@app.command()
def start(config: Optional[Path] = typer.Option(None, help="Path to YAML/JSON agent configuration.")) -> None:
    """Start enabled agents using the provided configuration."""
    if config is not None:
        settings = AgentServiceSettings.load(config)
    else:
        settings = load_settings_from_env_or_file()
    asyncio.run(run_agents(settings))


if __name__ == "__main__":
    app()
