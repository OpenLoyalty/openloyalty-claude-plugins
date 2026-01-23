# Open Loyalty Claude Skills

Engineering skills for the Open Loyalty development team, designed for Claude Code with portability to other AI coding assistants.

## Installation

### One-liner (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/OpenLoyalty/openloyalty-claude-skills/main/install.sh | bash
```

### Manual

```bash
git clone https://github.com/OpenLoyalty/openloyalty-claude-skills.git
cp -r openloyalty-claude-skills/skills/* ~/.claude/skills/
```

## Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty:compound` | Generate compound learning from branch |
| `/openloyalty:spike` | Structure a technical spike investigation |
| `/openloyalty:review` | OL-specific code review with conventions |
| `/openloyalty:rca` | Generate Root Cause Analysis document |
| `/openloyalty:onboard` | Generate context summary for module |

## Usage

### `/openloyalty:compound`

Generate a compound learning document from a completed branch:

```bash
# Auto-detect current branch
/openloyalty:compound

# Specify branch
/openloyalty:compound feature/OLOY-123-fix-timezone

# With Slack context (optional)
/openloyalty:compound --slack https://openloyalty.slack.com/archives/C123/p456
```

**Trigger phrases:**
- "compound this branch"
- "create learning doc"
- "document what we learned"
- "capture lessons from this branch"

**Output:** `engineering/compound-learnings/{ticket}-{slug}.md`

### Integration with Slack

For rich context, use @claude in Slack to summarize the discussion first:

1. In Slack thread: `@claude summarize this conversation for documentation`
2. Copy link to Claude's summary message
3. Run: `/openloyalty:compound --slack <copied-url>`

## Portability

For Cursor, Codex, or other AI assistants, see the `portable/` directory:
- `portable/cursorrules-snippet.md` - Add to your `.cursorrules`
- `portable/workflows/` - Tool-agnostic workflow instructions

## Requirements

- Claude Code CLI
- Git repository with Open Loyalty codebase
- (Optional) Atlassian MCP for Jira integration
- (Optional) Slack MCP for conversation context

The skill gracefully degrades without Jira/Slack - git + code analysis always works.

## License

Internal Open Loyalty use.
