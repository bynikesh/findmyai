# -------------------------------
#  Build stage – compile frontend + backend
# -------------------------------
FROM node:20-bullseye AS builder

WORKDIR /app

# Copy root package.json for workspace configuration
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install all dependencies (root + workspaces)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Build frontend (Vite)
WORKDIR /app/frontend
RUN npm run build

# Build backend (TypeScript -> JavaScript)
WORKDIR /app/backend
RUN npm run build

# -------------------------------
#  Runtime stage – serve backend + static frontend
# -------------------------------
FROM node:20-bullseye AS runtime

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Copy node_modules from builder (includes all workspace dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy built assets from builder
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Set environment
ENV NODE_ENV=production
EXPOSE 3000

# Start backend server
CMD ["node", "backend/dist/index.js"]
