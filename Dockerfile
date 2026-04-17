<<<<<<< HEAD
# AF FORGE — TypeScript Runtime Container
# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci && npm cache clean --force
COPY src/ ./src/
COPY examples/ ./examples/
COPY test/ ./test/
RUN npm run build

# Stage 2: runtime
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 7071
CMD ["node", "dist/src/server.js"]
=======
# GEOX Earth Intelligence Core — Anti-Chaos Dimension-Native
# DITEMPA BUKAN DIBERI
# Version: v2026.04.12-DIMENSION-NATIVE

FROM python:3.11-slim

LABEL maintainer="arifOS"
LABEL version="v2026.04.12-DIMENSION-NATIVE"
LABEL seal="DITEMPA BUKAN DIBERI"

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy canonical GEOX — Anti-Chaos Structure
# Contracts (Single Source of Truth)
COPY contracts/ ./contracts/

# Control Plane (Routing & Coordination)
COPY control_plane/ ./control_plane/

# Execution Plane (Calculations & Engines)
COPY execution_plane/ ./execution_plane/

# Compatibility Layer (Legacy Support)
COPY compatibility/ ./compatibility/

# Services (Evidence, Geo, Governance, Witness)
COPY services/ ./services/

# Data & Knowledge
COPY data/ ./data/
COPY geox_atlas_99_materials.csv .

# Entrypoint Shim (imports from execution_plane)
COPY geox_unified.py .
COPY entrypoint.sh .

# Create vault directory
RUN mkdir -p /app/999_vault

# Non-root user for security
RUN useradd -m -u 1000 geox && \
    chown -R geox:geox /app && \
    chmod +x /app/entrypoint.sh

USER geox

# Expose MCP server port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start Earth Intelligence Core
CMD ["/app/entrypoint.sh"]
>>>>>>> origin/promotion/ecosystem-final
