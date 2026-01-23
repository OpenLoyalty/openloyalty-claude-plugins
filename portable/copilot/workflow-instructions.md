# Open Loyalty Workflow Instructions for GitHub Copilot

Add this content to `.github/copilot-instructions.md` in your repository.

---

## Compound Learning Workflow

When documenting lessons learned from a branch:

### Process

1. **Analyze git history:**
   ```bash
   git log main..HEAD --pretty=format:"%h %s" --reverse
   git diff main...HEAD --stat
   ```

2. **Read changed files** to understand what was modified and why

3. **Extract information:**
   - Problem: What triggered this work? (specific symptoms)
   - Steps: What was tried, including dead ends?
   - Findings: What was discovered?
   - Conclusion: Root cause or solution
   - Lessons: What's reusable knowledge?

4. **Generate document** with this structure:
   ```markdown
   # {TICKET}: {Title}

   **Date:** {date}
   **Branch:** {branch}
   **Type:** Bug Fix | Feature | Spike | Refactor

   ## Problem Statement
   {specific symptoms that triggered this work}

   ## Investigation Steps
   1. {step with reasoning}

   ## Findings
   | Finding | Details |
   |---------|---------|

   ## Conclusion
   {root cause/solution with confidence level}

   ## Lessons Learned
   ### For Future Investigations
   ### For the Codebase
   ### Pattern Recognition
   - Symptoms that indicate this issue
   - Quick diagnostic steps
   ```

5. **Save to:** `engineering/compound-learnings/{TICKET}-{slug}.md`

---

## Code Review Workflow

When reviewing code changes:

1. **Check `AGENTS.md`** in the repository for conventions and critical rules

2. **For PHP/Backend**, verify:
   - CQRS patterns (DEV020)
   - Event handling (DEV022)
   - Value objects (DEV027)
   - Dependency injection (DEV034)

3. **For TypeScript/Frontend**, verify:
   - Const preference (TS001)
   - Explicit types (TS002)
   - Component structure (COMP002)
   - Form handling (FORM001)

4. **Report findings** categorized as:
   - Critical: Security, data integrity, breaking changes
   - Important: Convention violations, missing tests
   - Suggestions: Style, refactoring opportunities

---

## Spike Investigation Workflow

When conducting a technical spike:

1. **Define clearly:**
   - Question to answer
   - Time box
   - Success criteria

2. **Create document** at `engineering/spikes/{date}-{slug}.md`

3. **Document as you go:**
   - Options evaluated with pros/cons
   - Investigation log with timestamps
   - Dead ends (they save future time)

4. **Conclude with:**
   - Recommendation
   - Confidence level
   - Next steps

---

## Key Principles

- **Focus on "why"** not just "what"
- **Document dead ends** - they save future time
- **Pattern recognition** is the most valuable output
- **Be specific** about symptoms, not vague about problems

---

*These workflows follow the Compound Engineering methodology.*
