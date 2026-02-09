---
name: openloyalty:engineering:compound
description: Document a recently solved problem to compound your team's knowledge
argument-hint: "[branch] [--slack <url>] [--ticket <OLOY-XXX>]"
---

# /openloyalty:engineering:compound

Coordinate multiple subagents working in parallel to document a recently solved problem.

## Purpose

Captures problem solutions while context is fresh, creating structured documentation in `engineering/compound-learnings/` with YAML frontmatter for searchability and future reference. Uses parallel subagents for maximum efficiency.

**Why "compound"?** Each documented solution compounds your team's knowledge. The first time you solve a problem takes research. Document it, and the next occurrence takes minutes. Knowledge compounds.

## Usage

```bash
/openloyalty:engineering:compound                     # Document from current context
/openloyalty:engineering:compound [branch]            # Analyze specific branch
/openloyalty:engineering:compound --ticket OLOY-123   # Include Jira context
/openloyalty:engineering:compound --slack <url>       # Include Slack thread context
```

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `[branch]` | Branch to analyze (default: current) | `feature/OLOY-123-fix` |
| `--slack <url>` | Include Slack thread context | `--slack https://slack.com/...` |
| `--ticket <ID>` | Jira ticket ID | `--ticket OLOY-1234` |

## Execution Strategy: Parallel Subagents

This command launches multiple specialized subagents **IN PARALLEL** to maximize efficiency:

### Phase 1: Parallel Context Gathering (6 Agents)

Launch all agents simultaneously using the Task tool:

#### 1. Context Analyzer
```
Task: general-purpose
Prompt: |
  Analyze the conversation history and extract:
  1. Problem type (build_error, runtime_error, performance_issue, etc.)
  2. Affected module (Points System, Campaign Manager, etc.)
  3. Component involved (loyalty_engine, api_gateway, etc.)
  4. Observable symptoms (exact error messages)
  5. Environment details (OL version, dev/staging/prod)

  Return structured YAML-compatible data for frontmatter.
```

#### 2. Solution Extractor
```
Task: general-purpose
Prompt: |
  Analyze the conversation and extract:
  1. All investigation steps tried (chronological)
  2. What didn't work and why
  3. The working solution (with code examples)
  4. Root cause explanation
  5. Prevention strategies

  Format as structured content for documentation.
```

#### 3. Git History Analyzer (if branch provided)
```
Task: compound-engineering:research:git-history-analyzer
Prompt: |
  Analyze the git history for branch: {branch_name}
  Compare against main/master branch.

  Extract:
  1. All commit messages (chronological order)
  2. Files changed per commit
  3. Overall patterns in the changes
  4. Timeline of the work
  5. Any commit message insights about problems/solutions
```

#### 4. Code Diff Analyzer (if branch provided)
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
```

#### 5. Related Docs Finder
```
Task: Explore
Prompt: |
  Search engineering/compound-learnings/ for similar issues:
  1. Search by symptom keywords
  2. Search by component
  3. Search by error messages

  Return list of potentially related documents with relevance notes.
```

#### 6. Jira Context Fetcher (Optional - Graceful Degradation)
```
Task: general-purpose
Prompt: |
  Attempt to fetch Jira ticket context for: {ticket_id}

  Steps:
  1. First check if Atlassian MCP tools are available
  2. If not available: return { "status": "mcp_not_configured" }
  3. If available, try: mcp__mcp-atlassian__jira_get_issue
  4. If successful:
     - Extract: summary, description, acceptance criteria
     - Look for Slack thread URLs in comments
     - Note any linked issues
  5. If call fails:
     - Return: { "status": "unavailable", "reason": "..." }

  This is optional - the skill works without Jira.
```

### Phase 2: Slack Context (If --slack flag provided)

```
Task: general-purpose
Prompt: |
  Attempt to fetch Slack message from: {slack_url}

  Steps:
  1. Try Slack MCP if available
  2. If successful: extract message content and thread
  3. If unavailable: save URL as reference link only

  Return content or just the URL for reference.
```

### Phase 3: Synthesize & Validate

After all parallel agents complete:

1. **Merge Results:** Combine outputs from all agents
2. **Build YAML Frontmatter:** Construct validated frontmatter with enum values
3. **Validate Schema:** Check against `schema.yaml` (BLOCKING)
4. **Determine Category:** Map problem_type to output directory

### Phase 4: Generate Documentation

Route to `compound-docs` skill for:
- Step 5: YAML validation gate
- Step 6: Documentation creation
- Step 7: Cross-referencing

Use template from `skills/compound-docs/assets/resolution-template.md`.

### Phase 5: Post-Documentation Options

Present decision menu (from compound-docs skill):

```
Solution documented

File created:
- engineering/compound-learnings/[category]/[filename].md

What's next?
1. Continue workflow (recommended)
2. Add to Required Reading - Promote to critical patterns
3. Link related issues
4. View documentation
5. Other
```

## Output Location

**Path:** `engineering/compound-learnings/{category}/{filename}.md`

**Categories (auto-detected from problem_type):**
- `build-errors/`
- `test-failures/`
- `runtime-errors/`
- `performance-issues/`
- `database-issues/`
- `security-issues/`
- `api-issues/`
- `integration-issues/`
- `logic-errors/`
- `developer-experience/`
- `configuration-issues/`
- `documentation-gaps/`
- `data-issues/`
- `patterns/` (for critical patterns)

**Naming Convention:**
- `{symptom-slug}-{module-slug}-{YYYYMMDD}.md`
- Example: `n-plus-one-query-points-system-20260128.md`

## Success Output

```
Parallel documentation generation complete

Primary Subagent Results:
  Context Analyzer: Identified performance_issue in Points System
  Solution Extractor: Extracted 2 code fixes
  Related Docs Finder: Found 1 related issue
  Git History: Analyzed 5 commits
  Jira Context: Linked to OLOY-1234

File created:
- engineering/compound-learnings/performance-issues/n-plus-one-points-20260128.md

This documentation will be searchable for future reference when similar
issues occur in the Points System or Loyalty Engine modules.

What's next?
1. Continue workflow (recommended)
2. Add to Required Reading
3. Link related issues
4. View documentation
5. Other
```

## The Compounding Philosophy

This creates a compounding knowledge system:

1. First time you solve "N+1 query in points calculation" → Research (30 min)
2. Document the solution → engineering/compound-learnings/performance-issues/... (5 min)
3. Next time similar issue occurs → Quick lookup (2 min)
4. Knowledge compounds → Team gets smarter

The feedback loop:

```
Build → Test → Find Issue → Research → Improve → Document → Validate → Deploy
    ↑                                                                      ↓
    └──────────────────────────────────────────────────────────────────────┘
```

**Each unit of engineering work should make subsequent units of work easier—not harder.**

## Auto-Invoke

<auto_invoke>
<trigger_phrases>
- "that worked"
- "it's fixed"
- "working now"
- "problem solved"
- "finally working"
</trigger_phrases>

<manual_override>
Use `/openloyalty:engineering:compound [context]` to document immediately without waiting for auto-detection.
</manual_override>
</auto_invoke>

## Routes To

`compound-docs` skill (for documentation engine)

## Related Commands

- `/openloyalty:engineering:review-pr` - Code review workflow
- `/openloyalty:help` - Plugin documentation
