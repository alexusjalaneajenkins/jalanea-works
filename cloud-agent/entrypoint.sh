#!/bin/bash
# Jalanea Works Cloud Agent - Docker Entrypoint
# Starts virtual framebuffer (xvfb) for headless browser automation

set -e

echo "[Entrypoint] Starting Xvfb virtual display on :99..."
Xvfb :99 -screen 0 1280x800x24 -nolisten tcp &
XVFB_PID=$!

# Wait for Xvfb to start
sleep 2

# Verify Xvfb is running
if kill -0 $XVFB_PID 2>/dev/null; then
    echo "[Entrypoint] Xvfb started successfully (PID: $XVFB_PID)"
else
    echo "[Entrypoint] WARNING: Xvfb failed to start, continuing anyway..."
fi

echo "[Entrypoint] Starting application: $@"
exec "$@"
