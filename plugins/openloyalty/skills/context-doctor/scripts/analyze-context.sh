#!/usr/bin/env bash
# analyze-context.sh — Gathers project metadata for context-doctor skill
# Usage: bash analyze-context.sh [project_dir]
# Outputs structured summary to stdout

set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

echo "=== PROJECT ANALYSIS ==="
echo "Directory: $(pwd)"
echo "Date: $(date +%Y-%m-%d)"
echo ""

# --- Project Type ---
echo "=== PROJECT TYPE ==="
if [ -d ".obsidian" ]; then
    echo "Type: obsidian-vault"
elif [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
    if [ -f "composer.json" ]; then
        echo "Type: php-docker"
    elif [ -f "package.json" ]; then
        echo "Type: node-docker"
    else
        echo "Type: docker"
    fi
elif [ -f "composer.json" ]; then
    echo "Type: php"
elif [ -f "package.json" ]; then
    echo "Type: node"
elif [ -f "Gemfile" ]; then
    echo "Type: ruby"
elif [ -f "Cargo.toml" ]; then
    echo "Type: rust"
elif [ -f "go.mod" ]; then
    echo "Type: go"
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ] || [ -f "requirements.txt" ]; then
    echo "Type: python"
elif [ -f "Makefile" ] && [ -d "src" ]; then
    echo "Type: generic-code"
else
    echo "Type: unknown"
fi

# Check for monorepo indicators
if [ -f "lerna.json" ] || [ -f "pnpm-workspace.yaml" ] || [ -d "packages" ] || [ -f "turbo.json" ]; then
    echo "Monorepo: true"
else
    echo "Monorepo: false"
fi

# Git status
if [ -d ".git" ]; then
    echo "Git: true"
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo "Branch: $BRANCH"
else
    echo "Git: false"
fi
echo ""

# --- Language / Framework ---
echo "=== LANGUAGE & FRAMEWORK ==="
if [ -f "composer.json" ]; then
    echo "Language: PHP"
    if grep -q "symfony" composer.json 2>/dev/null; then
        echo "Framework: Symfony"
    elif grep -q "laravel" composer.json 2>/dev/null; then
        echo "Framework: Laravel"
    fi
fi
if [ -f "package.json" ]; then
    echo "Language: JavaScript/TypeScript"
    if grep -q '"react"' package.json 2>/dev/null; then
        echo "Framework: React"
    elif grep -q '"next"' package.json 2>/dev/null; then
        echo "Framework: Next.js"
    elif grep -q '"vue"' package.json 2>/dev/null; then
        echo "Framework: Vue"
    elif grep -q '"angular"' package.json 2>/dev/null; then
        echo "Framework: Angular"
    fi
fi
if [ -f "Gemfile" ]; then
    echo "Language: Ruby"
    if grep -q "rails" Gemfile 2>/dev/null; then
        echo "Framework: Rails"
    fi
fi
if [ -f "Cargo.toml" ]; then
    echo "Language: Rust"
fi
if [ -f "go.mod" ]; then
    echo "Language: Go"
