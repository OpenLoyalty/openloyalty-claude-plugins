---
name: run-coding-agent
description: Generate PHP code artifacts (commands, handlers, events, entities, repositories, tests) following Open Loyalty DDD/CQRS conventions with automatic validation against AGENTS.md rules.
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Task
  - Edit
preconditions:
  - Working directory is an Open Loyalty repository with AGENTS.md present
  - Target bounded context exists or is being created intentionally
---

# run-coding-agent Skill

**Purpose:** Generate PHP code artifacts aligned with Open Loyalty's DDD, CQRS, and Symfony 6.x architecture, ensuring every file follows naming conventions, critical rules, and structure from `AGENTS.md`.

## Overview

This skill automates code generation for the Open Loyalty codebase. It reads project conventions from `AGENTS.md`, detects existing directory structure, generates properly namespaced PHP classes, and validates output against critical rules before writing files.

**Supported artifacts:** Command, Handler, Event, Entity, Repository, Test

**Architecture:** DDD layers (Domain, Application, Infrastructure) with CQRS command/handler separation.

---

<critical_sequence name="code-generation" enforce_order="strict">

## 8-Step Process

<step number="1" required="true">
### Step 1: Parse Arguments

Extract from user input or command flags:

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--pattern` | Yes | — | Artifact type: `command`, `handler`, `event`, `entity`, `repository`, `test` |
| `--context` | Yes | — | Bounded context: `Customer`, `Campaign`, `Points`, etc. |
| `--name` | Yes | — | Artifact name in PascalCase: `CompleteAchievement` |
| `--type` | No | Auto-detected | Target layer: `domain`, `application`, `infrastructure` |
| `--ticket` | No | Auto-detected from branch | Jira ticket ID: `OLOY-123` |
| `--with-tests` | No | `false` | Generate test skeleton alongside artifact |
| `--strict` | No | `false` | Run full AGENTS.md validation after generation |

**Auto-detection:**
- If `--ticket` not provided, extract `OLOY-\d+` from current branch name
- If `--type` not provided, infer from `--pattern`:
  - `command`, `handler` -> `application`
  - `event`, `entity`, `repository` -> `domain`
  - `test` -> `tests`

**BLOCKING REQUIREMENT:** If `--pattern`, `--context`, or `--name` are missing, ask user and WAIT:

```
I need a few details to generate code:

1. What artifact type? (command, handler, event, entity, repository, test)
2. Which bounded context? (e.g., Customer, Campaign, Points)
3. What name? (PascalCase, e.g., CompleteAchievement)

[Continue after user provides details]
```
</step>

<step number="2" required="true" depends_on="1">
### Step 2: Gather Context (Parallel Agents)

Launch agents **IN PARALLEL** to gather independent context:

#### Agent 1: Conventions Loader
```
Task: Explore
Prompt: |
  Read the AGENTS.md file in the repository root.
  Extract and return:
  1. Critical rules: DEV020, DEV022, DEV027, DEV034 (full text)
  2. Directory conventions for DDD layers
  3. Naming conventions for PHP classes
  4. Required syntax patterns (strict_types, final readonly, etc.)
  5. Any rules specific to the pattern type: {pattern}

  Return structured data ready for validation.
```

#### Agent 2: Structure Detector
```
Task: Explore
Prompt: |
  Detect the existing project structure for bounded context: {context}

  1. Search for directories: find src -type d -name "*{context}*" | head -10
  2. List existing files in the target layer for this context
  3. Read one existing {pattern} file in the same context (if any) as a reference
  4. Note the exact namespace pattern used
  5. Check if the target directory already exists

  Return: directory paths, namespace patterns, and a reference file example.
```

#### Agent 3: Jira Context (Optional)
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
</step>

<step number="3" required="true" depends_on="2">
### Step 3: Check for Conflicts

Before generating, verify no conflicts exist:

```bash
# Check if target file already exists
ls -la src/Application/{Context}/Command/{Name}Command.php 2>/dev/null
ls -la src/Application/{Context}/Handler/{Name}Handler.php 2>/dev/null
ls -la src/Domain/{Context}/Event/{Name}*.php 2>/dev/null
ls -la src/Domain/{Context}/Model/{Name}.php 2>/dev/null
```

**IF file already exists:**

```
File already exists: src/Application/{Context}/Handler/{Name}Handler.php

