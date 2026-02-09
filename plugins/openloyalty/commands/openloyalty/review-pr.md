---
name: openloyalty:engineering:review-pr
description: Code review with OL conventions, Jira ticket verification, test quality analysis, N+1 detection, and 1-10 scoring.
argument-hint: "[--base <branch>] [--all | --last <N>] [--strict] [--ticket <ID>] [--skip-jira]"
---

# Code Review

Review code changes against Open Loyalty conventions, Jira ticket requirements, and senior engineer best practices.

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--base <branch>` | Compare against specific branch (auto-detected if not provided) | `--base 5.144` |
| `--all` | Review all commits since base branch (not just last commit) | `--all` |
| `--last <N>` | Review the last N commits | `--last 3` |
| `--files <pattern>` | Only review matching files | `--files "src/**/*.ts"` |
| `--strict` | Treat important issues as critical | `--strict` |
| `--ticket <ID>` | Override ticket ID detection | `--ticket OLOY-123` |
| `--skip-jira` | Skip Jira context fetching | `--skip-jira` |

**Note:** By default, only the last commit is reviewed. Use `--all` to review all commits since base branch, or `--last N` to review a specific number of recent commits.

## Efficiency Guidelines

To minimize tool calls while maintaining review quality:

1. **Batch bash commands** with `&&` and section markers (`echo "=== SECTION ==="`)
2. **Use git diff -U15** to get context instead of reading full files
3. **Only spawn agents** for complex multi-step tasks requiring exploration
4. **Combine related operations** in single tool calls where possible

Target: Complete review in 8-12 tool calls (not 17+)

## Phase 1: Gather Context (Parallel Agents)

Run these agents **IN PARALLEL** using the Task tool:

### Agent 1: Git & PR Context Analyzer

**Single batched command** to gather all git and PR context efficiently:

```
Task: Bash
Prompt: |
  Run a single batched command to gather all git context:

  echo "=== BRANCH ===" && git rev-parse --abbrev-ref HEAD && \
  echo "=== PR ===" && (gh pr view --json title,body,number,baseRefName 2>/dev/null || echo "NO_PR") && \
  echo "=== BASE_DETECT ===" && (git rev-parse --abbrev-ref @{upstream} 2>/dev/null | sed 's|origin/||' || echo "DETECT_NEEDED") && \
  echo "=== LOG ===" && git log {range} --oneline 2>/dev/null && \
  echo "=== STAT ===" && git diff {range} --stat 2>/dev/null && \
  echo "=== FILES ===" && git diff {range} --name-only 2>/dev/null

  **Determine {range} BEFORE running:**

  - DEFAULT (no flags): range = "HEAD~1..HEAD" (last commit only)
  - If --all flag: range = "{base}..HEAD" (all since base)
  - If --last N flag: range = "HEAD~{N}..HEAD" (last N commits)

  **Base branch detection order:**
  a) If --base flag provided by user, use that value
  b) Extract from PR JSON (baseRefName field) if PR exists
  c) Use upstream tracking branch from BASE_DETECT section
  d) If still needed and --all mode, ask user: "Could not detect base branch. Please run with --base <branch>"

  **Handle edge cases:**
  - For DEFAULT mode, if HEAD~1 fails (only 1 commit on branch), detect merge-base
  - If using --all and commit count >50, STOP and ask user to verify base branch

  **Parse the output sections and return structured data:**
  - review_mode: "last_commit" | "all_since_base" | "last_N_commits"
  - commit_range: the actual range used
  - base_branch: the base branch (for context)
  - branch_name: current branch from BRANCH section
  - ticket_id: extract OLOY-\d+ pattern from branch name if present
  - commit_count: count commits from LOG section
  - files_changed: list from FILES section with stats from STAT section
  - total_additions/deletions: sum from STAT section
  - pr_context: { title, body, number } if PR exists, else { status: "no_pr" }
