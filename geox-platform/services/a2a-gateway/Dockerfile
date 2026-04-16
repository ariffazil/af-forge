FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy server
COPY server.js .

# Copy agent cards (volume-mounted at runtime, but include for fallback)
RUN mkdir -p /app/agents && \
    cp -r agents/* /app/agents/ 2>/dev/null || true

EXPOSE 3002

CMD ["node", "server.js"]
