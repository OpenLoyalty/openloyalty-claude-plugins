# Open Loyalty Claude Plugins

Engineering workflows and MCP tools for the Open Loyalty development team.

## Quick Start

**Add the marketplace (once):**
```bash
/plugin marketplace add OpenLoyalty/openloyalty-claude-plugins
```

**Install the plugin:**
```bash
/plugin install openloyalty@openloyalty-claude-plugins
```

This installs engineering workflows (slash commands). MCP servers are configured separately during setup.

**Run setup (required after first install):**
```bash
/openloyalty:setup
```

> **Note:** Claude Code's plugin manifest (`plugin.json`) does not support declaring plugin dependencies. The `/openloyalty:setup` command handles installing all required plugins automatically. Always run it after installing.

The setup command handles the full onboarding process:

1. **Installs the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin** — automatically adds the marketplace and installs the plugin. This dependency provides review workflows and specialized agent types (architecture strategist, performance oracle, security sentinel, etc.) used by `/openloyalty:review-pr`.
2. **Configures Open Loyalty MCP server** (optional) — prompts for `OPENLOYALTY_API_URL` and `OPENLOYALTY_API_TOKEN`, writes the `openloyalty` server definition to `~/.claude/.mcp.json`. Skippable if you don't need direct loyalty API access.

---

## OpenCode Install

This repo includes a CLI that converts the Claude Code plugin to OpenCode format. Requires `bun` and `gh` CLI (authenticated).

```bash
bash <(gh api repos/OpenLoyalty/openloyalty-claude-plugins/contents/install.sh -H "Accept: application/vnd.github.raw")
```

Output is written to `~/.config/opencode/` by default, with `opencode.json` at the root and `skills/` alongside it.

### Updating

Re-run the same command to get the latest version.

### Post-Install: Dependencies

After installing the openloyalty plugin, install the compound-engineering dependency:

```bash
bunx @every-env/compound-plugin install compound-engineering --to opencode
```

### Local Development

```bash
bun run src/index.ts install ./plugins/openloyalty --to opencode
```

---

## How It Works

The plugin provides **slash commands** (code review, PR creation, Jira tickets, etc.) that are installed via the plugin system.

**MCP servers are not bundled with the plugin.** Instead, `/openloyalty:setup` writes the full server definitions (command, args, credentials) directly into `~/.claude/.mcp.json` under `mcpServers`. This means:

- Servers are registered in **user scope** — available across all projects, no project-level `.mcp.json` files
- Credentials are stored once, not duplicated per project
- No env var indirection — actual values are written directly into the server config

---

## Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty:setup` | Full onboarding: installs compound-engineering plugin, configures MCP servers in user scope |
| `/openloyalty:review-pr` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/openloyalty:jira-ticket-create` | Create Jira tickets from brainstorming/planning sessions |
| `/openloyalty:help` | Show available commands and plugin documentation |

---

## Open Loyalty MCP Server Setup (Optional)

The OL MCP server provides 60+ loyalty API tools. It's optional — skip it if you don't need direct loyalty API access. Run `/openloyalty:setup` for interactive configuration, or add to `~/.claude/.mcp.json` manually:

```json
{
  "mcpServers": {
    "openloyalty": {
      "command": "npx",
      "args": ["-y", "@open-loyalty/mcp-server@latest"],
      "env": {
        "OPENLOYALTY_API_URL": "https://your-instance.openloyalty.io/api",
        "OPENLOYALTY_API_TOKEN": "your-api-token-here",
        "OPENLOYALTY_DEFAULT_STORE_CODE": "default"
      }
    }
  }
}
```

| Variable | Description | How to get it |
|----------|-------------|---------------|
| `OPENLOYALTY_API_URL` | Your OL instance API endpoint | Instance URL with `/api` suffix |
| `OPENLOYALTY_API_TOKEN` | API authentication token | Admin Panel > Settings > API Keys |
| `OPENLOYALTY_DEFAULT_STORE_CODE` | Store identifier (defaults to `"default"`) | Admin Panel > Stores |

### Tool Domains

The MCP server provides tools across these domains:

- **Members** -- create, update, list, activate/deactivate, tier assignment
- **Points** -- add, spend, transfer, balance, history, histogram
- **Rewards** -- create, update, buy, redeem, activate/deactivate
- **Campaigns** -- create, update, list, simulate, leaderboards, coupon codes
- **Tiers** -- tier sets, tier definitions, member tier progress
- **Transactions** -- create, list, assign to members
- **Segments** -- create, update, list members, activate/deactivate
- **Achievements & Badges** -- create, track progress, list member achievements
- **Admin & Config** -- API keys, roles, stores, webhooks, imports/exports, analytics

---

## Installation (Private Repo)

For private repo access, use the same auth method as your normal git:

```bash
# SSH
/plugin marketplace add git@github.com:OpenLoyalty/openloyalty-claude-plugins.git

# HTTPS
/plugin marketplace add https://github.com/OpenLoyalty/openloyalty-claude-plugins.git
```

**Auto-updates:** Plugin updates automatically when you start Claude Code after a new version is pushed.

---

## Claude Desktop

The Open Loyalty MCP server is also available for Claude Desktop via the `.mcpb` extension from the MCP server repository. See the [@open-loyalty/mcp-server](https://github.com/OpenLoyalty/mcp-server) repo for Claude Desktop setup instructions.

---

## Requirements

- Git access to this repo (SSH or HTTPS)
- `AGENTS.md` in your OL repo (for conventions)

**Plugin dependencies (installed by `/openloyalty:setup`):**
- [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) — review workflows, agent types, engineering best practices

> These cannot be declared in `plugin.json` (Claude Code doesn't support plugin dependencies). Run `/openloyalty:setup` after installing to ensure all dependencies are present.

**For OL MCP server (optional):**
- `openloyalty` server in `~/.claude/.mcp.json` (configured by `/openloyalty:setup`)
- Node.js / npx available in PATH

**Optional:**
- Slack MCP for conversation context

---

## License

Internal Open Loyalty use.
