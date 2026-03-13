---
name: winning-plan
description: Build structured deal plans for key sales opportunities by auto-pulling context from HubSpot, Fathom meetings, and web research. Use when preparing for ICP/HPC deals, creating deal strategy, or iterating on an existing winning plan.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Task
  - mcp__claude_ai_HubSpot__search_crm_objects
  - mcp__claude_ai_HubSpot__get_crm_objects
  - mcp__claude_ai_HubSpot__get_user_details
  - mcp__claude_ai_HubSpot__search_properties
  - mcp__claude_ai_HubSpot__get_properties
  - mcp__claude_ai_HubSpot__search_owners
  - mcp__claude_ai_Fathom_Video__search_meetings
  - mcp__claude_ai_Fathom_Video__get_meeting_summary
  - mcp__claude_ai_Fathom_Video__get_transcript
  - WebSearch
  - WebFetch
---

# Winning Plan

Generate and iterate Winning Plans for key sales opportunities — structured action plans that answer "What do we need to do/present to win this deal?"

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `<company>` | Company name to look up (required) | `ticketmaster` |

**Usage:** `/sales:winning-plan ticketmaster`

## Assumptions

1. The winning plan gives a clear answer for "What do we need to do/present to win the deal"
2. The AE creates and owns the winning plan, describing the plan for winning including all action items that ensure the client receives an offer they can't refuse
3. A winning plan is **mandatory** for ICP and HPC deals
4. The winning plan is pinned to the deal in HubSpot as a note at the top
5. The winning plan is **iterated** as the sales process progresses — extended and updated based on observations and learnings

## Workflow

### Phase 0: Resolve Arguments

Extract the company name from the user's argument. This is the primary input — everything else is auto-discovered.

- **company_name** — from the argument (e.g., `ticketmaster` from `/sales:winning-plan ticketmaster`)

**Validation:** If no company name provided, ask:
```
Please provide a company name. Usage: /sales:winning-plan <company-name>
```

### Phase 1: Auto-Discover Deal Context

Automatically pull all available context from HubSpot and Fathom **before asking the user anything**. Run these in parallel where possible.

<step number="1" required="true">

**1a. Search HubSpot for the company.** Use `mcp__claude_ai_HubSpot__search_crm_objects` to find the company by name:
- Search `companies` objectType with the company name as `query`
- Request properties: `name`, `domain`, `industry`, `city`, `country`, `numberofemployees`, `annualrevenue`, `description`, `notes_last_updated`

If the company is found, save the company ID and proceed to pull associated data.

**1b. Pull associated deals.** Use `mcp__claude_ai_HubSpot__search_crm_objects` to find deals associated with the company:
- Search `deals` objectType with `associatedWith` filter for the company ID
- Request properties: `dealname`, `dealstage`, `amount`, `closedate`, `hubspot_owner_id`, `pipeline`, `description`, `notes_last_updated`

**1c. Pull associated contacts.** Use `mcp__claude_ai_HubSpot__search_crm_objects` to find contacts associated with the company:
- Search `contacts` objectType with `associatedWith` filter for the company ID
- Request properties: `firstname`, `lastname`, `email`, `jobtitle`, `phone`, `lifecyclestage`, `notes_last_updated`

**1d. Resolve deal owner.** If deals have a `hubspot_owner_id`, use `mcp__claude_ai_HubSpot__search_owners` to resolve the owner name (AE).

</step>

<step number="2" required="true">

**Search Fathom for meeting history.** Use `mcp__claude_ai_Fathom_Video__search_meetings` to find past meetings mentioning the company:
- Search by the company name as `query`
- Also search by known contact names/emails from step 1c (if found) using `attendee_name` or `attendee_email`
- Set reasonable `date_from` (e.g., 6 months back) and `date_to` (today)

For each relevant meeting found:
- Use `mcp__claude_ai_Fathom_Video__get_meeting_summary` to get AI-generated summaries
- Only use `mcp__claude_ai_Fathom_Video__get_transcript` if the summary lacks detail on key topics (decision drivers, objections, competitive mentions, timeline)

Extract from meetings:
- Key decision drivers and objections raised
- Competitive alternatives mentioned
- Timeline or deadline references
- Current loyalty program state
- Stakeholder roles and influence signals
- Any commitments or next steps discussed

</step>

<step number="3" required="true" depends_on="1">

**Research the company online.** Use `WebSearch` and `WebFetch` to fill gaps that HubSpot and Fathom didn't cover. Research in parallel where possible.

**Search for:**
- `"{{company_name}}" loyalty program` — do they have an existing loyalty program? What does it look like?
- `"{{company_name}}" rewards program` — alternative naming for loyalty
- `"{{company_name}}" industry competitors` — who are their main competitors?
- `"{{company_name}}" technology stack` OR `"{{company_name}}" engineering blog` — tech maturity signals for build vs buy
- `"{{company_name}}" annual revenue employees` — business scale if not in HubSpot

