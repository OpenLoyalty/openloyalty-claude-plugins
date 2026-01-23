# Compound Learning Workflow

Generate a compound learning document from a completed branch.

## Phase 1: Gather Context (Parallel Agents)

Run these three agents **IN PARALLEL** using the Task tool:

### Agent 1: Git History Analyzer

```
Task: git-history-analyzer
Prompt: |
  Analyze the git history for branch: {branch_name}
  Compare against main/master branch.

  Extract:
  1. All commit messages (chronological order)
  2. Files changed per commit
  3. Overall patterns in the changes
  4. Timeline of the work
  5. Any commit message insights about problems/solutions

  Format as structured data for synthesis.
```

### Agent 2: Code Diff Analyzer

```
Task: Explore
Prompt: |
  Analyze the code changes on branch: {branch_name}

  Run: git diff main...{branch_name} --stat
  Then read the most significant changed files.

  Extract:
  1. What areas of code were modified
  2. The nature of changes (bug fix, feature, refactor)
  3. Any before/after patterns visible
  4. Technical approach taken
  5. Key files and their roles in the change
```

### Agent 3: Jira Context (Optional - Graceful Degradation)

```
Task: general-purpose
Prompt: |
  Attempt to fetch Jira ticket context for: {ticket_id}

  Steps:
  1. Try: mcp__mcp-atlassian__jira_get_issue with issue_key={ticket_id}
  2. If successful:
     - Extract: summary, description, acceptance criteria
     - Look for Slack thread URLs in comments
     - Note any linked issues
  3. If MCP unavailable or fails:
     - Return: { "status": "unavailable", "reason": "..." }
     - This is fine - the skill works without Jira

  Return structured context or unavailability notice.
```

## Phase 2: Slack Context (If --slack flag provided)

If user provided `--slack <url>`:

```
Task: general-purpose
Prompt: |
  Attempt to fetch Slack message from: {slack_url}

  Steps:
  1. Try Slack MCP if available
  2. If successful: extract message content
  3. If unavailable: save URL as reference link only

  Return content or just the URL for reference.
```

## Phase 3: Synthesize Findings

From all agent outputs, synthesize:

### 1. Problem Statement
- What issue/feature was this branch addressing?
- What triggered this work?
- Initial hypothesis or approach?

### 2. Investigation/Implementation Steps
- Chronological steps taken
- What was tried?
- What worked, what didn't?

### 3. Findings
- What was discovered?
- Any unexpected results?
- Key technical insights?

### 4. Conclusion
- Root cause (for bugs) OR solution (for features)
- Confidence level (High/Medium/Low)

### 5. Lessons Learned
Extract three categories:

**For Future Investigations:**
- Process improvements
- Better approaches for similar problems

**For the Codebase:**
- Technical insights
- Areas that might need attention
- Documentation gaps found

**Pattern Recognition:**
- Symptoms that indicate this type of issue
- Heuristics for faster diagnosis next time

## Phase 4: Generate Document

Use template from `templates/compound-learning.md`

**Output location:** `engineering/compound-learnings/{ticket}-{slug}.md`

Naming convention:
- `{ticket}` = Jira ticket (e.g., OLOY-123) or "NO-TICKET"
- `{slug}` = kebab-case summary (e.g., timezone-offset-fix)

Example: `engineering/compound-learnings/OLOY-6715-timezone-offset-fix.md`

## Phase 5: Completion

After writing the file:

1. Report the file location
2. Summarize key lessons learned
3. Suggest if this should be linked in Engineering Strategy docs
