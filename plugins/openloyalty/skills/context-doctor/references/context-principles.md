# Context Engineering Principles

Distilled from Anthropic's research, the AGENTS.md paper, Claude Code documentation, and Compound Engineering patterns.

---

## Principle 1: Context is Finite — Treat Every Token as Spend

The transformer architecture creates n-squared pairwise relationships between tokens. At 100,000 tokens, that is 10 billion relationships. As context grows, recall accuracy degrades ("context rot"). Every token depletes the model's attention budget.

Claude 4.5+ models feature **context awareness** — they can track their remaining token budget. Inform agents about compaction/refresh behavior so they do not prematurely stop work or rush conclusions as context fills.

**Implication for CLAUDE.md:** Shorter is better. Every line must earn its place.

**Metric:** If removing a line doesn't change agent behavior, remove it.

---

## Principle 2: Minimal Context Outperforms Comprehensive Context

The AGENTS.md arXiv paper (Feb 2026) found:
- LLM-generated context files **decreased** success rates by 2-3%
- Developer-written files improved by only 4%
- Both increased costs by 19-23%
- Context files mostly **duplicate** existing documentation

A separate study found AGENTS.md presence reduced median runtime by 28.6% and output tokens by 16.6% — minimal, targeted context improves efficiency while comprehensive context hurts accuracy.

**Implication:** Don't describe what the README already says. Don't explain what the code already shows. Only include what is NOT available elsewhere.

---

## Principle 3: Right Altitude

Anthropic identifies two failure modes:
- **Too prescriptive:** Hardcoded if-then rules create fragility
- **Too vague:** High-level platitudes assume shared context that doesn't exist

**The sweet spot:** "Specific enough to guide behavior effectively, yet flexible enough to provide strong heuristics."

**Test:** Would a new team member understand what to do after reading just this line? If not, be more specific. Would this line break if the codebase changes slightly? If so, be more general.

**Model evolution caveat:** As models improve, instructions that previously prevented under-triggering may cause over-triggering. Prefer natural language ("Use X when...") over emphatic directives ("CRITICAL: You MUST use X"). Periodically review context for over-prompting.

---

## Principle 4: Progressive Disclosure

Load context in layers, not all at once. Claude Code implements a five-tier model:

1. **Always loaded:** CLAUDE.md, `.claude/rules/` (unconditional), MCP tool definitions
2. **Description-loaded:** Skill descriptions (2% of context window); full skill content loads on invocation
3. **On-demand:** Child-directory CLAUDE.md files, path-scoped `.claude/rules/`, auto-memory topic files
4. **Isolated:** Subagent context (fully separate context window)
5. **External / zero-cost:** Hooks (run outside the loop as deterministic scripts)

Skills with `disable-model-invocation: true` have zero context cost until manually invoked.

**Implication for CLAUDE.md:** Keep the file lean. Use `@path/to/doc` imports for detail. Move reference content to skills (which load on-demand). Keep CLAUDE.md under ~500 lines.

---

## Principle 5: External Memory Over Context Memory

Use the file system as persistent memory:
- **Structured formats (JSON)** for state data (test results, task status, feature lists)
- **Unstructured markdown** for progress notes (`progress.txt`, `claude-progress.txt`)
- **Auto-memory** (`~/.claude/projects/<project>/memory/`) — Claude auto-saves patterns, commands, preferences. First 200 lines of MEMORY.md load every session; topic files load on-demand.
- `docs/solutions/` — documented solved problems (searchable)
- `todos/` — file-based task tracking
- Git history — natural state tracking and rollback

Claude is extremely effective at discovering state from the local filesystem. Prefer filesystem discovery over compaction when starting fresh context windows.

**Implication:** CLAUDE.md should mention these patterns if the project uses them, but the actual content lives in files, not in context.

---

## Principle 6: Code Beats Language for Critical Logic

CLAUDE.md instructions are **advisory** — the agent can deviate. Hooks are **deterministic** — execution is guaranteed. CI checks provide **external verification**.

Anthropic: "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens."

**Implication:** If a rule MUST be followed with zero exceptions, use a hook or CI check. If a rule guides behavior but tolerates judgment, use CLAUDE.md. Mention the hook exists; don't explain what it checks.

---

## Principle 7: CLAUDE.md is a Tour Map, Not a Guidebook

