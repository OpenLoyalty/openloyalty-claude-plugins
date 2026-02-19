import type { ClaudeCommand, ClaudePlugin } from "../types/claude"
import type {
  OpenCodeBundle,
  OpenCodeCommandConfig,
  OpenCodeConfig,
} from "../types/opencode"

export type PermissionMode = "none" | "broad"

export type ClaudeToOpenCodeOptions = {
  permissions: PermissionMode
}

// Bare Claude family aliases used in Claude Code (e.g. `model: haiku`).
const CLAUDE_FAMILY_ALIASES: Record<string, string> = {
  haiku: "claude-haiku-4-5",
  sonnet: "claude-sonnet-4-5",
  opus: "claude-opus-4-6",
}

// Setup command rewrite map — string replacements applied to the setup command body.
const SETUP_REWRITES: [RegExp | string, string][] = [
  // compound-engineering: two-step Claude plugin install → single bunx command
  [
    /### 0\. Install required plugin: compound-engineering[\s\S]*?(?=###\s+1\.)/,
    `### 0. Install required plugin: compound-engineering

The Open Loyalty plugin requires the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin for review workflows, agent types, and engineering best practices.

Run the following command to install compound-engineering into OpenCode:

\`\`\`bash
bunx @every-env/compound-plugin install compound-engineering --to opencode
\`\`\`

If the command succeeds, tell the user:

> Installed compound-engineering plugin into OpenCode.

If it fails, show the error and tell the user to install manually.

`,
  ],

  // Atlassian: Claude plugin install → manual MCP config instructions
  [
    /### 1\. Install required plugin: atlassian[\s\S]*?(?=###\s+2\.)/,
    `### 1. Configure Atlassian integration

The Open Loyalty plugin uses Atlassian (Jira/Confluence) for ticket management and code review.

In OpenCode, Atlassian is configured as an MCP server. Add the following to your \`~/.config/opencode/opencode.json\`:

\`\`\`json
{
  "mcp": {
    "atlassian": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-atlassian"],
      "environment": {
        "ATLASSIAN_SITE_URL": "https://your-site.atlassian.net",
        "ATLASSIAN_USER_EMAIL": "your-email@example.com",
        "ATLASSIAN_API_TOKEN": "your-api-token"
      },
      "enabled": true
    }
  }
}
\`\`\`

Ask the user for their Atlassian credentials:
1. **ATLASSIAN_SITE_URL** — their Atlassian site URL (e.g. \`https://company.atlassian.net\`)
2. **ATLASSIAN_USER_EMAIL** — their Atlassian email
3. **ATLASSIAN_API_TOKEN** — API token from https://id.atlassian.com/manage-profile/security/api-tokens

Write the MCP configuration to \`~/.config/opencode/opencode.json\` (merge into existing config).

If the user wants to skip Atlassian, continue to step 2.

`,
  ],

  // OL MCP server: after generic rewrite, ~/.claude/.mcp.json became ~/.config/opencode/.mcp.json
  // Rewrite to opencode.json (the main config file in OpenCode)
  [
    "~/.config/opencode/.mcp.json",
    "~/.config/opencode/opencode.json",
  ],

  // "mcpServers" key (Claude format) → "mcp" key (OpenCode format)
  [
    '"mcpServers"',
    '"mcp"',
  ],

  // Restart instructions: Claude Code → OpenCode
  [
    "Restart Claude Code (`/exit` and relaunch)",
    "Restart OpenCode",
  ],
]

