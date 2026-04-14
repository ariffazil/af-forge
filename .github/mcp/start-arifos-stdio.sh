#!/usr/bin/env bash
set -euo pipefail

# arifOS MCP stdio server launcher
# Uses uvx to run the local arifosmcp package with auto-resolved dependencies

export PATH="/usr/local/bin:/root/.local/bin:${PATH}"
export ARIFOS_MINIMAL_STDIO=1

exec uvx --from /root/arifOS/arifosmcp arifos stdio
