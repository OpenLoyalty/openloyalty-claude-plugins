#!/bin/bash
set -euo pipefail

# Install Open Loyalty Claude plugin into OpenCode format.
# Usage:
#   bash <(gh api repos/OpenLoyalty/openloyalty-claude-plugins/contents/install.sh -H "Accept: application/vnd.github.raw")

TMPDIR=$(mktemp -d)

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

echo "Cloning openloyalty-claude-plugins..."
gh repo clone OpenLoyalty/openloyalty-claude-plugins "$TMPDIR" -- --depth 1 2>/dev/null

echo "Installing dependencies..."
cd "$TMPDIR"
bun install --frozen-lockfile 2>/dev/null || bun install

echo "Converting plugin to OpenCode format..."
bun run src/index.ts install ./plugins/openloyalty --to opencode

echo ""
echo "Done! Plugin installed to ~/.config/opencode/"
