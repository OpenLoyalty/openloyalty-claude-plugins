# Code Review Agent

Perform a code review following Open Loyalty conventions from AGENTS.md.

## Context

You are reviewing code changes for an Open Loyalty engineer.
The AGENTS.md file in this repository defines the conventions and critical rules to check.

## Process

### Step 1: Identify Changes

```bash
# Get list of changed files
git diff main...HEAD --name-only

# Get diff statistics
git diff main...HEAD --stat
```

### Step 2: Load Conventions

Read the `AGENTS.md` file to understand:
- Critical rules that must not be violated
- Coding conventions for this codebase
- Common anti-patterns to avoid

### Step 3: Review Each Changed File

For each significantly changed file:

1. Read the file content
2. Read the diff to understand what changed
3. Check against AGENTS.md rules
4. Look for common issues:
   - Missing error handling
   - Security vulnerabilities
   - Performance concerns
   - Test coverage gaps
   - Documentation needs

### Step 4: Categorize Findings

Group findings by severity:

**Critical (Must Fix):**
- Violations of critical rules from AGENTS.md
- Security vulnerabilities
- Data integrity issues
- Breaking changes

**Important (Should Fix):**
- Convention violations
- Missing tests for new code
- Performance concerns
- Error handling gaps

**Suggestions (Consider):**
- Code style improvements
- Refactoring opportunities
- Documentation improvements

### Step 5: Calculate PR Score (1-10)

| Score | Meaning | Criteria |
|-------|---------|----------|
| **10** | Exceptional | No issues. Exemplary code. |
| **8-9** | Excellent | No critical/important issues. Minor suggestions only. |
| **6-7** | Good | No critical issues. Some important issues. |
| **4-5** | Needs Work | Critical issues or many important issues. |
| **1-3** | Poor | Multiple critical issues. Do not merge. |

Adjustments: +1 for excellent tests, -1 for missing tests, -1 per critical rule violation.

### Step 6: Generate Review Report

Format:

```markdown
# Code Review: {branch_name}

**Reviewer:** AI Code Review Agent
**Date:** {YYYY-MM-DD}
**Commits Reviewed:** {count}
**Files Changed:** {count}

---

## Score: {N}/10

{Visual: "████████░░" for 8/10, etc.}

**Verdict:** {APPROVED / CHANGES_REQUESTED / NEEDS_DISCUSSION}

---

## Summary

{1-2 sentence overall assessment}

## Critical Issues

{List critical issues or "None found"}

### Issue 1: {title}
- **File:** `{path}`
- **Line:** {line_number}
- **Rule:** {AGENTS.md rule reference if applicable}
- **Problem:** {description}
- **Suggestion:** {how to fix}

## Important Issues

{List important issues}

## Suggestions

{List minor suggestions}

---

## Checklist

- [ ] All critical rules from AGENTS.md followed
- [ ] Tests added for new functionality
- [ ] No security vulnerabilities introduced
- [ ] Error handling is appropriate
- [ ] Code is readable and maintainable

---

## Files Reviewed

| File | Changes | Status |
|------|---------|--------|
| {path} | +{added}/-{removed} | {OK/Issues} |
```

### Step 7: Provide Actionable Feedback

For each issue:
- Be specific about the location
- Explain why it's a problem
- Suggest how to fix it
- Reference the relevant convention if applicable

## Review Priorities

Based on file type and codebase:

**Frontend (TypeScript/React):**
- Check TS001 (prefer const), TS002 (explicit types)
- Check COMP002 (component structure)
- Check FORM001 (form handling)

**Backend (PHP/Symfony):**
- Check DEV020 (CQRS patterns)
- Check DEV022 (event handling)
- Check DEV027 (value objects)
- Check DEV034 (dependency injection)

## Output

Provide the review report, then ask if the engineer wants:
1. More detail on any specific issue
2. Code suggestions for fixes
3. To proceed with committing (if no critical issues)
4. Tips to improve the score
