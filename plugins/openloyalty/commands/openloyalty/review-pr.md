---
name: openloyalty:review-pr
description: Code review with OL conventions, Jira ticket verification, test quality analysis, N+1 detection, and 1-10 scoring. Delegates deep analysis to compound-engineering review agents.
argument-hint: "[--base <branch>] [--all | --last <N>] [--strict] [--ticket <ID>] [--skip-jira] [--quick]"
---

# Code Review

Review code changes against Open Loyalty conventions, Jira ticket requirements, and senior engineer best practices. Leverages compound-engineering's multi-agent review system for deep analysis, then adds OL-specific layers: AGENTS.md conventions, Jira ticket compliance, and 1-10 scoring.

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--base <branch>` | Compare against specific branch (auto-detected if not provided) | `--base 5.144` |
| `--last <N>` | Review only the last N commits (instead of all) | `--last 3` |
| `--last-commit` | Review only the last commit (shorthand for `--last 1`) | `--last-commit` |
| `--files <pattern>` | Only review matching files | `--files "src/**/*.ts"` |
| `--strict` | Treat important issues as critical | `--strict` |
| `--ticket <ID>` | Override ticket ID detection | `--ticket OLOY-123` |
| `--skip-jira` | Skip Jira context fetching | `--skip-jira` |
| `--quick` | Skip compound-engineering deep review, run OL-only review | `--quick` |

**Note:** By default, all commits since the base branch are reviewed. Use `--last N` to narrow to the last N commits, or `--last-commit` to review only the most recent commit.

---

## Execution Discipline

**IMPORTANT:** Before starting any work, create a task for each phase using TaskCreate (Phase 1 through Phase 6). Follow the phases sequentially, marking each task as completed before moving to the next. Do not execute from memory — use the task list to track progress and ensure no phases are skipped.

---

## Phase 1: Dependency Check & Context Gathering

### Step 1: Verify compound-engineering plugin

Check if the compound-engineering plugin is installed:

```
Run: ls ~/.claude/plugins/cache/every-marketplace/compound-engineering/ 2>/dev/null
```

- If found: set `CE_AVAILABLE=true`, note the version
- If not found: set `CE_AVAILABLE=false`

**If CE not available AND `--quick` not passed:**
Display this warning and continue with OL-only review:

```
NOTE: compound-engineering plugin not installed. Running OL-only review.
For the full multi-agent deep review (15 parallel review agents, ultra-thinking,
security/performance/architecture analysis), install it:

  /install compound-engineering

