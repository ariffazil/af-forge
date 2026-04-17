#!/usr/bin/env bash
set -euo pipefail

# arifOS MCP stdio server launcher
# Runs from the repo root so both arifosmcp and sibling core modules resolve
# without creating a fresh uv environment on every launch.

export PATH="/usr/local/bin:/root/.local/bin:${PATH}"
export ARIFOS_MINIMAL_STDIO=1
export PYTHONPATH="/root/arifOS${PYTHONPATH:+:${PYTHONPATH}}"

cd /root/arifOS
exec python3 -m arifosmcp.runtime.__main__ stdio
