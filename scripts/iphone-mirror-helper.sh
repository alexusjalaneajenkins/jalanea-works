#!/bin/bash
# iPhone Mirroring Helper Script
# Usage: ./iphone-mirror-helper.sh [command]
# Commands: screenshot, home, tap x y, swipe

SCREENSHOT_DIR="/tmp"

case "$1" in
  screenshot)
    osascript -e 'tell application "iPhone Mirroring" to activate'
    sleep 0.5
    screencapture -x "$SCREENSHOT_DIR/iphone_screen.png"
    echo "Screenshot saved to $SCREENSHOT_DIR/iphone_screen.png"
    ;;
  home)
    osascript -e 'tell application "iPhone Mirroring" to activate'
    sleep 0.3
    # Click center of iPhone screen, then Cmd+Shift+H
    cliclick c:420,300 kd:cmd,shift t:h ku:cmd,shift
    sleep 1
    screencapture -x "$SCREENSHOT_DIR/iphone_screen.png"
    echo "Went home, screenshot saved"
    ;;
  tap)
    osascript -e 'tell application "iPhone Mirroring" to activate'
    sleep 0.3
    cliclick c:$2,$3
    sleep 0.5
    screencapture -x "$SCREENSHOT_DIR/iphone_screen.png"
    echo "Tapped at $2,$3, screenshot saved"
    ;;
  swipe-up)
    osascript -e 'tell application "iPhone Mirroring" to activate'
    sleep 0.3
    cliclick c:420,300
    sleep 0.2
    cliclick dd:420,450 m:420,150 du:420,150
    sleep 1
    screencapture -x "$SCREENSHOT_DIR/iphone_screen.png"
    echo "Swiped up, screenshot saved"
    ;;
  *)
    echo "Usage: $0 {screenshot|home|tap x y|swipe-up}"
    exit 1
    ;;
esac