fi
if [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    echo "Language: Python"
    if grep -q "django" pyproject.toml 2>/dev/null || grep -q "django" setup.py 2>/dev/null; then
        echo "Framework: Django"
    elif grep -q "fastapi" pyproject.toml 2>/dev/null; then
        echo "Framework: FastAPI"
    fi
fi
echo ""

# --- Context Files ---
echo "=== CONTEXT FILES ==="
for f in CLAUDE.md AGENTS.md .claude/settings.json .claude/settings.local.json; do
    if [ -f "$f" ]; then
        LINES=$(wc -l < "$f" | tr -d ' ')
        SIZE=$(wc -c < "$f" | tr -d ' ')
        echo "$f: exists (${LINES} lines, ${SIZE} bytes)"
    else
        echo "$f: missing"
    fi
done
echo ""

# --- Documentation ---
echo "=== DOCUMENTATION ==="
if [ -f "README.md" ]; then
    LINES=$(wc -l < "README.md" | tr -d ' ')
    echo "README.md: exists (${LINES} lines)"
else
    echo "README.md: missing"
fi

if [ -d "docs" ] || [ -d "doc" ]; then
    DOCS_DIR="docs"
    [ -d "doc" ] && DOCS_DIR="doc"
    DOC_COUNT=$(find "$DOCS_DIR" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "docs/: exists (${DOC_COUNT} markdown files)"
    find "$DOCS_DIR" -name "*.md" -type f -maxdepth 2 2>/dev/null | head -15 | while read -r doc; do
        echo "  - $doc"
    done
else
    echo "docs/: missing"
fi
echo ""

# --- Project Structure ---
echo "=== STRUCTURE ==="
# Count source files (top-level overview)
if [ -d "src" ]; then
    SRC_COUNT=$(find src -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "src/: ${SRC_COUNT} files"
fi
if [ -d "tests" ] || [ -d "test" ]; then
    TEST_DIR="tests"
    [ -d "test" ] && TEST_DIR="test"
    TEST_COUNT=$(find "$TEST_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "${TEST_DIR}/: ${TEST_COUNT} files"
fi
if [ -d "app" ]; then
    APP_COUNT=$(find app -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "app/: ${APP_COUNT} files"
fi

# Top-level listing
echo ""
echo "Top-level contents:"
ls -1F 2>/dev/null | head -30
echo ""

# --- Subdomain CLAUDE.md Files ---
echo "=== SUBDOMAIN CONTEXT FILES ==="
# Find all CLAUDE.md files recursively, excluding node_modules, vendor, .git, etc.
CLAUDE_FILES=$(find . -name "CLAUDE.md" -type f \
    -not -path "./.git/*" \
    -not -path "./node_modules/*" \
    -not -path "./vendor/*" \
    -not -path "./.claude/*" \
    -not -path "./dist/*" \
    -not -path "./build/*" \
    -not -path "./.next/*" \
    -not -path "./tmp/*" \
    2>/dev/null | sort)

ROOT_FOUND="false"
SUBDOMAIN_COUNT=0
echo "$CLAUDE_FILES" | while IFS= read -r cf; do
    [ -z "$cf" ] && continue
    LINES=$(wc -l < "$cf" | tr -d ' ')
    SIZE=$(wc -c < "$cf" | tr -d ' ')
    if [ "$cf" = "./CLAUDE.md" ]; then
        echo "Root: CLAUDE.md (${LINES} lines, ${SIZE} bytes)"
    else
        RELPATH="${cf#./}"
        echo "Subdomain: ${RELPATH} (${LINES} lines, ${SIZE} bytes)"
    fi
done

# Count outside subshell
if [ -f "./CLAUDE.md" ]; then
    ROOT_FOUND="true"
fi
SUBDOMAIN_COUNT=$(echo "$CLAUDE_FILES" | grep -v "^\./CLAUDE\.md$" | grep -c "CLAUDE\.md" 2>/dev/null || echo "0")

if [ "$ROOT_FOUND" = "false" ]; then
    echo "Root: CLAUDE.md missing"
fi
echo "Subdomain CLAUDE.md count: ${SUBDOMAIN_COUNT}"
echo ""

# --- Claude Integration ---
echo "=== CLAUDE INTEGRATION ==="
if [ -d ".claude" ]; then
    echo ".claude/: exists"
    ls -1F .claude/ 2>/dev/null | head -10 | while read -r item; do
        echo "  - $item"
    done
else
    echo ".claude/: missing"
fi

if [ -d ".claude/skills" ]; then
    SKILL_COUNT=$(find .claude/skills -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
    echo "Local skills: ${SKILL_COUNT}"
fi

# Check for solutions/learnings
if [ -d "docs/solutions" ]; then
    SOL_COUNT=$(find docs/solutions -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "docs/solutions/: ${SOL_COUNT} files (knowledge compounding active)"
else
    echo "docs/solutions/: missing (no knowledge compounding)"
fi

# Check for progress tracking
for f in progress.txt claude-progress.txt NOTES.md; do
    if [ -f "$f" ]; then
        echo "Progress file: $f exists"
    fi
done
echo ""

echo "=== END ANALYSIS ==="
