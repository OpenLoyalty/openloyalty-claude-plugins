---
name: context-knowledge-updater
description: Researches latest context engineering advancements from reputable sources and proposes evidence-based updates to the context-doctor skill. Fetches from Anthropic docs, arXiv papers, and community sources, then generates surgical diffs with source citations for user approval. Use when user says "update context-doctor", "refresh context knowledge", "research context engineering", or wants to keep context management best practices current.
---

<objective>
Research the latest advancements in context management and context engineering from tiered reputable sources, then propose surgical, evidence-based updates to the context-doctor skill and the comprehensive context engineering guide. Every proposed change traces back to a cited source and requires explicit user approval.
</objective>

<context>
The context-doctor skill encodes ~1100 lines of knowledge across 5 target files that become stale as the field evolves. This updater uses a claim-based research approach: it first inventories what context-doctor currently knows, then sends 4 parallel research agents to verify, extend, or challenge those claims against current sources.

**Target files** (relative to the context-doctor skill directory, a sibling of this skill):
- `../context-doctor/references/context-principles.md` — 10 core principles
- `../context-doctor/references/anti-patterns.md` — 11 anti-patterns + scoring
- `../context-doctor/references/ideal-structure.md` — 5 templates + line budgets
- `../context-doctor/SKILL.md` — 4-phase workflow procedure
- `context-engineering-comprehensive-guide.md` — project root comprehensive guide
</context>

<workflow>

## Phase 1: Inventory Current Knowledge

Run the claim extraction script to produce a structured inventory of everything context-doctor currently knows:

```bash
bash <skill-dir>/scripts/extract-claims.sh <context-doctor-dir>
```

> **Note:** `<skill-dir>` is the directory containing this SKILL.md file. `<context-doctor-dir>` is the sibling `context-doctor` skill directory. Resolve the full paths before executing.

Read the output and confirm the claim counts:
- Principles: expect ~10
- Anti-patterns: expect ~11
- Scoring dimensions: expect ~6
- Templates: expect ~5
- Guidelines: expect ~11

Also read the comprehensive guide to inventory its claims:
- Read `context-engineering-comprehensive-guide.md` from the project root
- Note its "Last updated" date and source list

Present the inventory summary to the user:

```
=== Current Knowledge Inventory ===
Principles: [N] (context-principles.md, [lines] lines)
Anti-patterns: [N] (anti-patterns.md, [lines] lines)
Dimensions: [N]
Templates: [N] (ideal-structure.md, [lines] lines)
Guidelines: [N] (SKILL.md, [lines] lines)
Comprehensive guide: [lines] lines, last updated [date]
Sources in guide: [N]

Ready to research. Proceeding to parallel research phase.
```

## Phase 2: Parallel Research

Load the source registry from `references/source-registry.md` and the research brief template from `references/research-brief-template.md`.

Spawn **4 research agents in parallel** using the Agent tool with `subagent_type: "general-purpose"`. Each agent receives:
1. The full claim inventory output from Phase 1
2. The source registry (filtered to their relevant sources)
3. The research brief template
4. Explicit instructions to **research only, not write code**

### Agent 1: Principles Researcher

```
You are researching context engineering PRINCIPLES for AI coding agents.

Your task: Verify, extend, or challenge the existing principles encoded in the context-doctor skill.

[Paste claim inventory — PRINCIPLES section]

Research these sources using WebSearch and WebFetch:
- Anthropic engineering blog (any new posts on context engineering)
- Anthropic documentation (Claude Code docs, prompt engineering guides)
- arXiv papers on context engineering, prompt optimization, agent architectures (2026)
- Any updates to the AGENTS.md evaluation paper

For each finding, use this format:
[Paste research brief template — Findings Format section]

Focus on:
- Has Anthropic updated their guidance on any of these 10 principles?
- Are there new principles emerging from recent research?
- Have any principles been invalidated or significantly nuanced?
- Model-specific advice for Claude 4.5/4.6 that affects principles?

Produce a complete research report. Do NOT write code or edit files.
```

### Agent 2: Anti-Patterns Researcher

```
You are researching CLAUDE.md ANTI-PATTERNS for AI coding agents.

Your task: Find new anti-patterns and verify existing ones still hold.

[Paste claim inventory — ANTI-PATTERNS and DIMENSIONS sections]

Research these sources using WebSearch and WebFetch:
- GitHub repos with CLAUDE.md files (search for common patterns and problems)
- Community discussions about CLAUDE.md problems
- Blog posts about context file failures
- Competitor approaches (Cursor rules, Windsurf rules) for cross-pollination

For each finding, use this format:
[Paste research brief template — Findings Format section]

Focus on:
- New anti-patterns not yet catalogued
- Existing anti-patterns that tooling changes may have resolved
- Scoring dimension improvements
- Real-world examples of each anti-pattern

Produce a complete research report. Do NOT write code or edit files.
```

### Agent 3: Structure Researcher

```
You are researching CLAUDE.md STRUCTURE and TEMPLATES for AI coding agents.

Your task: Compare current templates against how top projects structure context files.

[Paste claim inventory — TEMPLATES section]

Research these sources using WebSearch and WebFetch:
- High-star GitHub repos that use CLAUDE.md (analyze their structure)
- Anthropic's own recommended structures
- Community template collections (awesome-cursorrules, etc.)
- New project types that might need templates (AI apps, MCP servers, etc.)

For each finding, use this format:
[Paste research brief template — Findings Format section]

Focus on:
- Are the 5 templates still sufficient? Any new project types needed?
- Are line budgets still appropriate?
- Has section ordering evolved?
- Any structural patterns that outperform the current templates?

Produce a complete research report. Do NOT write code or edit files.
```

### Agent 4: Ecosystem Researcher

