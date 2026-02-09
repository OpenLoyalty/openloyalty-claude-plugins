# Convention Checklist Reference

Quick-reference checklist for validating generated PHP code against Open Loyalty conventions.

## Critical Rules (from AGENTS.md)

| Rule | Description | Applies To |
|------|-------------|------------|
| **DEV020** | Decimal fields must use `string\|float\|null` types | Entities, Value Objects |
| **DEV022** | Indexes must use `CREATE INDEX CONCURRENTLY IF NOT EXISTS` | Migrations only |
| **DEV027** | No destructive schema changes (DROP COLUMN, DROP TABLE, etc.) | Migrations only |
| **DEV034** | Handlers must NOT depend on read models | Handlers |

## Syntax Rules

Every generated PHP file must satisfy:

- [ ] Opens with `<?php` followed by blank line
- [ ] `declare(strict_types=1);` on line 3
- [ ] Correct namespace matching file path
- [ ] `final readonly class` on class declaration
- [ ] Constructor-based dependency injection (no `new` in methods, no static calls)
- [ ] `DateTimeImmutable` used everywhere (never `DateTime`)
- [ ] Ticket reference in docblock (if ticket provided)

## Namespace-to-Path Mapping

```
OpenLoyalty\Application\{Context}\Command  -> src/Application/{Context}/Command/
OpenLoyalty\Application\{Context}\Handler  -> src/Application/{Context}/Handler/
OpenLoyalty\Domain\{Context}\Event         -> src/Domain/{Context}/Event/
OpenLoyalty\Domain\{Context}\Model         -> src/Domain/{Context}/Model/
OpenLoyalty\Domain\{Context}\Repository    -> src/Domain/{Context}/Repository/
Tests\OpenLoyalty\Application\{Context}    -> tests/Application/{Context}/
```

## Handler-Specific Rules

- Handler class is `final readonly`
- Single `__invoke` method accepting the Command
- Return type: `void`
- Dependencies injected via constructor
- **NO read model imports** (DEV034)
- Domain services only

## Entity-Specific Rules

- All fields private, exposed via getters
- Domain behavior as methods (not anemic)
- Decimal fields: `string|float|null` (DEV020)
- Use value objects where appropriate
