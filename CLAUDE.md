# Open Loyalty Claude Plugins

Claude Code plugin providing engineering slash commands (code review, Jira tickets) and an OpenCode converter CLI. TypeScript, Bun runtime.

## Critical Rules

- **VER001**: Every commit touching `plugins/openloyalty/` MUST bump version in BOTH `plugins/openloyalty/.claude-plugin/plugin.json` AND `.claude-plugin/marketplace.json` (3 version fields total). Pre-commit hook blocks mismatches.
- **VER002**: Use semver — patch for fixes, minor for new commands/skills, major for breaking changes. Include version in commit message (e.g., `Add feature (v3.10.0)`).
- **CMD001**: New commands go in `plugins/openloyalty/commands/openloyalty/{name}.md`. Register in `help.md` commands table.
- **SKL001**: New skills go in `plugins/openloyalty/skills/{name}/SKILL.md`. See AGENTS.md for full conventions.
- **DEG001**: Optional integrations (Jira, Slack) must degrade gracefully — return status objects, never fail the workflow.

## Quick Start

```bash
# Run tests
bun test

# Run converter CLI locally
bun run src/index.ts install ./plugins/openloyalty --to opencode

# Install to OpenCode (remote)
bun run install:opencode
```

## Architecture

Two concerns in one repo:

1. **Plugin** (`plugins/openloyalty/`) — slash commands and skills loaded by Claude Code's plugin system. Commands orchestrate; skills do focused work.
2. **Converter CLI** (`src/`) — parses Claude Code plugin format and writes OpenCode-compatible output. Entry point: `src/index.ts`.

Version is tracked in two files that must stay in sync (enforced by `hooks/pre-commit`).

## Boundaries

**NEVER:**
- Skip version bump when changing plugin files (hook will block)
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
