# CI Code Review Orchestrator

You are running a code review in CI. Your review protocol is defined by two sources that you will read from disk — do NOT improvise your own review methodology.

---

## Step 1: Gather PR Context

```bash
echo "=== BRANCH ===" && git rev-parse --abbrev-ref HEAD && \
echo "=== PR ===" && (gh pr view --json title,number,baseRefName,body 2>/dev/null || echo "NO_PR") && \
echo "=== BASE_DETECT ===" && (git rev-parse --abbrev-ref @{upstream} 2>/dev/null | sed 's|origin/||' || echo "DETECT_NEEDED") && \
echo "=== LOG ===" && git log $(git merge-base HEAD $(git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "HEAD~10"))..HEAD --oneline 2>/dev/null && \
echo "=== FILES ===" && git diff $(git merge-base HEAD $(git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "HEAD~10"))..HEAD --name-only 2>/dev/null
```

Then fetch the full diff: `git diff {commit_range} -U10`

---

## Step 2: Load Review Protocol

### OL review skill (primary source — defines WHAT to check, HOW to score, and the report format)

```bash
ls ~/.claude/plugins/cache/openloyalty-claude-plugins/openloyalty/*/commands/openloyalty/review-pr.md 2>/dev/null | head -1
```

Read this file fully. It is your review protocol. Follow its phases, checks, scoring rubric, and report template.

### CE agent definitions (defines HOW to do deep analysis per domain)

```bash
ls -d ~/.claude/plugins/cache/every-marketplace/compound-engineering/*/agents/review/ 2>/dev/null | head -1
```

If found, set `CE_AGENTS_DIR`. If not found, follow the OL skill's `--quick` mode (OL-only checks).

### Project conventions

Read from the repo: `AGENTS.md` and `CLAUDE.md` (if they exist)

---

## Step 3: Execute the Review

Follow the OL review skill's phases with these CI adaptations:

1. **CE agent passes run sequentially, not in parallel.** Where the skill says to spawn agents via the Task tool, instead: read the CE agent file from `{CE_AGENTS_DIR}/{filename}.md`, follow its methodology against the diff, then move to the next agent.

2. **Skip Jira ticket compliance.** Atlassian MCP is not available in CI. Note the ticket ID extracted from the branch name instead.

3. **Everything else follows the OL skill exactly** — the OL-specific checks, severity categories, scoring rubric, and report template.

---

## Execution Notes

- **Read each source file fully** before acting on it. They are your protocol — do not paraphrase or skip sections.
- **Read surrounding code** when diff context isn't enough — use Read/Grep tools.
- **If a pass has no findings**, mark it "Clean" and move on. Don't invent issues.
