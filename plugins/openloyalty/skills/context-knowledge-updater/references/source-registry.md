# Source Registry

Curated sources for context engineering research, organized by reliability tier.
Research agents should prioritize higher-tier sources and cite tier alongside every finding.

---

## Tier 1: Official (Anthropic First-Party)

Highest trust. Changes here directly define best practices.

| ID | Source | URL | Relevance |
|---|---|---|---|
| T1-01 | Anthropic Context Engineering Blog | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | Core principles, attention budgets, progressive disclosure |
| T1-02 | Long-Running Agent Harnesses | https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents | External memory, session management, compaction |
| T1-03 | Claude Code Best Practices Docs | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices | Model-specific prompting, system prompt patterns |
| T1-04 | Anthropic Skills Guide PDF | https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf | Skill structure, progressive disclosure, YAML frontmatter |
| T1-05 | Claude Code Documentation | https://docs.anthropic.com/en/docs/claude-code | CLAUDE.md usage, tool design, agent patterns |
| T1-06 | Anthropic Engineering Blog Index | https://www.anthropic.com/engineering | New posts on agent design, context management |
| T1-07 | Claude Code GitHub Releases | https://github.com/anthropics/claude-code/releases | Changelog, new features affecting context management |

## Tier 2: Academic / Research

High trust. Peer-reviewed or well-cited preprints.

| ID | Source | URL | Relevance |
|---|---|---|---|
| T2-01 | AGENTS.md Evaluation Paper | https://arxiv.org/html/2602.11988v1 | Context file effectiveness, cost/performance tradeoffs |
| T2-02 | arXiv Search: Context Engineering | https://arxiv.org/search/?query=context+engineering+LLM&searchtype=all | New research on context management for LLMs |
| T2-03 | arXiv Search: Agent Architectures | https://arxiv.org/search/?query=LLM+agent+architecture+context&searchtype=all | Sub-agent patterns, memory management |
| T2-04 | arXiv Search: Prompt Optimization | https://arxiv.org/search/?query=prompt+optimization+context+window&searchtype=all | Token efficiency, context window utilization |

## Tier 3: Community Practitioners

Medium trust. Well-known practitioners with demonstrated expertise.

| ID | Source | URL | Relevance |
|---|---|---|---|
| T3-01 | Inkeep: Fighting Context Rot | https://inkeep.com/blog/fighting-context-rot | Context rot patterns, mitigation strategies |
| T3-02 | GitHub Search: CLAUDE.md | https://github.com/search?q=filename%3ACLAUDE.md&type=code | Real-world CLAUDE.md patterns and anti-patterns |
| T3-03 | GitHub Search: AGENTS.md | https://github.com/search?q=filename%3AAGENTS.md&type=code | Real-world AGENTS.md usage patterns |
| T3-04 | Simon Willison's Blog | https://simonwillison.net/ | LLM tooling analysis, context management insights |
| T3-05 | Harper Reed Context Engineering | https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/ | Practical context engineering workflows |
| T3-06 | Cursor/Windsurf Rules Repos | https://github.com/PatrickJS/awesome-cursorrules | Competitor approaches to context management |

## Tier 4: Signal (Flag Only)

Low trust. Interesting signals but never auto-propose diffs. Include in appendix only.

| ID | Source | URL | Relevance |
|---|---|---|---|
| T4-01 | Reddit r/ClaudeAI | https://www.reddit.com/r/ClaudeAI/ | Community pain points, emerging patterns |
| T4-02 | Reddit r/LocalLLaMA | https://www.reddit.com/r/LocalLLaMA/ | Context management discussions across models |
| T4-03 | Hacker News (search) | https://hn.algolia.com/?q=context+engineering+LLM | Industry discussions, new tools |
| T4-04 | X/Twitter Search | https://x.com/search?q=context+engineering+claude | Real-time practitioner insights |

---

## Source Discovery Protocol

During research, agents may discover new sources not in this registry.

**To propose a new source:**

```
### Discovered Source
- **URL:** [url]
- **Proposed Tier:** [1-4]
- **Justification:** [why this source is trustworthy and relevant]
- **Content Summary:** [what context engineering knowledge it contains]
```

New sources require user approval before being added to the registry. Tier assignment criteria:

| Tier | Criteria |
|---|---|
| 1 | Published by Anthropic or Claude team members |
| 2 | Peer-reviewed paper or preprint with >10 citations |
| 3 | Author has demonstrable expertise (>1k GitHub stars, known practitioner, published talks) |
| 4 | Everything else (forums, anonymous posts, social media) |
