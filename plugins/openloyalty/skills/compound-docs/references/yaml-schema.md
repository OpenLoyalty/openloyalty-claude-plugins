# Open Loyalty Documentation Schema Reference

This document explains the YAML frontmatter schema used for compound learning documentation. All documentation files in `engineering/compound-learnings/` must conform to this schema.

## Required Fields

### module

**Type:** String
**Description:** The Open Loyalty module or service area where the problem occurred.

**Valid values:**
- `Loyalty Engine` - Core loyalty logic
- `Campaign Manager` - Campaign configuration and rules
- `Points System` - Points earning, spending, transfers
- `Customer Portal` - Frontend/UI
- `API Gateway` - REST/GraphQL API layer
- `Webhook Processor` - Event processing
- `Analytics Service` - Reporting and metrics
- `Authentication` - Auth, SSO, permissions
- `Rewards Catalog` - Reward definitions
- `Segments` - Customer segmentation
- `Levels` - Tier/level management
- `Transactions` - Transaction processing
- `Earning Rules` - Point earning configuration
- `Spending Rules` - Point spending configuration

### date

**Type:** String (YYYY-MM-DD format)
**Description:** Date when this problem was solved.

**Example:** `2026-01-28`

### problem_type

**Type:** Enum
**Description:** Primary category of the problem. Determines the output directory.

| Value | Description | Output Directory |
|-------|-------------|------------------|
| `build_error` | Build, compilation, bundle errors | `build-errors/` |
| `test_failure` | Test failures, flaky tests | `test-failures/` |
| `runtime_error` | Exceptions, crashes | `runtime-errors/` |
| `performance_issue` | Slow queries, memory, N+1 | `performance-issues/` |
| `database_issue` | Migration, query, schema | `database-issues/` |
| `security_issue` | Auth, authorization, injection | `security-issues/` |
| `api_issue` | REST/GraphQL problems | `api-issues/` |
| `integration_issue` | External service, webhooks | `integration-issues/` |
| `logic_error` | Business logic bugs | `logic-errors/` |
| `developer_experience` | DX, workflow, tooling | `developer-experience/` |
| `configuration_issue` | Config, environment | `configuration-issues/` |
| `documentation_gap` | Missing documentation | `documentation-gaps/` |
| `data_issue` | Data corruption, sync | `data-issues/` |

### component

**Type:** Enum
**Description:** The specific Open Loyalty component involved.

| Value | Description |
|-------|-------------|
| `loyalty_engine` | Core loyalty logic, point calculations |
| `campaign_manager` | Campaign configuration, rules engine |
| `points_system` | Points earning, spending, transfers |
| `rewards_catalog` | Reward definitions, redemption |
| `customer_portal` | Frontend/UI components |
| `api_gateway` | REST/GraphQL API layer |
| `webhook_processor` | Event processing, notifications |
| `analytics_service` | Reporting, dashboards |
| `authentication` | Auth, SSO, permissions |
| `segments` | Customer segmentation |
| `levels` | Tier/level management |
| `transactions` | Transaction processing |
| `earning_rules` | Point earning configuration |
| `spending_rules` | Point spending configuration |
| `database` | PostgreSQL, migrations |
| `background_jobs` | Async processing, queues |
| `cache` | Redis, caching layer |
| `testing_framework` | Tests, fixtures |
| `development_workflow` | Dev tooling |
| `documentation` | Docs, guides |

### symptoms

**Type:** Array of strings (1-5 items)
**Description:** Observable symptoms - exact error messages, visual issues, or unexpected behavior.

**Good examples:**
- `"Points not crediting after transaction"`
- `"API returning 500 error on reward redemption"`
- `"N+1 query detected: 100+ queries for 10 customers"`

**Bad examples (too vague):**
- `"Something is broken"`
- `"It doesn't work"`
- `"Error occurred"`

### root_cause

**Type:** Enum
**Description:** The fundamental cause of the problem (not a symptom).

