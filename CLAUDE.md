# Open Loyalty Claude Plugins

Claude Code plugin providing engineering slash commands (code review, Jira tickets). TypeScript, Bun runtime.

## Critical Rules

- **VER001**: Version files must stay in sync when both are staged — pre-commit hook blocks mismatches. Releases are done on-demand (see AGENTS.md Release Process).
- **VER002**: Use semver — patch for fixes, minor for new commands/skills, major for breaking changes.
- **CMD001**: New commands go in `plugins/openloyalty/commands/openloyalty/{name}.md`. Register in `help.md` commands table.
- **SKL001**: New skills go in `plugins/openloyalty/skills/{name}/SKILL.md`. See AGENTS.md for full conventions.
- **DEG001**: Optional integrations (Jira, Slack) must degrade gracefully — return status objects, never fail the workflow.

## Architecture

**Plugin** (`plugins/openloyalty/`) — slash commands and skills loaded by Claude Code's plugin system. Commands orchestrate; skills do focused work.

Version is tracked in two files that must stay in sync (enforced by `hooks/pre-commit`).

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
