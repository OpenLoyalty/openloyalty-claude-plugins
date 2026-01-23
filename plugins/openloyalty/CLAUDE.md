# Open Loyalty Engineering Plugin

This plugin provides engineering workflows for the Open Loyalty development team.

## Available Commands

| Command | Purpose | Triggers |
|---------|---------|----------|
| `/openloyalty:compound` | Generate compound learning from branch | "document what we learned", "capture lessons" |
| `/openloyalty:spike` | Structure technical spike investigation | "start spike", "investigate issue" |
| `/openloyalty:review` | Code review with OL conventions | "review this PR", "check against OL standards" |
| `/openloyalty:rca` | Root Cause Analysis document | "write RCA", "post-mortem" |
| `/openloyalty:onboard` | Context summary for module | "onboard context", "explain module" |

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
