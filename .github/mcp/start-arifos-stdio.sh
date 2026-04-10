#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PROJECT_ROOT="${REPO_ROOT}/arifOS"

cd "${PROJECT_ROOT}"

export ARIFOS_DEPLOYMENT=local
export AAA_MCP_TRANSPORT=stdio
export ARIFOS_MINIMAL_STDIO=1

if [[ -x "${PROJECT_ROOT}/.venv/bin/python" ]]; then
  exec "${PROJECT_ROOT}/.venv/bin/python" ops/runtime/stdio_server.py
fi

exec python3 ops/runtime/stdio_server.py
