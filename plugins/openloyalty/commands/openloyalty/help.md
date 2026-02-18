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
| `/openloyalty:setup` | Full onboarding: installs compound-engineering plugin, configures MCP servers in user scope |
| `/openloyalty:review-pr` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/openloyalty:jira-ticket-breakdown` | Break down features/epics into Jira hierarchy (Epic > Tasks > Subtasks) with FE/BE split |
| `/openloyalty:help` | Show available commands and plugin documentation |

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

- **Required by:** `/openloyalty:jira-ticket-breakdown`
- **Optional for:** `/openloyalty:review-pr` (degrades gracefully without Jira)

Authentication is handled through Claude's native Atlassian OAuth — no API tokens needed.


