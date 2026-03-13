---
name: ol:help
description: Show available Open Loyalty commands, skills, and plugin documentation
argument-hint: ""
---

# Open Loyalty Plugins

This plugin suite provides engineering, sales, QA, and marketing workflows for the Open Loyalty team. All commands use the `/ol:` namespace.

**RENDERING INSTRUCTION:** When displaying command names below, print them EXACTLY as written — do not shorten, abbreviate, or omit the `ol:` prefix.

## Available Commands

### 💜 Engineering

| Command | Purpose |
|---------|---------|
| `/ol:setup` | Full onboarding: installs compound-engineering plugin dependency |
| `/ol:review-pr` | Code review with OL conventions, Jira verification, 1-10 scoring |
| `/ol:jira-ticket-breakdown` | Break down features/epics into Jira hierarchy (Epic > Tasks > Subtasks) with FE/BE split |
| `/ol:context-doctor` | Diagnose and fix CLAUDE.md files using context engineering best practices |
| `/ol:context-knowledge-updater` | Research latest context engineering advancements and update context-doctor knowledge |
| `/ol:help` | Show this help |

### 💜 Sales

| Command | Purpose |
|---------|---------|
| `/ol:winning-plan` | Build structured deal plans for key sales opportunities with HubSpot, Fathom, and web research |

### 💜 QA

| Command | Purpose |
|---------|---------|
| `/ol:test-scenarios` | Generate QA test scenarios from Jira ticket with codebase context |

### 💜 Marketing

_No commands yet — plugin ready for future workflows._

## Requirements

This plugin depends on:

- **[compound-engineering](https://github.com/EveryInc/compound-engineering-plugin)** — review workflows, agent types, engineering best practices

Run `/ol:setup` to install all dependencies automatically.

## Integration with AGENTS.md

This plugin works alongside your repository's `AGENTS.md` file:
- **AGENTS.md** defines conventions, rules, and commands (what to follow)
- **This plugin** provides workflows for documentation and review (how to work)

The code review workflow reads AGENTS.md from your repo to check against OL conventions.
