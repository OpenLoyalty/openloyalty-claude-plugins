---
name: compound-docs
description: Capture solved problems as categorized documentation with YAML frontmatter for fast lookup
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Task
preconditions:
  - Problem has been solved (not in-progress)
  - Solution has been verified working
---

# compound-docs Skill

**Purpose:** Automatically document solved problems to build searchable institutional knowledge with category-based organization and enum-validated problem types.

## Overview

This skill captures problem solutions immediately after confirmation, creating structured documentation that serves as a searchable knowledge base for future sessions. Documentation is organized by problem type into category directories with validated YAML frontmatter.

**Organization:** Single-file architecture - each problem documented as one markdown file in its symptom category directory (e.g., `engineering/compound-learnings/performance-issues/n-plus-one-points-20260128.md`).

---

<critical_sequence name="documentation-capture" enforce_order="strict">

## 7-Step Process

<step number="1" required="true">
### Step 1: Detect Confirmation

**Auto-invoke after phrases:**
- "that worked"
- "it's fixed"
- "working now"
- "problem solved"
- "that did it"
- "finally working"

**OR manual:** `/openloyalty:compound` command

**Non-trivial problems only:**
- Multiple investigation attempts needed
- Tricky debugging that took time
- Non-obvious solution
- Future sessions would benefit

**Skip documentation for:**
- Simple typos
- Obvious syntax errors
- Trivial fixes immediately corrected
</step>

<step number="2" required="true" depends_on="1">
### Step 2: Gather Context

Extract from conversation history:

**Required information:**
- **Module name**: Which Open Loyalty module had the problem
- **Symptom**: Observable error/behavior (exact error messages)
- **Investigation attempts**: What didn't work and why
- **Root cause**: Technical explanation of actual problem
- **Solution**: What fixed it (code/config changes)
- **Prevention**: How to avoid in future

**Environment details:**
- Open Loyalty version
- Environment (dev/staging/prod)
- File/line references
- Related Jira tickets

**BLOCKING REQUIREMENT:** If critical context is missing (module name, exact error, or resolution steps), ask user and WAIT for response before proceeding to Step 3:

```
I need a few details to document this properly:

1. Which module had this issue? [e.g., Points System, Campaign Manager]
2. What was the exact error message or symptom?
3. What environment was this in? (development/staging/production)

[Continue after user provides details]
```
</step>

<step number="3" required="false" depends_on="2">
### Step 3: Check Existing Docs

Search engineering/compound-learnings/ for similar issues:

```bash
# Search by error message keywords
grep -r "exact error phrase" engineering/compound-learnings/

# Search by symptom category
ls engineering/compound-learnings/[category]/
```

**IF similar issue found:**

THEN present decision options:

```
Found similar issue: engineering/compound-learnings/[path]

What's next?
1. Create new doc with cross-reference (recommended)
2. Update existing doc (only if same root cause)
3. Other

Choose (1-3): _
```

WAIT for user response, then execute chosen action.

**ELSE** (no similar issue found):

Proceed directly to Step 4 (no user interaction needed).
</step>

<step number="4" required="true" depends_on="2">
### Step 4: Generate Filename

Format: `[sanitized-symptom]-[module]-[YYYYMMDD].md`

**Sanitization rules:**
- Lowercase
- Replace spaces with hyphens
- Remove special characters except hyphens
- Truncate to reasonable length (< 80 chars)

**Examples:**
- `n-plus-one-query-points-system-20260128.md`
- `webhook-timeout-integration-20260128.md`
- `campaign-rules-not-evaluating-20260128.md`
</step>

<step number="5" required="true" depends_on="4" blocking="true">
### Step 5: Validate YAML Schema

**CRITICAL:** All docs require validated YAML frontmatter with enum validation.

<validation_gate name="yaml-schema" blocking="true">

**Validate against schema:**
Load `schema.yaml` and classify the problem against the enum values defined in [yaml-schema.md](./references/yaml-schema.md). Ensure all required fields are present and match allowed values exactly.

**Required fields:**
- `module` - String (valid OL module name)
- `date` - YYYY-MM-DD format
- `problem_type` - Must match enum exactly
- `component` - Must match enum exactly
- `symptoms` - Array with 1-5 specific items
- `root_cause` - Must match enum exactly
- `resolution_type` - Must match enum exactly
- `severity` - Must match enum exactly

