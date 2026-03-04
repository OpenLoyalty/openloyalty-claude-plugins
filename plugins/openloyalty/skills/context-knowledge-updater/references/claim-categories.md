# Claim Categories and Conflict Resolution

Guide for the synthesis phase: how to categorize, prioritize, and resolve conflicts between research findings.

---

## Category Decision Tree

For each finding, walk through:

```
1. Does the finding relate to an existing claim?
   ├── YES → Does it agree with the claim?
   │   ├── YES → Category: CONFIRMS (no action needed)
   │   └── NO → Does it add nuance or does it disagree?
   │       ├── Adds nuance/detail → Category: EXTENDS
   │       └── Disagrees/refutes → Category: CONTRADICTS
   └── NO → Category: NEW
```

---

## Conflict Resolution Rules

When findings contradict each other or existing claims:

### Rule 1: Source Tier Wins
Higher-tier source takes precedence.

| Conflict | Resolution |
|---|---|
| Tier 1 vs Tier 2 | Tier 1 wins |
| Tier 1 vs Tier 3 | Tier 1 wins |
| Tier 2 vs Tier 3 | Tier 2 wins |
| Same tier | Apply Rule 2 |

### Rule 2: Recency Wins (Same Tier)
More recent source takes precedence when sources are same tier.

### Rule 3: Specificity Wins (Same Tier, Same Date)
More specific finding (with concrete evidence, benchmarks, or examples) takes precedence over general claims.

### Rule 4: Flag for User (Unresolvable)
If conflict cannot be resolved by Rules 1-3, flag both findings for user decision. Present as:

```markdown
⚠️ CONFLICT — User Decision Required

**Existing claim:** [claim ID and text]
**Finding A:** [summary] (Source: [URL], Tier [X])
**Finding B:** [summary] (Source: [URL], Tier [X])
**Why unresolvable:** [explanation]
```

---

## Diff Priority Scoring

After categorization, score each proposed diff for presentation order:

| Factor | Weight | Scale |
|---|---|---|
| Source tier | 40% | Tier 1 = 4, Tier 2 = 3, Tier 3 = 2, Tier 4 = 1 |
| Confidence | 30% | High = 3, Medium = 2, Low = 1 |
| Impact | 20% | Contradicts = 3, Extends = 2, New = 1, Confirms = 0 |
| Corroboration | 10% | Multiple sources = 2, Single = 1 |

**Priority score** = (tier × 0.4) + (confidence × 0.3) + (impact × 0.2) + (corroboration × 0.1)

Present diffs in descending priority order.

---

## Confidence Thresholds for Action

| Confidence | Tier 1-2 | Tier 3 | Tier 4 |
|---|---|---|---|
| High | Propose diff | Propose diff | Appendix only |
| Medium | Propose diff | Propose diff (flagged) | Appendix only |
| Low | Flag for review | Appendix only | Appendix only |

"Propose diff" = include in main diff output for user approval.
"Appendix only" = include in "Interesting Signals" section, no diff generated.
"Flag for review" = include diff but mark with ⚠️ for extra scrutiny.

---

## Target File Routing

When a finding produces a proposed diff, route it to the correct file:

| Finding type | Target file |
|---|---|
| New/updated context engineering principle | `context-principles.md` |
| New/updated anti-pattern or scoring dimension | `anti-patterns.md` |
| Template change, line budget change, section ordering | `ideal-structure.md` |
| Workflow procedure change, guideline update | `SKILL.md` |
| Broad conceptual update, source synthesis | `context-engineering-comprehensive-guide.md` |
| Affects multiple files | Generate separate diffs per file |

---

## Deduplication Rules

When multiple agents report the same finding:

1. Keep the finding with the highest-tier source
2. If same tier, keep the one with more specific evidence
3. Merge corroborating sources into a single finding
4. Note all sources for stronger citation
