# Code Review Workflow

Review code changes against Open Loyalty conventions from AGENTS.md.

## Phase 1: Gather Context (Parallel Agents)

Run these three agents **IN PARALLEL** using the Task tool:

### Agent 1: Git Diff Analyzer

```
Task: Explore
Prompt: |
  Analyze the git diff for the current branch compared to main.

  Run these commands:
  1. git rev-parse --abbrev-ref HEAD  (get branch name)
  2. git log main..HEAD --oneline     (list commits being reviewed)
  3. git diff main...HEAD --stat      (files changed with stats)
  4. git diff main...HEAD --name-only (just file paths)

  Return structured data:
  - branch_name: the current branch
  - commit_count: number of commits
  - files_changed: list of file paths with change stats
  - total_additions: sum of lines added
  - total_deletions: sum of lines removed
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

  Format as structured data for matching against code changes.
```

### Agent 3: PR Context (Optional)

```
Task: general-purpose
Prompt: |
  Attempt to gather PR context:

  1. Check if there's a GitHub PR for this branch:
     gh pr view --json title,body,number 2>/dev/null

  2. If PR exists:
     - Extract title and description
     - Note any linked issues
     - Get review comments if any

  3. If no PR or gh unavailable:
     - Return: { "status": "no_pr" }
     - This is fine - review proceeds without PR context

  Return PR context or unavailability notice.
```

## Phase 2: Read Changed Files

For each file from the diff analysis:

1. **Prioritize files by risk:**
   - High: Security-related, authentication, data handling
   - Medium: Business logic, API endpoints
   - Low: Configuration, tests, documentation

2. **Read the full content of high/medium priority files**

3. **Get detailed diffs for these files:**
   ```bash
   git diff main...HEAD -- {file_path}
   ```

## Phase 3: Review Against Conventions

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

## Phase 4: Categorize Findings

Group findings by severity:

### Critical (Must Fix Before Merge)
- Violations of critical rules from AGENTS.md
- Security vulnerabilities
- Data integrity issues
- Breaking changes to public APIs
- Missing migrations for schema changes

### Important (Should Fix)
- Convention violations
- Missing tests for new code paths
- Performance concerns
- Error handling gaps
- Incomplete error messages

### Suggestions (Consider)
- Code style improvements
- Refactoring opportunities
- Documentation improvements
- Test coverage expansion

### Calculate PR Score (1-10)

Rate the PR quality based on these criteria:

| Score | Meaning | Criteria |
|-------|---------|----------|
| **10** | Exceptional | No issues. Exemplary code that could be used as a reference. |
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
- **+1** for excellent test coverage
- **+1** for clear commit messages and PR description
- **-1** for missing tests on new code paths
- **-1** for each critical AGENTS.md rule violation

## Phase 5: Generate Review Report

Create the review report with this structure:

```markdown
# Code Review: {branch_name}

**Reviewer:** AI Code Review Agent
**Date:** {YYYY-MM-DD}
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

## Critical Issues

{List each critical issue or "None found"}

### Issue: {title}
- **File:** `{path}:{line_number}`
- **Rule:** {AGENTS.md rule ID if applicable}
- **Problem:** {clear description}
- **Suggestion:**
  ```{language}
  {code suggestion if applicable}
  ```

---

## Important Issues

{List each important issue with same format}

---

## Suggestions

{List minor suggestions briefly}

---

## AGENTS.md Compliance

| Rule | Status | Notes |
|------|--------|-------|
| DEV020 (CQRS) | {OK/N/A/Violation} | {brief note} |
| DEV022 (Events) | {OK/N/A/Violation} | {brief note} |
| TS001 (const) | {OK/N/A/Violation} | {brief note} |
{...relevant rules...}

---

## Files Reviewed

| File | Changes | Status |
|------|---------|--------|
| `{path}` | +{added}/-{removed} | {OK/Issues/Skipped} |

---

## Checklist

- [ ] All critical AGENTS.md rules followed
- [ ] Tests added for new functionality
- [ ] No security vulnerabilities introduced
- [ ] Error handling is appropriate
- [ ] Code is readable and maintainable
```

## Phase 6: Completion

After generating the report:

1. **Display the full report**

2. **Provide a quick summary:**
   - **PR Score** with brief justification
   - Total issues by severity
   - Most important thing to fix (if any)
   - What would raise the score

3. **Offer next steps:**
   - "Would you like more detail on any specific issue?"
   - "Want me to suggest fixes for the critical issues?"
   - "Should I check anything else?"

4. **If no AGENTS.md was found:**
   - Note that review was done against general best practices
   - Suggest creating an AGENTS.md for team-specific conventions

## Arguments

The review command accepts optional arguments:

| Argument | Description | Example |
|----------|-------------|---------|
| `--base <branch>` | Compare against specific branch | `--base develop` |
| `--files <pattern>` | Only review matching files | `--files "src/**/*.ts"` |
| `--strict` | Treat important issues as critical | `--strict` |

Default: Compare current branch against `main`.
