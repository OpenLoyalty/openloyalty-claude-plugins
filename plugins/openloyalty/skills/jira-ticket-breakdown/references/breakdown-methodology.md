# Ticket Breakdown Methodology

## Hierarchy

```
Epic (the big feature/initiative)
  └── Story/Task (= one Stage of the epic, a milestone with real deliverables)
        └── Subtask (1-day unit of work, assigned to one team: FE or BE)
```

## Story Guidelines

- **One Story per Stage** — each natural phase of the epic becomes a single Story. Do NOT create separate Stories for individual features within a stage. A Story is a milestone, not a feature.
- Stories track **business progress** — completing Stage 1 means the foundation is done, completing Stage 2 means integrations work, etc.
- Name format: `[Stage N] Descriptive Milestone Name`
- Include a summary of what the stage delivers in the description, plus acceptance criteria as bullet list.
- Stories should be ordered by dependency (Stage 1 before Stage 2).

### How to identify Stages

Look for natural phases in the description:
- Stage 1 typically covers CRUD / foundation / data model / migration
- Stage 2 covers integrations / advanced features / effects
- Stage 3 covers cleanup / polish / legacy removal (if needed, can be part of Stage 2)

If the description doesn't have explicit stages, create them based on dependency order: foundational work first, then features that build on it.

## Subtask Guidelines

- Each Subtask is a **~1 day unit of work** for a single team (FE or BE)
- Subtasks track **engineering progress**
- Name format: `{TEAM}: Short description of work` where TEAM is `BE` or `FE`
- Description should include enough technical detail for a developer to start work
- Include API contract details (endpoints, request/response shapes) for BE tasks
- Include UI component details for FE tasks
- If a subtask is larger than 1.5 days, split it further

## Anti-pattern: Over-splitting repetitive work

**CRITICAL:** When the same pattern is applied across multiple modules (e.g., adding an effect type to Campaigns, Leaderboards, Fortune Wheel, and Automations), do NOT create separate subtasks per module. Instead:

- Create ONE BE subtask for the core infrastructure + applying it across all modules
- Create ONE FE subtask for the UI across all module configurators

The rationale: once the pattern is built for the first module, applying it to others is incremental work within the same task. Splitting it creates artificial granularity that doesn't match how developers actually work.

**Bad example (too granular):**
- BE: Add badge effect to Campaigns (0.5d)
- BE: Add badge effect to Leaderboards (0.5d)
- BE: Add badge effect to Fortune Wheel (0.5d)
- BE: Add badge effect to Automations (0.5d)
- FE: Campaign badge effect UI (0.5d)
- FE: Leaderboard badge effect UI (0.5d)
- FE: Fortune Wheel badge effect UI (0.5d)
- FE: Automation badge effect UI (0.5d)

**Good example (properly grouped):**
- BE: Badge effect infrastructure and execution logic (1d)
- BE: Add badge effects to all modules (Campaigns, Leaderboards, Fortune Wheel, Automations) (1d)
- FE: Badge effect UI across all module configurators (1d)

## Effort Estimation

Use simple day estimates (0.5, 1, 1.5 days). These are rough guides, not commitments:
- **0.5 day**: Simple endpoint, minor UI change, config-only change
- **1 day**: Standard CRUD endpoint, new UI component, migration script, applying a known pattern to multiple modules
- **1.5 days**: Complex logic, multiple interconnected changes

## Breakdown Analysis Process

1. Read the full description carefully
2. Identify natural stages/phases in the work
3. Create one Story per stage
4. For each Story, identify all the BE and FE work needed
5. Group related or repetitive work into single subtasks — avoid over-splitting
6. Size each subtask for ~1 day, split only if clearly larger than 1.5 days
7. Present the full breakdown in a single table for review

## Reference Example: "Enhanced Badges Functionality"

Input: A large epic describing making Badges independent entities with own CRUD, translations, multi-source assignment (Campaigns, Leaderboards, Fortune Wheel, Automations), and event history. The description explicitly defined 2 stages: Stage 1 (CRUD) and Stage 2 (Effects Integration).

### Correct breakdown:

| # | Type | Title | Team | ~Days |
|---|------|-------|------|-------|
| | **Epic** | **Enhanced Badges Functionality** | | |
| S1 | **Task** | **[Stage 1] Badge CRUD & Foundation** — Admin can manage badge types and member badges | | |
| 1.1 | Subtask | BE: Create Badge Type endpoint (POST, translations, system_code, active) | BE | 1 |
| 1.2 | Subtask | BE: List & Get Badge Type endpoints (paginated + single) | BE | 1 |
| 1.3 | Subtask | BE: Update Badge Type endpoint (PUT) | BE | 1 |
| 1.4 | Subtask | BE: Delete & Deactivate Badge Type (with in-use validation) | BE | 1 |
| 1.5 | Subtask | BE: Member Badge endpoints (GET list, POST assign, DELETE remove, PUT count) | BE | 1.5 |
| 1.6 | Subtask | BE: Migration script + feature flag for achievement handler | BE | 1 |
| 1.7 | Subtask | FE: Badge Type list view, create/edit form, delete/deactivate UI | FE | 2 |
| 1.8 | Subtask | FE: Member Badge section + assign/remove UI | FE | 1.5 |
| S2 | **Task** | **[Stage 2] Effects Integration & Event History** — Badges awarded from all modules with audit trail | | |
| 2.1 | Subtask | BE: Badge effect infrastructure + execution logic (origin tracking, increment/remove) | BE | 1.5 |
| 2.2 | Subtask | BE: Add badge effects to all modules (Campaigns, Leaderboards, Fortune Wheel, Automations) | BE | 1 |
| 2.3 | Subtask | BE: Badge event emission + history handlers (award/removal/count change with source) | BE | 1.5 |
| 2.4 | Subtask | BE: Remove legacy achievement-badge coupling | BE | 1 |
| 2.5 | Subtask | FE: Badge effect UI across all module configurators | FE | 1 |
| 2.6 | Subtask | FE: Badge events in member history timeline | FE | 1 |
| | | **Totals: 2 Stories, 14 Subtasks** | **BE: 11.5d** | **FE: 5.5d** |

### Why this structure works:

- **2 Stories match the 2 stages** — Stage 1 is the foundation (CRUD, data model, migration), Stage 2 builds on it (effects, history, cleanup). Each is a meaningful business milestone.
- **Member Badge endpoints grouped into one subtask** — GET, POST, DELETE, PUT are closely related and a developer would implement them together. No need for 4 separate subtasks.
- **FE work grouped by area, not by screen** — Badge Type management (list + form + delete) is one FE subtask because it's one cohesive area a frontend dev would build together.
- **Effects not split per module** — Adding badge effects to Campaigns, Leaderboards, Fortune Wheel, and Automations is the same pattern repeated. One BE subtask + one FE subtask covers all four.
- **Legacy cleanup stays in Stage 2** — No need for a separate Stage 3 when it's a single subtask that logically belongs with the integration work.
