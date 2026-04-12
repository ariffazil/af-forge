from __future__ import annotations

import asyncio
from typing import Any

from core.runtime_bridge import RuntimeBridge


class RealityBridge:
    """Compatibility wrapper around the canonical runtime bridge."""

    def __init__(self, session_id: str = "global", dry_run: bool = True):
        self.session_id = session_id
        self.dry_run = dry_run
        self._bridge = RuntimeBridge(session_id=session_id, dry_run=dry_run)

    async def execute(self, command: str, tool: str = "code_engine") -> dict[str, Any]:
        result = await self._bridge.execute(command=command, tool=tool)
        return {
            "success": result.success,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
            "command": result.command,
            "verification_hash": result.verification_hash,
            "execution_time_ms": result.execution_time_ms,
        }


def execute(
    tool: str,
    command: str,
    params: dict[str, Any] | None = None,
    checkpoint_id: str | None = None,
) -> dict[str, Any]:
    del params, checkpoint_id
    bridge = RealityBridge()
    return asyncio.run(bridge.execute(command=command, tool=tool))

