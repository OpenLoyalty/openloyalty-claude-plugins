# Compound Learning Principles

Guidelines for creating effective compound learning documents.

## Core Philosophy

Compound learning documents capture knowledge so it can be reused. A good compound learning document:

1. **Saves future debugging time** - Pattern recognition helps diagnose similar issues faster
2. **Preserves context** - Why decisions were made, not just what was done
3. **Teaches** - Someone unfamiliar with the code can understand the problem and solution

## What Makes a Good Compound Learning Document

### Problem Statement

- Be specific about symptoms, not assumptions
- Include how the problem was discovered
- Note any misleading initial signals

**Bad:** "Timezone was wrong"
**Good:** "Rewards earned between 11 PM and midnight local time were dated to the following day in reports, but only for users in negative UTC offset timezones"

### Investigation Steps

- Document dead ends - they save future time
- Include the reasoning, not just the actions
- Note any tools or techniques that helped

**Bad:** "Checked the code"
**Good:** "Added logging to RewardDateCalculator.calculate() and noticed getTimezoneOffset() was being called with server time instead of user's local time"

### Findings

- Distinguish between symptoms and root causes
- Note any related issues discovered but not fixed
- Include evidence (logs, test results, etc.)

### Lessons Learned

The most valuable section. Ask:

- What would help someone find this issue faster?
- What pattern should trigger thinking about this?
- What part of the codebase might have similar issues?

**Pattern Recognition is key:** Document the observable symptoms that should make someone think "this might be a timezone issue" or "this could be related to that OLOY-123 bug."

## Anti-Patterns to Avoid

1. **Too vague:** "Fixed a bug" - Useless for future reference
2. **Too detailed:** Including every git command run - Focus on insights, not mechanics
3. **Missing the "why":** Describing what was changed without explaining why it was wrong
4. **No pattern recognition:** Solving the immediate problem without extracting reusable knowledge

## When to Create Compound Learnings

Create a compound learning when:

- A bug took significant time to diagnose
- You discovered something surprising about the codebase
- The fix wasn't obvious from the symptom
- Similar issues might occur elsewhere
- A new team member might encounter this

Skip if:

- Trivial fix with obvious cause (typo, missing import)
- Already well-documented elsewhere
- No generalizable lessons
