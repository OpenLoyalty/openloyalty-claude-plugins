# Open Loyalty Engineering Plugin

This plugin provides engineering workflows for the Open Loyalty development team.

## Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty:compound` | Generate compound learning from branch |
| `/openloyalty:review` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/openloyalty:spike` | Structure technical spike investigation *(coming soon)* |
| `/openloyalty:rca` | Root Cause Analysis document *(coming soon)* |
| `/openloyalty:onboard` | Context summary for module *(coming soon)* |

## Integration with AGENTS.md

This plugin works alongside your repository's `AGENTS.md` file:
- **AGENTS.md** defines conventions, rules, and commands (what to follow)
- **This plugin** provides workflows for documentation and review (how to work)

The code review workflow reads AGENTS.md from your repo to check against OL conventions.

## Jira Integration

If Atlassian MCP is configured, the plugin will:
- Fetch ticket details from branch name patterns (e.g., `OLOY-123`)
- Extract context from ticket description and comments
- Link compound learnings to tickets

Without Jira MCP, the plugin gracefully degrades to git + code analysis only.

## Output Locations

| Document Type | Path |
|---------------|------|
| Compound Learnings | `engineering/compound-learnings/{TICKET}-{slug}.md` |
| Spikes | `engineering/spikes/{date}-{slug}.md` |
| RCAs | `engineering/rcas/{date}-{slug}.md` |
