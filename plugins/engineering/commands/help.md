---
name: engineering:help
description: Show available Open Loyalty engineering commands and plugin documentation
argument-hint: ""
---

# Open Loyalty Engineering Plugin

This plugin provides engineering workflows for the Open Loyalty development team.

## Available Commands

| Command | Purpose |
|---------|---------|
| `/engineering:setup` | Full onboarding: installs compound-engineering plugin dependency |
| `/engineering:review-pr` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/engineering:jira-ticket-breakdown` | Break down features/epics into Jira hierarchy (Epic > Tasks > Subtasks) with FE/BE split |
| `/engineering:migrate` | Remove legacy Open Loyalty MCP server configuration from user scope |
| `/engineering:help` | Show available commands and plugin documentation |

## Skills

| Skill | Purpose |
|-------|---------|
| `context-doctor` | Diagnose and fix CLAUDE.md files using context engineering best practices |
| `context-knowledge-updater` | Research latest context engineering advancements and update context-doctor knowledge |

## Requirements

This plugin depends on:

- **[compound-engineering](https://github.com/EveryInc/compound-engineering-plugin)** — review workflows, agent types, engineering best practices

Run `/engineering:setup` to install all dependencies automatically.

## Integration with AGENTS.md

This plugin works alongside your repository's `AGENTS.md` file:
- **AGENTS.md** defines conventions, rules, and commands (what to follow)
- **This plugin** provides workflows for documentation and review (how to work)

The code review workflow reads AGENTS.md from your repo to check against OL conventions.
