# AGENTS.md — Skill Generation Conventions

This file defines the conventions, patterns, and rules for creating new slash commands and skills in the `openloyalty` plugin. Follow these exactly when generating new components.

---

## Repository Structure

```
openloyalty-claude-skills/
├── .claude-plugin/
│   └── marketplace.json           # Marketplace definition (version: 2.0.0)
├── plugins/
│   └── openloyalty/               # The plugin
│       ├── .claude-plugin/
│       │   └── plugin.json        # Plugin metadata (bump version on changes)
│       ├── commands/openloyalty/   # Slash commands (user-facing)
│       │   ├── compound.md
│       │   ├── review-pr.md
│       │   ├── backend-pr-create.md
│       │   ├── setup.md
│       │   └── help.md
│       └── skills/                # Skills (internal, invoked by commands)
│           └── compound-docs/
│               ├── SKILL.md
│               ├── schema.yaml
│               ├── assets/        # Templates
│               └── references/    # Reference docs
├── AGENTS.md                      # This file
└── README.md
```

---

## Commands vs Skills

| Concept | Location | Purpose | Invoked by |
|---------|----------|---------|------------|
| **Command** | `commands/openloyalty/{name}.md` | User-facing slash command (`/openloyalty:{namespace}:{name}`) | User typing the command |
| **Skill** | `skills/{name}/SKILL.md` | Internal reusable workflow | Commands or other skills |

**Rule:** Commands orchestrate. Skills do focused work. If a workflow is reusable across multiple commands, extract it into a skill.

---

## Creating a New Slash Command

### File Location

```
plugins/openloyalty/commands/openloyalty/{command-name}.md
```

Use kebab-case for multi-word names (e.g., `backend-pr-create.md`).

### Required Frontmatter

Every command file starts with YAML frontmatter:

```yaml
---
name: engineering:{command-name}
description: One-line description of what the command does.
argument-hint: "[--flag1 <value>] [--flag2] [positional-arg]"
---
```

- `name` — Use `engineering:{command-name}` for engineering workflow commands, or just `{command-name}` for top-level commands like `help` and `setup`
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

- `/openloyalty:{other}` - Brief description
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

After creating the command file, add it to `commands/openloyalty/help.md` in the Available Commands table:

```markdown
| `/openloyalty:{name}` | Brief description |
```

Also update `README.md` if the command is significant.

---

## Creating a New Skill

### File Structure

```
plugins/openloyalty/skills/{skill-name}/
├── SKILL.md              # Main skill definition (required)
├── schema.yaml           # Validation schema (if skill has structured output)
├── assets/               # Templates, patterns (optional)
│   └── {template}.md
└── references/           # Reference documentation (optional)
    └── {reference}.md
```

### SKILL.md Frontmatter

```yaml
---
name: {skill-name}
description: What this skill does
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Task
preconditions:
  - Condition that must be true before invoking
---
```

### SKILL.md Body Patterns

Skills use structured XML-like tags for enforcement:

- `<critical_sequence>` — Steps that must execute in strict order
- `<step number="N" required="true|false" depends_on="N">` — Individual steps
- `<validation_gate blocking="true">` — Must pass before proceeding
- `<decision_gate wait_for_user="true">` — Present options, wait for user choice
- `<integration_protocol>` — Define what invokes this skill and what it invokes
- `<success_criteria>` — Define when the skill is complete

### Skill Conventions

1. **Numbered steps** — Use `<step>` tags with explicit dependencies
2. **Blocking gates** — Use `<validation_gate blocking="true">` for schema validation
3. **Decision menus** — Present numbered options after major actions, always include "Other"
4. **Templates in assets/** — Keep templates separate from logic
5. **Schema validation** — If the skill produces structured output, define a `schema.yaml`

---

## Writing Style

### Commands

- **Imperative headings:** "Gather Context", not "Gathering Context"
- **Phase names:** Descriptive, action-oriented (e.g., "Build PR Description", "Confirm & Create")
- **Agent prompts:** Direct instructions, not suggestions. Use "Extract", "Run", "Return", not "Try to" or "Consider"
- **Tables for arguments/options** — Always use tables, not prose
- **Code blocks for commands** — Always wrap bash commands, file paths, and code in fenced blocks

### Skills

- **Step titles:** "Step N: {Verb} {Object}" (e.g., "Step 3: Check Existing Docs")
- **Blocking requirements in bold:** "**BLOCKING REQUIREMENT:**" or "**CRITICAL:**"
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
| Jira Ticket (optional) | `general-purpose` | Fetch ticket details via Atlassian plugin |
| Code/Conventions | `Explore` | Read AGENTS.md, analyze changed files |

### Jira Agent Template (Reusable)

Every command that optionally uses Jira should follow this pattern:

```
Task: general-purpose
Prompt: |
  Attempt to fetch Jira ticket context for: {ticket_id}

  Steps:
  1. Check if Atlassian plugin tools are available (mcp__claude_ai_Atlassian__*)
  2. If not available: return { "status": "plugin_not_installed" }
  3. If available, try: mcp__claude_ai_Atlassian__getJiraIssue with issueIdOrKey={ticket_id}
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

- [ ] File at `commands/openloyalty/{name}.md` with correct frontmatter
- [ ] Phase-based structure with parallel agents in Phase 1
- [ ] Arguments table if the command accepts flags
- [ ] Graceful Jira/Slack degradation (if used)
- [ ] User confirmation before external actions
- [ ] Added to `help.md` commands table
- [ ] Related Commands section at the bottom
- [ ] README.md updated (for significant commands)

## Checklist: New Skill

- [ ] Directory at `skills/{name}/` with `SKILL.md`
- [ ] Correct frontmatter with `allowed-tools` and `preconditions`
- [ ] Numbered steps with dependencies
- [ ] Validation gates for structured output
- [ ] Decision menu after major actions
- [ ] Error handling section
- [ ] At least one example scenario
- [ ] Templates in `assets/` if applicable
- [ ] Referenced from the invoking command

---

## Versioning

When adding or modifying commands/skills:

1. Bump `version` in `plugins/openloyalty/.claude-plugin/plugin.json`
2. Use semver: patch for fixes, minor for new commands, major for breaking changes
3. Current version: check `plugin.json` before bumping
