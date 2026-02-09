---
name: setup
description: Install dependencies and configure MCP server environment variables for Open Loyalty plugin
argument-hint: ""
---

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

### 1. Check current configuration

Read `~/.claude/settings.local.json` and check if `mcpServers` already contains the `mcp-atlassian` and/or `openloyalty` server entries.

- If `mcp-atlassian` is present with non-empty env values, Atlassian is configured.
- If `openloyalty` is present with non-empty env values, OL MCP is configured.

If both are present, tell the user their configuration looks good. Skip to step 4.

### 2. Collect missing values

Present each MCP group with missing variables. Before collecting values for a group, ask the user if they want to configure it. If they skip, move to the next group.

**Open Loyalty MCP (optional):**

If any OL variables are missing, ask: "Do you want to configure the Open Loyalty MCP server? (needed for loyalty API tools — you can skip this and configure later)" — if the user says no/skip, skip this group entirely.

If yes, collect:

- **`OPENLOYALTY_API_URL`** — The base URL of your Open Loyalty instance with `/api` suffix, e.g. `https://your-instance.openloyalty.io/api`. Ask: "What is your Open Loyalty API URL?"

- **`OPENLOYALTY_API_TOKEN`** — API authentication token. Tell the user to get it from: Admin Panel > Settings > API Keys > Generate new key. Ask: "Paste your API token."

- **`OPENLOYALTY_DEFAULT_STORE_CODE`** — Store identifier. Defaults to `"default"`. Ask: "What is your store code? (press Enter for `default`)" — if the user presses Enter or says default, use `"default"`.

**Atlassian MCP (required):**

If any Atlassian variables are missing, collect them. This is required for Jira integration used by `/openloyalty:engineering:review-pr`, `/openloyalty:engineering:backend-pr-create`, and `/openloyalty:engineering:jira-ticket-create`.

Collect:

- **`JIRA_URL`** — Always `https://openloyalty.atlassian.net`. Set automatically, just inform the user: "Setting JIRA_URL to https://openloyalty.atlassian.net". Do not ask.

- **`JIRA_USERNAME`** — Your Atlassian email address. Ask: "What is your Atlassian email?"

- **`JIRA_API_TOKEN`** — Tell the user: "Generate an API token at https://id.atlassian.com/manage-profile/security/api-tokens — click 'Create API token', give it a name (e.g. 'Claude Code'), and copy the token." Then ask: "Paste your Jira API token."

- **`CONFLUENCE_URL`** — Always `https://openloyalty.atlassian.net/wiki`. Set automatically, just inform the user. Do not ask.

- **`CONFLUENCE_USERNAME`** — Usually same as Jira username. Ask: "What is your Confluence email? (press Enter to use same as Jira)"

- **`CONFLUENCE_API_TOKEN`** — Usually same as Jira token. Ask: "Paste your Confluence API token. (press Enter to use same as Jira)"

### 3. Write to user-scoped settings

Read `~/.claude/settings.local.json` (create if it doesn't exist). Merge the collected MCP server definitions into the `"mcpServers"` object. Each server entry includes the full command, args, and env with the actual user values — no `${VAR}` references.

**Atlassian server entry:**

```json
{
  "mcpServers": {
    "mcp-atlassian": {
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://openloyalty.atlassian.net",
        "JIRA_USERNAME": "<collected value>",
        "JIRA_API_TOKEN": "<collected value>",
        "CONFLUENCE_URL": "https://openloyalty.atlassian.net/wiki",
        "CONFLUENCE_USERNAME": "<collected value>",
        "CONFLUENCE_API_TOKEN": "<collected value>"
      }
    }
  }
}
```

**Open Loyalty server entry (if configured):**

```json
{
  "mcpServers": {
    "openloyalty": {
      "command": "npx",
      "args": ["-y", "@open-loyalty/mcp-server@latest"],
      "env": {
        "OPENLOYALTY_API_URL": "<collected value>",
        "OPENLOYALTY_API_TOKEN": "<collected value>",
        "OPENLOYALTY_DEFAULT_STORE_CODE": "<collected value>"
      }
    }
  }
}
```

**Important:** Preserve any existing keys in the file — only add or update the server entries being configured. Use the Read and Edit tools to merge, not overwrite.

### 4. Instruct to restart

Tell the user:

> Settings saved to `~/.claude/settings.local.json`. Restart Claude Code (`/exit` and relaunch) for the MCP servers to start.
