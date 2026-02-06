# Open Loyalty MCP Server Setup

Check and configure the required environment variables for the Open Loyalty MCP server.

## Instructions

1. Check which of the following environment variables are set in the current shell by running:

```bash
echo "OPENLOYALTY_API_URL=${OPENLOYALTY_API_URL:-<not set>}"
echo "OPENLOYALTY_API_TOKEN=${OPENLOYALTY_API_TOKEN:-<not set>}"
echo "OPENLOYALTY_DEFAULT_STORE_CODE=${OPENLOYALTY_DEFAULT_STORE_CODE:-<not set>}"
```

2. For any variables that are **not set**, instruct the user to add them to their shell profile. Show the appropriate commands:

**For zsh (~/.zshrc):**
```bash
echo 'export OPENLOYALTY_API_URL="https://your-instance.openloyalty.io/api"' >> ~/.zshrc
echo 'export OPENLOYALTY_API_TOKEN="your-api-token-here"' >> ~/.zshrc
echo 'export OPENLOYALTY_DEFAULT_STORE_CODE="default"' >> ~/.zshrc
source ~/.zshrc
```

**For bash (~/.bashrc):**
```bash
echo 'export OPENLOYALTY_API_URL="https://your-instance.openloyalty.io/api"' >> ~/.bashrc
echo 'export OPENLOYALTY_API_TOKEN="your-api-token-here"' >> ~/.bashrc
echo 'export OPENLOYALTY_DEFAULT_STORE_CODE="default"' >> ~/.bashrc
source ~/.bashrc
```

3. Explain each variable:

| Variable | Description | How to get it |
|----------|-------------|---------------|
| `OPENLOYALTY_API_URL` | The base URL of your Open Loyalty instance API endpoint (e.g. `https://your-instance.openloyalty.io/api`) | Your OL instance URL with `/api` suffix |
| `OPENLOYALTY_API_TOKEN` | API authentication token for accessing the Open Loyalty API | Admin Panel > Settings > API Keys > Generate new key |
| `OPENLOYALTY_DEFAULT_STORE_CODE` | Your store identifier within Open Loyalty. Defaults to `"default"` if not set | Admin Panel > Stores — use the store code value |

4. **Important:** Check if the user has a manual `"openloyalty"` MCP server entry in `~/.claude/settings.json` or project `.mcp.json`. If found, warn them:

> **Warning:** You have a manual `openloyalty` MCP server entry in your config. This will conflict with the plugin-managed server. Remove the manual entry to avoid duplicate connections and unexpected behavior.

5. After all variables are configured, instruct the user:

> Restart Claude Code (`/exit` and relaunch) for the new environment variables to take effect. The MCP server will start automatically on next launch.

6. If all variables are already set, confirm the configuration looks good and remind them the MCP server should be active.