What's next?
1. Overwrite existing file (recommended if starting fresh)
2. Generate with different name
3. Skip this artifact
4. Other

Choose (1-4): _
```

WAIT for user response before proceeding.

**ELSE:** Proceed directly to Step 4.
</step>

<step number="4" required="true" depends_on="3">
### Step 4: Build Code Skeleton

Generate PHP code based on the `--pattern` type. Every file MUST include:

```php
<?php

declare(strict_types=1);
```

#### Pattern: Command

```php
namespace OpenLoyalty\Application\{Context}\Command;

/**
 * @see {ticket_id} - {ticket_summary}
 */
final readonly class {Name}Command
{
    public function __construct(
        // typed properties with constructor promotion
    ) {
    }
}
```

#### Pattern: Handler

```php
namespace OpenLoyalty\Application\{Context}\Handler;

use OpenLoyalty\Application\{Context}\Command\{Name}Command;

/**
 * @see {ticket_id} - {ticket_summary}
 */
final readonly class {Name}Handler
{
    public function __construct(
        // inject domain services via constructor DI
    ) {
    }

    public function __invoke({Name}Command $command): void
    {
        // handle logic
        // RULE DEV034: must NOT depend on read models
    }
}
```

#### Pattern: Event

```php
namespace OpenLoyalty\Domain\{Context}\Event;

use OpenLoyalty\Domain\Shared\EventSourcing\EventSourced;

/**
 * @see {ticket_id}
 */
final readonly class {Name}WasCompleted extends EventSourced
{
    public function __construct(
        // event payload - immutable data
    ) {
    }
}
```

#### Pattern: Entity

```php
namespace OpenLoyalty\Domain\{Context}\Model;

/**
 * @see {ticket_id}
 */
final readonly class {Name}
{
    public function __construct(
        // private fields with constructor promotion
        // RULE DEV020: decimal fields use string|float|null
    ) {
    }

    // domain behavior methods
}
```

#### Pattern: Repository

```php
namespace OpenLoyalty\Domain\{Context}\Repository;

use OpenLoyalty\Domain\{Context}\Model\{Name};

interface {Name}Repository
{
    public function find(string $id): ?{Name};

    public function save({Name} $entity): void;
}
```

#### Pattern: Test

```php
namespace Tests\OpenLoyalty\Application\{Context};

use PHPUnit\Framework\TestCase;
use OpenLoyalty\Application\{Context}\Handler\{Name}Handler;
use OpenLoyalty\Application\{Context}\Command\{Name}Command;

/**
 * @see {ticket_id}
 */
final class {Name}HandlerTest extends TestCase
{
    public function test_handle(): void
    {
        // given

        // when

        // then
        $this->markTestIncomplete('TODO: implement test');
    }
}
```

**Adaptation rules:**
- If a reference file was found in Step 2, match its style (import ordering, docblock format, constructor patterns)
- If the context uses a specific base class or interface, extend/implement it
- Use `DateTimeImmutable`, never `DateTime`
- No static calls, constructor DI only
</step>

<validation_gate name="convention-check" blocking="true">

<step number="5" required="true" depends_on="4">
### Step 5: Validate Against Conventions

**CRITICAL:** Every generated file must pass convention validation before writing.

#### Critical Rule Checks

| Rule | Check | Fail Action |
|------|-------|-------------|
| **DEV020** | Decimal fields use `string\|float\|null` | Block, fix types |
| **DEV022** | Index migrations use `CREATE INDEX CONCURRENTLY IF NOT EXISTS` | Block if migration detected |
| **DEV027** | No destructive schema changes | Block, warn user |
| **DEV034** | Handlers must NOT depend on read models | Block, remove dependency |

#### Syntax Checks

- [ ] `declare(strict_types=1);` present
- [ ] `final readonly` on class declaration
- [ ] `DateTimeImmutable` used (not `DateTime`)
- [ ] No static method calls
- [ ] Constructor-based dependency injection only
- [ ] Correct namespace matching file path
- [ ] No read model imports in handlers

**BLOCK if any check fails:**

```
Convention validation failed:

