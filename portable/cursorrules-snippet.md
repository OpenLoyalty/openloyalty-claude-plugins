# Cursor Rules Snippet for Open Loyalty

Add this to your `.cursorrules` file for compound learning support.

---

## Compound Learning Workflow

When asked to "document what we learned", "create compound learning", or "capture lessons from this branch":

### Step 1: Gather Context

1. **Git history:** Run `git log main..HEAD --oneline` to see commits
2. **Code changes:** Run `git diff main...HEAD --stat` to see changed files
3. **Read key files:** Open the most significantly changed files

### Step 2: Extract Information

Identify:
- What problem was being solved
- What approach was taken
- What was discovered
- What the solution was

### Step 3: Generate Document

Use the template structure:

```markdown
# {TICKET}: {Title}

**Date:** {today}
**Branch:** {current_branch}
**Type:** Bug Fix | Feature | Spike | Refactor

## Problem Statement
{What triggered this work}

## Hypothesis / Approach
{Initial assumption or planned approach}

## Investigation Steps
1. {Step 1}
2. {Step 2}

## Findings
| Finding | Details |
|---------|---------|
| ... | ... |

## Conclusion
**{Root cause / Solution summary}**
{Detailed explanation}

## Lessons Learned

### For Future Investigations
1. {Process lesson}

### For the Codebase
1. {Technical insight}

### Pattern Recognition
**Symptoms that indicate this type of issue:**
- {Symptom}

---
*Generated following the Compound Engineering methodology.*
```

### Step 4: Save Document

Save to: `engineering/compound-learnings/{ticket}-{slug}.md`

Example: `engineering/compound-learnings/OLOY-123-timezone-fix.md`
