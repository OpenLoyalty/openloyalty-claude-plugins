# Ideal CLAUDE.md Structures

## Template Selection

Choose template based on project type detected by `analyze-context.sh`.

---

## Template A: Code Repository (PHP, JS/TS, Python, Ruby, Go, Rust)

**Target:** 100-150 lines

```markdown
# [Project Name]

[1-3 sentence description. What it does, what tech stack, what domain.]

## Critical Rules

[Terse, numbered blocker rules. 1-2 lines each. These break code review.]

- **RULE001**: [Rule description]
- **RULE002**: [Rule description]

## Quick Start

[Most common dev commands. No explanations — just commands.]

` ` `bash
# Run tests
[command]

# Start local dev
[command]

# Code quality
[command]
` ` `

## Architecture

[High-level patterns only. WHY, not HOW. 5-10 lines max.]

[Link to detailed architecture docs if they exist.]

## Common Tasks

| Task | Guide |
|------|-------|
| [Task 1] | [link to docs/guide] |
| [Task 2] | [link to docs/guide] |

## Boundaries

**NEVER:**
- [Forbidden action 1]
- [Forbidden action 2]

**ASK FIRST:**
- [Action needing approval 1]
- [Action needing approval 2]

## References

- [Link to detailed docs]
- [Link to conventions]
- [Link to API docs]
```

---

## Template B: Obsidian / Documentation Vault

**Target:** 50-80 lines

```markdown
# [Vault Name]

[1-2 sentence description. What knowledge it contains, what methodology.]

## Vault Type

This is an **Obsidian vault** — a personal knowledge base.

## Writing Rules

- [Formatting rule 1 — e.g., British English]
- [Formatting rule 2 — e.g., wiki-link syntax]
- [Organisation rule — e.g., PARA method]

## Syntax

- Wiki links: `[[Page Name]]`
- Tags: `#tag-name`
- Frontmatter: YAML metadata at top of files

## Boundaries

**NEVER:**
- Delete files without asking
- Change folder structure without asking

**PRESERVE:**
- Obsidian-specific syntax (wiki-links, callouts, dataview)
- Existing tags and frontmatter
```

---

## Template C: Monorepo

**Target:** 100-150 lines (root), 50-80 lines (per-package)

```markdown
# [Project Name]

[1-3 sentence description. Monorepo structure overview.]

## Critical Rules

[Rules that apply ACROSS all packages.]

- **RULE001**: [Cross-cutting rule]
- **RULE002**: [Cross-cutting rule]

## Package Map

| Package | Path | Purpose |
|---------|------|---------|
| [pkg1] | `packages/pkg1/` | [what it does] |
| [pkg2] | `packages/pkg2/` | [what it does] |

## Quick Start

` ` `bash
# Install all
[command]

# Run all tests
[command]

# Run specific package
[command]
` ` `

## Package-Level Context

Each package has its own CLAUDE.md with package-specific rules.
Read the relevant package CLAUDE.md before working on it.

## Boundaries

**NEVER:**
- [Cross-cutting forbidden action]

**ASK FIRST:**
- [Cross-cutting approval action]
```

---

## Template D: Infrastructure / DevOps

**Target:** 80-120 lines

```markdown
# [Project Name]

[1-2 sentence description. What infrastructure it manages.]

## Critical Rules

- **INFRA001**: [Safety rule — e.g., never apply to prod without approval]
- **INFRA002**: [Security rule]

## Environments

| Environment | Purpose | Access |
|-------------|---------|--------|
| dev | Development | [details] |
| staging | Pre-production | [details] |
| prod | Production | [details] |

## Common Operations

| Operation | Command | Requires Approval? |
|-----------|---------|-------------------|
| [op1] | `[cmd]` | No |
| [op2] | `[cmd]` | Yes — prod only |

## Architecture

[Infrastructure topology. 5-10 lines. Link to diagrams.]

## Boundaries

**NEVER:**
- Apply changes to production without approval
- Hardcode secrets (use vault/secrets manager)
- Delete stateful resources without backup

**ASK FIRST:**
- Any production changes
- New cloud resources (cost implications)
- Security group modifications
```

---

## Template E: Subdomain CLAUDE.md

**Target:** 30-80 lines

Use this for directories that represent a distinct bounded context, domain module, or service within a larger project. Subdomain files inherit root CLAUDE.md automatically — never repeat root content.

```markdown
# [Domain Name]

[1-2 sentence description. What this subdomain handles, what business domain it serves.]

## Domain Context

Key entities and their relationships:
- **[Entity A]** — [what it represents, key invariants]
- **[Entity B]** — [what it represents, relationship to Entity A]

Domain vocabulary:
- **[Term]** — [definition, if non-obvious]

## Critical Rules

[Rules specific to THIS domain only. Do not repeat root CLAUDE.md rules.]

- **DOM001**: [Domain-specific rule]
- **DOM002**: [Domain-specific rule]

## Key Files

| File/Dir | Purpose |
|----------|---------|
| `[path]` | [what it does] |
| `[path]` | [what it does] |

## Patterns & Gotchas

- [Non-obvious behavior specific to this domain]
- [Common pitfall when working in this area]

## Boundaries

**NEVER:**
- [Domain-specific forbidden action]

**ASK FIRST:**
- [Domain-specific approval action]
```

**What belongs in subdomain vs root:**

| Content | Where |
|---------|-------|
| Coding standards, linting, test commands | Root |
| Docker/CI/CD setup | Root |
| Domain entities and relationships | Subdomain |
| Domain-specific invariants | Subdomain |
| External service integrations for this domain | Subdomain |
| Domain-specific test patterns | Subdomain |
| Cross-cutting architecture decisions | Root |

---

## Content Altitude Guide

### Too Low (Prescriptive) — Avoid

```markdown
If the user creates a new controller, they must first create a test file
in tests/Feature/ named {ControllerName}Test.php. Then they must add
the route in routes/api.php. Then they must...
```

### Too High (Vague) — Avoid

```markdown
Follow best practices when writing code. Make sure to test things properly.
```

### Right Altitude — Target

```markdown
## Critical Rules
- **TEST**: Write failing test before implementation (TDD red-green cycle)
- **ROUTES**: All new endpoints need a route, controller, and feature test
```

---

## Line Budget Guide

| Section | Code Repo | Vault | Monorepo Root | Subdomain |
|---------|-----------|-------|---------------|-----------|
| Description | 3 | 2 | 3 | 2 |
| Domain Context | — | — | — | 8-15 |
| Critical Rules | 10-20 | 5-10 | 10-15 | 5-10 |
| Quick Start | 10-15 | — | 10-15 | — |
| Architecture | 10-20 | — | 5-10 | — |
| Common Tasks | 10-15 | — | 10-15 | — |
| Key Files | — | — | — | 5-10 |
| Patterns & Gotchas | — | — | — | 5-10 |
| Writing Rules | — | 10-15 | — | — |
| Package Map | — | — | 10-20 | — |
| Boundaries | 10-15 | 5-10 | 10-15 | 5-10 |
| References | 5-10 | 5 | 5-10 | — |
| **Total** | **~100-150** | **~40-70** | **~100-150** | **~30-80** |
