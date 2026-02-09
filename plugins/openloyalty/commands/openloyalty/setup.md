# Open Loyalty Plugin — Interactive Setup

Guide the user through installing required plugin dependencies and configuring MCP server environment variables.

## Steps

### 0. Install required plugin: compound-engineering

The Open Loyalty plugin requires the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin for review workflows, agent types, and engineering best practices.

Check if it's already installed by looking for compound-engineering skills in the available tools (e.g., any `compound-engineering:*` slash commands).

**If already installed**, tell the user and continue to step 1.

**If not installed**, install it automatically:

```bash
claude plugin marketplace add https://github.com/EveryInc/compound-engineering-plugin
claude plugin install compound-engineering
```

If the install succeeds, tell the user:

> Installed compound-engineering plugin. It will be available after restart.

If the install fails (e.g., network error, marketplace already exists), show the error and tell the user to install manually:

```
Could not auto-install compound-engineering. Install it manually:

  /plugin marketplace add https://github.com/EveryInc/compound-engineering-plugin
  /plugin install compound-engineering

Then restart Claude Code and run /openloyalty:setup again.
```

**STOP here if compound-engineering could not be installed.** Do not proceed to environment setup.

---

### 1. Check current environment

Run this command to check which variables are already set:

```bash
echo "=== Open Loyalty MCP ==="
echo "OPENLOYALTY_API_URL=${OPENLOYALTY_API_URL:-__MISSING__}"
echo "OPENLOYALTY_API_TOKEN=${OPENLOYALTY_API_TOKEN:-__MISSING__}"
echo "OPENLOYALTY_DEFAULT_STORE_CODE=${OPENLOYALTY_DEFAULT_STORE_CODE:-__MISSING__}"
echo ""
echo "=== Atlassian MCP ==="
echo "JIRA_URL=${JIRA_URL:-__MISSING__}"
echo "JIRA_USERNAME=${JIRA_USERNAME:-__MISSING__}"
echo "JIRA_API_TOKEN=${JIRA_API_TOKEN:-__MISSING__}"
echo "CONFLUENCE_URL=${CONFLUENCE_URL:-__MISSING__}"
echo "CONFLUENCE_USERNAME=${CONFLUENCE_USERNAME:-__MISSING__}"
echo "CONFLUENCE_API_TOKEN=${CONFLUENCE_API_TOKEN:-__MISSING__}"
```

If all variables are set (none show `__MISSING__`), tell the user their configuration looks good and both MCP servers should be active. Skip to step 5 (conflict check).

### 2. Collect missing values

Present each MCP group with missing variables. Before collecting values for a group, ask the user if they want to configure it. If they skip, move to the next group.

**Open Loyalty MCP (optional):**

If any OL variables are missing, ask: "Do you want to configure the Open Loyalty MCP server? (needed for loyalty API tools — you can skip this and configure later)" — if the user says no/skip, skip this group entirely.

If yes, collect:

- **`OPENLOYALTY_API_URL`** — The base URL of your Open Loyalty instance with `/api` suffix, e.g. `https://your-instance.openloyalty.io/api`. Ask: "What is your Open Loyalty API URL?"

- **`OPENLOYALTY_API_TOKEN`** — API authentication token. Tell the user to get it from: Admin Panel > Settings > API Keys > Generate new key. Ask: "Paste your API token."

- **`OPENLOYALTY_DEFAULT_STORE_CODE`** — Store identifier. Defaults to `"default"`. Ask: "What is your store code? (press Enter for `default`)" — if the user presses Enter or says default, use `"default"`.

**Atlassian MCP (required):**

If any Atlassian variables are missing, collect them. This is required for Jira integration used by `/openloyalty:review-pr`, `/openloyalty:backend-pr-create`, and `/openloyalty:jira-ticket-create`.

Collect:

- **`JIRA_URL`** — Always `https://openloyalty.atlassian.net`. Set automatically, just inform the user: "Setting JIRA_URL to https://openloyalty.atlassian.net". Do not ask.

- **`JIRA_USERNAME`** — Your Atlassian email address. Ask: "What is your Atlassian email?"

- **`JIRA_API_TOKEN`** — API token from https://id.atlassian.com/manage-profile/security/api-tokens. Ask: "Paste your Jira API token."

- **`CONFLUENCE_URL`** — Always `https://openloyalty.atlassian.net/wiki`. Set automatically, just inform the user. Do not ask.

- **`CONFLUENCE_USERNAME`** — Usually same as Jira username. Ask: "What is your Confluence email? (press Enter to use same as Jira)"

- **`CONFLUENCE_API_TOKEN`** — Usually same as Jira token. Ask: "Paste your Confluence API token. (press Enter to use same as Jira)"

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