**Extract and record:**
- **Current loyalty state:** Do they have a program? What type? Which provider? How does it work? (screenshots/descriptions from their website)
- **Industry and competitive landscape:** Who are their direct competitors? Do competitors have loyalty programs?
- **Company scale:** Revenue, employee count, customer base, number of locations/markets
- **Tech maturity signals:** Do they have an engineering blog? Do they build in-house or buy? What platforms do they use?
- **Recent news:** Any relevant announcements (expansion, digital transformation, new leadership)

**Use `WebFetch` on the company's website** to check for an existing loyalty/rewards page (common paths: `/loyalty`, `/rewards`, `/membership`, `/points`).

This step should answer questions like "current loyalty state", "build vs buy readiness", and "business scale" so the user doesn't have to.

</step>

<step number="4" required="true" depends_on="1,2,3">

**Present discovered context.** Show the user a summary of everything found:

```
=== Context Discovery: {{COMPANY_NAME}} ===

SOURCE: HubSpot
  Company: {{name}} ({{industry}})
  Deals: {{deal_count}} found — {{deal_summary}}
  Contacts: {{contact_count}} found — {{contact_list}}
  Deal Owner: {{ae_name}}

SOURCE: Fathom
  Meetings: {{meeting_count}} found ({{date_range}})
  Key insights: {{bullet_list_of_insights}}

SOURCE: Web Research
  Current loyalty program: {{loyalty_state}} (e.g., "Ticketmaster Fan Rewards — points-based, via Prizeout")
  Industry: {{industry_context}}
  Competitors: {{competitor_list}}
  Company scale: {{revenue, employees, locations}}
  Tech signals: {{build_vs_buy_indicators}}
  Recent news: {{relevant_announcements}}

REMAINING GAPS (internal OL data — need user input):
  - {{list of gaps that only the user can fill, e.g., deal stage, AE, decision drivers from meetings}}
```

**If HubSpot found the company:** Ask the user only about the gaps that web research also couldn't fill — do NOT re-ask for information already discovered from any source.

**If HubSpot found nothing but web research found company info:** Present what was found online and ask only for internal deal context (AE, deal stage, value, known contacts, key decision drivers).

**If neither HubSpot nor web research found anything useful:** Fall back to full manual gathering — ask for:
- Company industry
- Deal stage and estimated value
- AE name (deal owner)
- Known contacts at the prospect company
- Key decision drivers and timeline
- Any existing context not captured in Fathom

**If Fathom found nothing:** Note this in the summary and proceed — meeting history is enrichment, not a blocker.

**Key principle:** Only ask the user for information that is **internal to OL** (deal stage, AE, internal contacts, decision drivers from conversations). Anything publicly available (loyalty program state, company size, industry, competitors, tech signals) should be researched automatically.

</step>

### Phase 2: Assess and Score Ingredients

<step number="5" required="true" depends_on="4">

**Score each of the 11 key ingredients** based on available information. Consult `references/key-ingredients.md` for detailed guidance on each ingredient.

Present a scorecard:

```
=== Winning Plan Readiness: {{COMPANY_NAME}} ===

 #  | Ingredient                    | Status     | Notes
----|-------------------------------|------------|------------------
 1  | Buyer Committee               | Ready/Partial/Missing | ...
 2  | Gamified Loyalty USP          | Ready/Partial/Missing | ...
 3  | Build vs Buy USP              | Ready/Partial/Missing | ...
 4  | Loyalty Engine USP            | Ready/Partial/Missing | ...
 5  | Gamified Loyalty Tactics      | Ready/Partial/Missing | ...
 6  | Program Look & Feel           | Ready/Partial/Missing | ...
 7  | KPI Uplift Projections        | Ready/Partial/Missing | ...
 8  | Business Outcomes Forecast    | Ready/Partial/Missing | ...
 9  | Case Studies                  | Ready/Partial/Missing | ...
10  | Industry Expert               | Ready/Partial/Missing | ...
11  | Strategic Partners            | Ready/Partial/Missing | ...

Overall readiness: X/11 Ready | Y/11 Partial | Z/11 Missing
```

For each ingredient marked "Partial" or "Missing", note what specific information is needed.

</step>

<validation_gate blocking="false">

Present the scorecard to the user. Ask:
1. Is the assessment accurate?
2. Do they have additional context for any "Missing" or "Partial" ingredients?
3. Should we proceed with generating the plan (filling gaps with recommendations and TODOs)?

</validation_gate>

### Phase 3: Generate the Winning Plan

<step number="6" required="true" depends_on="5">

**Generate the winning plan** using the template from `assets/winning-plan-template.md`.

