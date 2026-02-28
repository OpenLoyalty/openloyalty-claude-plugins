---
name: context-doctor
description: Analyses and fixes CLAUDE.md files using context engineering best practices. Recursively discovers and treats all CLAUDE.md files in the project (root + subdomain). Use when user says "fix my CLAUDE.md", "review context files", "context doctor", "clean up CLAUDE.md", "optimise context", "check my context", or when improving CLAUDE.md/AGENTS.md files. Also triggers on requests about context rot, context engineering, or improving agent performance in a project.
---

# Context Doctor

Diagnoses and fixes CLAUDE.md files using context engineering best practices.

## Core Principles

These principles guide every decision (see `references/context-principles.md` for full detail):

1. **Minimal > comprehensive** — every line must earn its place
2. **Right altitude** — specific heuristics, not if-then rules or vague platitudes
3. **Tour map, not guidebook** — CLAUDE.md navigates, docs/ explains
4. **Don't duplicate** — if README or docs/ already covers it, link instead
5. **Code over prose** — prefer scripts/hooks for critical validations
6. **Progressive disclosure** — lean context file, detailed docs elsewhere

## Workflow

### Phase 1: Scan Project

Run the analysis script to gather project metadata:

```bash
bash <skill-dir>/scripts/analyze-context.sh .
```

> **Note:** `<skill-dir>` is the directory containing this SKILL.md file. Resolve the full path before executing.

Then read these files (if they exist):
- `CLAUDE.md` — root context file (also check `.claude/CLAUDE.md`)
- `CLAUDE.local.md` — local overrides
- `AGENTS.md` — alternative/cross-tool context file
- `.claude/rules/*.md` — path-specific rules (check for `paths:` frontmatter)
- `README.md` — check for content duplication
- `docs/` directory listing — check what detailed docs exist
- **All subdomain CLAUDE.md files** — discovered by the analysis script under `=== SUBDOMAIN CONTEXT FILES ===`
- Auto-memory at `~/.claude/projects/<project>/memory/MEMORY.md` — check for duplication with CLAUDE.md

Read every discovered CLAUDE.md file. Record:
- Project type: code-repo, obsidian-vault, monorepo, infrastructure, or unknown
- File inventory: root CLAUDE.md + list of all subdomain CLAUDE.md paths

### Phase 2: Diagnose Issues

Consult `references/anti-patterns.md` and score **each** CLAUDE.md file on six dimensions:

| Dimension | Question |
|---|---|
| **Length** | Over budget? (root: >150 lines, subdomain: >80 lines) |
| **Altitude** | Too prescriptive (if-then rules) or too vague (platitudes)? |
| **Duplication** | Does it repeat root CLAUDE.md, README.md, docs/, or auto-memory content? |
| **Structure** | Does it follow the appropriate template? Critical rules in first 20 lines? |
| **Disclosure** | Is everything inline or does it link to docs/, `.claude/rules/`, skills? |
| **Actionability** | Can a developer act on each rule? Blockers vs essays? Vague qualifiers? |
| **Freshness** | Do technologies/versions match actual project state? |

**Start with the root CLAUDE.md**, then diagnose each subdomain file.

For subdomain files, also check for **Anti-Pattern 11** (see `references/anti-patterns.md`):
- Does it duplicate rules already in the root CLAUDE.md?
- Does it contain cross-cutting concerns that belong in root?
- Is it missing domain-specific context that justifies its existence?

Present findings as a scorecard per file:

```
=== CLAUDE.md Health Check: Root ===
Length:        3/5 (127 lines — within budget)
Altitude:      2/5 (some if-then rules, needs generalising)
Duplication:   1/5 (setup instructions copied from README)
Structure:     4/5 (has sections, missing Boundaries)
Disclosure:    2/5 (API docs inline, should be in docs/)
Actionability: 3/5 (some rules are essays, need terse blockers)

Top issues:
1. [Anti-Pattern 1]: Lines 45-89 duplicate README setup instructions
2. [Anti-Pattern 3]: Lines 12-25 are verbose essays, convert to blockers
3. [Anti-Pattern 6]: No Boundaries section (NEVER/ASK FIRST)

=== CLAUDE.md Health Check: billing/CLAUDE.md ===
Length:        4/5 (52 lines — within budget)
Altitude:      3/5 (acceptable)
Duplication:   2/5 (repeats coding standards from root CLAUDE.md)
Structure:     3/5 (missing domain entities section)
Disclosure:    4/5 (links to docs/)
Actionability: 4/5 (terse rules)

Top issues:
1. [Anti-Pattern 11]: Lines 8-15 duplicate root coding standards
2. Missing domain entities and relationships section
```