Errors:
- DEV034: Handler imports ReadModel\CustomerView - handlers must not depend on read models
- Syntax: Missing declare(strict_types=1)

Fix these issues before generation can proceed.
```

**GATE ENFORCEMENT:** Do NOT proceed to Step 6 until all checks pass.

</step>
</validation_gate>

<step number="6" required="true" depends_on="5">
### Step 6: Generate Files

**File path mapping:**

| Pattern | Path |
|---------|------|
| Command | `src/Application/{Context}/Command/{Name}Command.php` |
| Handler | `src/Application/{Context}/Handler/{Name}Handler.php` |
| Event | `src/Domain/{Context}/Event/{Name}WasCompleted.php` |
| Entity | `src/Domain/{Context}/Model/{Name}.php` |
| Repository | `src/Domain/{Context}/Repository/{Name}Repository.php` |
| Test | `tests/Application/{Context}/{Name}HandlerTest.php` |

**Steps:**
1. Create target directory if it doesn't exist (`mkdir -p`)
2. Write generated PHP file using the Write tool
3. If `--with-tests` flag: also generate the corresponding test file
4. If `--pattern handler`: also generate the Command class (handlers need commands)

**Bundled generation rules:**
- `handler` always generates: Handler + Command (+ Test if `--with-tests`)
- `event` generates only the event class
- `entity` generates only the entity class
- `repository` generates only the interface
- `command` generates only the command class
- `test` generates only the test class
</step>

<step number="7" required="false" depends_on="6">
### Step 7: Map to AI Guide

After generation, reference the relevant implementation guide:

| Pattern | Guide |
|---------|-------|
| `command`, `handler`, `entity`, `repository` | `docs/ai-guides/crud-implementation.md` |
| `event` | `docs/ai-guides/read-model-projections.md` |
| `test` | `docs/ai-guides/integration-tests.md` |

Check if the guide exists:

```bash
ls docs/ai-guides/ 2>/dev/null
```

If found, suggest reading it for implementation patterns.
</step>

<step number="8" required="false" depends_on="6">
### Step 8: Strict Review (Optional)

If `--strict` flag is used:

1. Run full AGENTS.md rule validation against all generated files
2. Check namespace correctness against directory structure
3. Verify no rule violations
4. Block if any critical rule violated
5. Suggest fixes before commit

```
Strict review: checking generated files against all AGENTS.md rules...
```
</step>

</critical_sequence>

---

<decision_gate name="post-generation" wait_for_user="true">

## Decision Menu After Generation

After successful file generation, present:

```
Generated for {ticket_id} ({Context} context):

Files created:
- src/Application/{Context}/Handler/{Name}Handler.php
- src/Application/{Context}/Command/{Name}Command.php
- tests/Application/{Context}/{Name}HandlerTest.php

Verified: namespaces, strict_types, critical rules OK.

