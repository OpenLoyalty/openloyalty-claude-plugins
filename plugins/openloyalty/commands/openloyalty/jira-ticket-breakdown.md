---
name: openloyalty:jira-ticket-breakdown
description: Break down features, epics, or PRDs into a structured Jira hierarchy (Epic > Tasks > Subtasks) with FE/BE team split, effort estimates, and automatic ticket creation.
argument-hint: "[<jira-key|text|file>] [--project <KEY>]"
---

# Jira Ticket Breakdown

Break down a feature description into a structured Jira hierarchy (Epic > Tasks > Subtasks) and create all tickets automatically via the Atlassian plugin.

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `<source>` | Jira ticket key, file path, or freeform text | `OLOY-500` or paste text |
| `--project <KEY>` | Jira project key (default: `OLOY`) | `--project AI` |

## Precondition: Atlassian Plugin

**BLOCKING:** Verify the Atlassian plugin is connected before doing anything else.

Check for `mcp__plugin_atlassian_atlassian__getJiraIssue` in available tools.

**If not available, STOP and display:**

```
Atlassian plugin is not installed.

Install it:
  /plugin install atlassian@claude-plugins-official

Then restart Claude Code and run /openloyalty:setup to configure.
```

**Do NOT proceed without a working Atlassian plugin connection.**

---

## Phase 1: Gather Input

Determine the input source and collect the feature description:

**Jira key or URL provided:**
1. Use `mcp__plugin_atlassian_atlassian__getJiraIssue` to fetch the ticket
2. Extract summary, description, status, existing child issues

**Raw text or document path provided:**
Use the text directly or read the file.

**Conversation context (no explicit source):**
Scan the current conversation for the feature being discussed — extract the description from context.

**BLOCKING:** If the description is too vague to identify stages or work items, ask:

```
The description is too high-level to break down. I need:

1. What are the main deliverables?
2. Are there natural phases (e.g., foundation first, then integrations)?
3. Which teams are involved? (default: FE + BE)
```

---

## Phase 2: Clarify Configuration

Ask the user to confirm before proceeding:

1. **Project key** — Default `OLOY`. Ask: "Creating tickets in **OLOY** — want a different project?"
2. **Team split** — Default FE + BE. Ask what teams are involved (e.g., FE/BE, BE-only, FE/BE/Mobile).

Keep it brief — one confirmation question, not a questionnaire.

---

## Phase 3: Analyze and Break Down

### Hierarchy

```
Epic (the feature/initiative)
  └── Task (= one Stage — a milestone with real deliverables)
        └── Subtask (~1 day of work, assigned to one team: FE or BE)
```

### Rules

1. **Identify stages** — Look for natural phases in the work:
   - Stage 1: CRUD / foundation / data model / migration
   - Stage 2: integrations / advanced features / effects
   - Stage 3: cleanup / polish / legacy removal (if needed)
   - If no explicit stages, create them based on dependency order

2. **One Task per Stage** — Each stage becomes exactly one Task. Do NOT create separate Tasks for individual features within a stage. Tasks are milestones, not features.

3. **Split into Subtasks** — Each subtask is ~1 day of work for one team. Prefix with team label (`BE:`, `FE:`).

4. **Group repetitive work** — When the same pattern applies across multiple modules, create ONE subtask covering all modules, not separate subtasks per module.

5. **Estimate effort** — Simple day estimates:
   - 0.5d: simple endpoint, minor UI change, config-only
   - 1d: standard CRUD, new component, migration, applying known pattern across modules
   - 1.5d: complex logic, multiple interconnected changes
   - 2d: large cohesive area (e.g., full admin CRUD UI with list + form + delete)

6. **Order by dependency** — Earlier stages unblock later ones.

### Anti-pattern: Over-splitting

**Bad** (same pattern repeated per module):
```
BE: Add badge effect to Campaigns (0.5d)
BE: Add badge effect to Leaderboards (0.5d)
BE: Add badge effect to Fortune Wheel (0.5d)
BE: Add badge effect to Automations (0.5d)
```

**Good** (properly grouped):
```
BE: Badge effect infrastructure and execution logic (1d)
BE: Add badge effects to all modules (Campaigns, Leaderboards, Fortune Wheel, Automations) (1d)
```

### Title Conventions

- **Epic:** `{Feature Name}`
- **Task:** `[Stage N] {Milestone Name}` — {what this stage delivers}
- **Subtask:** `{TEAM}: {Short description of work}`

### Description Guidelines

- **Epic:** High-level overview of the feature
- **Task:** Summary of what the stage delivers + acceptance criteria as bullet list
- **Subtask:** Enough technical detail for a developer to start work. Include API contracts for BE, component details for FE.

---

## Phase 4: Present for Review

