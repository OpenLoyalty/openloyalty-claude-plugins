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
| `/openloyalty:review` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/openloyalty:setup` | Interactive setup for MCP server environment variables |
| `/openloyalty:help` | Show available commands and plugin documentation |

---

## Compound Learning System

The `/openloyalty:compound` command creates a compounding knowledge repository. Each documented solution makes the team smarter.

### Features

| Feature | Description |
|---------|-------------|
| **Parallel Subagents** | 6 agents gather context simultaneously |
| **YAML Schema Validation** | Enum-validated frontmatter ensures consistency |
| **Category-Based Organization** | Auto-categorized by problem type |
| **Critical Pattern Promotion** | Elevate issues to "Required Reading" |
| **Cross-Referencing** | Automatic linking of related issues |
| **Graceful Degradation** | Works without Jira/Slack MCPs |

### Usage

```bash
# Document from current context
/openloyalty:compound

# Analyze specific branch
/openloyalty:compound feature/OLOY-123-fix-timezone

# Include Jira ticket context
/openloyalty:compound --ticket OLOY-1234

# Include Slack thread
/openloyalty:compound --slack https://slack.com/archives/C123/p456
```

### Auto-Invoke Triggers

The skill can auto-invoke after phrases like:
- "that worked"
- "it's fixed"
- "working now"
- "problem solved"

### Output Categories

Documents are auto-sorted by `problem_type`:

```
engineering/compound-learnings/
├── build-errors/
├── test-failures/
├── runtime-errors/
├── performance-issues/
├── database-issues/
├── security-issues/
├── api-issues/
├── integration-issues/
├── logic-errors/
├── developer-experience/
├── configuration-issues/
├── documentation-gaps/
├── data-issues/
└── patterns/
    ├── common-solutions.md
    └── ol-critical-patterns.md
```

### YAML Schema

All documentation uses validated YAML frontmatter with OL-specific enums:

```yaml
---
module: Points System                    # OL module name
date: 2026-01-28                        # YYYY-MM-DD
problem_type: performance_issue          # Enum (determines category)
component: points_system                 # Enum
symptoms:
  - "N+1 query when loading transactions"
root_cause: missing_include              # Enum
resolution_type: code_fix                # Enum
severity: high                           # Enum
tags: [n-plus-one, performance]
---
```

### Post-Documentation Options

After capture, choose:
1. **Continue workflow** - Return to work
2. **Add to Required Reading** - Promote to critical patterns
3. **Link related issues** - Connect similar problems
4. **View documentation** - Review what was captured

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

---

## Migration

### From separate `openloyalty-mcp` plugin

If you previously installed `openloyalty-mcp` as a separate plugin:

1. **Uninstall** the old MCP plugin: `/plugin uninstall openloyalty-mcp@openloyalty-claude-plugins`
2. **Update** the main plugin (happens automatically on next launch)
3. **Restart** Claude Code

The MCP server is now bundled in the `openloyalty` plugin.

### From manual MCP config

If you previously configured the Open Loyalty MCP server manually in `~/.claude/settings.json` or your project `.mcp.json`:

1. **Remove** the manual `"openloyalty"` entry from your MCP config file
2. **Install** the plugin: `/plugin install openloyalty@openloyalty-claude-plugins`
3. **Restart** Claude Code

The plugin manages the MCP server configuration automatically and will stay up to date.

---

## Manage Plugins

```bash
/plugin                    # Open plugin manager UI
/plugin marketplace list   # List configured marketplaces
/plugin disable openloyalty@openloyalty-claude-plugins   # Disable plugin
/plugin enable openloyalty@openloyalty-claude-plugins     # Re-enable plugin
```

---

## Architecture

### Plugin Structure

```
openloyalty-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace definition
├── plugins/
│   └── openloyalty/                   # Plugin (skills + MCP)
│       ├── .claude-plugin/
│       │   └── plugin.json           # Plugin version
│       ├── .mcp.json                 # MCP server configuration
│       ├── commands/openloyalty/     # Command files
│       │   ├── compound.md           # Compound learning command
│       │   ├── review.md             # Code review command
│       │   ├── setup.md              # MCP setup command
│       │   └── help.md               # Help command
│       └── skills/compound-docs/     # Documentation engine
│           ├── SKILL.md              # 7-step process skill
│           ├── schema.yaml           # OL-specific schema
│           ├── assets/
│           │   ├── resolution-template.md
│           │   └── critical-pattern-template.md
│           └── references/
│               └── yaml-schema.md    # Schema documentation
└── README.md
```

### Versioning

To push an update:
1. Make changes to the `plugins/openloyalty/` directory
2. Bump version in `plugins/openloyalty/.claude-plugin/plugin.json`
3. Push to GitHub
4. Team members get update on next Claude Code startup

---

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
- `AGENTS.md` in your OL repo (for conventions)

**For MCP server:**
- `OPENLOYALTY_API_URL`, `OPENLOYALTY_API_TOKEN` environment variables
- Node.js / npx available in PATH

**Optional:**
- Atlassian MCP for Jira integration
- Slack MCP for conversation context

---

## License

Internal Open Loyalty use.
