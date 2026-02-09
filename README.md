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

This installs both engineering workflows (slash commands) and the MCP server (60+ loyalty API tools).

**Run setup:**
```bash
/openloyalty:setup
```

The setup command handles the full onboarding process:

1. **Installs the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin** — automatically adds the marketplace and installs the plugin. This dependency provides review workflows, specialized agent types (architecture strategist, performance oracle, security sentinel, etc.), and engineering best practices used by `/openloyalty:review-pr` and other commands.
2. **Configures Open Loyalty MCP environment variables** — prompts for `OPENLOYALTY_API_URL` and `OPENLOYALTY_API_TOKEN` so the 60+ loyalty API tools can connect to your instance.
3. **Configures Atlassian (Jira/Confluence) environment variables** — prompts for `JIRA_URL`, `JIRA_USERNAME`, and `JIRA_API_TOKEN` needed by the bundled mcp-atlassian server and `/openloyalty:jira-ticket-create`.
4. **Writes variables to your shell profile** (`~/.zshrc` or `~/.bashrc`) so they persist across sessions.
5. **Checks for conflicts** with any manually configured MCP server entries.

---

## What's Included

### Engineering Workflows

Slash commands for compound learning, code review, and technical spikes following OL conventions.

### MCP Server

Open Loyalty MCP server providing 60+ tools for loyalty program management directly in Claude Code. The MCP server starts automatically when the plugin is enabled.

---

## Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty:compound` | Document solved problems with YAML schema validation |
| `/openloyalty:review-pr` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/openloyalty:backend-pr-create` | Create backend PR with OL conventions and Jira linking |
| `/openloyalty:jira-ticket-create` | Create Jira tickets from brainstorming/planning sessions |
| `/openloyalty:setup` | Full onboarding: auto-installs compound-engineering plugin, configures MCP env vars |
| `/openloyalty:help` | Show available commands and plugin documentation |

---

## Compound Learning System

The `/openloyalty:compound` command creates a compounding knowledge repository with parallel subagents, YAML schema validation, and auto-categorized output. Each documented solution makes the team smarter.

See [compound-docs skill README](plugins/openloyalty/skills/compound-docs/README.md) for full documentation — usage, auto-invoke triggers, output categories, and YAML schema reference.

---

## MCP Server Setup

The MCP server requires environment variables to connect to your Open Loyalty instance. Run `/openloyalty:setup` for interactive configuration, or set them manually:

```bash
# ~/.zshrc or ~/.bashrc
export OPENLOYALTY_API_URL="https://your-instance.openloyalty.io/api"
export OPENLOYALTY_API_TOKEN="your-api-token-here"
export OPENLOYALTY_DEFAULT_STORE_CODE="default"  # optional, defaults to "default"
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

**For MCP server:**
- `OPENLOYALTY_API_URL`, `OPENLOYALTY_API_TOKEN` environment variables
- Node.js / npx available in PATH

**For Jira integration (bundled, required for `/openloyalty:jira-ticket-create`):**
- `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN` environment variables
- Python / uvx available in PATH

**Optional:**
- Confluence credentials for Confluence integration
- Slack MCP for conversation context

---

## License

Internal Open Loyalty use.
