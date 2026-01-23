# Compound Learning Agent

Generate a compound learning document from the current branch.

## Context

You are helping an Open Loyalty engineer document lessons learned from a completed branch.
This captures reusable knowledge for the team.

## Process

### Step 1: Detect Branch and Ticket

```bash
# Get current branch name
git rev-parse --abbrev-ref HEAD

# Extract ticket from branch name (pattern: OLOY-\d+)
# Example: feature/OLOY-123-fix-bug -> OLOY-123
```

### Step 2: Analyze Git History

```bash
# Get commit log (comparing to main)
git log main..HEAD --pretty=format:"%h %s" --reverse

# Get overall diff stats
git diff main...HEAD --stat
```

From this, extract:
- Timeline of commits
- What files changed
- Nature of changes (bug fix, feature, refactor)
- Insights from commit messages

### Step 3: Analyze Code Changes

Read the significantly changed files. Understand:
- What was the code doing before?
- What does it do now?
- Why was this change needed?

Focus on the **why**, not just the **what**.

### Step 4: Synthesize Findings

Combine all gathered information:

1. **Problem Statement:** What triggered this work? Be specific about symptoms.
2. **Hypothesis:** What was the initial approach or assumption?
3. **Investigation Steps:** What was tried, in chronological order? Include dead ends.
4. **Findings:** What was discovered? Distinguish symptoms from root causes.
5. **Conclusion:** What was the root cause (bugs) or solution (features)?
6. **Lessons Learned:** This is the most valuable part. Extract:
   - For Future Investigations: Process improvements
   - For the Codebase: Technical insights
   - Pattern Recognition: Symptoms that indicate this type of issue

### Step 5: Generate Document

Use this template:

```markdown
# {TICKET}: {Title}

**Date:** {YYYY-MM-DD}
**Author:** {git config user.name}
**Branch:** {branch_name}
**Ticket:** https://openloyalty.atlassian.net/browse/{TICKET}
**Type:** {Bug Fix | Feature | Spike | Refactor}

---

## Problem Statement

{What triggered this work - be specific about symptoms, not assumptions}

## Hypothesis / Approach

{Initial assumption about the cause or planned approach}

## Investigation Steps

1. {Step 1 - what was done first}
2. {Step 2 - what was tried next, including dead ends}
3. {Continue chronologically...}

## Findings

| Finding | Details |
|---------|---------|
| {finding_1} | {details_1} |
| {finding_2} | {details_2} |

## Conclusion

**{Root cause summary for bugs OR Solution summary for features}**

{Detailed explanation of why this was the root cause or how the solution works}

**Confidence level:** {High | Medium | Low}

---

## Lessons Learned

### For Future Investigations

1. {Process lesson - what would you do differently next time?}
2. {Diagnostic lesson - what's a faster way to find this?}

### For the Codebase

1. {Technical insight about the code}
2. {Documentation or architecture improvement identified}

### Pattern Recognition

**Symptoms that indicate this type of issue:**
- {Symptom 1 - observable behavior}
- {Symptom 2 - log patterns, error messages}

**Quick diagnostic steps:**
1. {First thing to check}
2. {Second thing to verify}

---

## Related Documents

- {Link to related compound learnings if any}

---

*Generated following the Compound Engineering methodology.*
```

### Step 6: Save Document

Save to: `engineering/compound-learnings/{TICKET}-{slug}.md`

Naming convention:
- `{TICKET}` = Jira ticket (e.g., OLOY-123) or "NO-TICKET" if none
- `{slug}` = kebab-case summary (e.g., timezone-offset-fix)

Example: `engineering/compound-learnings/OLOY-6715-timezone-offset-fix.md`

### Step 7: Report Completion

After writing the file:
1. Report the file location
2. Summarize the key lessons learned (2-3 bullet points)
3. Suggest if this should be linked in Engineering Strategy docs

## Quality Guidelines

**Good Problem Statements:**
- "Rewards earned between 11 PM and midnight local time were dated to the following day"
- NOT: "Timezone was wrong"

**Good Investigation Steps:**
- "Added logging to RewardDateCalculator.calculate() and noticed getTimezoneOffset() was being called with server time"
- NOT: "Checked the code"

**Good Pattern Recognition:**
- "When date calculations seem off by one day, first check if timezone offset is applied correctly"
- NOT: "Be careful with timezones"
