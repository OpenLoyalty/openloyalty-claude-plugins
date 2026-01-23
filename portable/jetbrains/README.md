# JetBrains AI Assistant Setup for Open Loyalty

JetBrains AI Assistant (built into PHPStorm, WebStorm, etc.) does **NOT** support file-based configuration. Custom prompts must be added manually via IDE settings.

## Limitation

Unlike Claude Code, OpenCode, and Cursor, JetBrains AI Assistant:
- Stores prompts in IDE settings, not project files
- Cannot be standardized across the team via repository
- Has no "agents" or named workflows concept

## Recommendation

For Open Loyalty developers using PHPStorm:
- Use **OpenCode** as a terminal companion for full agentic workflows
- Use JetBrains AI for quick, context-aware code completion
- Set up custom prompts below for common workflows

## Manual Setup

### Step 1: Access Prompt Library

1. Open PHPStorm
2. Go to **Settings** (Cmd+, on Mac, Ctrl+Alt+S on Windows/Linux)
3. Navigate to **Tools → AI Assistant → Prompt Library**

### Step 2: Add Custom Prompts

Create these prompts in your Prompt Library:

---

### Prompt: "Compound Learning"

**Name:** Compound Learning
**Prompt:**
```
Analyze the current branch to create a compound learning document.

Steps:
1. Review the git commits on this branch vs main
2. Understand what problem was being solved
3. Identify the approach taken and key findings
4. Extract lessons learned

Generate a document with:
- Problem Statement (specific symptoms, not vague)
- Investigation Steps (including dead ends)
- Findings (distinguish symptoms from root causes)
- Conclusion (root cause/solution with confidence level)
- Lessons Learned:
  - For Future Investigations
  - For the Codebase
  - Pattern Recognition (symptoms that indicate this issue)

Format as markdown for engineering/compound-learnings/
```

---

### Prompt: "OL Code Review"

**Name:** OL Code Review
**Prompt:**
```
Review this code following Open Loyalty conventions.

Check the AGENTS.md file in this repository for critical rules.

For PHP: Check DEV020 (CQRS), DEV022 (events), DEV027 (value objects), DEV034 (DI)
For TypeScript: Check TS001 (const), TS002 (types), COMP002 (components), FORM001 (forms)

Categorize issues as:
- Critical: Security, data integrity, breaking changes
- Important: Convention violations, missing tests
- Suggestions: Style improvements

For each issue, specify file, line, problem, and suggested fix.
```

---

### Prompt: "Technical Spike"

**Name:** Technical Spike
**Prompt:**
```
Help me structure a technical spike investigation.

I need to answer: $SELECTION

Create a spike document structure with:
1. Question to answer
2. Context and constraints
3. Success criteria
4. Options to evaluate (with pros/cons for each)
5. Investigation log format
6. Recommendation template

Save to: engineering/spikes/{date}-{topic}.md
```

---

## Using the Prompts

1. Select code or text in the editor (optional)
2. Open AI Assistant chat (Alt+Enter → AI Actions, or via toolbar)
3. Click the prompt from your library
4. AI will execute with selected context

## Alternatives for Full Workflows

For the full agentic experience with parallel agents and MCP integrations:

| Tool | Setup |
|------|-------|
| **OpenCode** | Run in terminal alongside PHPStorm. Copy `opencode.json` from `portable/opencode/` |
| **Claude Code** | Full skill support with `/openloyalty:compound` commands |

Both tools can read the same codebase open in PHPStorm.

## File Locations

When prompts generate documents, save them to:
- Compound learnings: `engineering/compound-learnings/{TICKET}-{slug}.md`
- Spikes: `engineering/spikes/{date}-{slug}.md`
- Code reviews: Output to chat or as comments

---

*Note: JetBrains is working on Junie (their AI coding assistant) which may support file-based config in the future. Until then, manual prompt setup is required.*
