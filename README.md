# Open Loyalty AI Skills

Engineering workflows for the Open Loyalty development team. Auto-updating Claude Code plugin with portable configs for other AI tools.

## Quick Start

| Tool | Installation |
|------|--------------|
| **Claude Code** | `/install-plugin OpenLoyalty/openloyalty-claude-skills` |
| **OpenCode** | Copy `portable/opencode/` to your OL repo |
| **Cursor** | Copy `portable/cursor/rules/` to `.cursor/rules/` |
| **GitHub Copilot** | Merge `portable/copilot/` into `.github/copilot-instructions.md` |
| **JetBrains AI** | Follow `portable/jetbrains/README.md` |

---

## Claude Code (Full Experience, Auto-Updates)

### Installation

```bash
/install-plugin OpenLoyalty/openloyalty-claude-skills
```

For private repo (use same auth method as your normal git):
```bash
# SSH
/install-plugin git@github.com:OpenLoyalty/openloyalty-claude-skills.git

# HTTPS
/install-plugin https://github.com/OpenLoyalty/openloyalty-claude-skills.git
```

**Auto-updates:** Plugin updates automatically when you start Claude Code after a new version is pushed.

### Enable Plugin

After installation:
```bash
/plugins
# Enable "openloyalty" from the list
```

### Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty:compound` | Generate compound learning from branch |
| `/openloyalty:spike` | Structure technical spike investigation |
| `/openloyalty:review` | Code review with OL conventions |
| `/openloyalty:rca` | Root Cause Analysis document *(coming soon)* |
| `/openloyalty:onboard` | Context summary for module *(coming soon)* |

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

- Multi-agent parallel execution (git, code, Jira analysis)
- Jira integration via Atlassian MCP (graceful degradation without it)
- Slack context via Slack MCP
- Reads AGENTS.md from your repo for conventions

---

## OpenCode

OpenCode provides a similar agentic experience to Claude Code.

### Installation

```bash
# Clone this repo (or just copy the files)
git clone git@github.com:OpenLoyalty/openloyalty-claude-skills.git /tmp/ol-skills

# Copy to your OL repo
cp /tmp/ol-skills/portable/opencode/opencode.json ~/projects/openloyalty/core-admin/
mkdir -p ~/projects/openloyalty/core-admin/.opencode/prompts
cp /tmp/ol-skills/portable/opencode/prompts/* ~/projects/openloyalty/core-admin/.opencode/prompts/
```

### Usage

```bash
opencode

# Use agents:
@compound   # Generate compound learning
@reviewer   # Code review with OL conventions
@spike      # Technical spike investigation
```

---

## Cursor

### Installation

```bash
mkdir -p ~/projects/openloyalty/core-admin/.cursor/rules
cp portable/cursor/rules/*.mdc ~/projects/openloyalty/core-admin/.cursor/rules/
```

### Usage

Rules activate when you ask "document what we learned" or "review this code".

---

## GitHub Copilot

Merge `portable/copilot/workflow-instructions.md` into your repo's `.github/copilot-instructions.md`.

---

## JetBrains AI

JetBrains AI does NOT support file-based config. See `portable/jetbrains/README.md` for manual setup.

**Recommendation:** Use OpenCode in terminal alongside PHPStorm.

---

## Capability Comparison

| Capability | Claude Code | OpenCode | Cursor | Copilot | JetBrains |
|------------|:-----------:|:--------:|:------:|:-------:|:---------:|
| Auto-updates | Yes | - | - | - | - |
| Multi-agent parallel | Yes | Yes | - | - | - |
| Named agents/commands | Yes | Yes | - | - | - |
| MCP integrations | Yes | Partial | Yes | - | - |
| Jira context | Yes | Manual | Manual | PR-only | - |

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
│       ├── CLAUDE.md             # Plugin context
│       └── skills/
│           └── openloyalty/      # Skill files
│               ├── SKILL.md
│               ├── workflows/
│               ├── templates/
│               └── shared/
├── portable/                     # Configs for other AI tools
│   ├── opencode/
│   ├── cursor/
│   ├── copilot/
│   └── jetbrains/
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

All tools generate files to the same locations:

| Document Type | Path |
|---------------|------|
| Compound Learnings | `engineering/compound-learnings/{TICKET}-{slug}.md` |
| Spikes | `engineering/spikes/{date}-{slug}.md` |
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
