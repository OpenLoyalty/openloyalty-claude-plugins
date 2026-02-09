---
module: [Module name - e.g., "Points System", "Campaign Manager"]
date: [YYYY-MM-DD]
problem_type: [build_error|test_failure|runtime_error|performance_issue|database_issue|security_issue|api_issue|integration_issue|logic_error|developer_experience|configuration_issue|documentation_gap|data_issue]
component: [loyalty_engine|campaign_manager|points_system|rewards_catalog|customer_portal|api_gateway|webhook_processor|analytics_service|authentication|segments|levels|transactions|earning_rules|spending_rules|database|background_jobs|cache|testing_framework|development_workflow|documentation]
symptoms:
  - [Observable symptom 1 - specific error message or behavior]
  - [Observable symptom 2 - what user actually saw/experienced]
root_cause: [missing_association|missing_include|missing_index|wrong_api_usage|scope_issue|race_condition|async_timing|memory_leak|config_error|logic_error|test_isolation|missing_validation|missing_permission|cache_invalidation|serialization_error|incomplete_setup|external_dependency]
ol_version: [4.x.x - optional]
resolution_type: [code_fix|migration|config_change|test_fix|dependency_update|environment_setup|workflow_improvement|documentation_update|tooling_addition|data_fix|cache_clear]
severity: [critical|high|medium|low]
tags: [keyword1, keyword2, keyword3]
related_tickets: [OLOY-XXX - optional]
---

# Troubleshooting: [Clear Problem Title]

## Problem

[1-2 sentence clear description of the issue and what the user experienced]

## Environment

- **Module:** [Name - e.g., "Points System"]
- **Open Loyalty Version:** [e.g., 4.2.0]
- **Affected Component:** [e.g., "Points calculation service", "Campaign rules engine"]
- **Date Resolved:** [YYYY-MM-DD]
- **Environment:** [Development/Staging/Production]

## Symptoms

- [Observable symptom 1 - what the user saw/experienced]
- [Observable symptom 2 - error messages, visual issues, unexpected behavior]
- [Continue as needed - be specific with exact error text]

## What Didn't Work

**Attempted Solution 1:** [Description of what was tried]
- **Why it failed:** [Technical reason this didn't solve the problem]

**Attempted Solution 2:** [Description of second attempt]
- **Why it failed:** [Technical reason]

[Continue for all significant attempts that DIDN'T work]

[If nothing else was attempted first, write:]
**Direct solution:** The problem was identified and fixed on the first attempt.

## Solution

[The actual fix that worked - provide specific details]

**Code changes** (if applicable):
```[language]
# Before (broken):
[Show the problematic code]

# After (fixed):
[Show the corrected code with explanation]
```

**Database migration** (if applicable):
```ruby
# Migration change:
[Show what was changed in the migration]
```

**Configuration change** (if applicable):
```yaml
# Config change:
[Show what was changed]
```

**Commands run** (if applicable):
```bash
# Steps taken to fix:
[Commands or actions]
```

## Why This Works

[Technical explanation of:]
1. What was the ROOT CAUSE of the problem?
2. Why does the solution address this root cause?
3. What was the underlying issue (API misuse, configuration error, logic bug, etc.)?

[Be detailed enough that future developers understand the "why", not just the "what"]

## Prevention

[How to avoid this problem in future Open Loyalty development:]
- [Specific coding practice, check, or pattern to follow]
- [What to watch out for]
- [How to catch this early - tests, linting, code review checks]

## Related Issues

[If any similar problems exist in engineering/compound-learnings/, link to them:]
- See also: [another-related-issue.md](../category/another-related-issue.md)
- Similar to: [related-problem.md](../category/related-problem.md)

[If no related issues, write:]
No related issues documented yet.

## Related Tickets

[Link to Jira tickets if available:]
- [OLOY-XXXX](https://openloyalty.atlassian.net/browse/OLOY-XXXX)
