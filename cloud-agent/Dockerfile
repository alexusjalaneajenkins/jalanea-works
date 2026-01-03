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
    # Shell for entrypoint script
    bash \
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
    xauth \
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

# Create non-root user FIRST (fixes Camoufox crash on Linux)
# See: https://github.com/daijro/camoufox/issues/372
RUN groupadd -r pwuser && useradd -r -g pwuser -G audio,video pwuser \
    && mkdir -p /home/pwuser/Downloads \
    && mkdir -p /home/pwuser/.cache \
    && chown -R pwuser:pwuser /home/pwuser

# Create session storage directory with proper permissions
RUN mkdir -p ./sessions && chown -R pwuser:pwuser ./sessions

# Set ownership of app directory to non-root user
RUN chown -R pwuser:pwuser /app

# Cache bust for browser installation (change this to force rebuild)
ARG BROWSER_CACHE_BUST=20260103

# Switch to pwuser BEFORE installing browsers so they go in the right cache dir
USER pwuser

# Download Camoufox browser with retry logic (GitHub API rate limits)
# Retries up to 5 times with 60 second delays between attempts
RUN for i in 1 2 3 4 5; do \
    echo "Attempt $i: Fetching Camoufox..." && \
    npx camoufox-js fetch && break || \
    if [ $i -lt 5 ]; then \
      echo "Attempt $i failed, waiting 60 seconds before retry..." && sleep 60; \
    else \
      echo "All attempts failed" && exit 1; \
    fi; \
    done

# Install Playwright browsers (chromium for fallback)
RUN npx playwright install chromium

# Switch back to root for system deps
USER root

# Install Playwright system dependencies (requires root)
RUN npx playwright install-deps chromium

# Environment variables
ENV NODE_ENV=production
ENV HEADLESS=true
# Display will be set by entrypoint if Xvfb starts successfully
ENV HOME=/home/pwuser

# Expose port for API server
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Create entrypoint script that starts xvfb first (as root, with proper ownership)
COPY --chown=pwuser:pwuser entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Switch to non-root user for running the application
USER pwuser

ENTRYPOINT ["/app/entrypoint.sh"]

# Default command (can be overridden for worker mode)
CMD ["node", "dist/index.js"]
