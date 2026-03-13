# Open Loyalty Claude Plugins

Claude Code plugin providing engineering, sales, QA, and marketing slash commands. All commands use the `/ol:` namespace.

## Critical Rules

- **VER001**: Version files must stay in sync when both are staged — pre-commit hook blocks mismatches. Releases are done on-demand (see AGENTS.md Release Process).
- **VER002**: Use semver — patch for fixes, minor for new commands/skills, major for breaking changes.
- **CMD001**: New commands go in `plugins/{department}/commands/{name}.md`. Register in `help.md` commands table.
- **PLG001**: Four department plugins: engineering, sales, marketing, qa. All display as "💜 {Department}" in marketplace. All commands use `ol:` prefix.
- **DEG001**: Optional integrations (Jira, Slack) must degrade gracefully — return status objects, never fail the workflow.

## Architecture

**4 department plugins** (`plugins/engineering/`, `plugins/sales/`, `plugins/marketing/`, `plugins/qa/`) — each appears separately in the marketplace as "💜 Engineering", "💜 Sales", etc. All commands use the `/ol:` namespace regardless of which plugin they belong to.

Version is tracked in each plugin's `plugin.json` and `marketplace.json` — must stay in sync (enforced by `hooks/pre-commit`).

## Boundaries

**NEVER:**
- Manually edit version files outside the release process
- Inline API docs or framework docs in command/skill files — link to references instead
- Repeat AGENTS.md conventions in command files — reference AGENTS.md

**ASK FIRST:**
- New plugin dependencies
- Changes to marketplace.json structure
- Removing or renaming existing commands

## References

- [AGENTS.md](AGENTS.md) — full conventions for creating commands and skills
- [README.md](README.md) — installation, setup, MCP server configuration
- `hooks/pre-commit` — version sync enforcement logic
