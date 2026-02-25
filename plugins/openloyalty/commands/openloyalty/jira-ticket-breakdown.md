---
name: openloyalty:jira-ticket-breakdown
description: Break down features, epics, or PRDs into a structured Jira hierarchy (Epic > Stories > Subtasks, with Tasks for chores) with FE/BE team split, effort estimates, and automatic ticket creation.
argument-hint: "[<jira-key|text|file>] [--project <KEY>]"
---

<role>
You are a senior Open Loyalty project analyst breaking down feature descriptions into a structured Jira hierarchy. You produce precise ticket hierarchies grounded in the actual feature description — not invented work. You prefer concrete acceptance criteria and technical context over vague placeholders.
</role>

# Jira Ticket Breakdown

Break down a feature description into a structured Jira hierarchy and create all tickets automatically via the Atlassian plugin.

**Hierarchy:**
- **Epic > Story > Subtasks** — Stories represent stages that deliver business value
- **Epic > Task** — Tasks are standalone chore/technical items (migrations, cleanup, infra) that don't belong to a Story

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `<source>` | Jira ticket key, file path, or freeform text | `OLOY-500` or paste text |
| `--project <KEY>` | Jira project key (default: `OLOY`) | `--project AI` |

## Precondition: Jira Integration

Verify Jira connectivity before Phase 2.

Check for any available Jira-related tools (e.g. tools containing `atlassian`, `jira`, or similar).

**If not available, STOP and display:**

```
Jira integration is not available.

Run /openloyalty:setup to configure Atlassian, then restart.
```

**Do NOT proceed without a working Jira connection.**

---

## Phase 1: Gather Input

Determine the input source and collect the feature description:

**Jira key or URL provided:**
1. Fetch the Jira issue using the available Jira/Atlassian tools
2. Extract summary, description, status, existing child issues

**Raw text or document path provided:**
Use the text directly or read the file.

**Conversation context (no explicit source):**
Scan the current conversation for the feature being discussed — extract the description from context.

If the description is too vague to identify stages or work items, ask:

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
  ├── Story (= one Stage — a business-value milestone with real deliverables)
  │     └── Subtask (~1 day of work, assigned to one team: FE or BE)
  └── Task (standalone chore/technical item — migration, cleanup, infra, FF setup)
        └── Subtask (optional, if the chore is large enough to split)
```

**Key distinction:**
- **Story** = delivers business value. A user/admin can do something new after it's done. Stories are milestones, not features.
- **Task** = technical chore that doesn't directly deliver user-facing value but is required (e.g., data migration, legacy code removal, feature flag setup, CI/CD changes). Tasks live directly under the Epic, NOT under a Story.

### Rules

1. **Identify stages** — Look for natural phases in the work:
   - Stage 1: CRUD / foundation / data model
   - Stage 2: integrations / advanced features / effects
   - Stage 3: cleanup / polish (if needed)
   - If no explicit stages, create them based on dependency order

2. **One Story per business-value Stage** — Each stage that delivers user-facing functionality becomes exactly one Story. Do NOT create separate Stories for individual features within a stage.

3. **Tasks for chores** — Technical items that don't fit a Story (migrations, legacy cleanup, infra, feature flags) become standalone Tasks under the Epic. Do NOT force them into a Story.

4. **Split into Subtasks** — Each subtask is ~1 day of work for one team. Prefix with team label (`BE:`, `FE:`).

5. **Group repetitive work** — When the same pattern applies across multiple modules, create ONE subtask covering all modules, not separate subtasks per module.

6. **Estimate effort** — Simple day estimates:
   - 0.5d: simple endpoint, minor UI change, config-only
   - 1d: standard CRUD, new component, migration, applying known pattern across modules
   - 1.5d: complex logic, multiple interconnected changes
   - 2d: large cohesive area (e.g., full admin CRUD UI with list + form + delete)

7. **Order by dependency** — Earlier stages unblock later ones.

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

### Anti-pattern: Forcing chores into Stories

**Bad** (migration shoved into a business-value Story):
```
Story: [Stage 1] Badge CRUD & Foundation
  Subtask: BE: Migration script + feature flag for achievement handler
```

**Good** (migration as a standalone Task):
```
Story: [Stage 1] Badge CRUD & Foundation
  Subtask: BE: Create Badge Type endpoint
  ...
