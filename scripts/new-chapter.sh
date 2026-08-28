#!/bin/bash
# Generate a new chapter folder from templates
# Usage: ./scripts/new-chapter.sh <chapter_number> "<Chapter Title>"
# Example: ./scripts/new-chapter.sh 05 "Shapes — Lines, Circles, and Rectangles"

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TUTORIAL_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATES_DIR="$TUTORIAL_DIR/_templates"
CHAPTERS_DIR="$TUTORIAL_DIR/chapters"

if [ $# -lt 2 ]; then
    echo "Usage: $0 <chapter_number> \"<Chapter Title>\""
    echo "Example: $0 05 \"Shapes — Lines, Circles, and Rectangles\""
    exit 1
fi

CHAPTER_NUM="$1"
CHAPTER_TITLE="$2"

# Create a slug from the title (lowercase, spaces to dashes, remove special chars)
CHAPTER_SLUG=$(echo "$CHAPTER_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
CHAPTER_DIR="$CHAPTERS_DIR/${CHAPTER_NUM}-${CHAPTER_SLUG}"

if [ -d "$CHAPTER_DIR" ]; then
    echo "Error: Chapter directory already exists: $CHAPTER_DIR"
    exit 1
fi

echo "Creating chapter: $CHAPTER_NUM - $CHAPTER_TITLE"
echo "Directory: $CHAPTER_DIR"

# Create directory structure
mkdir -p "$CHAPTER_DIR/app/shaders"
mkdir -p "$CHAPTER_DIR/app/components"

# Copy and fill templates
fill_template() {
    local src="$1"
    local dst="$2"
    sed -e "s/{{CHAPTER_NUM}}/$CHAPTER_NUM/g" \
        -e "s/{{CHAPTER_TITLE}}/$CHAPTER_TITLE/g" \
        "$src" > "$dst"
}

# Lesson
fill_template "$TEMPLATES_DIR/lesson.md.tmpl" "$CHAPTER_DIR/lesson.md"

# Quiz
fill_template "$TEMPLATES_DIR/quiz.md.tmpl" "$CHAPTER_DIR/quiz.md"

# App
fill_template "$TEMPLATES_DIR/app/index.html" "$CHAPTER_DIR/app/index.html"
fill_template "$TEMPLATES_DIR/app/App.jsx" "$CHAPTER_DIR/app/App.jsx"

# Base shader
fill_template "$TEMPLATES_DIR/shader.frag.tmpl" "$CHAPTER_DIR/app/shaders/example-01.frag"

echo ""
echo "Chapter scaffolded successfully!"
echo ""
echo "Next steps:"
echo "  1. Edit $CHAPTER_DIR/lesson.md with lesson content"
echo "  2. Edit $CHAPTER_DIR/quiz.md with quiz questions"
echo "  3. Edit $CHAPTER_DIR/app/App.jsx to customize the interactive app"
echo "  4. Add shader examples to $CHAPTER_DIR/app/shaders/"
echo ""
echo "Or use the AI prompt template:"
echo "  cat $TEMPLATES_DIR/PROMPT.md"
echo ""
echo "To serve locally:"
echo "  ./scripts/serve.sh $CHAPTER_NUM"
