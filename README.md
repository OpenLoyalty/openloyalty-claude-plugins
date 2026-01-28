# Open Loyalty Claude Code Skills

Engineering workflows for the Open Loyalty development team. Auto-updating Claude Code plugin.

## Quick Start

```bash
/plugin marketplace add OpenLoyalty/openloyalty-claude-skills
/plugin install openloyalty@openloyalty-claude-skills
```

---

## Installation

**Step 1: Add the marketplace**
```bash
/plugin marketplace add OpenLoyalty/openloyalty-claude-skills
```

For private repo (use same auth method as your normal git):
```bash
# SSH
/plugin marketplace add git@github.com:OpenLoyalty/openloyalty-claude-skills.git

# HTTPS
/plugin marketplace add https://github.com/OpenLoyalty/openloyalty-claude-skills.git
```

**Step 2: Install the plugin**
```bash
/plugin install openloyalty@openloyalty-claude-skills
```

**Auto-updates:** Plugin updates automatically when you start Claude Code after a new version is pushed.

### Manage Plugins

```bash
/plugin                    # Open plugin manager UI
/plugin marketplace list   # List configured marketplaces
/plugin disable openloyalty@openloyalty-claude-skills   # Disable temporarily
/plugin enable openloyalty@openloyalty-claude-skills    # Re-enable
```

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

## Architecture

### Plugin Structure

```
openloyalty-claude-skills/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace definition
├── plugins/
│   └── openloyalty/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Plugin version (bump to trigger updates)
│       └── commands/
│           └── openloyalty/      # Command files
│               ├── compound.md
│               ├── review.md
│               └── help.md
└── README.md
```

### Versioning

To push an update:
1. Make changes to `plugins/openloyalty/`
2. Bump version in `plugins/openloyalty/.claude-plugin/plugin.json`
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
- `AGENTS.md` in your OL repo (for conventions)

**Optional:**
- Atlassian MCP for Jira integration
- Slack MCP for conversation context

---

## License

Internal Open Loyalty use.
