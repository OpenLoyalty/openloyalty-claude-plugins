# CLAUDE.md Anti-Patterns Catalogue

## Scoring Dimensions

Rate each dimension 1-5 (1 = critical issue, 5 = excellent):

| Dimension | What to Check | Score 1 (Bad) | Score 5 (Good) |
|---|---|---|---|
| **Length** | Total line count | >300 lines (code) / >150 (vault) / >80 (subdomain) | <150 lines (code) / <100 (vault) / <80 (subdomain) |
| **Altitude** | Specificity level | If-then rules OR vague platitudes | Specific heuristics with flexibility |
| **Duplication** | Overlap with README/docs | >50% content exists elsewhere | Unique content only, links to rest |
| **Structure** | Section organization | Wall of text, no headers | Clear sections matching dev workflow; critical rules in first 20 lines |
| **Disclosure** | Progressive loading | Everything inline | Links to docs/, `.claude/rules/`, skills for detail |
| **Actionability** | Can dev act on it? | Vague qualifiers ("prefer," "when appropriate," "clean") | Blockers, commands, tables with measurable criteria |
| **Freshness** | Matches actual project state | Mentions technologies/versions not in codebase | All references match package files and actual code |

---

## Anti-Pattern 1: API Documentation Inline

**Symptom:** CLAUDE.md contains endpoint descriptions, status codes, request/response schemas.

**Example (bad):**
```markdown
### Authentication Flow
1. **Fetch Public Key Certificate** (`GET /security/public-key-certificates`)
   - Retrieves RSA public key certificates
   - Certificates are valid for ~2 years
   - Must support `KsefTokenEncryption` usage
2. **Create Session** (`POST /sessions`)
   - Request body: { "token": "...", "certificate_id": "..." }
   ...
```

**Fix:** Move to `docs/api.md` or link to OpenAPI spec. In CLAUDE.md, write only:
```markdown
## API
Authentication uses RSA certificate-based tokens. See [API Reference](docs/api.md).
```

**Impact:** Saves 50-200 lines. Reduces context rot risk.

---

## Anti-Pattern 2: Repeating Framework Documentation / Linter-Enforceable Rules

**Symptom:** Explains how to use standard tools (PHPStan, ESLint, Jest) that are documented elsewhere. Includes code style rules that linters/formatters already enforce (naming conventions, formatting, quote usage).

**Example (bad):**
```markdown
### Code Quality
PHPStan is configured at max level. Run:
docker compose run --rm php vendor/bin/phpstan --memory-limit=-1

PHPUnit tests use the TestCase base class. Create test files in tests/ directory...
```

**Fix:** One-line command reference, link to README:
```markdown
## Commands
- Tests: `docker compose run --rm php vendor/bin/phpunit`
- Static analysis: `docker compose run --rm php vendor/bin/phpstan`
```

---

## Anti-Pattern 3: Verbose Rules as Essays

**Symptom:** Policies explained in paragraphs instead of terse rules.

**Example (bad):**
```markdown
## Code Quality Standards
We believe in TypeScript because it helps catch bugs early. When writing
TypeScript, you should avoid using `any` types because they defeat the purpose
of having a type system. Instead, create proper interfaces...
```

**Fix:** Blocker-style rules:
```markdown
## Critical Rules
- **TS001**: No `any` types — use proper interfaces
- **TS002**: No type assertions (`as`) — use type guards
```

---

## Anti-Pattern 4: Over 300 Lines

**Symptom:** File is so long developers skip it entirely. Anthropic: "Bloated CLAUDE.md files cause Claude to ignore your actual instructions."

**Graduated severity:**
- 0-100 lines: Good
- 100-200 lines: Warning — review for content that belongs in `.claude/rules/` or skills
- 200-300 lines: Bad — significant content should move to supporting docs
- 300+ lines: Critical — agent is likely ignoring important rules

**Causes:**
- API docs inline (Anti-Pattern 1)
- Framework docs repeated (Anti-Pattern 2)
- Verbose essays (Anti-Pattern 3)
- Code examples that belong in docs/guides/
- Discoverable information (Anti-Pattern 12)

**Fix:** Target 100-150 lines for code repos. Anthropic's official recommendation: keep under ~500 lines. Move reference content to skills (load on-demand) or `.claude/rules/` (load per-path).

---

## Anti-Pattern 5: No Clear Structure

**Symptom:** Wall of text or random bullet points without headers.

**Fix:** Use consistent section hierarchy:
1. Project description (1-3 sentences)
2. Critical Rules
3. Quick Start / Commands
4. Architecture
5. Common Tasks
6. Boundaries
7. References

---

## Anti-Pattern 6: Duplicating README

**Symptom:** Setup instructions, installation steps, or getting started content copied from README.md.

**Detection:** Compare CLAUDE.md content against README.md. Flag >30% overlap.

**Fix:** Reference README:
```markdown
## Setup
See [README.md](README.md) for installation and setup.
```

---

## Anti-Pattern 7: Missing Trigger Context

**Symptom:** File describes what the project IS but not what a developer NEEDS TO KNOW to work on it.

**Example (bad):**
```markdown
# MyApp
MyApp is a SaaS platform for managing customer subscriptions.
It uses React for the frontend and Node.js for the backend.
```

**Fix:** Add what matters for development:
```markdown
# MyApp
Subscription management SaaS. React frontend + Node.js API.

## Critical Rules
- All API routes require auth middleware
- Stripe webhooks must be idempotent (use idempotency keys)
```

---

## Anti-Pattern 8: Mixing Policy with Reference