| Value | Description |
|-------|-------------|
| `missing_association` | Incorrect ORM relationships |
| `missing_include` | Missing eager loading (N+1) |
| `missing_index` | Database performance issue |
| `wrong_api_usage` | Using deprecated/incorrect API |
| `scope_issue` | Incorrect query scope |
| `race_condition` | Concurrent modification issues |
| `async_timing` | Background job timing |
| `memory_leak` | Memory issues |
| `config_error` | Configuration issue |
| `logic_error` | Algorithm/business logic bug |
| `test_isolation` | Test contamination |
| `missing_validation` | Input validation missing |
| `missing_permission` | Authorization missing |
| `cache_invalidation` | Stale cache data |
| `serialization_error` | JSON/data serialization |
| `incomplete_setup` | Missing seed data |
| `external_dependency` | Third-party service issue |

### resolution_type

**Type:** Enum
**Description:** Type of fix applied.

| Value | Description |
|-------|-------------|
| `code_fix` | Fixed by changing source code |
| `migration` | Fixed by database migration |
| `config_change` | Fixed by configuration change |
| `test_fix` | Fixed by correcting tests |
| `dependency_update` | Fixed by updating dependency |
| `environment_setup` | Fixed by environment config |
| `workflow_improvement` | Improved dev workflow |
| `documentation_update` | Added/updated docs |
| `tooling_addition` | Added helper script |
| `data_fix` | Fixed by correcting data |
| `cache_clear` | Fixed by cache rebuild |

### severity

**Type:** Enum
**Description:** Impact severity of the issue.

| Value | Description | Criteria |
|-------|-------------|----------|
| `critical` | Blocks production/development | Build fails, data loss, security breach |
| `high` | Impairs core functionality | Feature broken, performance severely degraded |
| `medium` | Affects specific feature | UI broken, partial functionality loss |
| `low` | Minor issue or edge case | Cosmetic, rare scenario |

## Optional Fields

### ol_version

**Type:** String
**Description:** Open Loyalty version where the issue occurred.

**Example:** `4.2.0`

### related_tickets

**Type:** Array of strings
**Description:** Related Jira tickets in OLOY-XXX format.

**Example:** `["OLOY-1234", "OLOY-5678"]`

### related_components

**Type:** Array of strings
**Description:** Other components that interact with this issue.

### tags

**Type:** Array of strings (max 8)
**Description:** Searchable keywords. Use lowercase, hyphen-separated.

**Good examples:**
- `points-calculation`
- `campaign-rules`
- `n-plus-one`
- `webhook-delivery`

### environment

**Type:** Enum
**Description:** Environment where issue occurred.

| Value | Description |
|-------|-------------|
| `development` | Local development |
| `staging` | Staging/test environment |
| `production` | Production |
| `all` | Occurs in all environments |

## Category Mapping

The `problem_type` field determines the output directory:

```yaml
category_mapping:
  build_error: "build-errors"
  test_failure: "test-failures"
  runtime_error: "runtime-errors"
  performance_issue: "performance-issues"
  database_issue: "database-issues"
  security_issue: "security-issues"
  api_issue: "api-issues"
  integration_issue: "integration-issues"
  logic_error: "logic-errors"
  developer_experience: "developer-experience"
  configuration_issue: "configuration-issues"
  documentation_gap: "documentation-gaps"
  data_issue: "data-issues"
```

## Validation Rules

1. All required fields must be present
2. Enum values must match exactly (case-sensitive)
3. Date must be in YYYY-MM-DD format
4. Symptoms must be specific and observable (not vague)
5. Root cause must be the actual cause, not a symptom
6. Tags should be lowercase with hyphens

## Example Valid Frontmatter

```yaml
---
module: Points System
date: 2026-01-28
problem_type: performance_issue
component: points_system
symptoms:
  - "Points calculation taking >5 seconds"
  - "N+1 query when loading customer transactions"
root_cause: missing_include
ol_version: "4.2.0"
resolution_type: code_fix
severity: high
tags: [n-plus-one, eager-loading, performance]
related_tickets: [OLOY-1234]
environment: production
---
```

## Directory Structure

Documentation is organized by problem type:

```
engineering/
└── compound-learnings/
    ├── build-errors/
    ├── test-failures/
    ├── runtime-errors/
    ├── performance-issues/
    ├── database-issues/
    ├── security-issues/
    ├── api-issues/
    ├── integration-issues/
    ├── logic-errors/
    ├── developer-experience/
    ├── configuration-issues/
    ├── documentation-gaps/
    ├── data-issues/
    └── patterns/
        ├── common-solutions.md
        └── ol-critical-patterns.md
```
