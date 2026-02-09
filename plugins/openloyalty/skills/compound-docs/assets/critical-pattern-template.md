# Critical Pattern Template

Use this template when adding a pattern to `engineering/compound-learnings/patterns/ol-critical-patterns.md`:

---

## N. [Pattern Name] (ALWAYS REQUIRED)

### Context

**When this applies:**
- [Situation 1 where this pattern is relevant]
- [Situation 2]

**Components affected:** [loyalty_engine, points_system, etc.]

### The Wrong Way

**What causes problems:**
```[language]
[code showing wrong approach - be specific]
```

**Why it fails:** [Brief explanation of what goes wrong]

### The Correct Way

**Do this instead:**
```[language]
[code showing correct approach - be specific]
```

**Why it works:** [Brief explanation of why this is correct]

### Quick Reference

| Aspect | Wrong | Correct |
|--------|-------|---------|
| [Key difference 1] | [Bad approach] | [Good approach] |
| [Key difference 2] | [Bad approach] | [Good approach] |

### Detection

**Symptoms that indicate this issue:**
- [Observable symptom 1]
- [Observable symptom 2]

**How to check:**
```bash
# Quick diagnostic command or query
[command to detect this issue]
```

### Source

**Documented in:** `engineering/compound-learnings/[category]/[filename].md`

**Related tickets:** [OLOY-XXXX]

---

## Instructions for Adding New Patterns

1. Replace `N` with the next pattern number (check existing patterns)
2. Replace `[Pattern Name]` with a descriptive title
3. Fill in the context section explaining when this applies
4. Provide concrete WRONG example with actual code that causes the problem
5. Provide concrete CORRECT example showing the solution
6. Add the quick reference table for at-a-glance comparison
7. Include detection symptoms and diagnostic commands
8. Link to the full troubleshooting doc where this was originally solved

## Pattern Categories

When naming patterns, use these prefixes:
- **POINTS-** : Points calculation, earning, spending
- **CAMPAIGN-** : Campaign rules, evaluation, activation
- **API-** : API design, responses, authentication
- **DB-** : Database, queries, migrations
- **PERF-** : Performance, caching, optimization
- **SEC-** : Security, authorization, validation
- **ASYNC-** : Background jobs, webhooks, events
- **TEST-** : Testing, fixtures, factories

## Example Pattern Entry

```markdown
## 7. POINTS-001: Always Use Decimal for Points Calculations

### Context

**When this applies:**
- Any points earning or spending calculation
- Transaction value to points conversion
- Points balance operations

**Components affected:** points_system, earning_rules, spending_rules

### The Wrong Way

**What causes problems:**
```ruby
# Using float for points calculation
points = (transaction_value * earning_rate).to_i
```

**Why it fails:** Floating point arithmetic causes rounding errors that accumulate over many transactions.

### The Correct Way

**Do this instead:**
```ruby
# Use BigDecimal for precise calculation
points = (BigDecimal(transaction_value.to_s) * BigDecimal(earning_rate.to_s)).round(0).to_i
```

**Why it works:** BigDecimal maintains precision for financial calculations.

### Quick Reference

| Aspect | Wrong | Correct |
|--------|-------|---------|
| Type | Float | BigDecimal |
| Rounding | Implicit | Explicit .round() |
| Precision | ~15 digits | Arbitrary |

### Detection

**Symptoms that indicate this issue:**
- Points balance doesn't match expected total
- Small discrepancies in earning calculations
- "Missing" points over time

**How to check:**
```bash
# Check for float usage in points calculations
grep -r "\.to_f" app/services/points/
```

### Source

**Documented in:** `engineering/compound-learnings/logic-errors/float-precision-points-20260115.md`

**Related tickets:** OLOY-4521
```
