#!/bin/bash
set -e

REPO_URL="https://github.com/OpenLoyalty/openloyalty-claude-skills"
SKILLS_DIR="$HOME/.claude/skills"
TEMP_DIR=$(mktemp -d)

echo "Installing Open Loyalty Claude Skills..."

# Clone the repo
git clone --depth 1 "$REPO_URL" "$TEMP_DIR" 2>/dev/null || {
    echo "Error: Could not clone from $REPO_URL"
    echo "Make sure you have access to the repository."
    rm -rf "$TEMP_DIR"
    exit 1
}

# Create skills directory if needed
mkdir -p "$SKILLS_DIR"

# Copy skills
cp -r "$TEMP_DIR/skills/"* "$SKILLS_DIR/"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "Open Loyalty Claude Skills installed."
echo ""
echo "Installed to: $SKILLS_DIR"
echo ""
echo "Available commands:"
echo "  /openloyalty:compound  - Generate compound learning from branch"
echo "  /openloyalty:spike     - Structure technical spike investigation"
echo "  /openloyalty:review    - OL-specific code review"
echo "  /openloyalty:rca       - Root Cause Analysis document"
echo "  /openloyalty:onboard   - Context summary for module"
echo ""
echo "Run '/openloyalty:compound' in any Open Loyalty repo to get started."