```

### Agent 2: Conventions Loader

```
Task: Explore
Prompt: |
  Read the AGENTS.md file from the repository root.

  Extract and categorize:
  1. Critical rules (must not violate)
  2. Coding conventions by category:
     - Backend (PHP/Symfony) rules
     - Frontend (TypeScript/React) rules
     - General rules
  3. Rule IDs and their descriptions (e.g., DEV020, TS001)
  4. Common anti-patterns mentioned

  If no AGENTS.md exists, return: { "status": "not_found" }

  **Return a structured summary (not the raw file):**
  - critical_rules: [list of rule IDs that must not be violated]
  - backend_rules: {rule_id: brief_description}
  - frontend_rules: {rule_id: brief_description}
  - anti_patterns: [list of common mistakes to flag]
```

### Agent 3: Jira Ticket Context (Optional - Graceful Degradation)

**Skip this agent entirely if:**
- No ticket_id was found in branch name
- User passed `--skip-jira` flag

**Note:** This is the only sub-agent that should be spawned separately - use direct tool calls for git/file operations.

```
Task: general-purpose
Prompt: |
  Attempt to fetch Jira ticket context for: {ticket_id}

  IMPORTANT: This is optional. The review works fine without Jira.

  Steps:
  1. First, check if Atlassian MCP is available by looking for
     mcp__mcp-atlassian__* tools in your available tools
  2. If MCP not available:
     - Return immediately: { "status": "mcp_not_configured" }
     - Do NOT treat this as an error
  3. If MCP available, try: mcp__mcp-atlassian__jira_get_issue with issue_key={ticket_id}
  4. If successful, extract:
     - Summary (ticket title)
     - Description (full requirements)
     - Acceptance criteria (look in description or custom fields)
     - Expected behavior changes
     - Any linked issues or epic context
  5. If call fails (network, permissions, ticket not found):
     - Return: { "status": "unavailable", "reason": "..." }

  Return structured ticket context or status indicating why it's unavailable.
  All statuses are valid - the review proceeds regardless.
