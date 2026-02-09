---
name: openloyalty:help
description: Show available Open Loyalty engineering commands and plugin documentation
argument-hint: ""
---

# Open Loyalty Engineering Plugin

This plugin provides engineering workflows for the Open Loyalty development team.

## Available Commands

| Command | Purpose |
|---------|---------|
| `/openloyalty:compound` | Document solved problems with validated YAML schema |
| `/openloyalty:review` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/openloyalty:backend-pr-create` | Create backend PR with OL conventions and Jira linking |
| `/openloyalty:jira-ticket-create` | Create Jira tickets from brainstorming/planning sessions (requires Atlassian MCP) |
| `/openloyalty:help` | Show this help |

## Compound Learning System

The `/openloyalty:compound` command captures solved problems to build searchable institutional knowledge.

### Features

- **Parallel Subagents:** 6 agents gather context simultaneously for fast capture
- **YAML Schema Validation:** Enum-validated frontmatter ensures consistent categorization
- **Category-Based Organization:** Documents auto-sorted by problem type
- **Critical Pattern Promotion:** Elevate recurring issues to "Required Reading"
- **Cross-Referencing:** Automatic linking of related issues

### Usage

```bash
/openloyalty:compound                     # Document from current context
/openloyalty:compound [branch]            # Analyze specific branch
/openloyalty:compound --ticket OLOY-123   # Include Jira context
/openloyalty:compound --slack <url>       # Include Slack thread
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

## Integration with AGENTS.md

This plugin works alongside your repository's `AGENTS.md` file:
- **AGENTS.md** defines conventions, rules, and commands (what to follow)
- **This plugin** provides workflows for documentation and review (how to work)

The code review workflow reads AGENTS.md from your repo to check against OL conventions.

## Jira Integration

This plugin bundles the [mcp-atlassian](https://github.com/sooperset/mcp-atlassian) MCP server as a dependency. When configured, it enables:
- Creating Jira tickets from brainstorming sessions (`/openloyalty:jira-ticket-create`)
- Fetching ticket details from branch name patterns (e.g., `OLOY-123`)
- Extracting context from ticket description and comments
- Linking compound learnings to tickets

Run `/openloyalty:setup` to configure your Atlassian credentials.

Some commands (like `/openloyalty:compound` and `/openloyalty:review`) work without Jira and gracefully degrade to git + code analysis only. The `/openloyalty:jira-ticket-create` command **requires** Atlassian MCP.

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
