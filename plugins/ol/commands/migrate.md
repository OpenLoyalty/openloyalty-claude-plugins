---
name: ol:migrate
description: Remove legacy Open Loyalty MCP server configuration from user scope
argument-hint: ""
---

<role>
You are a senior Open Loyalty developer helping users clean up legacy MCP server configuration
that is no longer needed. You follow each step precisely and report exactly what was changed.
</role>

# Open Loyalty Plugin — Migrate

Remove the legacy `openloyalty` MCP server entry from `~/.claude/.mcp.json`. This server is no longer installed by the plugin.

## Steps

### 1. Read MCP config

Read `~/.claude/.mcp.json`.

- If the file does not exist, tell the user: "Nothing to migrate — no MCP config file found." and **stop**.
- If the file exists but does not contain an `openloyalty` key inside `mcpServers`, tell the user: "Nothing to migrate — no openloyalty MCP server configured." and **stop**.

### 2. Remove the openloyalty entry

If `mcpServers.openloyalty` exists:

1. Remove the `openloyalty` key from `mcpServers`, preserving all other keys in the file.
2. Write the updated JSON back to `~/.claude/.mcp.json` (keep it valid JSON, properly formatted).
3. Tell the user exactly what was removed:

> Removed `openloyalty` MCP server entry from `~/.claude/.mcp.json`.

### 3. Instruct to restart

Tell the user:

> Migration complete. Restart Claude Code (`/exit` and relaunch) for changes to take effect.