For each section:
- **Ready ingredients** — fill with the gathered information
- **Partial ingredients** — fill what's known, add specific TODOs for gaps
- **Missing ingredients** — provide strategic recommendations based on the prospect's industry, size, and situation, marked clearly as suggestions that need AE validation

Apply these principles:
- Be specific, never generic — tailor every recommendation to this prospect
- Link gamification tactics to concrete KPI impacts (see `references/key-ingredients.md`, ingredient #5)
- For case studies, suggest the most relevant from OL's portfolio based on industry/scale/use-case match
- For KPI projections, use conservative estimates with cited benchmarks
- Action items must have owners and due dates (suggest reasonable timelines)

</step>

<step number="7" required="true" depends_on="6">

**Write the winning plan** to a file. Default location: `winning-plan-{{company-name-kebab}}.md` in the current directory.

</step>

### Phase 4: Distribute and Next Steps

<decision_gate wait_for_user="true">

Present the completed plan and offer next steps:

1. **Review and refine** — iterate on specific sections
2. **Pin to HubSpot** — add as a note on the deal (requires HubSpot tools)
3. **Share via Slack** — post to a deal channel or DM to team members
4. **Export for presentation** — format key sections for slides or email
5. **Other** — describe what you need

</decision_gate>

## Iteration Support

When updating an existing winning plan:

1. Read the current plan file
2. Ask what has changed (new contacts discovered, competitive intel, feedback from prospect meetings)
3. Update the relevant sections
4. Add an entry to the **Iteration Log** at the bottom of the plan
5. Re-score the ingredients and highlight what improved

## Error Handling

- **Company not found in HubSpot:** Fall back to asking the user for deal context manually. Note in the plan that HubSpot lookup returned no results.
- **HubSpot MCP unavailable:** Fall back to asking the user for all deal context. Note in the plan that HubSpot was not available.
- **Fathom MCP unavailable:** Proceed without meeting history. Note in the plan that Fathom was not available.
- **No meetings found in Fathom:** Proceed — meeting history is enrichment, not a requirement.
- **Incomplete information for most ingredients:** Generate the plan with clear TODOs and recommendations. A partial plan with good structure is more useful than waiting for complete information.

## Example Scenario

**User:** `/sales:winning-plan INTERSPORT Elverys`

**Phase 1 output:** Auto-discovers from HubSpot: sports retail chain, 2 deals in pipeline, 4 contacts. Fathom: 3 meetings found with key insights about their current program evaluation. Gaps: need economic buyer, tech team assessment, brand assets.

**Phase 2 output:**
```
=== Winning Plan Readiness: INTERSPORT Elverys ===

 #  | Ingredient                    | Status  | Notes
----|-------------------------------|---------|------------------
 1  | Buyer Committee               | Partial | 2 contacts known, need economic buyer
 2  | Gamified Loyalty USP          | Ready   | Sports retail = strong gamification fit
 3  | Build vs Buy USP              | Missing | Need to assess their tech team
 4  | Loyalty Engine USP            | Partial | Know they're evaluating 2 others
 5  | Gamified Loyalty Tactics      | Ready   | Challenges, streaks, seasonal campaigns
 6  | Program Look & Feel           | Missing | Need brand assets
 7  | KPI Uplift Projections        | Partial | Have industry benchmarks, need their data
 8  | Business Outcomes Forecast    | Missing | Need baseline revenue/customer data
 9  | Case Studies                  | Ready   | Sports retail case studies available
10  | Industry Expert               | Partial | Know the industry, need to assign expert
11  | Strategic Partners            | Partial | Loyyo for wallet integration, Intive for mobile app (existing relationship)

Overall readiness: 3/11 Ready | 5/11 Partial | 3/11 Missing
```

**Phase 3 output:** Full winning plan document with all sections filled, TODOs for missing items, and specific action items with suggested owners and timelines.

## Guidelines

- **MUST** tailor every recommendation to the specific prospect — never use generic loyalty advice
- **MUST** link gamification tactics to measurable KPI impacts
- **MUST** include action items with owners and due dates
- **MUST** use conservative, credible numbers for projections
- **MUST NOT** make up contact names, deal values, or business metrics — use TODOs for unknown data
- **SHOULD** suggest the most relevant OL case studies based on industry/scale match
- **SHOULD** identify capability gaps and recommend partner strategies
- **SHOULD** note competitive alternatives the prospect is likely evaluating

## Success Criteria

- [ ] All 11 key ingredients are addressed (filled or marked as actionable TODOs)
- [ ] Buyer committee section has specific names and roles (or clear gaps to fill)
- [ ] KPI projections use three-way comparison (no program vs. basic vs. gamified)
- [ ] Business outcomes forecast uses prospect-specific data or reasonable estimates
- [ ] Every TODO has a suggested owner and timeline
- [ ] Plan is written to a file the user can iterate on
- [ ] Iteration log is initialized
