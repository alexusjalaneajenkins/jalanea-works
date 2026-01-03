#!/bin/bash
# Jalanea Works Cloud Agent - Docker Entrypoint
# Starts virtual framebuffer (xvfb) for headless browser automation
# Fixes for Docker/cloud environments based on:
# - https://github.com/daijro/camoufox/issues/372
# - https://github.com/microsoft/playwright/issues/9788

set -e

echo "[Entrypoint] Starting Xvfb virtual display on :99..."

# Try to start Xvfb
Xvfb :99 -screen 0 1280x800x24 -nolisten tcp &
XVFB_PID=$!

# Wait for Xvfb to start
sleep 2

# Verify Xvfb is running
if kill -0 $XVFB_PID 2>/dev/null; then
    echo "[Entrypoint] Xvfb started successfully (PID: $XVFB_PID)"
    export DISPLAY=:99
    echo "[Entrypoint] DISPLAY set to :99"
else
    echo "[Entrypoint] WARNING: Xvfb failed to start"
    echo "[Entrypoint] Unsetting DISPLAY to prevent browser hangs (per Playwright issue #9788)"
    unset DISPLAY
    echo "[Entrypoint] DISPLAY unset - browser will use native headless mode"
fi

echo "[Entrypoint] Platform: $(uname -a)"
echo "[Entrypoint] User: $(whoami) (UID: $(id -u))"

# Download Camoufox browser if not already cached
echo "[Entrypoint] Checking for Camoufox browser..."
if npx camoufox-js fetch 2>&1 | grep -q "already installed\|Successfully"; then
    echo "[Entrypoint] Camoufox ready"
else
    echo "[Entrypoint] WARNING: Camoufox fetch failed, will use Chromium fallback"
fi

echo "[Entrypoint] Starting application: $@"

exec "$@"
