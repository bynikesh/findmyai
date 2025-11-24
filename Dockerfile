# -------------------------------
#  Build stage – compile frontend + backend
# -------------------------------
FROM node:20-bullseye AS builder

WORKDIR /app

# Install root dependencies (optional if you have shared packages)
COPY package*.json ./
RUN npm install

# Backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Frontend deps
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy source code
COPY . .

# Build frontend (Vite)
WORKDIR /app/frontend
RUN npm run build   # produces ./dist

# Build backend (TS -> JS if applicable)
WORKDIR /app/backend
RUN npm run build   # produces ./dist

# -------------------------------
#  Runtime stage – serve backend + static frontend
# -------------------------------
FROM node:20-bullseye AS runtime

WORKDIR /app

# Install only production backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy built assets
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Expose port (Railway provides $PORT env)
ENV NODE_ENV=production
EXPOSE 3000

# Start backend (Fastify / Express)
CMD ["node", "backend/dist/index.js"]
