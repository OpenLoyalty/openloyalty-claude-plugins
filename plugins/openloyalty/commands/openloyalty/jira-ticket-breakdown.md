---
name: openloyalty:jira-ticket-breakdown
description: Break down large feature descriptions, epics, or PRDs into a structured Jira hierarchy (Epic, Stories/Tasks, Subtasks) and create tickets via Jira Cloud API.
argument-hint: "[<jira-url|text>] [--project <KEY>]"
---

# Jira Ticket Breakdown

Break down a large feature description into a structured Jira hierarchy (Epic, Stories, Subtasks) and create all tickets automatically.

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `<source>` | Jira ticket URL, file path, or freeform text describing the feature | `OLOY-500` or paste text |
| `--project <KEY>` | Jira project key (default: detect from source or ask) | `--project OLOY` |

## Precondition: Atlassian Plugin Required

**BLOCKING:** This command requires the official Atlassian plugin (`atlassian@claude-plugins-official`).

Before proceeding, verify the Atlassian plugin is available by checking for `mcp__plugin_atlassian_atlassian__getJiraIssue` in the available tools.

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

## Phase 1: Gather Input

Determine the input source and collect the description:

**Jira URL or key provided:**
1. Use `mcp__plugin_atlassian_atlassian__getJiraIssue` to fetch the ticket
2. Extract summary, description, status, existing child issues

**Raw text or document path provided:**
Use the text directly or read the file as the feature description.

**BLOCKING REQUIREMENT:** If the description is too vague to identify stages or work items, ask for clarification:

```
The description is too high-level to break down. I need:

1. What are the main deliverables?
2. Are there natural phases (e.g., foundation first, then integrations)?
3. Which teams are involved? (default: FE + BE)
```

---

## Phase 2: Clarify Structure

Ask the user for project configuration:

1. **Target Jira project key** — Where to create tickets (e.g., "AI", "OLOY")
2. **Structure** — Epic with child Stories, or standalone Tasks?
3. **Team split** — Default FE/BE. Allow custom (e.g., FE/BE/Mobile, BE-only).
4. **Review first?** — Default to review first. Always recommended.

---

## Phase 3: Analyze and Break Down

### Hierarchy

```
Epic (the big feature/initiative)
  └── Story/Task (= one Stage of the epic, a milestone with real deliverables)
        └── Subtask (1-day unit of work, assigned to one team: FE or BE)
```

### Rules

1. **Identify stages** — Look for natural phases (foundation, integration, cleanup).
   - Stage 1 typically covers CRUD / foundation / data model / migration
   - Stage 2 covers integrations / advanced features / effects
   - Stage 3 covers cleanup / polish / legacy removal (if needed)
   - If the description doesn't have explicit stages, create them based on dependency order
2. **One Story per Stage** — Each stage becomes exactly one Story. Do NOT create separate stories for individual features within a stage. Stories are milestones, not features.
3. **Split into Subtasks** — Each subtask is ~1 day of work for one team. Prefix with team label (`BE:`, `FE:`).
4. **Group repetitive work** — When the same pattern applies across multiple modules, create ONE subtask covering all modules, not separate subtasks per module.
5. **Estimate effort** — Simple day estimates: 0.5d (simple endpoint/minor UI), 1d (standard CRUD/new component), 1.5d (complex logic/multiple changes).
6. **Order by dependency** — Earlier stages unblock later ones.

### Anti-pattern: Over-splitting

**Bad** (too granular — same pattern repeated per module):
- BE: Add badge effect to Campaigns (0.5d)
- BE: Add badge effect to Leaderboards (0.5d)
- BE: Add badge effect to Fortune Wheel (0.5d)

**Good** (properly grouped):
- BE: Badge effect infrastructure and execution logic (1d)
- BE: Add badge effects to all modules (Campaigns, Leaderboards, Fortune Wheel, Automations) (1d)

---

## Phase 4: Present for Review

Present the complete breakdown as a **single flat table**:

```markdown
| # | Type | Title | Team | ~Days |
|---|------|-------|------|-------|
| | **Epic** | **Epic Title** | | |
| S1 | **Task** | **[Stage 1] Milestone Name** — what this stage delivers | | |
| 1.1 | Subtask | BE: Subtask description | BE | 1 |
| 1.2 | Subtask | FE: Subtask description | FE | 1 |
| S2 | **Task** | **[Stage 2] Milestone Name** — what this stage delivers | | |
| 2.1 | Subtask | BE: Subtask description | BE | 1 |
| ... | | | | |
| | | **Totals: N Stories, M Subtasks** | **BE: Xd** | **FE: Yd** |
```

Include totals at the bottom: stories, BE subtasks, FE subtasks, BE days, FE days.

**GATE ENFORCEMENT:** Do NOT proceed to Phase 5 until user explicitly approves. Handle feedback:

- **"Looks good" / "Go ahead"** — Proceed to Phase 5
- **Adjustment requests** — Modify the breakdown and present again
- **"Cancel"** — Abort without creating tickets

---

## Phase 5: Create in Jira

**Sequence:**

1. **Get accessible resources** — Use `mcp__plugin_atlassian_atlassian__getAccessibleAtlassianResources` to get the cloud ID

2. **Create Epic** — Use `mcp__plugin_atlassian_atlassian__createJiraIssue` with `issueTypeName: "Epic"`, collect key

3. **Create Stories/Tasks** — Use `mcp__plugin_atlassian_atlassian__createJiraIssue` with `parent: "EPIC-KEY"`, collect keys

4. **Create Subtasks** — Use `mcp__plugin_atlassian_atlassian__createJiraIssue` with `issueTypeName: "Subtask"` and `parent: "STORY-KEY"`

5. **Present results** as a complete table mapping # to created Jira keys:

```
Created {N} tickets:

 #    Key        Type      Title
 -    OLOY-500   Epic      Enhanced Badges Functionality
 S1   OLOY-501   Story     [Stage 1] Badge CRUD & Foundation
 1.1  OLOY-502   Subtask   BE: Create Badge Type endpoint
 1.2  OLOY-503   Subtask   FE: Badge Type list view
 ...

Epic: https://openloyalty.atlassian.net/browse/OLOY-500
```

**Critical API notes:**
- Always use `parent` field for hierarchy
- Use markdown format for descriptions (set `contentFormat: "markdown"` is not needed — description field accepts markdown)
- Include acceptance criteria as bullet list in Story descriptions
- Subtask descriptions should have enough detail for a developer to start work

---

## Error Handling

**Issue type not available:**
- Some projects lack Story type — use Task instead
- Some projects lack Subtask — use Sub-task or check exact name via API
- Use `mcp__plugin_atlassian_atlassian__getJiraProjectIssueTypesMetadata` to discover available types

**Field cannot be set:**
- Check full error response body for details
- Some projects have required custom fields — discover them first

---

## Related Commands

- `/openloyalty:jira-ticket-create` — Create individual tickets from a session (not hierarchical breakdown)
- `/openloyalty:backend-pr-create` — Create a PR linked to a Jira ticket
- `/openloyalty:help` — Plugin documentation
