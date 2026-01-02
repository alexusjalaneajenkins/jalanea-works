# Jalanea Works Cloud Agent
# Multi-stage build for browser automation worker

# ============================================
# Stage 1: Build
# ============================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for build)
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-slim AS runner

# Install system dependencies for browsers
RUN apt-get update && apt-get install -y \
    # Firefox/Camoufox dependencies
    libgtk-3-0 \
    libdbus-glib-1-2 \
    libxt6 \
    libasound2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxkbcommon0 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxshmfence1 \
    # For virtual display (headless)
    xvfb \
    # Fonts
    fonts-liberation \
    fonts-noto-color-emoji \
    # Utils
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Download Camoufox browser
RUN npx camoufox-js fetch

# Create session storage directory
RUN mkdir -p ./sessions && chmod 755 ./sessions

# Environment variables
ENV NODE_ENV=production
ENV HEADLESS=true

# Expose port for API server
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Default command (can be overridden for worker mode)
CMD ["node", "dist/index.js"]
