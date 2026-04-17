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