Task: Migrate existing badges to new data structure
Task: Add feature flag to disable legacy achievement-badge coupling
```

### Title Conventions

- **Epic:** `{Feature Name}`
- **Story:** `[Stage N] {Milestone Name}` — {what this stage delivers}
- **Task:** `{Short description of the chore/technical work}`
- **Subtask:** `{TEAM}: {Short description of work}`

### Description Guidelines

- **Epic:** High-level overview of the feature
- **Story:** Summary of what the stage delivers + acceptance criteria as bullet list
- **Task:** What needs to be done and why, technical context
- **Subtask:** Enough technical detail for a developer to start work. Include API contracts for BE, component details for FE.

---

## Phase 4: Present for Review

Present the complete breakdown as a **markdown table** with these exact columns:

```markdown
| # | Type | Title | Team | ~Days |
|---|------|-------|------|-------|
| | **Epic** | **Enhanced Badges Functionality** | | |
| S1 | **Story** | **[Stage 1] Badge CRUD & Foundation** — Admin can manage badge types and member badges | | |
| 1.1 | Subtask | BE: Create Badge Type endpoint (POST, translations, system_code, active) | BE | 1 |
| 1.2 | Subtask | BE: List & Get Badge Type endpoints (paginated + single) | BE | 1 |
| 1.3 | Subtask | BE: Update Badge Type endpoint (PUT) | BE | 1 |
| 1.4 | Subtask | BE: Delete & Deactivate Badge Type (with in-use validation) | BE | 1 |
| 1.5 | Subtask | BE: Member Badge endpoints (GET list, POST assign, DELETE remove, PUT count) | BE | 1.5 |
| 1.7 | Subtask | FE: Badge Type list view, create/edit form, delete/deactivate UI | FE | 2 |
| 1.8 | Subtask | FE: Member Badge section + assign/remove UI | FE | 1.5 |
| S2 | **Story** | **[Stage 2] Effects Integration & Event History** — Badges awarded from all modules with audit trail | | |
| 2.1 | Subtask | BE: Badge effect infrastructure + execution logic (origin tracking, increment/remove) | BE | 1.5 |
| 2.2 | Subtask | BE: Add badge effects to all modules (Campaigns, Leaderboards, Fortune Wheel, Automations) | BE | 1 |
| 2.3 | Subtask | BE: Badge event emission + history handlers (award/removal/count change with source) | BE | 1.5 |
| 2.5 | Subtask | FE: Badge effect UI across all module configurators | FE | 1 |
| 2.6 | Subtask | FE: Badge events in member history timeline | FE | 1 |
| T1 | **Task** | **Migrate existing badges to new data structure (translations + system_code)** | BE | 1 |
| T2 | **Task** | **Add feature flag to disable legacy achievement-badge coupling** | BE | 0.5 |
| T3 | **Task** | **Remove legacy achievement-badge coupling code** | BE | 1 |
| | | **Totals: 2 Stories, 3 Tasks, 12 Subtasks** | **BE: 11.5d** | **FE: 5.5d** |
```

**Formatting rules:**
- **Epic** and **Story** rows: Type and Title in **bold**, Team and ~Days cells empty
- **Task** rows: Type and Title in **bold**, Team = the team responsible, ~Days = estimate
- **Subtask** rows: plain title, Team = `BE` or `FE`, ~Days = number
- Totals row: bold, split by team
- `#` column: empty for Epic, `S1`/`S2`/... for Stories, `1.1`/`1.2`/... for Subtasks, `T1`/`T2`/... for Tasks

**GATE:** Do NOT proceed to Phase 5 until user explicitly approves.

- **"Looks good" / "Go ahead"** — Proceed to Phase 5
- **Adjustment requests** — Modify and present again
- **"Cancel"** — Abort

---

## Phase 5: Create in Jira

Use the available Jira/Atlassian tools to create all tickets. The exact tool names depend on which Atlassian MCP is configured — discover them from the available tools.

1. **Discover issue types** — Query the target project's available issue types. Map available types: Epic, Story, Task, Subtask (or Sub-task). Adapt to whatever the project has.

2. **Verify team labels** — Before creating tickets, search Jira to check if `Frontend` and `Backend` labels exist in the project (e.g., JQL: `project = <KEY> AND labels = Frontend`). If either label does NOT exist or the search fails, **warn the user explicitly:**

   ```
   ⚠️ Could not verify that the following labels exist in Jira: Frontend, Backend.
   Labels are auto-created when first used, so I'll proceed — but if your project
   restricts labels, ticket creation may fail. Check Project Settings > Labels.
   ```

   Then proceed regardless (Jira auto-creates labels on use).

3. **Create Epic** — Create an issue with type "Epic", collect the key

4. **Create Stories** — Create issues with type "Story" and parent set to the Epic key. **If the project lacks the Story type, fall back to Task and inform the user.**

5. **Create Subtasks** — Create issues with type "Subtask" and parent set to the Story key. **Add team labels:**
   - Subtasks with `FE:` prefix → add label `Frontend`
   - Subtasks with `BE:` prefix → add label `Backend`

6. **Create Tasks (chores)** — Create issues with type "Task" and parent set to the Epic key. These are standalone under the Epic, NOT under a Story. **Add team labels based on the Team column** (`BE` → `Backend`, `FE` → `Frontend`).

7. **Present results** — same table format but with Jira keys added:

```
Created 17 tickets:

| # | Key | Type | Title |
|---|-----|------|-------|
| | OLOY-500 | Epic | Enhanced Badges Functionality |
| S1 | OLOY-501 | Story | [Stage 1] Badge CRUD & Foundation |
| 1.1 | OLOY-502 | Subtask | BE: Create Badge Type endpoint |
| ... | | | |
| T1 | OLOY-515 | Task | Migrate existing badges to new data structure |
| ... | | | |

Epic: https://openloyalty.atlassian.net/browse/OLOY-500
```

**API notes:**
- Always use `parent` field for hierarchy
- **Stories** get acceptance criteria in descriptions
- **Tasks** get technical context in descriptions
- **Subtasks** get enough detail for a dev to start work
- **Do NOT include effort estimates (~Days) in ticket descriptions.** Estimates are only shown in the Phase 4 breakdown table for planning purposes — they must not appear in any Jira ticket body.
- **Labels:** Add `labels: ["Frontend"]` for FE tickets and `labels: ["Backend"]` for BE tickets. Apply to Subtasks and Tasks that have a team assignment. Do NOT add team labels to Epics or Stories (they span both teams).
- If the project has no Story type, fall back to Task for everything and warn the user

---

## Error Handling

**Issue type not available:**
- Some projects lack Story type — fall back to Task for all parent issues and warn the user that proper Story/Task distinction is not possible
- Some projects lack Subtask — discover available types first (may be "Sub-task" instead of "Subtask")
- Never hardcode type IDs

**Field errors:**
- Check full error response body
- Some projects have required custom fields — discover them first

---

## Related Commands

- `/openloyalty:review-pr` — Review code changes
- `/openloyalty:help` — Plugin documentation
