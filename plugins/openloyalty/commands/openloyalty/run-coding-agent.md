---
name: openloyalty:run-coding-agent
description: Generate PHP code artifacts following Open Loyalty DDD/CQRS conventions with AGENTS.md validation.
argument-hint: "--pattern <type> --context <Context> --name <Name> [--ticket <OLOY-XXX>] [--with-tests] [--strict]"
---

# /openloyalty:run-coding-agent

Generate PHP code artifacts (commands, handlers, events, entities, repositories, tests) aligned with Open Loyalty's DDD, CQRS, and Symfony 6.x architecture.

## Purpose

Automates scaffolding of new PHP classes that follow the project's naming conventions, directory structure, and critical rules from `AGENTS.md`. Uses parallel subagents to gather context and validate output before writing files.

## Usage

```bash
/openloyalty:run-coding-agent --pattern handler --context Customer --name CompleteAchievement
/openloyalty:run-coding-agent --pattern handler --context Customer --name CompleteAchievement --ticket OLOY-6715 --with-tests
/openloyalty:run-coding-agent --pattern entity --context Campaign --name RewardTier --strict
/openloyalty:run-coding-agent --pattern event --context Points --name PointsExpired
```

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--pattern <type>` | Artifact type: `command`, `handler`, `event`, `entity`, `repository`, `test` | `--pattern handler` |
| `--context <Context>` | Bounded context (PascalCase) | `--context Customer` |
| `--name <Name>` | Artifact name (PascalCase) | `--name CompleteAchievement` |
| `--type <layer>` | Target layer: `domain`, `application`, `infrastructure` (auto-detected) | `--type domain` |
| `--ticket <ID>` | Jira ticket ID (auto-detected from branch if omitted) | `--ticket OLOY-6715` |
| `--with-tests` | Generate test skeleton alongside artifact | `--with-tests` |
| `--strict` | Validate against all AGENTS.md rules after generation | `--strict` |

## Execution Strategy: Parallel Subagents

### Phase 1: Parallel Context Gathering (3 Agents)

Launch all agents simultaneously using the Task tool:

#### 1. Conventions Loader
```
Task: Explore
Prompt: |
  Read the AGENTS.md file in the repository root.
  Extract and return:
  1. Critical rules: DEV020, DEV022, DEV027, DEV034 (full text)
  2. Directory conventions for DDD layers
  3. Naming conventions for PHP classes
  4. Required syntax patterns (strict_types, final readonly, etc.)
  5. Any rules specific to the artifact being generated

  Return structured data ready for validation.
```

#### 2. Structure Detector
```
Task: Explore
Prompt: |
  Detect existing project structure for bounded context: {context}

  1. Search: find src -type d -name "*{context}*" | head -10
  2. List existing files in the target layer for this context
  3. Read one existing {pattern} file as a reference (if any exist)
  4. Note the exact namespace pattern used
  5. Check if target directory already exists

  Return: directory paths, namespace patterns, reference file example.
```

#### 3. Jira Context (Optional - Graceful Degradation)
```
Task: general-purpose
Prompt: |
  Attempt to fetch Jira ticket context for: {ticket_id}

  Steps:
  1. Check if Atlassian plugin tools are available (mcp__claude_ai_Atlassian__*)
  2. If not available: return { "status": "plugin_not_installed" }
  3. If available, try: mcp__claude_ai_Atlassian__getJiraIssue with issueIdOrKey={ticket_id}
  4. If successful: extract summary, description, acceptance criteria
  5. If call fails: return { "status": "unavailable", "reason": "..." }

  This is optional. The workflow works without Jira.
```

### Phase 2: Conflict Check

Before generating, verify target files don't already exist. If conflicts found, present options and wait for user confirmation.

### Phase 3: Generate & Validate

1. **Build code skeleton** from pattern templates
2. **Validate against conventions** (BLOCKING):
   - `declare(strict_types=1)` present
   - `final readonly` on class declaration
   - `DateTimeImmutable` used (not `DateTime`)
   - No static method calls
   - Constructor-based DI only
   - DEV020: decimal fields use `string|float|null`
   - DEV034: handlers must not depend on read models
3. **Write files** to correct paths

### Phase 4: Write Files

**File path mapping:**

| Pattern | Path |
|---------|------|
| Command | `src/Application/{Context}/Command/{Name}Command.php` |
| Handler | `src/Application/{Context}/Handler/{Name}Handler.php` |
| Event | `src/Domain/{Context}/Event/{Name}WasCompleted.php` |
| Entity | `src/Domain/{Context}/Model/{Name}.php` |
| Repository | `src/Domain/{Context}/Repository/{Name}Repository.php` |
| Test | `tests/Application/{Context}/{Name}HandlerTest.php` |

**Bundled generation:**
- `handler` always generates: Handler + Command (+ Test if `--with-tests`)
- All other patterns generate only their specific artifact

### Phase 5: Post-Generation Options

```
Generated for {ticket_id} ({Context} context):

Files created:
- {list of created files}

Verified: namespaces, strict_types, critical rules OK.

What's next?
1. Auto-fill handler logic from Jira ticket (recommended)
2. Add event publishing and repository stub
3. Run strict review now
4. Generate more artifacts for this context
5. Other
```

## AI Guide Reference

After generation, the relevant implementation guide is suggested:

| Pattern | Guide |
|---------|-------|
| `command`, `handler`, `entity`, `repository` | `docs/ai-guides/crud-implementation.md` |
| `event` | `docs/ai-guides/read-model-projections.md` |
| `test` | `docs/ai-guides/integration-tests.md` |

## Success Output

```
Generated for OLOY-6715 (Customer context):

Files created:
- src/Application/Customer/Command/CompleteAchievementCommand.php
- src/Application/Customer/Handler/CompleteAchievementHandler.php
- tests/Application/Customer/CompleteAchievementHandlerTest.php

Verified: namespaces, strict_types, and critical rules OK.
Linked to OLOY-6715.

What's next?
1. Auto-fill handler logic from Jira ticket (recommended)
2. Add event publishing and repository stub
3. Run strict review now
4. Generate more artifacts for this context
5. Other
```

## Routes To

`run-coding-agent` skill (for code generation engine)

## Related Commands

- `/openloyalty:review-pr` - Code review with OL conventions
- `/openloyalty:backend-pr-create` - Create backend PR with OL conventions
- `/openloyalty:compound` - Document solved problems
- `/openloyalty:help` - Plugin documentation