```

## Phase 2: Read Changed Files (Batched Operations)

### Step 1: Get Full Diff with Context (ONE command)

```bash
git diff {commit_range} -U15
```

This provides ALL changes with 15 lines of surrounding context - usually sufficient for review without reading full files.

### Step 2: Prioritize Files by Risk

From the diff output, categorize files:
- **Critical**: Migrations, security-related, authentication, payment handling
- **High**: Business logic, API endpoints, data transformations
- **Medium**: Services, repositories, event handlers
- **Low**: Configuration, documentation
- **Review Separately**: Tests (see Phase 3b)

### Step 3: Read Full Files ONLY If Necessary

Only read full files when:
- Migrations (need complete context for safety review)
- Security-sensitive files (auth, payment, encryption)
- Diff context is insufficient to understand the change

**When reading multiple files, batch them:**
```bash
for f in file1.php file2.ts file3.php; do echo "=== $f ===" && cat "$f" 2>/dev/null; done
```

### Step 4: For API Endpoints

Check in the diff context:
- Response structure changes (new/removed fields)
- Breaking changes to existing contracts

## Phase 3a: Review Against Conventions

For each changed file, check against AGENTS.md rules:

### Backend Files (PHP/Symfony)

Check these rules if applicable:
- **DEV020**: CQRS patterns - commands/queries properly separated
- **DEV022**: Event handling - events properly dispatched
- **DEV027**: Value objects - immutability, proper construction
- **DEV034**: Dependency injection - constructor injection preferred
- **DEV035**: Repository patterns - proper query methods

### Frontend Files (TypeScript/React)

Check these rules if applicable:
- **TS001**: Prefer `const` over `let`
- **TS002**: Explicit types on function parameters
- **COMP002**: Component structure - proper separation
- **FORM001**: Form handling patterns
- **HOOK001**: Custom hooks conventions

### General Checks (All Files)

Always check:
- Missing error handling
- Security vulnerabilities (SQL injection, XSS, etc.)
- Hardcoded secrets or credentials
- Performance concerns (N+1 queries, large loops)
- Missing null checks
- Inconsistent naming conventions

## Phase 3b: Test Quality Review

**Don't just check if tests exist - review their quality:**

### Read All Test Files Changed

For each test file, evaluate:

1. **Coverage of edge cases:**
   - Are boundary conditions tested?
   - Are error paths tested?
   - Are null/empty inputs handled?

2. **Assertion quality:**
   - Do assertions check meaningful values?
   - Are assertions specific enough to catch regressions?
   - **Snapshot concern**: Are tests checking specific values only, or full responses?
     - Flag if tests only check `response.data.id` but not the full response structure
     - New fields appearing/disappearing won't be caught by partial assertions

3. **Test data quality:**
   - Is test data realistic?
   - Are edge cases in test data (special characters, long strings, etc.)?

4. **Missing test cases:**
   - Is there new code without corresponding tests?
   - Are there obvious scenarios not covered?
   - Would these tests catch the bugs that exploratory testing might find?

### Flag These Test Issues

- Tests that only assert on specific fields (recommend snapshot/full response testing)
- Missing tests for new public methods/endpoints
- Tests with weak assertions (`assertNotNull` when value should be checked)
- Tests that wouldn't catch API response structure changes

## Phase 3c: Performance Review

Specifically look for:

### N+1 Query Detection

```
Look for patterns like:
- Loops that call repository methods
- Foreach over entities that lazy-load relations
- Missing eager loading (->with(), JOIN FETCH, etc.)
- Collection operations without batch loading
```

### Database Performance

- New queries without indexes consideration
- Large result sets without pagination
- Missing query optimization for listings

### Memory Concerns

- Large collections loaded into memory
- Missing generators for large datasets
- Unbounded result sets

## Phase 3d: Migration Review

If migrations are present:

1. **Syntax check:**
   - Valid for both MySQL and PostgreSQL?
   - Using database-agnostic syntax?

2. **Data migration concerns:**
   - Does it handle existing data correctly?
   - Is there a safe rollback path?
   - Could it lock tables for too long?

3. **Recommend local verification:**
   - "Consider running this migration locally against a copy of {base_branch} database"
   - Flag any complex migrations that need manual testing

## Phase 4: Ticket Compliance Check

**Skip this phase if:**
- No ticket ID in branch name AND no `--ticket` flag provided
- Jira MCP not configured (status: "mcp_not_configured")
- Jira fetch failed (status: "unavailable")
- User passed `--skip-jira`

**If skipped, simply note in report:** "Ticket compliance not checked - {reason}"

**If Jira ticket context was retrieved:**

Compare the code changes against ticket requirements:

### Does the Code Match the Ticket?

1. **Requirements coverage:**
   - Does the implementation address all acceptance criteria?
   - Are there requirements in the ticket that aren't implemented?
   - Is there code that goes beyond what the ticket asks for?

2. **Expected behavior:**
   - Does the code produce the expected outcomes described in the ticket?
   - Are edge cases mentioned in the ticket handled?

3. **Scope creep detection:**
   - Flag changes that seem unrelated to the ticket
   - Note if the PR does more or less than the ticket describes

### Report Ticket Alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| {requirement from ticket} | {Implemented/Missing/Partial} | {details} |

## Phase 5: Categorize Findings

Group findings by severity:

### Critical (Must Fix Before Merge)
- Violations of critical rules from AGENTS.md
- Security vulnerabilities
- Data integrity issues
- Breaking changes to public APIs
- Missing migrations for schema changes
- **Code doesn't implement ticket requirements**
- N+1 queries on listing endpoints

### Important (Should Fix)
- Convention violations
- Missing tests for new code paths
- Performance concerns
- Error handling gaps
- Incomplete error messages
- Tests with weak assertions
- **Partial ticket implementation**

### Suggestions (Consider)
- Code style improvements
- Refactoring opportunities
- Documentation improvements
- Test coverage expansion
- Snapshot testing recommendations

### Exploratory Testing Recommendations

Based on the changes, suggest specific exploratory tests:

```
"To verify this PR, consider testing:
1. {specific scenario based on code changes}
2. {edge case that tests might not cover}
3. {data combination that could break the logic}
4. Compare API response from this branch vs {base_branch} for: {endpoints changed}"
```

## Phase 6: Calculate PR Score (1-10)

Rate the PR quality based on these criteria:

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

**Note:** Ticket compliance adjustments only apply when Jira context was successfully retrieved. Missing Jira integration does not affect the score.

## Phase 7: Generate Review Report

Create the review report with this structure:

```markdown
# Code Review: {branch_name}

