# Research Brief Template

Each research agent produces a findings report using this structure.
The claim inventory (from `extract-claims.sh`) anchors the research — verify, extend, or challenge existing claims.

---

## Report Header

```markdown
# Research Report: [Agent Focus Area]

**Agent:** [Principles / Anti-Patterns / Structure / Ecosystem]
**Date:** [YYYY-MM-DD]
**Sources consulted:** [count]
**Findings:** [count]
**New sources discovered:** [count or "none"]
```

---

## Findings Format

Each finding must follow this exact structure:

```markdown
### Finding [N]: [Descriptive Title]

- **Category:** [confirms | contradicts | extends | new]
- **Claim affected:** [claim ID from inventory, e.g., "principles:3"] or "none — new topic"
- **Source:** [URL] ([Tier X], [date accessed])
- **Evidence:** [Direct quote or specific summary — max 3 sentences]
- **Confidence:** [high | medium | low]
- **Reasoning:** [Why this confidence level — 1-2 sentences]
- **Proposed change:** [Natural language description of what should change in context-doctor]
- **Target file:** [Which context-doctor file this affects]
```

### Category Definitions

| Category | Meaning | Action |
|---|---|---|
| **confirms** | Source agrees with existing claim | No change needed; note in report for validation |
| **contradicts** | Source provides evidence against existing claim | Propose modification or removal with evidence |
| **extends** | Source adds nuance, detail, or scope to existing claim | Propose addition/amendment to existing content |
| **new** | Source introduces a topic not covered by any existing claim | Propose new content (principle, anti-pattern, template section, etc.) |

### Confidence Scoring

| Level | Criteria |
|---|---|
| **high** | Tier 1-2 source, multiple corroborating sources, clear evidence |
| **medium** | Tier 2-3 source, single source but credible, reasonable evidence |
| **low** | Tier 3-4 source, anecdotal, speculative, or conflicting evidence |

---

## Source Discovery Section

If the agent finds new sources not in the registry:

```markdown
## Discovered Sources

### Source [N]: [Name]
- **URL:** [url]
- **Proposed Tier:** [1-4]
- **Justification:** [Why this source is trustworthy and relevant]
- **Key content:** [Brief summary of context engineering knowledge found]
```

---

## Report Footer

```markdown
## Summary

- **Confirmed claims:** [list claim IDs]
- **Contradicted claims:** [list claim IDs with brief reason]
- **Extended claims:** [list claim IDs with brief addition]
- **New topics:** [list titles]
- **Sources discovered:** [count]

## Confidence Distribution
- High: [count]
- Medium: [count]
- Low: [count]
```

---

## Agent-Specific Research Focus

### Principles Researcher
- Verify each of the 10 principles against current Anthropic guidance
- Search for new principles emerging from recent research
- Check if any principles have been superseded by newer findings
- Pay special attention to model-specific advice (Claude 4.5/4.6 vs earlier)
- **Primary sources:** T1-01 through T1-06, T2-01 through T2-04

### Anti-Patterns Researcher
- Look for new CLAUDE.md anti-patterns emerging in the community
- Check if existing anti-patterns have been resolved by tooling changes
- Search for scoring dimension improvements
- Analyze real-world CLAUDE.md files for patterns not yet catalogued
- **Primary sources:** T3-01 through T3-06, T4-01 through T4-03

### Structure Researcher
- Compare current templates against how top projects structure context files
- Check if line budgets are still appropriate
- Look for new project types that need templates
- Analyze if section ordering has evolved
- **Primary sources:** T3-02, T3-03, T3-06, plus direct repo analysis

### Ecosystem Researcher
- Check Claude Code changelog for features affecting context management
- Look for new tools, MCP servers, or patterns that change how context is managed
- Check if progressive disclosure mechanisms have changed
- Monitor for changes to CLAUDE.md loading behavior
- **Primary sources:** T1-05, T1-07, T1-06
