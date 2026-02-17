#!/bin/bash
set -euo pipefail

# Install Open Loyalty Claude plugin into OpenCode format.
# Usage:
#   bash <(gh api repos/OpenLoyalty/openloyalty-claude-plugins/contents/install.sh -H "Accept: application/vnd.github.raw")

REPO="https://github.com/OpenLoyalty/openloyalty-claude-plugins.git"
TMPDIR=$(mktemp -d)

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

echo "Cloning openloyalty-claude-plugins..."
git clone --depth 1 "$REPO" "$TMPDIR" 2>/dev/null

echo "Installing dependencies..."
cd "$TMPDIR"
bun install --frozen-lockfile 2>/dev/null || bun install

echo "Converting plugin to OpenCode format..."
bun run install:opencode

echo ""
echo "Done! Plugin installed to ~/.config/opencode/"
