---
name: openloyalty:help
description: Show available Open Loyalty engineering commands and plugin documentation
argument-hint: ""
---

Display the following documentation to the user. IMPORTANT: Render command names EXACTLY as written — always include the full path with `engineering:` (e.g., `/openloyalty:engineering:review-pr`, NOT `/openloyalty:review-pr`). Do not shorten or omit any part of the command names.

# Open Loyalty Engineering Plugin

This plugin provides engineering workflows for the Open Loyalty development team.

## Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty:setup` | Full onboarding: installs compound-engineering plugin, configures MCP servers in user scope |
| `/openloyalty:engineering:review-pr` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/openloyalty:engineering:backend-pr-create` | Create backend PR with OL conventions and Jira linking |
| `/openloyalty:engineering:jira-ticket-create` | Create Jira tickets from brainstorming/planning sessions |
| `/openloyalty:engineering:compound` | **[WIP]** Document solved problems with YAML schema validation |
| `/openloyalty:help` | Show available commands and plugin documentation |

## Compound Learning System

The `/openloyalty:engineering:compound` command captures solved problems to build searchable institutional knowledge.

### Features

- **Parallel Subagents:** 6 agents gather context simultaneously for fast capture
- **YAML Schema Validation:** Enum-validated frontmatter ensures consistent categorization
- **Category-Based Organization:** Documents auto-sorted by problem type
- **Critical Pattern Promotion:** Elevate recurring issues to "Required Reading"
- **Cross-Referencing:** Automatic linking of related issues

### Usage

```bash
/openloyalty:engineering:compound                     # Document from current context
/openloyalty:engineering:compound [branch]            # Analyze specific branch
/openloyalty:engineering:compound --ticket OLOY-123   # Include Jira context
/openloyalty:engineering:compound --slack <url>       # Include Slack thread
```

### Output Categories

Documents are auto-categorized based on `problem_type`:

| Category | Description |
|----------|-------------|
| `build-errors/` | Build, compilation issues |
| `test-failures/` | Test failures, flaky tests |
| `runtime-errors/` | Exceptions, crashes |
| `performance-issues/` | Slow queries, N+1, memory |
| `database-issues/` | Migrations, queries, schema |
| `security-issues/` | Auth, authorization |
| `api-issues/` | REST/GraphQL problems |
| `integration-issues/` | External services, webhooks |
| `logic-errors/` | Business logic bugs |
| `developer-experience/` | DX, workflow, tooling |
| `configuration-issues/` | Config, environment |
| `patterns/` | Critical patterns |

### Post-Documentation Options

After capture, choose:
1. **Continue workflow** - Return to work
2. **Add to Required Reading** - Promote to critical patterns
3. **Link related issues** - Connect similar problems
4. **View documentation** - Review what was captured

## Requirements

This plugin depends on:

- **[compound-engineering](https://github.com/EveryInc/compound-engineering-plugin)** — review workflows, agent types, engineering best practices
- **[atlassian@claude-plugins-official](https://github.com/anthropics/claude-plugins-official)** — Jira/Confluence integration via OAuth

Run `/openloyalty:setup` to install all dependencies automatically.

## Integration with AGENTS.md

This plugin works alongside your repository's `AGENTS.md` file:
- **AGENTS.md** defines conventions, rules, and commands (what to follow)
- **This plugin** provides workflows for documentation and review (how to work)

The code review workflow reads AGENTS.md from your repo to check against OL conventions.

## Atlassian (Jira/Confluence) Setup

Jira and Confluence integration is provided by the official Atlassian plugin (`atlassian@claude-plugins-official`). It's installed automatically by `/openloyalty:setup`.

- **Required by:** `/openloyalty:engineering:jira-ticket-create`
- **Optional for:** `/openloyalty:engineering:review-pr`, `/openloyalty:engineering:backend-pr-create`, `/openloyalty:engineering:compound` (these commands degrade gracefully without Jira)

Authentication is handled through Claude's native Atlassian OAuth — no API tokens needed.

## Output Locations

| Document Type | Path |
|---------------|------|
| Compound Learnings | `engineering/compound-learnings/{category}/{filename}.md` |
| Critical Patterns | `engineering/compound-learnings/patterns/ol-critical-patterns.md` |
| Code Reviews | Chat output (not saved) |

## Directory Structure

```
engineering/
└── compound-learnings/
    ├── build-errors/
    ├── test-failures/
    ├── runtime-errors/
    ├── performance-issues/
    ├── database-issues/
    ├── security-issues/
    ├── api-issues/
    ├── integration-issues/
    ├── logic-errors/
    ├── developer-experience/
    ├── configuration-issues/
    ├── documentation-gaps/
    ├── data-issues/
    └── patterns/
        ├── common-solutions.md
        └── ol-critical-patterns.md
```

## The Compounding Philosophy

> Each documented solution compounds your team's knowledge.
> The first time you solve a problem takes research.
> Document it, and the next occurrence takes minutes.
> Knowledge compounds.

**Each unit of engineering work should make subsequent units of work easier—not harder.**
