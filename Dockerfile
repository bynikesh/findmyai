# Multi‑stage Dockerfile for Railway deployment (frontend + backend)
# -------------------------------------------------
#  Build stage – compile frontend (Vite) and backend (TS)
# -------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install root dependencies (frontend + backend share some)
COPY package*.json ./
RUN npm ci

# Install backend deps (they are in ./backend)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Install frontend deps
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build   # creates ./dist

# Build backend (TS -> JS)
WORKDIR /app/backend
RUN npm run build   # creates ./dist

# -------------------------------------------------
#  Runtime stage – serve static files + API
# -------------------------------------------------
FROM node:20-alpine AS runtime

WORKDIR /app

# Install only production deps for backend
COPY backend/package*.json ./backend/
COPY backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy built assets
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Expose Fastify port (Railway expects $PORT env var, default 3000)
EXPOSE 3000
ENV NODE_ENV=production

# Start the Fastify server
CMD ["node", "backend/dist/index.js"]
