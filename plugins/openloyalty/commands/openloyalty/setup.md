# Open Loyalty MCP Server — Interactive Setup

Guide the user through configuring the Open Loyalty MCP server environment variables.

## Steps

### 1. Check current environment

Run this command to check which variables are already set:

```bash
echo "OPENLOYALTY_API_URL=${OPENLOYALTY_API_URL:-__MISSING__}"
echo "OPENLOYALTY_API_TOKEN=${OPENLOYALTY_API_TOKEN:-__MISSING__}"
echo "OPENLOYALTY_DEFAULT_STORE_CODE=${OPENLOYALTY_DEFAULT_STORE_CODE:-__MISSING__}"
```

If **all three** are set (none show `__MISSING__`), tell the user their configuration looks good and the MCP server should be active. Skip to step 5 (conflict check).

### 2. Collect missing values

For each variable that shows `__MISSING__`, ask the user to provide a value. Ask one at a time.

- **`OPENLOYALTY_API_URL`** — The base URL of your Open Loyalty instance with `/api` suffix, e.g. `https://your-instance.openloyalty.io/api`. Ask: "What is your Open Loyalty API URL?"

- **`OPENLOYALTY_API_TOKEN`** — API authentication token. Tell the user to get it from: Admin Panel > Settings > API Keys > Generate new key. Ask: "Paste your API token."

- **`OPENLOYALTY_DEFAULT_STORE_CODE`** — Store identifier. Defaults to `"default"`. Ask: "What is your store code? (press Enter for `default`)" — if the user presses Enter or says default, use `"default"`.

### 3. Write to shell profile

Detect the user's shell:

```bash
echo "$SHELL"
```

- If the shell is `zsh`, write to `~/.zshrc`
- If the shell is `bash`, write to `~/.bashrc`

For each missing variable, append an `export` line to the profile file. For example:

```bash
echo 'export OPENLOYALTY_API_URL="<value>"' >> ~/.zshrc
echo 'export OPENLOYALTY_API_TOKEN="<value>"' >> ~/.zshrc
echo 'export OPENLOYALTY_DEFAULT_STORE_CODE="<value>"' >> ~/.zshrc
```

Then source the profile to load the variables into the current shell:

```bash
source ~/.zshrc
```

### 4. Instruct to restart

Tell the user:

> Variables saved. Restart Claude Code (`/exit` and relaunch) for the MCP server to pick up the new environment variables.

### 5. Check for conflicts

Check if the user has a manual `openloyalty` MCP server entry in `~/.claude/settings.json` or in any project `.mcp.json` in the current working directory. Run:

```bash
cat ~/.claude/settings.json 2>/dev/null | grep -l openloyalty || true
cat .mcp.json 2>/dev/null | grep -l openloyalty || true
```

If a manual `"openloyalty"` MCP entry is found, warn:

> You have a manual `openloyalty` MCP server entry in your config. Remove it to avoid conflicts with the plugin-managed server.
