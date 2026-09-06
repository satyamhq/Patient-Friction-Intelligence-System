# ==============================================================================
# PFIS - Patient Friction Intelligence System
# Production Multi-Stage Container Image
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend Server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy compiled backend
COPY --from=server-builder /app/server/dist ./server/dist

# Copy compiled frontend to public directory
COPY --from=client-builder /app/client/dist ./client/dist

# Create uploads directory
RUN mkdir -p /app/server/uploads

EXPOSE 5000

CMD ["node", "server/dist/server.js"]
