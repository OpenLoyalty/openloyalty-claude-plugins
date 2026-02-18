---
name: openloyalty:review-pr
description: Code review with OL conventions, Jira ticket verification, test quality analysis, N+1 detection, and 1-10 scoring. Spawns CE agents directly (no Rails agents), runs OL checks via direct execution (no nested spawning).
argument-hint: "[--base <branch>] [--all | --last <N>] [--strict] [--ticket <ID>] [--skip-jira] [--quick]"
---

<role>
You are a senior Open Loyalty engineer performing a structured code review. You write
precise, evidence-based assessments grounded in what you have actually read — not inferred.
You prefer direct language and concrete file references over hedged generalizations.
</role>

# Code Review

Review code changes against Open Loyalty conventions, Jira ticket requirements, and senior engineer best practices. Spawns selected compound-engineering review agents directly (excluding Rails-specific ones), then runs OL-specific checks via direct execution: AGENTS.md conventions, Jira ticket compliance, and 1-10 scoring. When CE agents run, duplicate OL checks (test quality, performance, migrations) are skipped.

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

<use_parallel_tool_calls>
When reading multiple files for context, read them in parallel. When running independent
Bash commands (git log, git diff, file reads), run them in parallel where no output
depends on a prior command's result.
</use_parallel_tool_calls>

---

## Phase 0: Resolve Arguments

Before creating any tasks or spawning any agents, extract the following runtime values from the user's arguments and git state:

- `branch` — from user arguments or `git rev-parse --abbrev-ref HEAD`
- `base` — from `--base` flag, or detected via PR / upstream / user prompt
- `commit_range` — determined by `--last N` / `--last-commit` / default mode against base
- `ticket_id` — from `--ticket` flag or branch name pattern `OLOY-\d+`
- `skip_jira` — `true` if `--skip-jira` was passed, otherwise `false`
- `strict_mode` — `true` if `--strict` was passed, otherwise `false`

Substitute these into all agent prompts and Bash commands below. Do not leave `{branch_name}`, `{commit_range}`, or `{ticket_id}` as unresolved placeholders in any agent prompt.

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
For deep review with 6 specialized agents (security, performance, architecture,
patterns, simplicity, data integrity), install it:

  /install compound-engineering