**Official threshold:** Keep CLAUDE.md under ~500 lines. Move reference material to skills.

**Include:** Bash commands Claude can't guess, code style rules that differ from defaults, testing instructions, architecture decisions specific to the project, common gotchas.

**Exclude:** Anything Claude can figure out by reading code, standard language conventions, detailed API docs, information that changes frequently, file-by-file descriptions.

**Pruning test:** For each line, ask: "Would removing this cause Claude to make mistakes?" If not, cut it. Bloated files cause Claude to ignore your actual instructions.

**Treat CLAUDE.md like code:** Review when failures occur, prune regularly, test by observing behavioral shifts. Two diagnostic signals: (a) agent ignores rules = file too long; (b) agent asks questions answered in the file = phrasing ambiguous.

---

## Principle 8: Structure by Developer Workflow, Not File Type

Sections should match what a developer asks at different stages:

| Stage | Question | Section |
|-------|----------|---------|
| Onboarding | "What is this?" | Project description |
| First PR | "What will fail review?" | Critical Rules |
| Daily work | "How do I run X?" | Quick Start / Commands |
| Architecture | "Why is it like this?" | Architecture |
| New feature | "How do I build Y?" | Common Tasks (links) |
| Edge case | "Am I allowed to do Z?" | Boundaries |
| Deep dive | "Where are the details?" | References |

Note: empirical analysis of ~500 real CLAUDE.md files shows developers tend to organize by content domain (architecture-first). Both approaches work; consistency matters most.

---

## Principle 9: Sub-Agents Protect Context Quality

For complex projects, recommend sub-agent patterns:
- Research agents with clean context windows for deep exploration
- Review agents for focused code analysis
- Keep the main agent's context clean by delegating

**When NOT to use sub-agents:** Simple tasks, single-file edits, sequential operations where context must be maintained across steps. Claude Opus 4.6 has a strong predilection for spawning sub-agents even when a direct approach would suffice.

**Three-tier delegation:** Main conversation (iterative, context-preserving) > Subagents (focused, isolated) > Agent teams (multi-session, collaborative).

**Implication for CLAUDE.md:** Recommend sub-agent strategies appropriate to the project type and size.

---

## Principle 10: Knowledge Compounding

Every solved problem is an opportunity to make future work easier:
- Document solutions in `docs/solutions/` with YAML frontmatter
- Tag with category, symptoms, module for searchability
- The `learnings-researcher` agent can find these before starting new work
- **Auto-memory** (`MEMORY.md` + topic files) provides a canonical mechanism — Claude auto-saves patterns and insights across sessions with three scopes: user, project, local

**Warning:** Iterative summarization risks **brevity bias** (collapsing toward generic brevity) and **context collapse** (monolithic rewrites degrading quality). Prefer incremental delta updates over full regeneration.

**Implication for CLAUDE.md:** Recommend setting up a solutions directory if the project doesn't have one.

---

## Principle 11: Verification as Context

Verification is the single highest-leverage context practice. Claude performs dramatically better when it can verify its own work — run tests, compare screenshots, validate outputs.

Without clear success criteria, the agent produces output that looks right but may not work. Test results, error messages, and screenshots become high-signal context that shapes the next action.

**Implication:** Provide agents with self-verification mechanisms. Include test commands and expected outputs in CLAUDE.md. Every test run is actionable feedback.

---

## Principle 12: Context Hygiene

Actively clear irrelevant context between tasks. Failed approaches, unrelated explorations, and accumulated corrections become noise that degrades performance.

**Anti-patterns:** The "kitchen sink session" (mixing unrelated tasks), correcting Claude more than twice on the same issue (context cluttered with failed approaches), leaving stale exploration results in context.

**Rule:** If you've corrected Claude twice on the same issue, run `/clear` and start fresh with a better prompt. A clean session with a specific prompt outperforms a long session with accumulated corrections.

---

## Principle 13: Active Context Compaction

Manage conversation history through selective summarization:
- Preserve architectural decisions and critical state
- Discard redundant tool outputs
- Use `/compact <focus>` with custom instructions to guide what is preserved
- Add a "Compact Instructions" section to CLAUDE.md to control compaction behavior
- Prefer starting fresh (`/clear`) over compacting when possible — Claude is effective at rediscovering state from the filesystem

**Safest form:** Tool result clearing (removing verbose outputs while keeping conclusions).