Present the complete breakdown as a **markdown table** with these exact columns:

```markdown
| # | Type | Title | Team | ~Days |
|---|------|-------|------|-------|
| | Epic | **Enhanced Badges Functionality** | | |
| S1 | Task | **[Stage 1] Badge CRUD & Foundation** — Admin can manage badge types and member badges | | |
| 1.1 | Subtask | BE: Create Badge Type endpoint (POST, translations, system_code, active) | BE | 1 |
| 1.2 | Subtask | BE: List & Get Badge Type endpoints (paginated + single) | BE | 1 |
| 1.3 | Subtask | BE: Update Badge Type endpoint (PUT) | BE | 1 |
| 1.4 | Subtask | BE: Delete & Deactivate Badge Type (with in-use validation) | BE | 1 |
| 1.5 | Subtask | BE: Member Badge endpoints (GET list, POST assign, DELETE remove, PUT count) | BE | 1.5 |
| 1.6 | Subtask | BE: Migration script + feature flag for achievement handler | BE | 1 |
| 1.7 | Subtask | FE: Badge Type list view, create/edit form, delete/deactivate UI | FE | 2 |
| 1.8 | Subtask | FE: Member Badge section + assign/remove UI | FE | 1.5 |
| S2 | Task | **[Stage 2] Effects Integration & Event History** — Badges awarded from all modules with audit trail | | |
| 2.1 | Subtask | BE: Badge effect infrastructure + execution logic (origin tracking, increment/remove) | BE | 1.5 |
| 2.2 | Subtask | BE: Add badge effects to all modules (Campaigns, Leaderboards, Fortune Wheel, Automations) | BE | 1 |
| 2.3 | Subtask | BE: Badge event emission + history handlers (award/removal/count change with source) | BE | 1.5 |
| 2.4 | Subtask | BE: Remove legacy achievement-badge coupling | BE | 1 |
| 2.5 | Subtask | FE: Badge effect UI across all module configurators | FE | 1 |
| 2.6 | Subtask | FE: Badge events in member history timeline | FE | 1 |
| | | **Totals: 2 Tasks, 14 Subtasks** | **BE: 11.5d** | **FE: 5.5d** |
```

**Formatting rules:**
- Epic and Task rows: Title in **bold**, Team and ~Days cells empty
- Subtask rows: plain title, Team = `BE` or `FE`, ~Days = number
- Totals row: bold, split by team
- `#` column: empty for Epic, `S1`/`S2`/... for Tasks, `1.1`/`1.2`/... for Subtasks

**GATE:** Do NOT proceed to Phase 5 until user explicitly approves.

- **"Looks good" / "Go ahead"** — Proceed to Phase 5
- **Adjustment requests** — Modify and present again
- **"Cancel"** — Abort

---

## Phase 5: Create in Jira

1. **Get cloud ID** — `mcp__plugin_atlassian_atlassian__getAccessibleAtlassianResources`

2. **Discover issue types** — `mcp__plugin_atlassian_atlassian__getJiraProjectIssueTypesMetadata` for the target project. Map available types: Epic, Task (or Story), Subtask (or Sub-task). Adapt to whatever the project has.

3. **Create Epic** — `mcp__plugin_atlassian_atlassian__createJiraIssue` with `issueTypeName: "Epic"`, collect key

4. **Create Tasks** — `mcp__plugin_atlassian_atlassian__createJiraIssue` with `parent: "EPIC-KEY"`, collect keys

5. **Create Subtasks** — `mcp__plugin_atlassian_atlassian__createJiraIssue` with `issueTypeName: "Subtask"` and `parent: "TASK-KEY"`

6. **Present results** — same table format but with Jira keys added:

```
Created 16 tickets:

| # | Key | Type | Title |
|---|-----|------|-------|
| | OLOY-500 | Epic | Enhanced Badges Functionality |
| S1 | OLOY-501 | Task | [Stage 1] Badge CRUD & Foundation |
| 1.1 | OLOY-502 | Subtask | BE: Create Badge Type endpoint |
| ... | | | |

Epic: https://openloyalty.atlassian.net/browse/OLOY-500
```

**API notes:**
- Always use `parent` field for hierarchy
- Include acceptance criteria in Task descriptions
- Subtask descriptions: enough detail for a dev to start work

---

## Error Handling

**Issue type not available:**
- Some projects lack Story — use Task instead
- Some projects lack Subtask — check exact name via `getJiraProjectIssueTypesMetadata`
- Never hardcode type IDs

**Field errors:**
- Check full error response body
- Some projects have required custom fields — discover them first

---

## Related Commands

- `/openloyalty:backend-pr-create` — Create a PR linked to a Jira ticket
- `/openloyalty:review-pr` — Review code changes
- `/openloyalty:help` — Plugin documentation