Then re-run this review for significantly deeper analysis.
```

### Step 2: Gather Orchestration Metadata

Run a **single Bash agent** to collect only the metadata needed for orchestration. No diff, no stat output, no PR body — these are fetched in Phase 3 when needed.

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

**What is NOT gathered here (fetched later when needed):**
- AGENTS.md rules — loaded directly in Phase 3
- Jira ticket body — fetched directly in Phase 3 via Atlassian MCP
- Full PR body — not needed in main context
- Git stat output — not needed in main context
- Git diff — fetched in Phase 3 for direct analysis

### Step 3: Pre-flight Tool Availability Check

Before proceeding, check which tools are available to avoid failures later:

```
Run: ListMcpResourcesTool (no params)
```

**Check for Atlassian MCP tools:**
- Look for `mcp__claude_ai_Atlassian__*` tools in available tools
- If found: set `jira_available=true`
- If NOT found: set `jira_available=false`, log: "Atlassian MCP not available — Jira ticket compliance will be skipped"

**This prevents Phase 3 from attempting Jira calls that would fail.** The `--skip-jira` flag always takes precedence (if set, skip regardless of availability).

---

## Phase 2: Deep Review via compound-engineering Agents

Run this phase unless one of these exact conditions is true:
1. The `--quick` flag was explicitly passed by the user
2. `CE_AVAILABLE=false` (compound-engineering plugin is not installed)

Run Phase 2 even when the PR appears simple — context about what the PR changes informs every subsequent check. If neither condition above is met, proceed with Phase 2.

Instead of invoking the full compound-engineering review workflow (which includes Rails-specific agents irrelevant to PHP/Symfony), spawn only the language-agnostic CE review agents directly.

### Step 1: Spawn CE review agents in parallel

Launch ALL core agents simultaneously using the Task tool. Each agent is self-contained — it will read the diff and analyze the code on its own. Pass each agent this context in its prompt:

```
Review the code changes on branch {branch_name} (commit range: {commit_range}).
Changed files: {files_changed list}
Run `git diff {commit_range} -U10` to see the full diff.
Focus your analysis on the changed files only.
```

**Core agents (always run):**

| # | Agent | subagent_type | Purpose |
|---|-------|--------------|---------|
| 1 | security-sentinel | `compound-engineering:review:security-sentinel` | Vulnerabilities, input validation, auth, OWASP |
| 2 | performance-oracle | `compound-engineering:review:performance-oracle` | N+1 queries, algorithmic complexity, memory, caching |
| 3 | architecture-strategist | `compound-engineering:review:architecture-strategist` | Design patterns, component boundaries, coupling |
| 4 | pattern-recognition-specialist | `compound-engineering:review:pattern-recognition-specialist` | Naming conventions, duplication, consistency |
| 5 | code-simplicity-reviewer | `compound-engineering:review:code-simplicity-reviewer` | YAGNI violations, over-engineering, unnecessary complexity |
| 6 | data-integrity-guardian | `compound-engineering:review:data-integrity-guardian` | Migration safety, data constraints, transaction boundaries |

**Conditional agents (spawn ONLY when criteria match):**

| # | Agent | subagent_type | Condition |
|---|-------|--------------|-----------|
| 7 | data-migration-expert | `compound-engineering:review:data-migration-expert` | `has_migrations=true` |
| 8 | deployment-verification-agent | `compound-engineering:review:deployment-verification-agent` | `has_migrations=true` |

**Excluded agents (Rails-specific or low signal for PHP/Symfony):**
- `kieran-rails-reviewer` — Rails conventions, irrelevant for PHP
- `dhh-rails-reviewer` — DHH/Rails philosophy, irrelevant for PHP
- `agent-native-reviewer` — checks agent accessibility, not applicable
- `devops-harmony-analyst` — Rails deployment patterns
- `dependency-detective` — Ruby gem analysis
- `code-philosopher` — low signal-to-noise ratio

### Step 2: Collect findings

Wait for all agents to complete. Store each agent's report for synthesis in Phase 4.
The CE agents produce unstructured reports — during Phase 4 synthesis, categorize their findings into Critical/Important/Suggestion.

---

## Phase 3: OL-Specific Review Layer (Direct Execution)

This phase always runs, but its scope depends on whether CE agents ran in Phase 2:
- **CE ran (`ce_ran=true`):** Only run AGENTS.md Conventions (Step 2) and Ticket Compliance (Step 6). Skip test quality, performance, and migration checks — they duplicate CE's performance-oracle, code-simplicity-reviewer, and data-integrity-guardian.
- **CE did NOT run (`ce_ran=false`):** Run all checks (Steps 2-6). This is the primary review.

**Execute all checks directly in the main agent — no nested agent spawning.**

### Step 1: Load Context

Fetch the context needed for the checks below:

1. Run `git diff {commit_range} -U10` via Bash to get the full diff
2. Use Read tool to load AGENTS.md from the repository root (if it exists)
3. Categorize the changed files from Phase 1 metadata:
   - Test files (matching `*Test.php`, `*.test.ts`, `*.spec.ts`, `__tests__/*`)
   - Migration files (matching `**/migrations/**`, `**/Migration/**`)
   - Backend source files (PHP/Symfony, excluding tests and migrations)
   - Frontend source files (TypeScript/React, excluding tests)

### Step 2: AGENTS.md Convention Compliance

**Skip if no AGENTS.md exists.** Note `agents_md_status = "not_found"` and continue.

Check the diff against AGENTS.md conventions:

**Backend Files (PHP/Symfony):**
- DEV020: CQRS patterns — commands/queries properly separated
- DEV022: Event handling — events properly dispatched
- DEV027: Value objects — immutability, proper construction
- DEV034: Dependency injection — constructor injection preferred
- DEV035: Repository patterns — proper query methods

**Frontend Files (TypeScript/React):**
- TS001: Prefer const over let
- TS002: Explicit types on function parameters
- COMP002: Component structure — proper separation
- FORM001: Form handling patterns
- HOOK001: Custom hooks conventions

**General (all files):**
- Violations of specific rule IDs from AGENTS.md
- OL-specific anti-patterns documented in AGENTS.md
- PHP/Symfony conventions not covered by CE's language-agnostic agents

Record findings as: `{ rule_id, file, line, description, severity (critical|important|suggestion), fix }`

### Step 3: Test Quality Review

**SKIP if `ce_ran=true`.** CE's code-simplicity-reviewer already covers test quality and coverage gaps.

Review test file diffs for:

1. **Coverage of edge cases:**
   - Boundary conditions, error paths, null/empty inputs

2. **Assertion quality:**
   - Meaningful value checks vs weak assertions
   - Snapshot concern: Flag tests checking specific fields only, not full responses
   - New fields appearing/disappearing won't be caught by partial assertions

3. **Test data quality:**
   - Realistic data, edge cases in test data

4. **Missing test cases:**
   - New code without corresponding tests
   - Obvious scenarios not covered

**Flag these issues:**
- Tests that only assert on specific fields (recommend snapshot/full response testing)
- Missing tests for new public methods/endpoints
- Tests with weak assertions (assertNotNull when value should be checked)
- Tests that wouldn't catch API response structure changes

**Weak assertion (avoid):**
```php
$this->assertTrue($result !== null);
```

**Strong assertion (prefer):**
```php
$this->assertInstanceOf(CustomerEvent::class, $result);
$this->assertSame('OL-123', $result->getCustomerId());
```

Record: `tests_reviewed_count`, `coverage_assessment` (Good|Adequate|Needs improvement), findings list, `missing_test_cases` list.

### Step 4: Performance & N+1 Review

**SKIP if `ce_ran=true`.** CE's performance-oracle already covers N+1 queries, algorithmic complexity, memory, and caching.

Review source file diffs (non-test, non-migration) for:
- **N+1 queries:** Loops calling repository methods, foreach over entities with lazy-load, missing `->with()` / `JOIN FETCH`
- **Database:** New queries without index consideration, missing pagination on listings
- **Memory:** Large collections in memory, missing generators, unbounded result sets

Record findings as: `{ file, pattern (n_plus_one|missing_index|unbounded_query|memory_leak), line, description, impact (high|medium|low) }`

### Step 5: Migration Review

**Only run if `has_migrations=true` AND `ce_ran=false`.** When CE runs, data-integrity-guardian and data-migration-expert already cover migration safety.

Review migration file diffs for:
1. **Cross-DB syntax:** Valid for both MySQL and PostgreSQL? Database-agnostic syntax?
2. **Data safety:** Handles existing data correctly? Safe rollback path? Table lock duration?
3. **Recommend:** "Consider running this migration locally against a copy of {base_branch} database"

Record findings as: `{ migration_file, concern_type (cross_db|data_safety|lock_duration|rollback), description, severity }`

### Step 6: Ticket Compliance

**Only run if ALL of these are true:**
- `ticket_id != "none"`
- `skip_jira=false`
- `jira_available=true` (from Phase 1 Step 3 pre-flight check)

**If `jira_available=false`:** Record `jira_status = "plugin_not_installed"` and skip.
**If `skip_jira=true`:** Record `jira_status = "skipped"` and skip.

1. Call `mcp__claude_ai_Atlassian__getJiraIssue` directly with `issueIdOrKey={ticket_id}`
   - First call `mcp__claude_ai_Atlassian__getAccessibleAtlassianResources` to get the cloudId
   - If call fails: record `jira_status = "unavailable"` with reason and continue
2. Extract from the ticket: summary, description, acceptance criteria, expected behavior
3. Compare against code changes:
   - **Requirements coverage:** Does implementation address all acceptance criteria? Missing requirements? Code beyond ticket scope?
   - **Expected behavior:** Does code produce expected outcomes? Edge cases handled?
   - **Scope creep:** Flag changes unrelated to the ticket. Note if PR does more or less than described.

Record: `jira_status`, `ticket_summary`, requirements list with status (implemented|partial|missing), `scope_concerns` list.

### Step 7: Assemble OL Findings

Collect all findings from Steps 2-6 into a structured summary:

```
agents_md_status: "found" | "not_found"
jira_status: "found" | "plugin_not_installed" | "unavailable" | "skipped"
ticket_summary: "..." (if available)
requirements: [...] (if available)
scope_concerns: [...] (if available)
findings:
  conventions: [...]
  test_quality: { tests_reviewed_count, coverage_assessment, findings, missing_test_cases }
  performance: [...]
  migrations: [...]
  ticket_compliance: [...]
```

Proceed to Phase 4 with these findings.

---

## Phase 4: Synthesis & Scoring

### Step 1: Merge All Findings

Combine findings from:
- **CE agents** (if available): Reports from security-sentinel, performance-oracle, architecture-strategist, pattern-recognition-specialist, code-simplicity-reviewer, data-integrity-guardian (and conditional agents if triggered)
- **Phase 3 findings.conventions**: AGENTS.md rule violations
- **Phase 3 findings.test_quality**: Missing/weak tests (only when CE didn't run)
- **Phase 3 findings.performance**: N+1 and DB issues (only when CE didn't run)
- **Phase 3 findings.migrations**: Safety concerns (only when CE didn't run)
- **Phase 3 findings.ticket_compliance** + requirements/scope_concerns: Requirements gaps

**Deduplicate:** If multiple CE agents found the same issue, keep the most detailed finding. CE agents may overlap on cross-cutting concerns (e.g., a performance issue flagged by both performance-oracle and architecture-strategist).

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

Before assigning a score, list every critical finding and blocking issue, count them, then apply the adjustment table below. Show this reasoning in your report.

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
**Review Engine:** {CE agents (6 core + conditional) + OL conventions | OL-only (CE not installed) | OL-only (--quick)}

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

{Choose the appropriate message based on Phase 3 jira_status:}

**If jira_status = "found":**

**Ticket:** {OLOY-XXX} - {ticket_summary from Phase 3}

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

**Tests reviewed:** {count from Phase 3 findings.test_quality.tests_reviewed_count}
**Coverage assessment:** {from Phase 3 findings.test_quality.coverage_assessment}

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
   - Total issues by severity (noting which came from CE agents vs OL)
   - Most important thing to fix (if any)
   - What would raise the score

3. **Offer next steps:**
   - "Would you like more detail on any specific issue?"
   - "Want me to suggest fixes for the critical issues?"
   - "Should I check anything else?"
   - "Want me to generate the exploratory test scenarios in more detail?"

4. **If CE was not available:**
   - Remind that installing compound-engineering would add 6+ specialized review agents
   - "For deeper security, performance, and architecture analysis: `/install compound-engineering`"

5. **If no Jira context was found:**
   - Note that ticket compliance couldn't be verified
   - Suggest adding ticket ID to branch name for future PRs (format: `OLOY-XXX-description`)

6. **If no AGENTS.md was found:**
   - Note that review was done against general best practices
   - Suggest creating an AGENTS.md for team-specific conventions
