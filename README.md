# Open Loyalty Claude Plugins

Engineering workflows and MCP tools for the Open Loyalty development team. Auto-updating Claude Code plugins.

## Quick Start

**Add the marketplace (once):**
```bash
/plugin marketplace add OpenLoyalty/openloyalty-claude-plugins
```

**Install the skills plugin (engineering workflows):**
```bash
/plugin install openloyalty@openloyalty-claude-plugins
```

**Install the MCP plugin (loyalty API tools):**
```bash
/plugin install openloyalty-mcp@openloyalty-claude-plugins
```

---

## Skills Plugin: `openloyalty`

Engineering workflows for compound learning, code review, and technical spikes following OL conventions.

### Installation

```bash
/plugin install openloyalty@openloyalty-claude-plugins
```

For private repo (use same auth method as your normal git):
```bash
# SSH
/plugin marketplace add git@github.com:OpenLoyalty/openloyalty-claude-plugins.git

# HTTPS
/plugin marketplace add https://github.com/OpenLoyalty/openloyalty-claude-plugins.git
```

**Auto-updates:** Plugin updates automatically when you start Claude Code after a new version is pushed.

### Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty:compound` | Generate compound learning from branch |
| `/openloyalty:review` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/openloyalty:help` | Show available commands and plugin documentation |

### Usage

```bash
# Generate compound learning from current branch
/openloyalty:compound

# Specify branch explicitly
/openloyalty:compound feature/OLOY-123-fix-timezone

# With Slack context (optional)
/openloyalty:compound --slack https://openloyalty.slack.com/archives/C123/p456
```

**Trigger phrases:** "document what we learned", "create compound learning", "capture lessons"

### Features

- Jira integration via Atlassian MCP (graceful degradation without it)
- Slack context via Slack MCP
- Reads AGENTS.md from your repo for conventions

---

## MCP Plugin: `openloyalty-mcp`

Open Loyalty MCP server providing 60+ tools for loyalty program management directly in Claude Code.

### Installation

```bash
/plugin install openloyalty-mcp@openloyalty-claude-plugins
```

### Required Environment Variables

Set these in your shell profile before launching Claude Code:

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

Run `/openloyalty-mcp:setup` to check your configuration and get guided setup instructions.

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

### Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty-mcp:setup` | Check and configure environment variables |

---

## Claude Desktop

The Open Loyalty MCP server is also available for Claude Desktop via the `.mcpb` extension from the MCP server repository. See the [@open-loyalty/mcp-server](https://github.com/OpenLoyalty/mcp-server) repo for Claude Desktop setup instructions.

---

## Migration from Manual Config

If you previously configured the Open Loyalty MCP server manually in `~/.claude/settings.json` or your project `.mcp.json`:

1. **Remove** the manual `"openloyalty"` entry from your MCP config file
2. **Install** the plugin: `/plugin install openloyalty-mcp@openloyalty-claude-plugins`
3. **Restart** Claude Code

The plugin manages the MCP server configuration automatically and will stay up to date.

---

## Manage Plugins

```bash
/plugin                    # Open plugin manager UI
/plugin marketplace list   # List configured marketplaces
/plugin disable openloyalty@openloyalty-claude-plugins       # Disable skills plugin
/plugin enable openloyalty@openloyalty-claude-plugins        # Re-enable skills plugin
/plugin disable openloyalty-mcp@openloyalty-claude-plugins   # Disable MCP plugin
/plugin enable openloyalty-mcp@openloyalty-claude-plugins    # Re-enable MCP plugin
```

---

## Architecture

### Plugin Structure

```
openloyalty-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace definition (both plugins)
├── plugins/
│   ├── openloyalty/                   # Skills plugin
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json           # Plugin version
│   │   └── commands/
│   │       └── openloyalty/
│   │           ├── compound.md       # Compound learning command
│   │           ├── review.md         # Code review command
│   │           └── help.md           # Help command
│   └── openloyalty-mcp/              # MCP plugin
│       ├── .claude-plugin/
│       │   └── plugin.json           # Plugin version
│       ├── .mcp.json                 # MCP server configuration
│       └── commands/
│           └── openloyalty-mcp/
│               └── setup.md          # Setup command
└── README.md
```

### Versioning

To push an update:
1. Make changes to the relevant `plugins/` directory
2. Bump version in the plugin's `.claude-plugin/plugin.json`
3. Push to GitHub
4. Team members get update on next Claude Code startup

---

## Output Locations

| Document Type | Path |
|---------------|------|
| Compound Learnings | `engineering/compound-learnings/{TICKET}-{slug}.md` |
| Code Reviews | Chat output (not saved) |

---

## Requirements

- Git access to this repo (SSH or HTTPS)
- `AGENTS.md` in your OL repo (for conventions -- skills plugin)

**For MCP plugin:**
- `OPENLOYALTY_API_URL`, `OPENLOYALTY_API_TOKEN` environment variables
- Node.js / npx available in PATH

**Optional:**
- Atlassian MCP for Jira integration (skills plugin)
- Slack MCP for conversation context (skills plugin)

---

## License

Internal Open Loyalty use.
