---
name: engineering:backend-pr-create
description: Create a backend pull request with OL conventions, Jira linking, and structured description.
argument-hint: "[--ticket <OLOY-XXX>] [--base <branch>] [--draft]"
---

# Backend PR Create

Create a well-structured pull request for Open Loyalty backend changes, following team conventions.

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--ticket <ID>` | Jira ticket ID (auto-detected from branch if not provided) | `--ticket OLOY-456` |
| `--base <branch>` | Target branch (auto-detected if not provided) | `--base 5.144` |
| `--draft` | Create as draft PR | `--draft` |

## Phase 1: Gather Context (Parallel Agents)

Run these agents **IN PARALLEL** using the Task tool:

### Agent 1: Git & Branch Context

```
Task: Bash
Prompt: |
  Run a single batched command to gather branch and commit context:

  echo "=== BRANCH ===" && git rev-parse --abbrev-ref HEAD && \
  echo "=== BASE_DETECT ===" && (git rev-parse --abbrev-ref @{upstream} 2>/dev/null | sed 's|origin/||' || echo "DETECT_NEEDED") && \
  echo "=== LOG ===" && git log $(git merge-base HEAD origin/$(git rev-parse --abbrev-ref @{upstream} 2>/dev/null | sed 's|origin/||' || echo main))..HEAD --oneline 2>/dev/null && \
  echo "=== STAT ===" && git diff $(git merge-base HEAD origin/$(git rev-parse --abbrev-ref @{upstream} 2>/dev/null | sed 's|origin/||' || echo main))..HEAD --stat 2>/dev/null && \
  echo "=== DIFF_SUMMARY ===" && git diff $(git merge-base HEAD origin/$(git rev-parse --abbrev-ref @{upstream} 2>/dev/null | sed 's|origin/||' || echo main))..HEAD --name-only 2>/dev/null && \
  echo "=== REMOTE ===" && git remote -v 2>/dev/null && \
  echo "=== PUSH_STATUS ===" && git status -sb 2>/dev/null

  Parse and return:
  - branch_name: current branch
  - ticket_id: extract OLOY-\d+ from branch name
  - base_branch: detected or provided base branch
  - commits: list of commit messages
  - files_changed: list with stats
  - total_additions/deletions
  - is_pushed: whether branch is pushed to remote
```

### Agent 2: Jira Ticket Context (Optional)

**Skip if:** no ticket_id found and no `--ticket` flag provided.

```
Task: general-purpose
Prompt: |
  Attempt to fetch Jira ticket context for: {ticket_id}

  Steps:
  1. Check if Atlassian MCP tools are available
  2. If not available: return { "status": "mcp_not_configured" }
  3. If available, try: mcp__mcp-atlassian__jira_get_issue with issue_key={ticket_id}
  4. If successful, extract:
     - Summary (ticket title)
     - Description
     - Acceptance criteria
     - Issue type (bug, story, task)
     - Epic link if present
  5. If call fails: return { "status": "unavailable", "reason": "..." }

  This is optional. PR creation works without Jira.
```

### Agent 3: Change Analysis

```
Task: Explore
Prompt: |
  Analyze the diff between current branch and base branch to understand:

  1. What type of change this is (feature, bugfix, refactor, chore)
  2. Which modules/domains are affected
  3. Whether there are migrations
  4. Whether there are new/changed API endpoints
  5. Whether tests were added or modified
  6. Any breaking changes

  Return a structured summary of the changes.
```

## Phase 2: Build PR Description

After all agents complete, construct the PR description.

### Title Format

```
{type}({scope}): {summary} [{ticket_id}]
```

- **type**: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`
- **scope**: affected module (e.g., `points`, `campaigns`, `tiers`)
- **summary**: concise description in imperative mood
- **ticket_id**: Jira ticket if available

Examples:
- `feat(points): add batch transfer endpoint [OLOY-456]`
- `fix(campaigns): correct reward calculation for tiered discounts [OLOY-789]`

### Body Template

```markdown
## Summary

{1-3 sentences describing what this PR does and why}

## Ticket

{OLOY-XXX link or "No ticket associated"}

## Changes

- {Bullet list of key changes}

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactoring (no functional changes)
- [ ] Documentation update
- [ ] Tests only

## Testing

{Description of how changes were tested}

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Migration Notes

{If migrations present: description and any manual steps needed}
{If no migrations: "No migrations in this PR"}

## Checklist

- [ ] Code follows OL conventions (AGENTS.md)
- [ ] Tests pass locally
- [ ] No N+1 queries introduced
- [ ] API changes documented
```

## Phase 3: Confirm & Create

### Step 1: Present PR Preview

Show the user the constructed PR title and body for review before creation.

### Step 2: Push Branch (if needed)

If the branch is not pushed to remote:

```bash
git push -u origin {branch_name}
```

### Step 3: Create PR

```bash
gh pr create \
  --title "{title}" \
  --body "{body}" \
  --base {base_branch} \
  {--draft if flag provided}
```

### Step 4: Post-Creation

After PR is created:

1. Display the PR URL
2. If Jira ticket exists, suggest linking: "Want me to add the PR link to the Jira ticket?"

## Related Commands

- `/openloyalty:engineering:review-pr` - Review the PR after creation
- `/openloyalty:engineering:compound` - Document any solved problems
- `/openloyalty:help` - Plugin documentation