**Reviewer:** AI Code Review Agent
**Date:** {YYYY-MM-DD}
**Base Branch:** {base_branch}
**Review Mode:** {review_mode} ({commit_range})
**Ticket:** {OLOY-XXX} - {ticket summary if available}
**Commits Reviewed:** {count}
**Files Changed:** {count}

---

## Score: {N}/10

{Visual representation using filled/empty squares}
{"██████████" for 10, "████████░░" for 8, etc.}

**Verdict:** {APPROVED / CHANGES_REQUESTED / NEEDS_DISCUSSION}

---

## Summary

{1-2 sentence overall assessment: Ready to merge / Needs attention / Critical issues found}

---

## Ticket Compliance

{Choose the appropriate message based on status:}

**If Jira context available:**

**Ticket:** {OLOY-XXX} - {summary}

| Requirement | Status | Notes |
|-------------|--------|-------|
| {req 1} | ✅ Implemented | |
| {req 2} | ⚠️ Partial | {what's missing} |
| {req 3} | ❌ Missing | |

**If no ticket ID in branch:** "No ticket ID found in branch name. Skipping ticket compliance check."

**If Jira MCP not configured:** "Jira integration not configured. To enable ticket compliance checking, set up the Atlassian MCP."

**If Jira fetch failed:** "Could not fetch ticket {OLOY-XXX}: {reason}. Review based on code only."

**If --skip-jira used:** "Ticket compliance check skipped (--skip-jira flag)."

---

## Issues

{List all issues grouped by severity, or "No issues found"}

### Critical

| File | Rule | Issue | Suggestion |
|------|------|-------|------------|
| `{path}:{line}` | {DEV020} | {description} | {brief fix} |

### Important

| File | Rule | Issue | Suggestion |
|------|------|-------|------------|
| `{path}:{line}` | {TS001} | {description} | {brief fix} |

### Suggestions

| File | Rule | Issue | Suggestion |
|------|------|-------|------------|
| `{path}:{line}` | — | {description} | {brief fix} |

**Expand any issue for details:** "Tell me more about the {rule} violation in {file}"

---

## Test Quality Assessment

**Tests reviewed:** {count}
**Coverage assessment:** {Good/Adequate/Needs improvement}

### Concerns:
- {List test quality issues}
- {Snapshot testing recommendations if applicable}

### Missing Test Cases:
- {List scenarios that should be tested}

---

## Performance Notes

{N+1 queries, database concerns, memory issues - or "No performance concerns identified"}

---

## Migration Notes

{If migrations present: assessment and recommendations}
{If no migrations: "No migrations in this PR"}

---

## Exploratory Testing Recommendations

Before merging, consider manually testing:
1. {specific test scenario}
2. {edge case to try}
3. {API comparison: "Compare response of GET /api/xxx between {base_branch} and this branch"}

---

## Files Reviewed

| File | Changes | Status |
|------|---------|--------|
| `{path}` | +{added}/-{removed} | {OK/Issues/Skipped} |

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

## Phase 8: Completion

After generating the report:

1. **Display the full report**

2. **Provide a quick summary:**
   - **PR Score** with brief justification
   - **Ticket compliance** status
   - Total issues by severity
   - Most important thing to fix (if any)
   - What would raise the score

3. **Offer next steps:**
   - "Would you like more detail on any specific issue?"
   - "Want me to suggest fixes for the critical issues?"
   - "Should I check anything else?"
   - "Want me to generate the exploratory test scenarios in more detail?"

4. **If no Jira context was found:**
   - Note that ticket compliance couldn't be verified
   - Suggest adding ticket ID to branch name for future PRs

5. **If no AGENTS.md was found:**
   - Note that review was done against general best practices
   - Suggest creating an AGENTS.md for team-specific conventions