```
You are researching the CLAUDE CODE ECOSYSTEM and how it affects context management.

Your task: Find changes in tooling, features, or capabilities that affect how context should be managed.

[Paste claim inventory — WORKFLOW and GUIDELINES sections]

Research these sources using WebSearch and WebFetch:
- Claude Code GitHub releases and changelog
- Anthropic documentation updates
- New MCP servers or tools that change context patterns
- Changes to how CLAUDE.md files are loaded or processed

For each finding, use this format:
[Paste research brief template — Findings Format section]

Focus on:
- Claude Code features that change how context is loaded
- New capabilities (skills, hooks, MCP) affecting context management
- Changes to CLAUDE.md loading behavior or limits
- Workflow changes that affect the context-doctor procedure

Produce a complete research report. Do NOT write code or edit files.
```

## Phase 3: Synthesis

After all 4 agents complete, merge their findings:

1. **Collect** all findings from 4 agent reports
2. **Deduplicate** — same finding from multiple agents? Keep highest-tier source, merge citations
3. **Resolve conflicts** — use rules from `references/claim-categories.md`:
   - Higher tier wins
   - Same tier: more recent wins
   - Same tier + date: more specific wins
   - Unresolvable: flag for user
4. **Categorize** each finding: confirms | contradicts | extends | new
5. **Score priority** using the formula from `references/claim-categories.md`
6. **Filter** by confidence threshold:
   - High/medium confidence + Tier 1-3 → propose diff
   - Low confidence + Tier 1-2 → flag for review
   - Everything else → appendix only
7. **Collect discovered sources** from all agents for registry update proposals

Present synthesis summary:

```
=== Research Synthesis ===
Total findings: [N]
After deduplication: [N]

By category:
  Confirms: [N] (no action needed)
  Contradicts: [N] (diffs proposed)
  Extends: [N] (diffs proposed)
  New: [N] (diffs proposed)

By confidence:
  High: [N]
  Medium: [N]
  Low: [N]

Conflicts requiring user decision: [N]
New sources discovered: [N]

Proceeding to diff generation.
```

## Phase 4: Diff Generation

For each finding that passes the confidence threshold, generate a proposed diff:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIFF [N] — [Category: extends/contradicts/new]
Priority: [score] | Confidence: [high/medium]
Source: [URL] (Tier [N], [date])
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: [target file path]
Claim: [claim ID] or "new"
Summary: [1-2 sentence description of the change]

--- BEFORE ---
[Exact current content that would be replaced, or "N/A — new addition"]

--- AFTER ---
[Proposed new content]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Group diffs by target file:
1. `context-principles.md` diffs
2. `anti-patterns.md` diffs
3. `ideal-structure.md` diffs
4. `SKILL.md` diffs
5. `context-engineering-comprehensive-guide.md` diffs

After all diffs, include:

**Flagged for review** (low confidence or unresolved conflicts):
```
⚠️ [Finding title] — [reason for flag]
   Source: [URL]
   Evidence: [summary]
```

**Interesting signals** (appendix — tier 4 or low confidence, no diffs):
```
📡 [Signal title] — [summary]
   Source: [URL]
```

**Discovered sources** (proposed registry additions):
```
🔗 [Source name] — [URL]
   Proposed tier: [N]
   Justification: [why trustworthy]
```

## Phase 5: Present and Apply

Present all diffs to the user grouped by file. For each file:

1. Show all proposed diffs for that file
2. Ask the user to approve or reject **each diff individually**
3. For approved diffs, apply using the Edit tool
4. After all diffs for a file are applied, verify line counts still respect budgets:
   - `context-principles.md`: soft limit ~150 lines
   - `anti-patterns.md`: soft limit ~300 lines
   - `ideal-structure.md`: soft limit ~350 lines
   - `SKILL.md`: soft limit ~220 lines
   - `comprehensive-guide.md`: no strict limit but flag if >600 lines

5. For discovered sources approved by user, append to `references/source-registry.md`

6. Log all applied changes to the context-doctor's `changelog.md`:
```markdown
## [YYYY-MM-DD] Knowledge Update

**Research scope:** [which agents ran, how many sources consulted]
**Findings:** [N] total, [N] applied

### Applied Changes
- [File]: [1-line description of change] (Source: [URL])
- [File]: [1-line description of change] (Source: [URL])

### Rejected/Deferred
- [Finding title]: [reason for rejection/deferral]
```

7. Present final summary:
```
=== Update Complete ===

Files modified: [N]
Changes applied: [N]
Changes rejected: [N]
Sources added to registry: [N]

Modified files:
  [file]: [before lines] → [after lines] ([+N/-M] lines)

Changelog updated: context-doctor/changelog.md
```

</workflow>

<success_criteria>
- Claim inventory extracted successfully from all context-doctor files
- All 4 research agents completed with structured findings
- Synthesis resolved all conflicts (or flagged unresolvable ones for user)
- Every proposed diff includes source citation, confidence level, and priority score
- User approved or rejected each diff individually
- Applied diffs do not break context-doctor file structure or exceed soft line limits
- Changelog entry created in context-doctor with full audit trail
- Discovered sources (if any) proposed for registry addition
- No existing knowledge removed without explicit user approval and Tier 1-2 contradicting evidence
</success_criteria>

<anti_patterns>
- **Never auto-apply diffs** — every change requires explicit user approval
- **Never remove existing claims** based solely on Tier 3-4 sources
- **Never bulk-rewrite files** — propose surgical, targeted edits
- **Never trust a single low-tier source** to contradict established principles
- **Never skip the claim inventory** — it anchors research and prevents vague, unfocused results
- **Never mix findings across agents** without deduplication — the same blog post may be found by multiple agents
</anti_patterns>
