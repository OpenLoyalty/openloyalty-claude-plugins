---
name: openloyalty:setup
description: Install dependencies and configure MCP server environment variables for Open Loyalty plugin
argument-hint: ""
---

# Open Loyalty Plugin — Interactive Setup

Guide the user through installing required plugin dependencies and configuring MCP server environment variables.

## Steps

### 0. Install required plugin: compound-engineering

The Open Loyalty plugin requires the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin for review workflows, agent types, and engineering best practices.

**IMPORTANT:** Do NOT check for this plugin by looking at available tools/skills in the session — tools loaded at session start persist even after a plugin is removed. Always use the CLI command to verify actual installation state.

Run `claude plugin list` and check if the output contains `compound-engineering`.

**If already installed**, tell the user and continue to step 1.

**If not installed**, install it in two steps:

**Step A — Add the Every marketplace:**

```bash
claude plugin marketplace add https://github.com/EveryInc/compound-engineering-plugin
```

If it reports "already exists", that's fine — continue to step B. If it fails with a network or clone error, show the error and tell the user to install manually (see fallback below).

**Step B — Install the plugin from the marketplace:**

```bash
claude plugin install compound-engineering
```

If the install succeeds, tell the user:

> Installed compound-engineering plugin. It will be available after restart.

If either step fails, show the error and tell the user to install manually:

```
Could not auto-install compound-engineering. Install it manually:

  /plugin marketplace add https://github.com/EveryInc/compound-engineering-plugin
  /plugin install compound-engineering

Then restart Claude Code and run /openloyalty:setup again.
```

**STOP here if compound-engineering could not be installed.** Do not proceed to environment setup.

---

### 1. Install required plugin: atlassian

The Open Loyalty plugin requires the official [Atlassian](https://github.com/anthropics/claude-plugins-official) plugin for Jira and Confluence integration. This is used by `/openloyalty:engineering:review-pr`, `/openloyalty:engineering:backend-pr-create`, and `/openloyalty:engineering:jira-ticket-create`.

**IMPORTANT:** Do NOT check for this plugin by looking at available `mcp__claude_ai_Atlassian__*` tools in the session — tools loaded at session start persist even after a plugin is removed. Always use the CLI command to verify actual installation state.

Run `claude plugin list` and check if the output contains `atlassian`.

**If already installed**, tell the user and continue to step 2.

**If not installed**, install it in two steps:

**Step A — Add the Anthropic official plugins marketplace:**

```bash
claude plugin marketplace add https://github.com/anthropics/claude-plugins-official
```

If it reports "already exists", that's fine — continue to step B. If it fails with a network or clone error, show the error and tell the user to install manually (see fallback below).

**Step B — Install the plugin from the marketplace:**

```bash
claude plugin install atlassian@claude-plugins-official
```

If the install succeeds, tell the user:

> Installed Atlassian plugin. It will be available after restart. You'll be prompted to connect your Atlassian account on first use.

If the install fails, show the error and tell the user to install manually:

```
Could not auto-install the Atlassian plugin. Install it manually:

  /plugin marketplace add https://github.com/anthropics/claude-plugins-official
  /plugin install atlassian@claude-plugins-official

Then restart Claude Code and run /openloyalty:setup again.
```

### 2. Check Open Loyalty MCP configuration (optional)

Read `~/.claude/.mcp.json` and check if `mcpServers` already contains the `openloyalty` server entry.

- If `openloyalty` is present with non-empty env values, OL MCP is configured. Skip to step 4.

### 3. Collect Open Loyalty MCP values (optional)

Ask: "Do you want to configure the Open Loyalty MCP server? (needed for loyalty API tools — you can skip this and configure later)" — if the user says no/skip, skip to step 4.

If yes, collect:

- **`OPENLOYALTY_API_URL`** — The base URL of your Open Loyalty instance with `/api` suffix, e.g. `https://your-instance.openloyalty.io/api`. Ask: "What is your Open Loyalty API URL?"

- **`OPENLOYALTY_API_TOKEN`** — API authentication token. Tell the user to get it from: Admin Panel > Settings > API Keys > Generate new key. Ask: "Paste your API token."

- **`OPENLOYALTY_DEFAULT_STORE_CODE`** — Store identifier. Defaults to `"default"`. Ask: "What is your store code? (press Enter for `default`)" — if the user presses Enter or says default, use `"default"`.

Read `~/.claude/.mcp.json` (create if it doesn't exist). Merge the collected MCP server definition into the `"mcpServers"` object:

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

**Important:** Preserve any existing keys in the file — only add or update the server entry being configured. Use the Read and Edit tools to merge, not overwrite.

### 4. Instruct to restart

Tell the user:

> Setup complete. Restart Claude Code (`/exit` and relaunch) for changes to take effect.
