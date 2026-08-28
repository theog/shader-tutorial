#!/bin/bash
# Serve a chapter's interactive app locally
# Usage: ./scripts/serve.sh [chapter_number]
# If no chapter specified, serves the entire chapters directory

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TUTORIAL_DIR="$(dirname "$SCRIPT_DIR")"
CHAPTERS_DIR="$TUTORIAL_DIR/chapters"

PORT="${PORT:-8080}"

if [ -n "$1" ]; then
    # Find the chapter directory matching this number
    CHAPTER_DIR=$(find "$CHAPTERS_DIR" -maxdepth 1 -type d -name "${1}-*" | head -1)
    if [ -z "$CHAPTER_DIR" ]; then
        echo "Error: No chapter found with number $1"
        echo "Available chapters:"
        ls -1 "$CHAPTERS_DIR" 2>/dev/null || echo "  (none)"
        exit 1
    fi
    SERVE_DIR="$CHAPTER_DIR/app"
    echo "Serving Chapter $1 at http://localhost:$PORT"
else
    SERVE_DIR="$TUTORIAL_DIR"
    echo "Serving tutorial hub and all chapters at http://localhost:$PORT"
fi

echo "Directory: $SERVE_DIR"
echo "Press Ctrl+C to stop"
echo ""

# Use Python's built-in HTTP server (available on macOS)
cd "$SERVE_DIR"
python3 -m http.server "$PORT"
