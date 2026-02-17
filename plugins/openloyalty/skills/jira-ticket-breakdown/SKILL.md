---
name: jira-ticket-breakdown
description: Break down large feature descriptions, epics, or PRDs into a structured Jira hierarchy (Epic, Stories/Tasks, Subtasks) and create tickets via Jira Cloud API. Decomposes big specs into trackable work items split by team (FE/BE). Triggers on "break down this ticket", "decompose this epic", "create stories from this description", "split into subtasks", "jira breakdown".
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
preconditions:
  - Jira credentials configured in ~/.claude/mcp.json (mcp-atlassian server)
  - Target Jira project exists and user has create permission
---

# Jira Ticket Breakdown

**Purpose:** Break down large feature descriptions into a structured Jira hierarchy (Epic, Stories, Subtasks) and create all tickets automatically via the Jira Cloud REST API.

## Overview

This skill takes a big feature description — from a Jira ticket URL, a document, or freeform text — and decomposes it into:

- **Epic** — the overall feature/initiative
- **Stories** (1 per stage) — milestones that track business progress
- **Subtasks** (~1 day each, labeled FE/BE) — units that track engineering progress

**Invoked by:** `/openloyalty:jira-ticket-breakdown` or natural language triggers

---

<critical_sequence name="ticket-breakdown" enforce_order="strict">

## 5-Phase Process

<step number="1" required="true">
### Phase 1: Gather Input

Determine the input source and collect the description:

**Jira URL provided:**
1. Read credentials from `~/.claude/mcp.json` (see `references/jira-api-patterns.md`)
2. Verify auth: `GET /rest/api/3/myself`
3. Fetch ticket: `GET /rest/api/3/issue/{key}?expand=renderedFields`
4. Extract summary, description, status, existing child issues

**Raw text or document path provided:**
Use the text directly or read the file as the feature description.

**BLOCKING REQUIREMENT:** If the description is too vague to identify stages or work items, ask for clarification:

```
The description is too high-level to break down. I need:

1. What are the main deliverables?
2. Are there natural phases (e.g., foundation first, then integrations)?
3. Which teams are involved? (default: FE + BE)
```
</step>

<step number="2" required="true" depends_on="1">
### Phase 2: Clarify Structure

Ask the user for project configuration:

1. **Target Jira project key** — Where to create tickets (e.g., "AI", "OLOY")
2. **Structure** — Epic with child Stories, or standalone Tasks?
3. **Team split** — Default FE/BE. Allow custom (e.g., FE/BE/Mobile, BE-only).
4. **Review first?** — Default to review first. Always recommended.
</step>

<step number="3" required="true" depends_on="2">
### Phase 3: Analyze and Break Down

Read `references/breakdown-methodology.md` for the full methodology.

**Rules:**

1. **Identify stages** — Look for natural phases (foundation, integration, cleanup).
2. **One Story per Stage** — Each stage becomes exactly one Story. Do NOT create separate stories for individual features within a stage. Stories are milestones, not features.
3. **Split into Subtasks** — Each subtask is ~1 day of work for one team. Prefix with team label (`BE:`, `FE:`).
4. **Group repetitive work** — When the same pattern applies across multiple modules, create ONE subtask covering all modules, not separate subtasks per module.
5. **Estimate effort** — Simple day estimates (0.5, 1, 1.5).
6. **Order by dependency** — Earlier stages unblock later ones.
</step>

<step number="4" required="true" depends_on="3" blocking="true">
### Phase 4: Present for Review

<validation_gate name="user-approval" blocking="true">

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

</validation_gate>
</step>

<step number="5" required="true" depends_on="4">
### Phase 5: Create in Jira

Read `references/jira-api-patterns.md` for all API patterns.

**Sequence:**

1. **Read credentials** from `~/.claude/mcp.json`:
   ```bash
   JIRA_USER=$(jq -r '.mcpServers["mcp-atlassian"].env.JIRA_USERNAME' ~/.claude/mcp.json)
   JIRA_TOKEN=$(jq -r '.mcpServers["mcp-atlassian"].env.JIRA_API_TOKEN' ~/.claude/mcp.json)
   JIRA_URL=$(jq -r '.mcpServers["mcp-atlassian"].env.JIRA_URL' ~/.claude/mcp.json)
   AUTH=$(printf '%s:%s' "$JIRA_USER" "$JIRA_TOKEN" | base64)
   ```

2. **Verify auth** — `GET /rest/api/3/myself`

3. **Discover project** — `GET /rest/api/3/project/{key}` to get issue type IDs. Map: Epic, Task/Story, Subtask. Adapt to whatever types the project has.

4. **Create Epic** — collect key

5. **Create Stories/Tasks** with `"parent": {"key": "EPIC-KEY"}` — collect keys

6. **Create Subtasks** with `"parent": {"key": "STORY-KEY"}` — use the reusable `create_subtask` shell function from the reference doc

7. **Present results** as a complete table mapping # to created Jira keys

**Critical API notes:**
- Always use `parent` field for hierarchy, NOT `customfield_10014` (Epic Link)
- Always base64 encode credentials (NOT `-u user:token`)
- Use ADF (Atlassian Document Format) for descriptions
- Include acceptance criteria as `bulletList` in ADF for Story descriptions
- Subtask descriptions should have enough detail for a developer to start work
</step>

</critical_sequence>

---

## Error Handling

**Auth failure:**
- Check `~/.claude/mcp.json` for mcp-atlassian config
- Verify token hasn't expired
- Suggest user run `/openloyalty:setup` to reconfigure

**Project not found / no permission:**
- Verify project key exists
- Check user has create issue permission in that project

**Issue type not available:**
- Some projects lack Story type — use Task instead
- Some projects lack Subtask — use Sub-task or check exact name via API
- Always discover types first, never hardcode IDs

**Field cannot be set:**
- `customfield_10014` (Epic Link) may not be on screen — use `parent` field instead
- Check full error response body for details

---

<integration_protocol>

## Integration Points

**Invoked by:**
- `/openloyalty:jira-ticket-breakdown` command
- Natural language: "break down this ticket", "decompose this epic", "split into subtasks"

**Related commands:**
- `/openloyalty:jira-ticket-create` — Create individual tickets from a session (not hierarchical breakdown)
- `/openloyalty:help` — Plugin documentation

</integration_protocol>

---

<success_criteria>

## Success Criteria

Breakdown is successful when ALL of the following are true:

- Epic created with descriptive summary
- One Story per stage, each with acceptance criteria
- Subtasks sized for ~1 day, labeled with team (BE/FE)
- No over-splitting of repetitive work across modules
- All tickets created in correct hierarchy (Epic > Story > Subtask)
- Final table presented with all Jira keys and link to Epic

</success_criteria>

---

## Resources

- `references/breakdown-methodology.md` — Rules for decomposing features into Stories and Subtasks, with corrected reference example
- `references/jira-api-patterns.md` — Jira Cloud REST API authentication, issue creation, ADF format, batch creation patterns, and error handling