**BLOCK if validation fails:**

```
YAML validation failed

Errors:
- problem_type: must be one of schema enums, got "compilation_error"
- severity: must be one of [critical, high, medium, low], got "severe"
- symptoms: must be array with 1-5 items, got string

Please provide corrected values.
```

**GATE ENFORCEMENT:** Do NOT proceed to Step 6 (Create Documentation) until YAML frontmatter passes all validation rules defined in `schema.yaml`.

</validation_gate>
</step>

<step number="6" required="true" depends_on="5">
### Step 6: Create Documentation

**Determine category from problem_type:** Use the category mapping:

```yaml
build_error: "build-errors"
test_failure: "test-failures"
runtime_error: "runtime-errors"
performance_issue: "performance-issues"
database_issue: "database-issues"
security_issue: "security-issues"
api_issue: "api-issues"
integration_issue: "integration-issues"
logic_error: "logic-errors"
developer_experience: "developer-experience"
configuration_issue: "configuration-issues"
documentation_gap: "documentation-gaps"
data_issue: "data-issues"
```

**Create documentation file:**

```bash
PROBLEM_TYPE="[from validated YAML]"
CATEGORY="[mapped from problem_type]"
FILENAME="[generated-filename].md"
DOC_PATH="engineering/compound-learnings/${CATEGORY}/${FILENAME}"

# Create directory if needed
mkdir -p "engineering/compound-learnings/${CATEGORY}"

# Write documentation using template from assets/resolution-template.md
# (Content populated with Step 2 context and validated YAML frontmatter)
```

**Create documentation:** Populate the structure from `assets/resolution-template.md` with context gathered in Step 2 and validated YAML frontmatter from Step 5.
</step>

<step number="7" required="false" depends_on="6">
### Step 7: Cross-Reference & Critical Pattern Detection

**If similar issues found in Step 3:**

Update existing doc:
```bash
# Add Related Issues link to similar doc
echo "- See also: [$FILENAME](./$FILENAME)" >> [similar-doc.md]
```

Update new doc:
Already includes cross-reference from Step 6.

**Critical Pattern Detection (Optional Proactive Suggestion):**

If this issue has automatic indicators suggesting it might be critical:
- Severity: `critical` in YAML
- Affects multiple components OR core modules (loyalty_engine, points_system)
- Non-obvious solution that others would likely miss

Then in the decision menu (Step 8), add a note:
```
This might be worth adding to Required Reading (Option 2)
```

But **NEVER auto-promote**. User decides via decision menu.

**Template for critical pattern addition:**

When user selects Option 2 (Add to Required Reading), use the template from `assets/critical-pattern-template.md` to structure the pattern entry. Add to `engineering/compound-learnings/patterns/ol-critical-patterns.md`.
</step>

</critical_sequence>

---

<decision_gate name="post-documentation" wait_for_user="true">

## Decision Menu After Capture

After successful documentation, present options and WAIT for user response:

```
Solution documented

File created:
- engineering/compound-learnings/[category]/[filename].md

What's next?
1. Continue workflow (recommended)
2. Add to Required Reading - Promote to critical patterns (ol-critical-patterns.md)
3. Link related issues - Connect to similar problems
4. View documentation - See what was captured
5. Other
```

**Handle responses:**

**Option 1: Continue workflow**
- Return to calling skill/workflow
- Documentation is complete

**Option 2: Add to Required Reading**

User selects this when:
- System made this mistake multiple times
- Solution is non-obvious but must be followed every time
- Foundational requirement (points calculation, API contracts, etc.)

Action:
1. Extract pattern from the documentation
2. Format as WRONG vs CORRECT with code examples
3. Add to `engineering/compound-learnings/patterns/ol-critical-patterns.md`
4. Add cross-reference back to this doc
5. Confirm: "Added to Required Reading. All AI agents will see this pattern."

**Option 3: Link related issues**
- Prompt: "Which doc to link? (provide filename or describe)"
- Search engineering/compound-learnings/ for the doc
- Add cross-reference to both docs
- Confirm: "Cross-reference added"

