# AGENTS.md — Skill Generation Conventions

This file defines the conventions, patterns, and rules for creating new slash commands in the Open Loyalty plugins. Follow these exactly when generating new components.

---

## Repository Structure

```
openloyalty-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json           # Marketplace definition (all 4 plugins)
├── plugins/
│   ├── engineering/               # 💜 Engineering plugin
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── commands/
│   │       ├── help.md
│   │       ├── setup.md
│   │       ├── review-pr.md
│   │       ├── jira-ticket-breakdown.md
│   │       ├── context-doctor.md
│   │       └── context-knowledge-updater.md
│   ├── sales/                     # 💜 Sales plugin
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── commands/
│   │       └── winning-plan.md
│   ├── marketing/                 # 💜 Marketing plugin
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── commands/
│   └── qa/                        # 💜 QA plugin
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── commands/
│           └── test-scenarios.md
├── AGENTS.md                      # This file
└── README.md
```

---

## Commands

| Concept | Location | Purpose | Invoked by |
|---------|----------|---------|------------|
| **Command** | `plugins/{department}/commands/{name}.md` | User-facing slash command (`/ol:{name}`) | User typing the command |

**Department mapping:** engineering, sales, marketing, qa. Place new commands in the appropriate department plugin. All commands use the `ol:` prefix regardless of department.

---

## Creating a New Slash Command

### File Location

```
plugins/{department}/commands/{command-name}.md
```

Use kebab-case for multi-word names (e.g., `jira-ticket-breakdown.md`).

### Required Frontmatter

Every command file starts with YAML frontmatter:

```yaml
---
name: ol:{command-name}
description: One-line description of what the command does.
argument-hint: "[--flag1 <value>] [--flag2] [positional-arg]"
---
```

- `name` — Always use `ol:{command-name}` to keep all commands under the `/ol:` namespace
- `description` — Concise, starts with a verb (e.g., "Create", "Review", "Document")
- `argument-hint` — Shows accepted flags/args. Use `""` if none.

### Command Body Structure

Follow this template:

```markdown
# {Title}

{One sentence explaining what this command does.}

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--flag` | What it does | `--flag value` |

## Phase 1: {First Phase Name}

{Instructions for this phase}

## Phase 2: {Second Phase Name}

{Instructions for this phase}

...

## Related Commands

- `/ol:{other}` - Brief description
```

### Conventions

1. **Phase-based structure** — Break work into numbered phases (Phase 1, Phase 2, etc.)
2. **Parallel agents first** — Phase 1 should launch independent agents IN PARALLEL using the Task tool
3. **Agent specs use code blocks** — Define each agent's task type and prompt in fenced code blocks:
   ```
   Task: {agent-type}
   Prompt: |
     {instructions}
   ```
4. **Valid agent types:** `Bash`, `Explore`, `general-purpose`, `compound-engineering:research:git-history-analyzer`, and other Task tool subagent types
5. **Graceful degradation** — Optional integrations (Jira, Slack) must handle unavailability without failing. Return status objects like `{ "status": "plugin_not_installed" }` or `{ "status": "unavailable" }`
6. **User confirmation before destructive actions** — Always preview before creating PRs, pushing code, or modifying external systems
7. **Ticket detection** — Extract `OLOY-\d+` from branch names when `--ticket` is not provided

### Registering the Command

After creating the command file, add it to `commands/help.md` in the Available Commands table:

```markdown
| `/ol:{name}` | Brief description |
```

Also update `README.md` if the command is significant.

---

## Supporting Files

Commands may have supporting files (templates, references, scripts) stored alongside them in the commands directory. Use a `{command-name}-{type}/` prefix for subdirectories:

```
plugins/{department}/commands/
├── context-doctor.md
├── context-doctor-references/    # Reference docs for context-doctor
├── context-doctor-scripts/       # Scripts for context-doctor
├── winning-plan.md
├── winning-plan-assets/          # Templates for winning-plan
└── winning-plan-references/      # Reference docs for winning-plan
```

---

## Writing Style

### Commands

- **Imperative headings:** "Gather Context", not "Gathering Context"
- **Phase names:** Descriptive, action-oriented (e.g., "Build PR Description", "Confirm & Create")
- **Agent prompts:** Direct instructions, not suggestions. Use "Extract", "Run", "Return", not "Try to" or "Consider"
- **Tables for arguments/options** — Always use tables, not prose
- **Code blocks for commands** — Always wrap bash commands, file paths, and code in fenced blocks
- **XML semantic tags (permitted for commands):**
  - `<role>` — Establish persona and behavioral defaults at the top of the command, before any instructions
  - `<use_parallel_tool_calls>` — Explicitly instruct Claude to run independent tool calls in parallel

### Skills

- **Step titles:** "Step N: {Verb} {Object}" (e.g., "Step 3: Check Existing Docs")
- **Blocking requirements in bold:** "**BLOCKING REQUIREMENT:**"
- **Error handling section** — Every skill needs explicit error handling guidance
- **Example scenario** — Include at least one concrete end-to-end example

---

## Parallel Agent Patterns

### When to Use Parallel Agents

Use parallel agents (multiple Task tool calls in one message) when:
- Gathering independent context (git info, Jira ticket, conventions, file analysis)
- Each agent's output doesn't depend on another agent's result

### Standard Agent Pattern

Most commands use this Phase 1 pattern:

| Agent | Type | Purpose |
|-------|------|---------|
| Git/Branch Context | `Bash` | Branch name, commits, diff stats, remote status |
| Jira Ticket (optional) | `general-purpose` | Fetch ticket details via Atlassian tools |
| Code/Conventions | `Explore` | Read AGENTS.md, analyze changed files |

### Jira Agent Template (Reusable)

Every command that optionally uses Jira should follow this pattern:

```
Task: general-purpose
Prompt: |
  Attempt to fetch Jira ticket context for: {ticket_id}

  Steps:
  1. Check if Jira/Atlassian tools are available (any tools containing `atlassian`, `jira`, or similar)
  2. If not available: return { "status": "plugin_not_installed" }
  3. If available, try fetching the Jira issue using the available tools with issueIdOrKey={ticket_id}
  4. If successful, extract: summary, description, acceptance criteria
  5. If call fails: return { "status": "unavailable", "reason": "..." }

  This is optional. The workflow works without Jira.
