#!/usr/bin/env bash
# extract-claims.sh — Parses context-doctor knowledge files into a structured claim inventory
# Usage: bash extract-claims.sh [context-doctor-skill-dir]
# Outputs structured claim list to stdout for use as a research brief anchor

set -euo pipefail

# Default: look for context-doctor as a sibling directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_SKILL_DIR="$(cd "$SCRIPT_DIR/../../context-doctor" 2>/dev/null && pwd || echo "")"

SKILL_DIR="${1:-$DEFAULT_SKILL_DIR}"

if [ -z "$SKILL_DIR" ] || [ ! -d "$SKILL_DIR" ]; then
    echo "ERROR: context-doctor skill not found at $SKILL_DIR"
    echo "Usage: bash extract-claims.sh [path-to-context-doctor-skill]"
    exit 1
fi

echo "=== CLAIM INVENTORY ==="
echo "Source: $SKILL_DIR"
echo "Date: $(date +%Y-%m-%d)"
echo "Purpose: Anchor for research agents — verify, extend, or challenge these claims"
echo ""

# --- Extract Principles ---
PRINCIPLES_FILE="$SKILL_DIR/references/context-principles.md"
if [ -f "$PRINCIPLES_FILE" ]; then
    echo "=== PRINCIPLES ==="
    echo "File: references/context-principles.md"
    LINES=$(wc -l < "$PRINCIPLES_FILE" | tr -d ' ')
    echo "Lines: $LINES"
    echo ""

    # Extract principle headings and their first substantive paragraph
    PRINCIPLE_NUM=0
    IN_PRINCIPLE=false
    CURRENT_TITLE=""
    CURRENT_CONTENT=""
    CURRENT_START=0

    while IFS= read -r line_content; do
        LINE_NUM=$((${LINE_NUM:-0} + 1))

        # Detect principle heading
        if echo "$line_content" | grep -qE "^## Principle [0-9]+:"; then
            # Output previous principle if exists
            if [ "$IN_PRINCIPLE" = true ] && [ -n "$CURRENT_TITLE" ]; then
                echo "[principles:${PRINCIPLE_NUM}] \"${CURRENT_TITLE}\""
                if [ -n "$CURRENT_CONTENT" ]; then
                    echo "  Summary: ${CURRENT_CONTENT}"
                fi
                echo "  File: references/context-principles.md, line ${CURRENT_START}"
                echo ""
            fi

            PRINCIPLE_NUM=$((PRINCIPLE_NUM + 1))
            CURRENT_TITLE=$(echo "$line_content" | sed 's/^## Principle [0-9]*: //')
            CURRENT_CONTENT=""
            CURRENT_START=$LINE_NUM
            IN_PRINCIPLE=true
        fi

        # Capture implication lines (key actionable content)
        if echo "$line_content" | grep -qE "^\*\*Implication"; then
            IMPL=$(echo "$line_content" | sed 's/^\*\*Implication[^:]*:\*\* //')
            CURRENT_CONTENT="$IMPL"
        fi

    done < <(cat -n "$PRINCIPLES_FILE" | sed 's/^[[:space:]]*[0-9]*\t//')
    LINE_NUM=0

    # Output last principle
    if [ "$IN_PRINCIPLE" = true ] && [ -n "$CURRENT_TITLE" ]; then
        echo "[principles:${PRINCIPLE_NUM}] \"${CURRENT_TITLE}\""
        if [ -n "$CURRENT_CONTENT" ]; then
            echo "  Summary: ${CURRENT_CONTENT}"
        fi
        echo "  File: references/context-principles.md, line ${CURRENT_START}"
        echo ""
    fi

    echo "Total principles: ${PRINCIPLE_NUM}"
    echo ""
fi

# --- Extract Anti-Patterns ---
AP_FILE="$SKILL_DIR/references/anti-patterns.md"
if [ -f "$AP_FILE" ]; then
    echo "=== ANTI-PATTERNS ==="
    echo "File: references/anti-patterns.md"
    LINES=$(wc -l < "$AP_FILE" | tr -d ' ')
    echo "Lines: $LINES"
    echo ""

    AP_NUM=0
    while IFS= read -r line_content; do
        LINE_NUM=$((${LINE_NUM:-0} + 1))

        if echo "$line_content" | grep -qE "^## Anti-Pattern [0-9]+:"; then
            AP_NUM=$((AP_NUM + 1))
            AP_TITLE=$(echo "$line_content" | sed 's/^## Anti-Pattern [0-9]*: //')
            echo "[anti-pattern:${AP_NUM}] \"${AP_TITLE}\""

            # Read next few lines for symptom
            NEXT_LINES=$(sed -n "$((LINE_NUM+1)),$((LINE_NUM+5))p" "$AP_FILE")
            SYMPTOM=$(echo "$NEXT_LINES" | grep -m1 "Symptom:" | sed 's/^.*Symptom:\*\* //' || true)
            if [ -n "$SYMPTOM" ]; then
                echo "  Symptom: ${SYMPTOM}"
            fi
            echo "  File: references/anti-patterns.md, line ${LINE_NUM}"
            echo ""
        fi
    done < <(cat -n "$AP_FILE" | sed 's/^[[:space:]]*[0-9]*\t//')
    LINE_NUM=0

    echo "Total anti-patterns: ${AP_NUM}"
    echo ""