**Option 4: View documentation**
- Display the created documentation
- Present decision menu again

**Option 5: Other**
- Ask what they'd like to do

</decision_gate>

---

<integration_protocol>

## Integration Points

**Invoked by:**
- `/openloyalty:compound` command (primary interface)
- Manual invocation in conversation after solution confirmed
- Can be triggered by detecting confirmation phrases

**Invokes:**
- None (terminal skill - does not delegate to other skills)

**Handoff expectations:**
All context needed for documentation should be present in conversation history before invocation.

</integration_protocol>

---

<success_criteria>

## Success Criteria

Documentation is successful when ALL of the following are true:

- YAML frontmatter validated (all required fields, correct formats)
- File created in `engineering/compound-learnings/[category]/[filename].md`
- Enum values match schema.yaml exactly
- Code examples included in solution section
- Cross-references added if related issues found
- User presented with decision menu and action confirmed

</success_criteria>

---

## Error Handling

**Missing context:**
- Ask user for missing details
- Don't proceed until critical info provided

**YAML validation failure:**
- Show specific errors
- Present retry with corrected values
- BLOCK until valid

**Similar issue ambiguity:**
- Present multiple matches
- Let user choose: new doc, update existing, or link as duplicate

**Directory doesn't exist:**
- Create directory with `mkdir -p`
- Proceed with documentation

---

## Execution Guidelines

**MUST do:**
- Validate YAML frontmatter (BLOCK if invalid per Step 5 validation gate)
- Extract exact error messages from conversation
- Include code examples in solution section
- Create directories before writing files (`mkdir -p`)
- Ask user and WAIT if critical context missing

**MUST NOT do:**
- Skip YAML validation (validation gate is blocking)
- Use vague descriptions (not searchable)
- Omit code examples or cross-references
- Auto-promote to critical patterns without user approval

---

## Quality Guidelines

**Good documentation has:**

- Exact error messages (copy-paste from output)
- Specific file:line references
- Observable symptoms (what you saw, not interpretations)
- Failed attempts documented (helps avoid wrong paths)
- Technical explanation (not just "what" but "why")
- Code examples (before/after if applicable)
- Prevention guidance (how to catch early)
- Cross-references (related issues)

**Avoid:**

- Vague descriptions ("something was wrong")
- Missing technical details ("fixed the code")
- No context (which version? which file?)
- Just code dumps (explain why it works)
- No prevention guidance
- No cross-references

---

## Example Scenario

**User:** "That worked! The points are calculating correctly now."

**Skill activates:**

1. **Detect confirmation:** "That worked!" triggers auto-invoke
2. **Gather context:**
   - Module: Points System
   - Symptom: Points not crediting correctly, off by 1-2 points on large transactions
   - Failed attempts: Checked earning rules config, verified transaction amounts
   - Solution: Changed from Float to BigDecimal for points calculation
   - Root cause: Floating point precision loss in multiplication
3. **Check existing:** No similar issue found
4. **Generate filename:** `float-precision-points-system-20260128.md`
5. **Validate YAML:**
   ```yaml
   module: Points System
   date: 2026-01-28
   problem_type: logic_error
   component: points_system
   symptoms:
     - "Points calculation off by 1-2 points on large transactions"
     - "Accumulated rounding errors over time"
   root_cause: logic_error
   severity: high
   tags: [float-precision, bigdecimal, points-calculation]
   ```
   Valid
6. **Create documentation:**
   - `engineering/compound-learnings/logic-errors/float-precision-points-system-20260128.md`
7. **Cross-reference:** None needed

**Output:**

```
Solution documented

File created:
- engineering/compound-learnings/logic-errors/float-precision-points-system-20260128.md

This might be worth adding to Required Reading (Option 2)

What's next?
1. Continue workflow (recommended)
2. Add to Required Reading - Promote to critical patterns
3. Link related issues
4. View documentation
5. Other
```

---

## The Compounding Philosophy

> Each documented solution compounds your team's knowledge. The first time you solve "float precision in points calculation" takes research (30 min). Document it, and the next occurrence takes minutes. Knowledge compounds.

**Each unit of engineering work should make subsequent units of work easier—not harder.**
