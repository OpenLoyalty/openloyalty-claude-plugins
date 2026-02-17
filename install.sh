#!/bin/bash
set -euo pipefail

# Install Open Loyalty Claude plugin into OpenCode format.
# Usage:
#   bash <(gh api repos/OpenLoyalty/openloyalty-claude-plugins/contents/install.sh -H "Accept: application/vnd.github.raw")

TMPDIR=$(mktemp -d)

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

echo "[1/4] Cloning openloyalty-claude-plugins..."
gh repo clone OpenLoyalty/openloyalty-claude-plugins "$TMPDIR" -- --depth 1 2>/dev/null

echo "[2/4] Installing dependencies..."
cd "$TMPDIR"
bun install --frozen-lockfile || bun install

echo "[3/4] Converting Claude Code plugin to OpenCode format..."
bun run src/index.ts install ./plugins/openloyalty --to opencode

echo "[4/4] Cleaning up temporary files..."
# cleanup runs automatically via trap

echo ""
echo "Done! Plugin installed to ~/.config/opencode/"