fi

# --- Extract Scoring Dimensions ---
if [ -f "$AP_FILE" ]; then
    echo "=== SCORING DIMENSIONS ==="
    echo "File: references/anti-patterns.md"
    echo ""

    DIM_NUM=0
    while IFS= read -r line_content; do
        if echo "$line_content" | grep -qE "^\| \*\*"; then
            DIM_NUM=$((DIM_NUM + 1))
            DIM_NAME=$(echo "$line_content" | sed 's/^| \*\*\([^*]*\)\*\*.*/\1/')
            echo "[dimension:${DIM_NUM}] \"${DIM_NAME}\""
        fi
    done < "$AP_FILE"

    echo ""
    echo "Total dimensions: ${DIM_NUM}"
    echo ""
fi

# --- Extract Templates ---
TEMPLATES_FILE="$SKILL_DIR/references/ideal-structure.md"
if [ -f "$TEMPLATES_FILE" ]; then
    echo "=== TEMPLATES ==="
    echo "File: references/ideal-structure.md"
    LINES=$(wc -l < "$TEMPLATES_FILE" | tr -d ' ')
    echo "Lines: $LINES"
    echo ""

    TPL_NUM=0
    while IFS= read -r line_content; do
        LINE_NUM=$((${LINE_NUM:-0} + 1))

        if echo "$line_content" | grep -qE "^## Template [A-Z]:"; then
            TPL_NUM=$((TPL_NUM + 1))
            TPL_TITLE=$(echo "$line_content" | sed 's/^## //')

            # Extract target line count
            NEXT_LINES=$(sed -n "$((LINE_NUM+1)),$((LINE_NUM+3))p" "$TEMPLATES_FILE")
            TARGET=$(echo "$NEXT_LINES" | grep -m1 "Target:" | sed 's/^.*Target:\*\* //' || true)

            echo "[template:${TPL_NUM}] \"${TPL_TITLE}\""
            if [ -n "$TARGET" ]; then
                echo "  Budget: ${TARGET}"
            fi
            echo "  File: references/ideal-structure.md, line ${LINE_NUM}"
            echo ""
        fi
    done < <(cat -n "$TEMPLATES_FILE" | sed 's/^[[:space:]]*[0-9]*\t//')
    LINE_NUM=0

    echo "Total templates: ${TPL_NUM}"
    echo ""
fi

# --- Extract Workflow Phases from SKILL.md ---
SKILL_FILE="$SKILL_DIR/SKILL.md"
if [ -f "$SKILL_FILE" ]; then
    echo "=== WORKFLOW CLAIMS ==="
    echo "File: SKILL.md"
    LINES=$(wc -l < "$SKILL_FILE" | tr -d ' ')
    echo "Lines: $LINES"
    echo ""

    PHASE_NUM=0
    while IFS= read -r line_content; do
        LINE_NUM=$((${LINE_NUM:-0} + 1))

        if echo "$line_content" | grep -qE "^### Phase [0-9]+:"; then
            PHASE_NUM=$((PHASE_NUM + 1))
            PHASE_TITLE=$(echo "$line_content" | sed 's/^### //')
            echo "[workflow:${PHASE_NUM}] \"${PHASE_TITLE}\""
            echo "  File: SKILL.md, line ${LINE_NUM}"
            echo ""
        fi
    done < <(cat -n "$SKILL_FILE" | sed 's/^[[:space:]]*[0-9]*\t//')
    LINE_NUM=0

    echo "Total workflow phases: ${PHASE_NUM}"
    echo ""

    # Extract line budgets
    echo "=== LINE BUDGETS ==="
    while IFS= read -r line_content; do
        if echo "$line_content" | grep -qE "^\| Root|^\| Subdomain"; then
            echo "[budget] ${line_content}"
        fi
    done < "$SKILL_FILE"
    echo ""

    # Extract guidelines (MUST/MUST NOT/SHOULD)
    echo "=== GUIDELINES ==="
    GUIDE_NUM=0
    while IFS= read -r line_content; do
        if echo "$line_content" | grep -qE "^\- \*\*(MUST|SHOULD)"; then
            GUIDE_NUM=$((GUIDE_NUM + 1))
            RULE=$(echo "$line_content" | sed 's/^- //')
            echo "[guideline:${GUIDE_NUM}] ${RULE}"
        fi
    done < "$SKILL_FILE"
    echo ""
    echo "Total guidelines: ${GUIDE_NUM}"
fi

echo ""
echo "=== END CLAIM INVENTORY ==="