```

---

## Efficiency Rules

1. **Batch bash commands** — Use `&&` and `echo "=== SECTION ==="` markers to combine related commands into one call
2. **Use git diff with context** — `git diff -U15` provides surrounding code without reading full files
3. **Only spawn agents for independent parallel work** — Don't spawn an agent for something a single tool call can do
4. **Read full files only when necessary** — Migrations, security-sensitive files, or when diff context is insufficient
5. **Target tool call counts** — A command should complete in 8-15 tool calls, not 25+

---

## Checklist: New Command

- [ ] File at `plugins/{department}/commands/{name}.md` with correct frontmatter
- [ ] Phase-based structure with parallel agents in Phase 1
- [ ] Arguments table if the command accepts flags
- [ ] Graceful Jira/Slack degradation (if used)
- [ ] User confirmation before external actions
- [ ] Added to `help.md` commands table (in the correct department section)
- [ ] Related Commands section at the bottom
- [ ] README.md updated (for significant commands)

---

## Release Process

**Day-to-day rule:** PRs merge without version bumps. Version changes happen only during an explicit release.

### Release Protocol

When Marcin says "release", execute these steps:

1. **Read current version** from any `plugins/*/.claude-plugin/plugin.json` (all share same version)
2. **Determine bump level** — Marcin specifies patch/minor/major, or Claude suggests based on changes since last tag
3. **Update all version fields** to the new version:
   - `plugins/engineering/.claude-plugin/plugin.json` → `"version": "X.Y.Z"`
   - `plugins/sales/.claude-plugin/plugin.json` → `"version": "X.Y.Z"`
   - `plugins/marketing/.claude-plugin/plugin.json` → `"version": "X.Y.Z"`
   - `plugins/qa/.claude-plugin/plugin.json` → `"version": "X.Y.Z"`
   - `.claude-plugin/marketplace.json` → `metadata.version` field
   - `.claude-plugin/marketplace.json` → each `plugins[].version` field
4. **Generate changelog** from `git log --oneline $(git describe --tags --abbrev=0)..HEAD`
5. **Commit** with message `Release vX.Y.Z`
6. **Tag** with `vX.Y.Z`
7. **Ask Marcin** for confirmation before pushing
8. **Push** commit + tag: `git push && git push --tags`
9. **Create GitHub Release** via `gh release create vX.Y.Z --title "vX.Y.Z" --notes "<changelog>"`
10. **Post changelog to Slack** — Send the changelog to `#claude-code-engineering` (private channel) using the Slack MCP tool (`mcp__claude_ai_Slack__slack_send_message`). Format the message as: bold version header, then the changelog entries. Degrade gracefully if Slack tools are unavailable.

### Version files

All plugin.json files and marketplace.json must always have matching versions (enforced by pre-commit hook when both are staged):

- `plugins/engineering/.claude-plugin/plugin.json` — 💜 Engineering metadata
- `plugins/sales/.claude-plugin/plugin.json` — 💜 Sales metadata
- `plugins/marketing/.claude-plugin/plugin.json` — 💜 Marketing metadata
- `plugins/qa/.claude-plugin/plugin.json` — 💜 QA metadata
- `.claude-plugin/marketplace.json` — marketplace definition (has `metadata.version` and per-plugin `version` fields)

Use semver: patch for fixes, minor for new commands/skills, major for breaking changes.
