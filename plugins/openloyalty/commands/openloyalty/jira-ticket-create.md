---
name: openloyalty:jira-ticket-create
description: Create Jira tickets from a brainstorming or planning session with OL conventions.
argument-hint: "[--project <OLOY>] [--type <story|bug|task>] [--epic <OLOY-XXX>]"
---

# Jira Ticket Create

Turn a brainstorming or planning session into structured Jira tickets. Extracts actionable items from the conversation, groups them into tickets, and creates them in bulk after user approval.

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--project <KEY>` | Jira project key (default: `OLOY`) | `--project OLOY` |
| `--type <type>` | Force issue type for all tickets: `story`, `bug`, `task` | `--type story` |
| `--epic <ID>` | Link all tickets to an existing epic | `--epic OLOY-100` |

## Precondition: Atlassian Plugin Required

**BLOCKING:** This command requires the official Atlassian plugin (`atlassian@claude-plugins-official`).

Before proceeding, verify the Atlassian plugin is available by checking for `mcp__claude_ai_Atlassian__getJiraIssue` in the available tools.

**If not available, STOP and display:**

```
Atlassian plugin is not installed.

This command requires the official Atlassian plugin to create Jira tickets.

Install it:
  /plugin install atlassian@claude-plugins-official

Then restart Claude Code and run /openloyalty:setup to configure.
```

**Do NOT proceed without a working Atlassian plugin connection.**

---

## Phase 1: Extract Tickets from Conversation

Analyze the full conversation history to identify distinct actionable items.

### Step 1: Scan Conversation

Review the entire conversation and extract:

1. **Distinct work items** — each feature, task, fix, or improvement discussed
2. **Context per item** — why it was discussed, what problem it solves
3. **Dependencies** — which items depend on or relate to each other
4. **Priorities discussed** — any urgency or ordering mentioned
5. **Related tickets** — any `OLOY-\d+` references mentioned

**Grouping rules:**
- One ticket per distinct deliverable (not per conversation message)
- Merge duplicates or variations of the same idea
- Split items that are too large into logical sub-tickets
- Preserve the user's intent — don't invent work items not discussed

### Step 2: Fetch Jira Project Metadata

```
Task: general-purpose
Prompt: |
  Fetch Jira project metadata for: {project_key}

  Steps:
  1. Use mcp__claude_ai_Atlassian__searchJiraIssuesUsingJql with jql="project = {project_key} ORDER BY created DESC" to understand recent issue patterns
  2. Use mcp__claude_ai_Atlassian__getJiraIssueTypeMetaWithFields to discover available fields
  3. Extract:
     - Available issue types
     - Available priorities
     - Custom fields relevant to OL (story points, team, sprint, etc.)
  4. Return structured metadata
```

## Phase 2: Build Ticket List

For each extracted work item, construct ticket fields.

### Issue Type Selection

If `--type` not provided, infer per ticket from context:

| Context Signal | Inferred Type |
|----------------|---------------|
| Error messages, "bug", "fix", "broken" | `bug` |
| "Add", "implement", "feature", "new" | `story` |
| "Refactor", "update", "chore", "cleanup" | `task` |

### Title Format

```
[{Module}] {Concise summary in imperative mood}
```

Examples:
- `[Points] Add batch transfer endpoint for bulk operations`
- `[Campaigns] Fix reward calculation for tiered discounts`

### Description Template

```markdown
## Summary

{1-3 sentences describing the issue/feature}

## Context

{Background and motivation — why is this needed?}

## Acceptance Criteria

- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] {Criterion 3}

## Technical Notes

{Implementation hints, affected modules, architectural considerations}

## Related

- {Links to related tickets or dependencies from this batch}
```

### Fields per Ticket

| Field | Source | Default |
|-------|--------|---------|
| Project | `--project` flag | `OLOY` |
| Issue Type | `--type` flag or inferred per ticket | `task` |
| Summary | Generated title | — |
| Description | Generated from template | — |
| Epic Link | `--epic` flag | None |
| Priority | Inferred from context | `Medium` |

## Phase 3: Review & Create

### Step 1: Present Ticket List Preview

Show all extracted tickets in a numbered table for review:

```
Found {N} tickets from this session:

 #  Type    Priority  Title
 1  story   High      [Points] Add batch transfer endpoint
 2  task    Medium    [API] Define OpenAPI schema for transfers
 3  story   Medium    [Campaigns] Support tiered reward rules
 4  task    Low       [Docs] Document new transfer API

Epic: {epic_id or "None"}
Project: {project_key}

What's next?
1. Create all tickets (recommended)
2. Review a ticket in detail — enter ticket number (e.g., "2")
3. Remove a ticket — enter "remove N"
4. Edit a ticket — enter "edit N"
5. Add a ticket — describe the missing item
6. Cancel
```

**WAIT for user response before proceeding.**

**Handle responses:**

- **Option 1:** Proceed to Step 2
- **Option 2:** Show full title + description for the selected ticket, then return to this menu
- **Option 3:** Remove the ticket from the list, then return to this menu
- **Option 4:** Ask what to change, update the ticket, then return to this menu
- **Option 5:** Ask user to describe the item, build a new ticket, add to list, then return to this menu
- **Option 6:** Abort without creating anything

### Step 2: Create Tickets

After user confirms (Option 1), create tickets sequentially:

```
For each ticket in the list:
  Use mcp__claude_ai_Atlassian__createJiraIssue with:
    - project_key: {project_key}
    - issue_type: {issue_type}
    - summary: {title}
    - description: {description}
    - priority: {priority}
    - epic_key: {epic_id} (if provided)
```

### Step 3: Post-Creation Summary

After all tickets are created, show a summary:

```
Created {N} tickets:

 #  Key        Type    Title
 1  OLOY-501   story   [Points] Add batch transfer endpoint
 2  OLOY-502   task    [API] Define OpenAPI schema for transfers
 3  OLOY-503   story   [Campaigns] Support tiered reward rules
 4  OLOY-504   task    [Docs] Document new transfer API

What's next?
1. Done (recommended)
2. Link tickets as dependencies (e.g., "OLOY-502 blocks OLOY-501")
3. Create a branch for a ticket
```

## Related Commands

- `/openloyalty:backend-pr-create` - Create a PR linked to a Jira ticket
- `/openloyalty:review-pr` - Review code changes
- `/openloyalty:compound` - Document solved problems
- `/openloyalty:help` - Plugin documentation
