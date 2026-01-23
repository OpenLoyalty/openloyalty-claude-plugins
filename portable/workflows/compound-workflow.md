# Compound Learning Workflow (Tool-Agnostic)

This workflow can be executed by any AI coding assistant.

## Prerequisites

- Git repository with branch to document
- Access to read files and run git commands

## Workflow

### Input

- `branch_name`: Branch to analyze (or auto-detect current branch)
- `ticket_id`: Optional Jira ticket ID (extracted from branch name if follows pattern)
- `slack_url`: Optional Slack thread URL for additional context

### Step 1: Detect Branch

If branch not specified:
```bash
git rev-parse --abbrev-ref HEAD
```

Extract ticket ID from branch name:
- Pattern: `OLOY-\d+`
- Example: `feature/OLOY-123-fix-bug` -> `OLOY-123`

### Step 2: Analyze Git History

```bash
# Get commit log
git log main..{branch_name} --pretty=format:"%h %s" --reverse

# Get overall diff stats
git diff main...{branch_name} --stat

# Get detailed diff for key files
git diff main...{branch_name} -- {significant_files}
```

From this, extract:
- Timeline of commits
- What files changed
- Nature of changes
- Commit message insights

### Step 3: Analyze Code Changes

Read the significantly changed files. Understand:
- What was the code doing before?
- What does it do now?
- Why was this change needed?

### Step 4: Fetch External Context (Optional)

If Jira access available and ticket ID found:
- Fetch ticket summary, description, acceptance criteria
- Look for Slack links in comments

If Slack access available and URL provided:
- Fetch conversation context

These are optional enhancements - the workflow works without them.

### Step 5: Synthesize

Combine all gathered information to understand:

1. **Problem Statement:** What triggered this work?
2. **Hypothesis:** What was the initial approach?
3. **Investigation Steps:** What was tried, in order?
4. **Findings:** What was discovered?
5. **Conclusion:** What was the root cause or solution?
6. **Lessons Learned:** What's reusable knowledge?

### Step 6: Generate Document

Use this template structure:

```markdown
# {TICKET}: {Title}

**Date:** {date}
**Author:** {author}
**Branch:** {branch_name}
**Ticket:** {jira_url or "N/A"}
**Type:** {Bug Fix | Feature | Spike | Refactor}

---

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
| {finding} | {details} |

## Conclusion
**{Summary}**
{Detailed explanation}
**Confidence level:** {High | Medium | Low}

---

## Lessons Learned

### For Future Investigations
1. {Lesson}

### For the Codebase
1. {Insight}

### Pattern Recognition
**Symptoms that indicate this type of issue:**
- {Symptom}

---

## Related Documents
- {Links}

## Related Discussions
- {Slack URL if provided}

---
*Generated following the Compound Engineering methodology.*
```

### Step 7: Save

Output location: `engineering/compound-learnings/{ticket}-{slug}.md`

Naming:
- `{ticket}`: Jira ticket or "NO-TICKET"
- `{slug}`: kebab-case summary of the problem

Example: `OLOY-6715-timezone-offset-fix.md`

## Output

The compound learning document, plus a brief summary of:
- File location
- Key lessons captured
- Suggestion to link in Engineering Strategy if significant