// Review-PR command rewrites — applied only to the openloyalty:review-pr command body.
// Note: these run after rewriteClaudePaths(), so patterns match ~/.config/opencode/ paths.
const REVIEW_PR_REWRITES: [RegExp | string, string][] = [
  // CE detection: replace Claude Code plugin-cache ls check with opencode.json command-key lookup
  [
    /Check if the compound-engineering plugin is installed:\n\n```\nRun: ls ~\/.config\/opencode\/plugins\/cache\/every-marketplace\/compound-engineering\/ 2>\/dev\/null\n```\n\n- If found: set `CE_AVAILABLE=true`, note the version\n- If not found: set `CE_AVAILABLE=false`/,
    `Check if the compound-engineering plugin is installed in OpenCode:

\`\`\`bash
python3 -c "import json, os; d=json.load(open(os.path.expanduser('~/.config/opencode/opencode.json'))); print('found' if any(k in d.get('command', {}) for k in ['test-browser', 'deepen-plan', 'workflows:work']) else 'not_found')" 2>/dev/null
\`\`\`

- If output is \`found\`: set \`CE_AVAILABLE=true\`
- If output is \`not_found\` or empty: set \`CE_AVAILABLE=false\``,
  ],

  // Phase 2 Step 1: replace parallel Task sub-agent spawning with inline CE-equivalent review
  [
    /### Step 1: Spawn CE review agents in parallel\n\nLaunch ALL core agents simultaneously[\s\S]*?(?=\n### Step 2: Collect findings)/,
    `### Step 1: Run CE-equivalent review inline

OpenCode does not support spawning compound-engineering sub-agents by type. Instead, run the CE-equivalent review inline by analysing \`git diff {commit_range} -U10\` directly, covering the same six areas:

1. **Security** (security-sentinel): Vulnerabilities, input validation, auth/authz, OWASP top 10, hardcoded secrets
2. **Performance** (performance-oracle): N+1 queries, algorithmic complexity, memory usage, caching, scalability
3. **Architecture** (architecture-strategist): Design patterns, component boundaries, coupling, structural integrity
4. **Patterns** (pattern-recognition-specialist): Naming conventions, duplication, codebase consistency
5. **Simplicity** (code-simplicity-reviewer): YAGNI violations, over-engineering, unnecessary abstractions
6. **Data integrity** (data-integrity-guardian): Migration safety, data constraints, transaction boundaries

If \`has_migrations=true\`, also cover:
7. **Migration** (data-migration-expert): ID mappings, column renames, enum conversions, schema changes
8. **Deployment** (deployment-verification-agent): Rollback procedures, SQL verification, monitoring plans

Set \`ce_ran=true\` after completing this analysis. Record findings per area for Phase 4 synthesis.`,
  ],

  // Phase 1 warning + Phase 6: update /install compound-engineering to bunx command
  [
    "/install compound-engineering",
    "bunx @every-env/compound-plugin install compound-engineering --to opencode",
  ],
]

export function convertClaudeToOpenCode(
  plugin: ClaudePlugin,
  options: ClaudeToOpenCodeOptions,
): OpenCodeBundle {
  const commandMap = convertCommands(plugin.commands)

  const config: OpenCodeConfig = {
    $schema: "https://opencode.ai/config.json",
    command: Object.keys(commandMap).length > 0 ? commandMap : undefined,
  }

  applyPermissions(config, options.permissions)

  return {
    config,
    skillDirs: plugin.skills.map((skill) => ({
      sourceDir: skill.sourceDir,
      name: skill.name,
    })),
  }
}

function convertCommands(
  commands: ClaudeCommand[],
): Record<string, OpenCodeCommandConfig> {
  const result: Record<string, OpenCodeCommandConfig> = {}
  for (const command of commands) {
    let body = rewriteClaudePaths(command.body)

    // Apply setup-specific rewrites
    if (command.name === "openloyalty:setup") {
      body = applySetupRewrites(body)
    }

    // Apply review-pr-specific rewrites
    if (command.name === "openloyalty:review-pr") {
      body = applyReviewPrRewrites(body)
    }

    const entry: OpenCodeCommandConfig = {
      description: command.description,
      template: body,
    }
    if (command.model && command.model !== "inherit") {
      entry.model = normalizeModel(command.model)
    }
    result[command.name] = entry
  }
  return result
}

function applySetupRewrites(body: string): string {
  let result = body
  for (const [pattern, replacement] of SETUP_REWRITES) {
    if (pattern instanceof RegExp) {
      result = result.replace(pattern, replacement)
    } else {
      result = result.replaceAll(pattern, replacement)
    }
  }
  return result
}

function applyReviewPrRewrites(body: string): string {
  let result = body
  for (const [pattern, replacement] of REVIEW_PR_REWRITES) {
    if (pattern instanceof RegExp) {
      result = result.replace(pattern, replacement)
    } else {
      result = result.replaceAll(pattern, replacement)
    }
  }
  return result
}

function rewriteClaudePaths(body: string): string {
  return body
    .replace(/~\/\.claude\//g, "~/.config/opencode/")
    .replace(/\.claude\//g, ".opencode/")
}

function normalizeModel(model: string): string {
  if (model.includes("/")) return model
  if (CLAUDE_FAMILY_ALIASES[model]) {
    return `anthropic/${CLAUDE_FAMILY_ALIASES[model]}`
  }
  if (/^claude-/.test(model)) return `anthropic/${model}`
  return `anthropic/${model}`
}

function applyPermissions(config: OpenCodeConfig, mode: PermissionMode): void {
  if (mode === "none") return

  const sourceTools = [
    "read",
    "write",
    "edit",
    "bash",
    "grep",
    "glob",
    "list",
    "webfetch",
    "skill",
    "patch",
    "task",
    "question",
    "todowrite",
    "todoread",
  ]

  const permission: Record<string, "allow" | "deny"> = {}
  const tools: Record<string, boolean> = {}

  for (const tool of sourceTools) {
    permission[tool] = "allow"
    tools[tool] = true
  }

  config.permission = permission
  config.tools = tools
}