What's next?
1. Auto-fill handler logic from Jira ticket (recommended)
2. Add event publishing and repository stub
3. Run strict review now
4. Generate more artifacts for this context
5. Other
```

**Handle responses:**

**Option 1: Auto-fill handler logic**
- Read Jira ticket description and acceptance criteria
- Infer handler implementation from requirements
- Fill in the `__invoke` method body
- Present code for review before saving

**Option 2: Add event + repository**
- Generate event class for this context
- Generate repository interface
- Wire event dispatching in handler

**Option 3: Strict review**
- Trigger Step 8 validation

**Option 4: Generate more**
- Ask for next artifact details
- Re-enter at Step 1 with same context

**Option 5: Other**
- Ask what they'd like to do

</decision_gate>

---

<integration_protocol>

## Integration Points

**Invoked by:**
- `/openloyalty:run-coding-agent` command (primary interface)
- Manual invocation when user requests code generation
- Can be called from other skills needing artifact scaffolding

**Invokes:**
- None (terminal skill - generates files directly)

**Handoff expectations:**
- AGENTS.md must be readable in the repository
- Target bounded context should exist or be intentionally new
- Jira integration is optional (degrades gracefully)

</integration_protocol>

---

<success_criteria>

## Success Criteria

Code generation is successful when ALL of the following are true:

- All requested PHP files created at correct paths
- `declare(strict_types=1)` present in every file
- `final readonly` used on all class declarations
- Namespaces match file paths exactly
- Critical rules (DEV020, DEV022, DEV027, DEV034) validated
- No read model dependencies in handlers
- Constructor-based DI only (no static calls)
- Ticket reference in docblock (if ticket provided)
- Test skeleton generated (if `--with-tests`)
- User presented with decision menu

</success_criteria>

---

## Error Handling

**Missing AGENTS.md:**
- Warn user: "AGENTS.md not found. Generating with default OL conventions."
- Proceed with built-in convention knowledge
- Flag output as "unvalidated against project rules"

**Invalid pattern type:**
- Show allowed values: `command`, `handler`, `event`, `entity`, `repository`, `test`
- Ask user to choose

**Context directory doesn't exist:**
- Create directory structure with `mkdir -p`
- Warn: "Creating new bounded context directory: {Context}"

**Jira unavailable:**
- Skip ticket info in docblocks
- Use placeholder: `@see {ticket_id}` without summary

**Convention validation fails:**
- Show specific violations
- Suggest fixes
- BLOCK until resolved (validation gate is blocking)

**File already exists:**
- Present conflict resolution options (Step 3)
- Never overwrite without user confirmation

---

## Execution Guidelines

**MUST do:**
- Read AGENTS.md before generating any code
- Validate all output against critical rules (BLOCK if invalid)
- Use `final readonly` on every class
- Include `declare(strict_types=1)` in every file
- Match existing namespace patterns from the project
- Create directories before writing files (`mkdir -p`)
- Ask user and WAIT if required arguments missing

**MUST NOT do:**
- Generate code without reading AGENTS.md first
- Skip convention validation
- Use `DateTime` (always `DateTimeImmutable`)
- Add static method calls
- Import read models in handlers (DEV034)
- Overwrite existing files without confirmation
- Generate destructive migration statements (DEV027)

---

## Example Scenario

**User:** `/openloyalty:run-coding-agent --pattern handler --context Customer --name CompleteAchievement --ticket OLOY-6715 --with-tests`

**Skill activates:**

1. **Parse arguments:** pattern=handler, context=Customer, name=CompleteAchievement, ticket=OLOY-6715, with-tests=true
2. **Gather context (parallel):**
   - Conventions Loader: Reads AGENTS.md, extracts DEV020/022/027/034
   - Structure Detector: Finds `src/Application/Customer/Handler/` exists, reads `AssignCustomerHandler.php` as reference
   - Jira Context: Fetches OLOY-6715 summary: "Complete achievement when customer reaches tier"
3. **Check conflicts:** No existing `CompleteAchievementHandler.php` found
4. **Build skeleton:** Generates Handler, Command, and Test classes matching existing style
5. **Validate:** All checks pass (strict_types, final readonly, no read models, namespaces OK)
6. **Generate files:**
   - `src/Application/Customer/Command/CompleteAchievementCommand.php`
   - `src/Application/Customer/Handler/CompleteAchievementHandler.php`
   - `tests/Application/Customer/CompleteAchievementHandlerTest.php`
7. **AI guide:** Suggests reading `docs/ai-guides/crud-implementation.md`

**Output:**

```
Generated for OLOY-6715 (Customer context):

Files created:
- src/Application/Customer/Command/CompleteAchievementCommand.php
- src/Application/Customer/Handler/CompleteAchievementHandler.php
- tests/Application/Customer/CompleteAchievementHandlerTest.php

Verified: namespaces, strict_types, critical rules OK.
Linked to OLOY-6715: "Complete achievement when customer reaches tier"

What's next?
1. Auto-fill handler logic from Jira ticket (recommended)
2. Add event publishing and repository stub
3. Run strict review now
4. Generate more artifacts for this context
5. Other
```