If no CLAUDE.md exists at a given path, skip scoring and proceed to Phase 3 with a fresh creation.

### Phase 3: Fix CLAUDE.md Files

Process all discovered CLAUDE.md files. **Always start with root, then subdomain files.**

#### 3a: Root CLAUDE.md

Load the appropriate template from `references/ideal-structure.md` based on project type.

**For existing files — restructure:**
1. Extract content worth keeping (critical rules, architecture decisions, unique knowledge)
2. Identify content to remove (duplicated, verbose, belongs in docs/)
3. Rewrite using the template structure
4. Apply right-altitude rewrites (essays → terse blocker rules)
5. Add missing sections (especially Boundaries)
6. Add links to existing docs/ files where content was removed
7. **Move subdomain-specific rules** out of root into the appropriate subdomain CLAUDE.md

**For new files — create from template:**
1. Select template matching project type
2. Fill in from project analysis (language, framework, structure)
3. Add discovered conventions from package files, config, and existing code patterns

#### 3b: Subdomain CLAUDE.md Files

Use **Template E: Subdomain** from `references/ideal-structure.md`.

**For existing files — restructure:**
1. Remove anything that duplicates the root CLAUDE.md (it's inherited automatically)
2. Keep only domain-specific content: entities, relationships, invariants, domain vocabulary
3. Apply right-altitude rewrites
4. Add missing sections (Domain Context, Boundaries)

**For new files — create from template:**
1. Analyze the subdomain directory to identify its purpose
2. Extract domain entities, key files, and patterns from the code
3. Fill the subdomain template

**Hierarchy rule:** Subdomain files inherit root context automatically. Never repeat root rules — only add what is unique to that domain.

#### Line budgets (strict):

| File Type | Budget |
|-----------|--------|
| Root — code repository | 100-150 lines |
| Root — obsidian vault | 50-80 lines |
| Root — monorepo | 100-150 lines |
| Root — infrastructure | 80-120 lines |
| Subdomain CLAUDE.md | 30-80 lines |

**Before writing any file, present the proposed content to the user and ask for approval.**

### Phase 4: Summary

Present a before/after comparison for **every** CLAUDE.md file and actionable recommendations:

```
=== Context Doctor Summary ===

Root CLAUDE.md:
  Before: [X lines / not present]
  After:  [Y lines]
  Change: [removed Z lines of duplication, added Boundaries section, etc.]
  Score:  [before/30] → [after/30]

billing/CLAUDE.md:
  Before: [X lines / not present]
  After:  [Y lines]
  Change: [removed duplication from root, added domain entities, etc.]
  Score:  [before/30] → [after/30]

identity/CLAUDE.md:
  Before: [not present]
  After:  [Y lines]
  Change: [created from subdomain template]
  Score:  [—] → [after/30]

Recommendations:
  High: [list content that should move to docs/ or be created]
  Medium: [suggestions for progressive disclosure, external memory]
  Low: [nice-to-have improvements, subdomain files that could be created]
```

Keep recommendations concise — bullet points, not prose.

## Guidelines

- **MUST** present CLAUDE.md changes to user before writing — never overwrite without approval
- **MUST** preserve user's unique project knowledge (architecture decisions, domain rules)
- **MUST NOT** add content that duplicates README.md or existing docs
- **MUST NOT** exceed line budgets
- **MUST** use American English in all generated content (aligns with Anthropic documentation style)
- **MUST** keep critical rules as terse blockers (1-2 lines), never essays
- **MUST NOT** duplicate root CLAUDE.md content in subdomain files
- **SHOULD** link to existing docs rather than inlining content
- **SHOULD** suggest creating docs/ files for content removed from CLAUDE.md
- **SHOULD** detect and preserve project-specific conventions from config files
- **SHOULD** suggest creating subdomain CLAUDE.md files for directories with distinct bounded contexts

## Success Criteria

- [ ] Root CLAUDE.md within line budget for project type
- [ ] All subdomain CLAUDE.md files within 30-80 line budget
- [ ] No content duplicated from README.md
- [ ] No content duplicated between root and subdomain files
- [ ] All sections match the appropriate template structure
- [ ] Critical rules are terse blockers, not essays
- [ ] Boundaries section present where appropriate (NEVER / ASK FIRST)
- [ ] Summary includes prioritised recommendations for all files
- [ ] User approved every CLAUDE.md before it was written
