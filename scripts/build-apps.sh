#!/bin/bash
# Build/validate all chapter apps (or a specific one)
# Usage: ./scripts/build-apps.sh [chapter_number]
#
# Since we use browser-native React (via CDN + Babel standalone),
# there's no build step needed. This script validates the structure
# and can optionally bundle for production.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TUTORIAL_DIR="$(dirname "$SCRIPT_DIR")"
CHAPTERS_DIR="$TUTORIAL_DIR/chapters"

validate_chapter() {
    local dir="$1"
    local name=$(basename "$dir")
    local errors=0

    echo "Validating $name..."

    # Check required files
    if [ ! -f "$dir/lesson.md" ]; then
        echo "  MISSING: lesson.md"
        errors=$((errors + 1))
    fi

    if [ ! -f "$dir/quiz.md" ]; then
        echo "  MISSING: quiz.md"
        errors=$((errors + 1))
    fi

    if [ ! -f "$dir/app/index.html" ]; then
        echo "  MISSING: app/index.html"
        errors=$((errors + 1))
    fi

    if [ ! -f "$dir/app/App.jsx" ]; then
        echo "  MISSING: app/App.jsx"
        errors=$((errors + 1))
    fi

    if [ ! -d "$dir/app/shaders" ]; then
        echo "  MISSING: app/shaders/ directory"
        errors=$((errors + 1))
    fi

    # Check for at least one shader file
    local shader_count=$(find "$dir/app/shaders" -name "*.frag" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$shader_count" -eq 0 ]; then
        echo "  WARNING: No .frag files in app/shaders/"
    else
        echo "  ✓ Found $shader_count shader examples in app/shaders/"
    fi

    if [ $errors -eq 0 ]; then
        echo "  OK"
    else
        echo "  ERRORS: $errors"
    fi

    return $errors
}

echo "========================================="
echo " Shader Tutorial — App Validator"
echo "========================================="
echo ""

total_errors=0

if [ -n "$1" ]; then
    # Validate specific chapter
    CHAPTER_DIR=$(find "$CHAPTERS_DIR" -maxdepth 1 -type d -name "${1}-*" | head -1)
    if [ -z "$CHAPTER_DIR" ]; then
        echo "Error: No chapter found with number $1"
        exit 1
    fi
    validate_chapter "$CHAPTER_DIR"
    total_errors=$?
else
    # Validate root portal index.html
    if [ ! -f "$TUTORIAL_DIR/index.html" ]; then
        echo "MISSING: Root portal index.html in $TUTORIAL_DIR"
        total_errors=$((total_errors + 1))
    else
        echo "✓ Root portal index.html exists"
    fi
    echo ""

    if [ ! -d "$CHAPTERS_DIR" ] || [ -z "$(ls -A "$CHAPTERS_DIR" 2>/dev/null)" ]; then
        echo "No chapters found in $CHAPTERS_DIR"
        echo "Run ./scripts/new-chapter.sh to create one."
        exit 0
    fi

    for dir in "$CHAPTERS_DIR"/*/; do
        if [ -d "$dir" ]; then
            validate_chapter "$dir"
            total_errors=$((total_errors + $?))
        fi
    done
fi

echo ""
if [ $total_errors -eq 0 ]; then
    echo "All validations passed!"
else
    echo "Total errors: $total_errors"
    exit 1
fi
