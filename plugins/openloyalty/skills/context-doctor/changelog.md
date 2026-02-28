# Context Doctor Changelog

## 2026-02-28 Knowledge Update

**Research scope:** 4 parallel agents (Principles, Anti-Patterns, Structure, Ecosystem), 17+ Tier 1-2 sources consulted
**Findings:** 77 total across agents, 48 after deduplication, 33 applied

### Applied Changes

**context-principles.md:**
- Extended principles:3 with Claude 4.6 over-prompting caveat (Source: Claude 4 best practices)
- Extended principles:4 from 3-tier to 5-tier progressive disclosure model (Source: code.claude.com/docs/en/memory)
- Extended principles:5 with auto-memory system and structured format guidance (Source: code.claude.com/docs/en/memory)
- Extended principles:6 with advisory-vs-deterministic spectrum and hooks (Source: code.claude.com/docs/en/best-practices)
- Extended principles:7 with ~500 line threshold, include/exclude criteria, "treat like code" (Source: code.claude.com/docs/en/best-practices)
- Extended principles:9 with overuse warnings and when-NOT-to-use guidance (Source: Claude 4 best practices)
- Extended principles:10 with auto-memory as canonical implementation (Source: code.claude.com/docs/en/memory)
- Added Principle 11: Verification as Context (Source: code.claude.com/docs/en/best-practices)
- Added Principle 12: Context Hygiene (Source: code.claude.com/docs/en/best-practices)
- Added Principle 13: Active Context Compaction (Source: Anthropic engineering blog)

**anti-patterns.md:**
- Added scoring dimension: Freshness (cross-reference CLAUDE.md vs actual project state)
- Extended AP:2 to include linter-enforceable rules
- Extended AP:4 with graduated severity scale (0-100/100-200/200-300/300+)
- Extended AP:9 with anchoring bias mechanism and technology cross-referencing
- Extended AP:10 with advisory-vs-deterministic enforcement and three-tier boundaries
- Extended AP:11 with `.claude/rules/` as preferred solution and cross-tool divergence
- Added AP:12: Discoverable Information (4-question filter)
- Added AP:13: Auto-Generated Context Dump

**SKILL.md:**
- Switched guideline:5 from British English to American English
- Extended Phase 1 scan to cover 6 memory locations (`.claude/rules/`, `CLAUDE.local.md`, auto-memory)
- Extended Phase 2 scoring with Freshness dimension
- Updated scoring dimensions to reference `.claude/rules/`, skills, and vague qualifiers

### Rejected/Deferred
- Principle "First Window, Then Iterate" — deferred to keep principles under 15
- Anti-Pattern "Over-Importing / Indirection Maze" — medium confidence, deferred pending more evidence
- Anti-Pattern "Buried Critical Rules" — medium confidence, partially addressed by Structure dimension update
- ideal-structure.md template updates — deferred to a focused template update session
- comprehensive-guide.md updates — deferred to a focused guide refresh session
