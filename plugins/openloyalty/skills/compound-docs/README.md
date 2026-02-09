# Compound Learning System

The `/openloyalty:compound` command creates a compounding knowledge repository. Each documented solution makes the team smarter.

## Features

| Feature | Description |
|---------|-------------|
| **Parallel Subagents** | 6 agents gather context simultaneously |
| **YAML Schema Validation** | Enum-validated frontmatter ensures consistency |
| **Category-Based Organization** | Auto-categorized by problem type |
| **Critical Pattern Promotion** | Elevate issues to "Required Reading" |
| **Cross-Referencing** | Automatic linking of related issues |
| **Graceful Degradation** | Works without Jira/Slack MCPs |

## Usage

```bash
# Document from current context
/openloyalty:compound

# Analyze specific branch
/openloyalty:compound feature/OLOY-123-fix-timezone

# Include Jira ticket context
/openloyalty:compound --ticket OLOY-1234

# Include Slack thread
/openloyalty:compound --slack https://slack.com/archives/C123/p456
```

## Auto-Invoke Triggers

The skill can auto-invoke after phrases like:
- "that worked"
- "it's fixed"
- "working now"
- "problem solved"

## Output Categories

Documents are auto-sorted by `problem_type`:

```
engineering/compound-learnings/
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

## YAML Schema

All documentation uses validated YAML frontmatter with OL-specific enums:

```yaml
---
module: Points System                    # OL module name
date: 2026-01-28                        # YYYY-MM-DD
problem_type: performance_issue          # Enum (determines category)
component: points_system                 # Enum
symptoms:
  - "N+1 query when loading transactions"
root_cause: missing_include              # Enum
resolution_type: code_fix                # Enum
severity: high                           # Enum
tags: [n-plus-one, performance]
---
```

## Post-Documentation Options

After capture, choose:
1. **Continue workflow** - Return to work
2. **Add to Required Reading** - Promote to critical patterns
3. **Link related issues** - Connect similar problems
4. **View documentation** - Review what was captured
