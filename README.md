# Open Loyalty Claude Plugins

Engineering workflows and MCP tools for the Open Loyalty development team. Auto-updating Claude Code plugins with compound learning documentation system.

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

**Run setup:**
```bash
/openloyalty:setup
```

The setup command handles the full onboarding process:

1. **Installs the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin** — automatically adds the marketplace and installs the plugin. This dependency provides review workflows, specialized agent types (architecture strategist, performance oracle, security sentinel, etc.), and engineering best practices used by `/openloyalty:engineering:review-pr` and other commands.
2. **Installs the official [Atlassian plugin](https://github.com/anthropics/claude-plugins-official)** (required) — installs `atlassian@claude-plugins-official` which provides Jira and Confluence tools. Authentication is handled through Claude's native Atlassian OAuth — no API tokens needed.
3. **Configures Open Loyalty MCP server** (optional) — prompts for `OPENLOYALTY_API_URL` and `OPENLOYALTY_API_TOKEN`, writes the `openloyalty` server definition. Skippable if you don't need direct loyalty API access.
4. **Saves to `~/.claude/settings.local.json`** — MCP servers are registered in user-scoped Claude Code settings, available across all projects without any project-level config files.

---

## How It Works

The plugin provides **slash commands** (code review, PR creation, Jira tickets, etc.) that are installed via the plugin system.

**MCP servers are not bundled with the plugin.** Instead, `/openloyalty:setup` writes the full server definitions (command, args, credentials) directly into `~/.claude/settings.local.json` under `mcpServers`. This means:

- Servers are registered in **user scope** — available across all projects, no project-level `.mcp.json` files
- Credentials are stored once, not duplicated per project
- No env var indirection — actual values are written directly into the server config

---

## Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty:setup` | Full onboarding: installs compound-engineering plugin, configures MCP servers in user scope |
| `/openloyalty:engineering:review-pr` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/openloyalty:engineering:backend-pr-create` | Create backend PR with OL conventions and Jira linking |
| `/openloyalty:engineering:jira-ticket-create` | Create Jira tickets from brainstorming/planning sessions |
| `/openloyalty:engineering:compound` | **[WIP]** Document solved problems with YAML schema validation |
| `/openloyalty:help` | Show available commands and plugin documentation |

---

## Compound Learning System

The `/openloyalty:engineering:compound` command creates a compounding knowledge repository with parallel subagents, YAML schema validation, and auto-categorized output. Each documented solution makes the team smarter.

See [compound-docs skill README](plugins/openloyalty/skills/compound-docs/README.md) for full documentation — usage, auto-invoke triggers, output categories, and YAML schema reference.

---

## Atlassian (Jira/Confluence) Setup

Jira and Confluence integration is provided by the official Atlassian plugin (`atlassian@claude-plugins-official`). It's required for `/openloyalty:engineering:review-pr`, `/openloyalty:engineering:backend-pr-create`, and `/openloyalty:engineering:jira-ticket-create`.

**Install:**
```bash
/plugin install atlassian@claude-plugins-official
```

Authentication is handled through Claude's native Atlassian OAuth — no API tokens or environment variables needed. You'll be prompted to connect your Atlassian account on first use.

Run `/openloyalty:setup` for guided installation.

---

## Open Loyalty MCP Server Setup (Optional)

The OL MCP server provides 60+ loyalty API tools. It's optional — skip it if you don't need direct loyalty API access. Run `/openloyalty:setup` for interactive configuration, or add to `~/.claude/settings.local.json` manually:

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

## Output Locations

| Document Type | Path |
|---------------|------|
| Compound Learnings | `engineering/compound-learnings/{category}/{filename}.md` |
| Critical Patterns | `engineering/compound-learnings/patterns/ol-critical-patterns.md` |
| Code Reviews | Chat output (not saved) |

---

## The Compounding Philosophy

> Each documented solution compounds your team's knowledge.
> The first time you solve a problem takes research.
> Document it, and the next occurrence takes minutes.
> Knowledge compounds.

```
Build → Test → Find Issue → Research → Improve → Document → Validate → Deploy
    ↑                                                                      ↓
    └──────────────────────────────────────────────────────────────────────┘
```

**Each unit of engineering work should make subsequent units of work easier—not harder.**

---

## Requirements

- Git access to this repo (SSH or HTTPS)
- [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin (auto-installed by `/openloyalty:setup`)
- `AGENTS.md` in your OL repo (for conventions)

**For Jira integration (required):**
- `atlassian@claude-plugins-official` plugin (installed by `/openloyalty:setup`)

**For OL MCP server (optional):**
- `openloyalty` server in `~/.claude/settings.local.json` (configured by `/openloyalty:setup`)
- Node.js / npx available in PATH

**Optional:**
- Slack MCP for conversation context

---

## License

Internal Open Loyalty use.