Then re-run this review for significantly deeper analysis.
```

### Step 2: Gather Orchestration Metadata

Run a **single Bash agent** to collect only the metadata the main agent needs for orchestration. No diff, no stat output, no PR body — sub-agents will fetch their own context later.

```
Task: Bash
Prompt: |
  Run a single batched command to gather orchestration metadata:

  echo "=== BRANCH ===" && git rev-parse --abbrev-ref HEAD && \
  echo "=== PR ===" && (gh pr view --json title,number,baseRefName 2>/dev/null || echo "NO_PR") && \
  echo "=== BASE_DETECT ===" && (git rev-parse --abbrev-ref @{upstream} 2>/dev/null | sed 's|origin/||' || echo "DETECT_NEEDED") && \
  echo "=== LOG ===" && git log {range} --oneline 2>/dev/null && \
  echo "=== FILES ===" && git diff {range} --name-only 2>/dev/null

  **Determine {range} BEFORE running:**

  - DEFAULT (no flags): range = "{base}..HEAD" (all commits since base branch)
  - If --last N flag: range = "HEAD~{N}..HEAD" (last N commits)
  - If --last-commit flag: range = "HEAD~1..HEAD" (last commit only)

  **Base branch detection order:**
  a) If --base flag provided by user, use that value
  b) Extract from PR JSON (baseRefName field) if PR exists
  c) Use upstream tracking branch from BASE_DETECT section
  d) If still needed, ask user: "Could not detect base branch. Please run with --base <branch>"

  **Handle edge cases:**
  - For DEFAULT mode, base branch is required — if detection fails, ask user: "Could not detect base branch. Please run with --base <branch>"
  - If commit count >50, STOP and ask user to verify base branch before proceeding
  - For --last-commit mode, if HEAD~1 fails (only 1 commit on branch), detect merge-base

  **Return ONLY these fields (compact, no raw output):**
  - branch_name, base_branch, commit_range, review_mode
  - ticket_id (extracted from branch name via OLOY-\d+ pattern, or from --ticket flag)
  - commit_count, files_changed_count
  - files_changed: [list of file paths, name-only]
  - has_migrations: true/false (check if any file in files_changed matches **/migrations/** or **/Migration/**)
  - pr_number, pr_title (NOT the full PR body)
  - pr_status: "found" | "no_pr"
```

**What is NOT gathered here (sub-agents fetch their own):**
- AGENTS.md rules — loaded by Phase 3 orchestrator
- Jira ticket body — fetched by Phase 3 ticket compliance sub-agent
- Full PR body — not needed in main context
- Git stat output — not needed in main context
- Git diff — loaded by Phase 3 orchestrator, never enters main context

---

## Phase 2: Deep Review via compound-engineering

**MANDATORY unless ONE of these exact conditions is true:**
1. The `--quick` flag was explicitly passed by the user
2. `CE_AVAILABLE=false` (compound-engineering plugin is not installed)

**You MUST NOT skip this phase for any other reason.** Do not skip because the PR "seems simple", "is small", "doesn't need deep review", or any self-generated rationale. If neither condition above is met, run Phase 2.

Invoke the compound-engineering review workflow:

```
Skill: compound-engineering:workflows:review
Args: {PR number or branch name from Phase 1}
```

This runs 15+ parallel review agents covering:
- Security (security-sentinel)
- Performance (performance-oracle)
- Architecture (architecture-strategist)
- Pattern consistency (pattern-recognition-specialist)
- Code simplicity (code-simplicity-reviewer)
- Data integrity (data-integrity-guardian)
- And more specialized agents

**Wait for compound-engineering review to complete before proceeding.**

The CE review produces:
- P1/P2/P3 categorized findings
- Todo files in `todos/` directory
- A summary report

Store the CE findings for synthesis in Phase 4.

---

## Phase 3: OL-Specific Review Layer (Self-Contained Orchestrator)

This phase runs regardless of whether CE review was available. When CE was used, this phase adds OL-specific checks that CE agents do not cover. When CE was not available, this phase is the primary review.

**Spawn a single `general-purpose` Task agent** that works like CE does in Phase 2 — self-contained, fetches its own context, spawns its own sub-agents, returns only findings. The diff, AGENTS.md rules, and Jira ticket body never enter main context.

```
Task: general-purpose
Prompt: |
  You are the OL Code Review Orchestrator. Review code changes against
  Open Loyalty conventions. You are self-contained: fetch your own context,
  spawn your own sub-agents, and return ONLY a structured findings summary.

  **Inputs from main agent:**
  - commit_range: {commit_range}
  - files_changed: {files_changed list}
  - ticket_id: {ticket_id or "none"}
  - skip_jira: {true/false}
  - ce_ran: {true/false}
  - has_migrations: {true/false}

  **Step 1: Fetch your own context**

  Run these commands via Bash:
  - `git diff {commit_range} -U10` — store the full diff (you will partition it for sub-agents)
  - Read the AGENTS.md file from the repository root (if it exists)
  - Identify which files are test files, migration files, backend (PHP) files, frontend (TS/React) files

  **Step 2: Spawn parallel sub-agents**

  Launch the following sub-agents IN PARALLEL using the Task tool.
  Pass each sub-agent ONLY the diff sections and context it needs.

  ---

  ### Sub-agent 1: AGENTS.md Convention Compliance

  **Skip if no AGENTS.md exists.** Return `{ "status": "not_found" }` instead.

  ```
  Task: general-purpose
  Prompt: |
    Check code changes against AGENTS.md conventions.

    **AGENTS.md rules:**
    {paste the relevant rules you loaded — critical rules, backend rules, frontend rules, anti-patterns}

    **Diff of changed files:**
    {paste only the diff sections for source files (not test files, not migrations)}

    **What to check:**

    Backend Files (PHP/Symfony):
    - DEV020: CQRS patterns — commands/queries properly separated
    - DEV022: Event handling — events properly dispatched
    - DEV027: Value objects — immutability, proper construction
    - DEV034: Dependency injection — constructor injection preferred
    - DEV035: Repository patterns — proper query methods

    Frontend Files (TypeScript/React):
    - TS001: Prefer const over let
    - TS002: Explicit types on function parameters
    - COMP002: Component structure — proper separation
    - FORM001: Form handling patterns
    - HOOK001: Custom hooks conventions

    General (all files):
    - Violations of specific rule IDs from AGENTS.md
    - OL-specific anti-patterns documented in AGENTS.md
    - PHP/Symfony conventions not covered by CE's Rails-focused agents

    **Return format:**
    {
      "status": "found",
      "rules_checked_count": <number>,
      "findings": [
        { "rule_id": "DEV020", "file": "path/to/file", "line": <number>, "description": "...", "severity": "critical|important|suggestion", "fix": "..." }
      ]
    }
  ```

  ---

  ### Sub-agent 2: Test Quality Review

  ```
  Task: general-purpose
  Prompt: |
    Review test quality for the following code changes.

    **Test file diffs:**
    {paste only the diff sections for test files}

    **Non-test files changed (for coverage gap detection):**
    {list of non-test files that were changed}

    **What to check:**

    1. Coverage of edge cases:
       - Boundary conditions, error paths, null/empty inputs

    2. Assertion quality:
       - Meaningful value checks vs weak assertions
       - Snapshot concern: Flag tests checking specific fields only, not full responses
       - New fields appearing/disappearing won't be caught by partial assertions

    3. Test data quality:
       - Realistic data, edge cases in test data

    4. Missing test cases:
       - New code without corresponding tests
       - Obvious scenarios not covered

    **Flag these issues:**
    - Tests that only assert on specific fields (recommend snapshot/full response testing)
    - Missing tests for new public methods/endpoints
    - Tests with weak assertions (assertNotNull when value should be checked)
    - Tests that wouldn't catch API response structure changes

    **Return format:**
    {
      "tests_reviewed_count": <number>,
      "coverage_assessment": "Good|Adequate|Needs improvement",
      "findings": [
        { "file": "path/to/test", "issue_type": "weak_assertion|missing_test|missing_edge_case|partial_assertion", "description": "...", "severity": "critical|important|suggestion" }
      ],
      "missing_test_cases": ["..."]
    }
  ```

  ---

  ### Sub-agent 3: Performance & N+1 Review

  ```
  Task: general-purpose
  Prompt: |
    Review code changes for performance issues.

    **CE already ran:** {ce_ran}
    If CE ran, focus ONLY on OL/PHP/Symfony-specific patterns that CE's
    Rails-focused agents would miss. If CE did NOT run, do a full performance review.

    **Source file diffs (non-test, non-migration):**
    {paste source file diffs}

    **What to check:**
    - N+1 queries: Loops calling repository methods, foreach over entities with lazy-load, missing ->with() / JOIN FETCH
    - Database: New queries without index consideration, missing pagination on listings
    - Memory: Large collections in memory, missing generators, unbounded result sets

    **Return format:**
    {
      "findings": [
        { "file": "path/to/file", "pattern": "n_plus_one|missing_index|unbounded_query|memory_leak", "line": <number>, "description": "...", "impact": "high|medium|low" }
      ]
    }
  ```

  ---

  ### Sub-agent 4: Migration Review (CONDITIONAL)

  **Only spawn this sub-agent if `has_migrations=true`.** Otherwise skip entirely.

  ```
  Task: general-purpose
  Prompt: |
    Review database migrations for safety and correctness.

    **Migration file diffs:**
    {paste only the migration file diffs}

    **What to check:**
    1. Cross-DB syntax: Valid for both MySQL and PostgreSQL? Database-agnostic syntax?
    2. Data safety: Handles existing data correctly? Safe rollback path? Table lock duration?
    3. Recommend: "Consider running this migration locally against a copy of {base_branch} database"

    **Return format:**
    {
      "findings": [
        { "migration_file": "path/to/migration", "concern_type": "cross_db|data_safety|lock_duration|rollback", "description": "...", "severity": "critical|important|suggestion" }
      ]
    }
  ```

  ---

  ### Sub-agent 5: Ticket Compliance (CONDITIONAL)

  **Only spawn this sub-agent if `ticket_id != "none"` AND `skip_jira=false`.**
  Otherwise skip entirely.

  ```
  Task: general-purpose
  Prompt: |
    Check if code changes implement the requirements from Jira ticket: {ticket_id}

    **Step 1:** Fetch the Jira ticket yourself.
    - Check if Atlassian MCP tools are available (mcp__claude_ai_Atlassian__* or mcp__plugin_atlassian_atlassian__*)
    - If plugin not available: return { "status": "plugin_not_installed" }
    - If available: call getJiraIssue with issueIdOrKey={ticket_id}
    - If call fails: return { "status": "unavailable", "reason": "..." }

    **Step 2:** Extract from the ticket:
    - Summary (ticket title)
    - Description (full requirements)
    - Acceptance criteria (look in description or custom fields)
    - Expected behavior changes

    **Step 3:** Compare against the code changes.
    - Files changed: {files_changed list}
    - Diff summary: {commit_count} commits, {files_changed_count} files

    **What to check:**
    1. Requirements coverage: Does implementation address all acceptance criteria?
       Are there requirements not implemented? Code beyond what the ticket asks for?
    2. Expected behavior: Does code produce expected outcomes from the ticket?
       Are edge cases mentioned in the ticket handled?
    3. Scope creep: Flag changes unrelated to the ticket.
       Note if PR does more or less than the ticket describes.

    **Return format:**
    {
      "status": "found",
      "ticket_summary": "...",
      "jira_status": "found",
      "requirements": [
        { "requirement": "...", "status": "implemented|partial|missing", "notes": "..." }
      ],
      "scope_concerns": ["..."]
    }
  ```

  ---

  **Step 3: Collect and return findings**

  After all sub-agents complete, assemble and return ONLY this structured object
  to the main agent. Do NOT return raw diff, raw AGENTS.md content, or raw Jira ticket body.

  **Return format:**
  {
    "agents_md_status": "found" | "not_found",
    "jira_status": "found" | "plugin_not_installed" | "unavailable" | "skipped",
    "ticket_summary": "..." (if available, else omit),
    "requirements": [...] (if available, else omit),
    "scope_concerns": [...] (if available, else omit),
    "findings": {
      "conventions": [...],
      "test_quality": { "tests_reviewed_count": N, "coverage_assessment": "...", "findings": [...], "missing_test_cases": [...] },
      "performance": [...],
      "migrations": [...],
      "ticket_compliance": [...]
    }
  }
```

---

## Phase 4: Synthesis & Scoring

### Step 1: Merge All Findings

Combine findings from:
- **CE review** (if available): P1/P2/P3 findings from 15+ agents
- **OL orchestrator findings.conventions**: AGENTS.md rule violations
- **OL orchestrator findings.test_quality**: Missing/weak tests
- **OL orchestrator findings.performance**: N+1 and DB issues
- **OL orchestrator findings.migrations**: Safety concerns
- **OL orchestrator findings.ticket_compliance** + requirements/scope_concerns: Requirements gaps

**Deduplicate:** If CE and OL found the same issue, keep the more detailed finding.

### Step 2: Categorize by OL Severity

Map all findings into three categories:

**Critical (Must Fix Before Merge)**
- CE P1 findings
- Violations of critical rules from AGENTS.md
- Security vulnerabilities
- Data integrity issues
- Breaking changes to public APIs
- Missing migrations for schema changes
- Code doesn't implement ticket requirements
- N+1 queries on listing endpoints

**Important (Should Fix)**
- CE P2 findings
- Convention violations from AGENTS.md
- Missing tests for new code paths
- Performance concerns
- Error handling gaps
- Tests with weak assertions
- Partial ticket implementation

**Suggestions (Consider)**
- CE P3 findings
- Code style improvements
- Refactoring opportunities
- Test coverage expansion
- Snapshot testing recommendations

If `--strict` flag: promote all Important findings to Critical.

### Step 3: Calculate PR Score (1-10)

| Score | Meaning | Criteria |
|-------|---------|----------|
| **10** | Exceptional | No issues. Exemplary code. Full ticket compliance. Excellent tests. |
| **9** | Excellent | No critical/important issues. Minor suggestions only. Well-tested. |
| **8** | Very Good | No critical issues. 1-2 minor important issues. Good test coverage. |
| **7** | Good | No critical issues. A few important issues. Adequate tests. |
| **6** | Acceptable | No critical issues. Several important issues need attention. |
| **5** | Needs Work | 1 critical issue OR many important issues. Gaps in testing. |
| **4** | Below Standard | 1-2 critical issues. Multiple convention violations. |
| **3** | Poor | Multiple critical issues. Significant rework needed. |
| **2** | Serious Problems | Security vulnerabilities or data integrity risks. |
| **1** | Do Not Merge | Fundamental issues. May cause production incidents. |

**Scoring adjustments:**
- **+1** for excellent test coverage with good assertions
- **+1** for clear commit messages and PR description
- **+1** for full ticket requirement compliance *(only if Jira context available)*
- **-1** for missing tests on new code paths
- **-1** for each critical AGENTS.md rule violation
- **-1** for N+1 queries introduced
- **-1** for code that doesn't match ticket requirements *(only if Jira context available)*
- **-2** for tests that only check specific values (not full responses)

**Note:** Ticket compliance adjustments only apply when Jira context was successfully retrieved.

---

## Phase 5: Generate Report

```markdown
# Code Review: {branch_name}

**Reviewer:** AI Code Review Agent (OL + compound-engineering)
**Date:** {YYYY-MM-DD}
**Base Branch:** {base_branch}
**Review Mode:** {review_mode} ({commit_range})
**Ticket:** {OLOY-XXX} - {ticket summary if available}
**Commits Reviewed:** {count}
**Files Changed:** {count}
**Review Engine:** {compound-engineering vX.XX + OL conventions | OL-only (CE not installed) | OL-only (--quick)}

---

## Score: {N}/10

{Visual representation using filled/empty squares}
{"██████████" for 10, "████████░░" for 8, etc.}

**Verdict:** {APPROVED / CHANGES_REQUESTED / NEEDS_DISCUSSION}

---

## Summary

{1-2 sentence overall assessment}

---

## Ticket Compliance

{Choose the appropriate message based on OL orchestrator's jira_status:}

**If jira_status = "found":**

**Ticket:** {OLOY-XXX} - {ticket_summary from orchestrator}

| Requirement | Status | Notes |
|-------------|--------|-------|
| {req 1} | Implemented | |
| {req 2} | Partial | {what's missing} |
| {req 3} | Missing | |

**If no ticket ID in branch:** "No ticket ID found in branch name. Skipping ticket compliance check."

**If jira_status = "plugin_not_installed":** "Atlassian plugin not installed. To enable ticket compliance checking, install it with `/install atlassian`."

**If jira_status = "unavailable":** "Could not fetch ticket {OLOY-XXX}: {reason}. Review based on code only."

**If jira_status = "skipped" (--skip-jira used):** "Ticket compliance check skipped (--skip-jira flag)."

---

## Issues

{List all issues grouped by severity, or "No issues found"}

### Critical

| File | Rule | Source | Issue | Suggestion |
|------|------|--------|-------|------------|
| `{path}:{line}` | {DEV020} | {CE/OL} | {description} | {brief fix} |

### Important

| File | Rule | Source | Issue | Suggestion |
|------|------|--------|-------|------------|
| `{path}:{line}` | {TS001} | {CE/OL} | {description} | {brief fix} |

### Suggestions

| File | Rule | Source | Issue | Suggestion |
|------|------|--------|-------|------------|
| `{path}:{line}` | — | {CE/OL} | {description} | {brief fix} |

**Expand any issue for details:** "Tell me more about the {rule} violation in {file}"

---

## AGENTS.md Convention Compliance

{If agents_md_status = "found":}
**Rules checked:** {count}
**Violations found:** {count}

| Rule ID | File | Violation | Fix |
|---------|------|-----------|-----|
| {DEV020} | `{path}` | {description} | {fix} |

{If agents_md_status = "not_found":}
"No AGENTS.md found in repository root. Review used general best practices only. Consider creating AGENTS.md for team-specific conventions."

---

## Test Quality Assessment

**Tests reviewed:** {count from orchestrator findings.test_quality.tests_reviewed_count}
**Coverage assessment:** {from orchestrator findings.test_quality.coverage_assessment}

### Concerns:
- {List test quality issues from findings.test_quality.findings}
- {Snapshot testing recommendations if applicable}

### Missing Test Cases:
- {List from findings.test_quality.missing_test_cases}

---

## Performance Notes

{N+1 queries, database concerns, memory issues from findings.performance — or "No performance concerns identified"}

---

## Migration Notes

{If has_migrations: assessment from findings.migrations}
{If no migrations: "No migrations in this PR"}

---

## Exploratory Testing Recommendations

Before merging, consider manually testing:
1. {specific test scenario}
2. {edge case to try}
3. {API comparison: "Compare response of GET /api/xxx between {base_branch} and this branch"}

---

## Checklist

- [ ] All critical AGENTS.md rules followed
- [ ] Code implements ticket requirements
- [ ] Tests added with meaningful assertions
- [ ] No N+1 queries introduced
- [ ] Migrations tested locally (if applicable)
- [ ] No security vulnerabilities introduced
- [ ] API response structure documented (if changed)
```

---

## Phase 6: Completion

After generating the report:

1. **Display the full report**

2. **Provide a quick summary:**
   - **PR Score** with brief justification
   - **Ticket compliance** status
   - Total issues by severity (noting which came from CE vs OL)
   - Most important thing to fix (if any)
   - What would raise the score

3. **Offer next steps:**
   - "Would you like more detail on any specific issue?"
   - "Want me to suggest fixes for the critical issues?"
   - "Should I check anything else?"
   - "Want me to generate the exploratory test scenarios in more detail?"
   - If CE produced todos: "Want me to run `/resolve_todo_parallel` to fix the findings?"

4. **If CE was not available:**
   - Remind that installing compound-engineering would add 15+ review agents
   - "For deeper security, performance, and architecture analysis: `/install compound-engineering`"

5. **If no Jira context was found:**
   - Note that ticket compliance couldn't be verified
   - Suggest adding ticket ID to branch name for future PRs (format: `OLOY-XXX-description`)

6. **If no AGENTS.md was found:**
   - Note that review was done against general best practices
   - Suggest creating an AGENTS.md for team-specific conventions
