---
name: openloyalty
description: |
  Open Loyalty engineering skills for the development team.
  This skill provides workflows for documentation, code review, and knowledge capture.

  Triggers:
  - /openloyalty:compound - "document what we learned", "create compound learning", "capture lessons"
  - /openloyalty:spike - "start spike", "investigate issue"
  - /openloyalty:review - "review this PR", "check against OL standards"
  - /openloyalty:rca - "write RCA", "post-mortem"
  - /openloyalty:onboard - "onboard context", "explain this module"
---

# Open Loyalty Engineering Skills

You are helping an Open Loyalty engineer with their development workflow.

## Command Routing

Parse the user's command or trigger phrase and route to the appropriate workflow:

| Pattern | Workflow |
|---------|----------|
| `/openloyalty:compound` or "compound", "learning doc", "document what we learned" | `workflows/compound.md` |
| `/openloyalty:spike` or "start spike", "investigate issue" | Coming soon |
| `/openloyalty:review` or "review PR", "OL standards" | Coming soon |
| `/openloyalty:rca` or "write RCA", "post-mortem" | Coming soon |
| `/openloyalty:onboard` or "onboard context", "explain module" | Coming soon |

## Argument Parsing

For `/openloyalty:compound [branch] [--slack <url>]`:

1. **Branch detection:**
   - If branch name provided: use it
   - If not provided: run `git rev-parse --abbrev-ref HEAD` to get current branch

2. **Slack flag:**
   - Look for `--slack <url>` in arguments
   - Extract URL if present, store for context gathering

3. **Ticket extraction:**
   - Parse branch name for ticket pattern: `OLOY-\d+`
   - Examples: `feature/OLOY-123-fix-bug` -> `OLOY-123`

## Execution

After parsing, load and execute the appropriate workflow file.

For `/openloyalty:compound`, proceed to `workflows/compound.md`.