**Symptom:** Architecture decisions (policy) mixed with implementation details (reference) in the same section.

**Fix:** Separate clearly:
- **In CLAUDE.md:** WHY decisions were made (policy)
- **In docs/:** HOW to implement them (reference)

---

## Anti-Pattern 9: Stale Information (Anchoring Bias)

**Symptom:** References to deprecated tools, old API versions, removed features.

**Why it's dangerous:** Stale references create **anchoring bias** — if CLAUDE.md mentions a technology even in passing, the agent biases toward that pattern for every subsequent prompt. Research confirms common mitigation techniques (Chain-of-Thought, "ignore the hint") are largely ineffective against anchoring.

**Detection:** Check for references to files/dirs that don't exist. Cross-reference technology names in CLAUDE.md against package.json/requirements.txt/go.mod. Flag technologies mentioned in CLAUDE.md that appear with very low frequency in the codebase.

**Fix:** Remove stale content. Add a `Last reviewed: YYYY-MM-DD` line at top.

---

## Anti-Pattern 10: No Boundaries Section (or Wrong Enforcement Level)

**Symptom:** No mention of what's forbidden or what needs approval. Or: hard prohibitions in CLAUDE.md text when they should be hooks.

CLAUDE.md instructions are **advisory** — the agent can deviate. Hooks are **deterministic** — execution is guaranteed. Hard boundaries (NEVER) that truly cannot be violated should be enforced via hooks, not prose.

**Fix:** Add explicit three-tier boundaries and enforce hard rules via hooks:
```markdown
## Boundaries

**ALWAYS:**
- Run tests before committing

**ASK FIRST:**
- New dependencies
- Database schema changes
- API breaking changes

**NEVER:**
- Commit secrets or API keys (enforced via pre-commit hook)
- Skip tests before PR (enforced via pre-push hook)
```

**Detection:** Flag NEVER/FORBIDDEN/MUST NOT directives in CLAUDE.md that lack corresponding hooks.

---

## Anti-Pattern 11: Subdomain Context Leaks

**Symptom:** Subdomain CLAUDE.md files duplicate content from root CLAUDE.md, or root CLAUDE.md contains domain-specific rules that belong in subdomain files.

**Example (bad — subdomain duplicates root):**
```markdown
# billing/CLAUDE.md

## Critical Rules
- All PHP code must follow PSR-12  ← already in root
- Use TDD red-green cycle          ← already in root
- Stripe webhooks must be idempotent  ← domain-specific, keep
```

**Example (bad — root contains subdomain rules):**
```markdown
# CLAUDE.md (root)

## Critical Rules
- Use TDD red-green cycle
- Stripe webhooks must be idempotent   ← belongs in billing/CLAUDE.md
- Auth tokens expire after 24 hours    ← belongs in identity/CLAUDE.md
```

**Fix — subdomain file:**
```markdown
# billing/CLAUDE.md

Handles payment processing via Stripe.

## Domain Context
- **Invoice** — immutable after finalization
- **Subscription** — managed through Stripe webhooks

## Critical Rules
- **BIL001**: Stripe webhooks must be idempotent (use idempotency keys)
- **BIL002**: Never delete invoices — soft-delete only
```

**Fix — root file:**
Move domain-specific rules to their subdomain CLAUDE.md files. Root should only contain cross-cutting concerns.

**Preferred solution:** Use `.claude/rules/` with `paths:` frontmatter for path-specific instructions instead of subdomain CLAUDE.md files. Example:
```yaml
---
paths: ["src/billing/**"]
---
Stripe webhooks must be idempotent (use idempotency keys).
Never delete invoices — soft-delete only.
```

**Also check for:** Cross-tool divergence — if both CLAUDE.md and AGENTS.md exist, flag potential content drift between them.

**Detection:** Compare each subdomain CLAUDE.md against root. Flag >20% content overlap.

**Impact:** Reduces context waste (duplicated rules load twice). Keeps subdomain files focused on what's unique.

---

## Anti-Pattern 12: Discoverable Information

**Symptom:** CLAUDE.md contains information the agent can discover by reading code, configs, or help text. Includes architecture descriptions, directory trees, technology stack enumerations, file-by-file descriptions.

**4-question filter** (include content only if ALL are true):
1. The agent cannot discover it from README, configs, or help text
2. It tells the agent to do something specific
3. Missing it causes hard-to-debug failures
4. It applies to most tasks in the project

**Example (bad):**
```markdown
## Project Structure
src/
  controllers/    — API controllers
  models/         — Database models
  services/       — Business logic
  utils/          — Utility functions
```

**Fix:** Remove entirely. Claude reads file trees and package configs naturally. Only include gotchas, not descriptions.

**Impact:** The AGENTS.md evaluation paper found codebase overviews in 95-100% of AI-generated files, and they added no value. This is the single most common form of context waste.

---

## Anti-Pattern 13: Auto-Generated Context Dump

**Symptom:** CLAUDE.md was created by `/init` or an LLM and contains generic, discoverable content. Typical signs: package.json command listings, comprehensive architecture overviews, technology stack descriptions that mirror what's in config files.

**Why it's harmful:** The AGENTS.md arXiv paper found LLM-generated context files **decreased** success rates by 2-3% while increasing costs by 20-23%. Auto-generated content is almost entirely redundant with existing documentation.

**Detection:** Look for patterns typical of `/init` output: enumerated npm/composer scripts, directory structure listings, framework boilerplate descriptions.

**Fix:** Delete and hand-write a minimal CLAUDE.md with only what the agent cannot discover on its own. 10 hand-written lines outperform 200 auto-generated ones.
