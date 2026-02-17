---
title: "feat: Add OpenCode converter CLI via bunx"
type: feat
date: 2026-02-17
---

# feat: Add OpenCode converter CLI via bunx

## Overview

Add a Bun/TypeScript CLI tool to this repository that converts the `openloyalty` Claude Code plugin into OpenCode format, following the same pattern used by [compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin). The tool will be published to npm as `@open-loyalty/claude-plugin` and runnable via `bunx`.

**Usage after implementation:**

```bash
# Install openloyalty plugin into OpenCode (fetches latest from GitHub)
bunx @open-loyalty/claude-plugin install openloyalty --to opencode

# Convert from a local path
bunx @open-loyalty/claude-plugin install ./plugins/openloyalty --to opencode

# Specify custom output directory
bunx @open-loyalty/claude-plugin install openloyalty --to opencode -o ~/my-project
```

## Problem Statement / Motivation

The openloyalty plugin is currently Claude Code-only. Team members using OpenCode have no way to install these skills/commands. The compound-engineering plugin already solved this with a generic converter CLI. We want the same developer experience for the openloyalty plugin, but scoped to only OpenCode (no Codex, Droid, Pi, Gemini, or Copilot support needed).

## Proposed Solution

Create a simplified version of compound-engineering's CLI that:
1. Parses Claude Code plugin structure (plugin.json, commands, skills)
2. Converts to OpenCode format (opencode.json config + agents/skills directories)
3. Writes output to `~/.config/opencode/` (global) or a custom path
4. Is published to npm for `bunx` usage

**Scope:** Only OpenCode target. No multi-target abstraction. No hooks conversion (plugin has no hooks). No MCP server conversion (configured at user level via setup).

## Technical Approach

### Architecture

The CLI mirrors compound-engineering's structure but simplified for a single target:

```
src/
├── index.ts                        # CLI entry point (citty)
├── commands/
│   └── install.ts                  # Install command (resolve + convert + write)
├── parsers/
│   └── claude.ts                   # Load Claude plugin from disk
├── converters/
│   └── claude-to-opencode.ts       # Convert ClaudePlugin → OpenCodeBundle
├── targets/
│   └── opencode.ts                 # Write OpenCodeBundle to disk
├── types/
│   ├── claude.ts                   # Claude plugin types
│   └── opencode.ts                 # OpenCode bundle types
└── utils/
    ├── files.ts                    # File I/O helpers
    ├── frontmatter.ts              # YAML frontmatter parse/format
    └── resolve-home.ts             # ~ expansion
```

### What Gets Converted

| Claude Code Source | OpenCode Output | Notes |
|---|---|---|
| `commands/openloyalty/*.md` | `opencode.json` → `command` section | Name → template mapping |
| `skills/compound-docs/` | `.opencode/skills/compound-docs/` | Copied as directory |
| Command frontmatter `model` | `command[name].model` | `provider/model-id` format |
| `.claude/` paths in bodies | `.opencode/` paths | Rewritten |
| `~/.claude/` paths in bodies | `~/.config/opencode/` paths | Rewritten |

**Not converted (by design):**
- No agents directory exists in this plugin
- No hooks exist in this plugin
- MCP servers are user-scoped (configured via `/openloyalty:setup`), not plugin-bundled
- Permissions default to `broad` (all tools allowed)

### Setup Command: OpenCode-Specific Adaptations

The `/openloyalty:setup` command needs OpenCode-specific instructions when converted. The converter applies these transformations to the `setup.md` command body:

#### 1. Compound-engineering installation

**Claude Code (original):**
```bash
claude plugin marketplace add https://github.com/EveryInc/compound-engineering-plugin
claude plugin install compound-engineering
```

**OpenCode (converted):**
```bash
bunx @every-env/compound-plugin install compound-engineering --to opencode
```

The converter replaces the two-step Claude plugin install flow with a single `bunx` command that installs compound-engineering directly into OpenCode format at `~/.config/opencode/`.

#### 2. Atlassian integration

**Claude Code (original):** Installs `atlassian@claude-plugins-official` via Claude's plugin system (OAuth-based).

**OpenCode (converted):** Instructs the user to manually configure their Atlassian MCP server in `opencode.json`:

```json
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
```

The converted setup command guides the user through providing these values interactively, then writes them to `~/.config/opencode/opencode.json`.

#### 3. Path references

All `~/.claude/` paths → `~/.config/opencode/`, all `.claude/` paths → `.opencode/`.

#### Implementation approach

The converter maintains a **setup rewrite map** — a set of string replacements applied only to the `setup` command body. This keeps the converter generic while handling the one command that has provider-specific installation logic.

### Implementation Phases

#### Phase 1: Project Setup

Create the npm package scaffolding at the repo root.

**New files:**

- **`package.json`** — npm package definition

```json
{
  "name": "@open-loyalty/claude-plugin",
  "version": "0.1.0",
  "type": "module",
  "private": false,
  "bin": {
    "ol-claude-plugin": "./src/index.ts"
  },
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "dev": "bun run src/index.ts",
    "install:opencode": "bun run src/index.ts install openloyalty --to opencode",
    "test": "bun test"
  },
  "dependencies": {
    "citty": "^0.1.6",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "bun-types": "^1.0.0"
  }
}
```

- **`tsconfig.json`** — TypeScript config

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["bun-types"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

#### Phase 2: Types

**`src/types/claude.ts`** — Matches compound-engineering's types, stripped to what this plugin uses:

```typescript
export type ClaudeManifest = {
  name: string
  version: string
  description?: string
  author?: { name?: string; url?: string }
  keywords?: string[]
  commands?: string | string[]
  skills?: string | string[]
}

export type ClaudeCommand = {
  name: string
  description?: string
  argumentHint?: string
  model?: string
  allowedTools?: string[]
  body: string
  sourcePath: string
}

export type ClaudeSkill = {
  name: string
  description?: string
  sourceDir: string
  skillPath: string
}

export type ClaudePlugin = {
  root: string
  manifest: ClaudeManifest
  commands: ClaudeCommand[]
  skills: ClaudeSkill[]
}
```

**`src/types/opencode.ts`** — Matches compound-engineering's types:

```typescript
export type OpenCodeConfig = {
  $schema?: string
  command?: Record<string, OpenCodeCommandConfig>
  permission?: Record<string, "allow" | "ask" | "deny">
  tools?: Record<string, boolean>
}

export type OpenCodeCommandConfig = {
  description?: string
  model?: string
  template: string
}

export type OpenCodeBundle = {
  config: OpenCodeConfig
  skillDirs: { sourceDir: string; name: string }[]
}
```

#### Phase 3: Utilities

**`src/utils/files.ts`** — Direct port from compound-engineering:
- `pathExists()`, `ensureDir()`, `readText()`, `readJson()`, `writeText()`, `writeJson()`
- `walkFiles()`, `copyDir()`, `backupFile()`

**`src/utils/frontmatter.ts`** — Direct port:
- `parseFrontmatter()` — Parse YAML frontmatter from markdown
- Uses `js-yaml` for YAML parsing

**`src/utils/resolve-home.ts`** — Direct port:
- `expandHome()`, `resolveTargetHome()`

#### Phase 4: Parser

**`src/parsers/claude.ts`** — Simplified from compound-engineering:
- `loadClaudePlugin(inputPath)` — Loads plugin.json, commands, skills
- Removed: agents loading, hooks loading, MCP server loading (not needed)
- Keeps: command frontmatter parsing (name, description, model, allowed-tools, argument-hint)
- Keeps: skill discovery (SKILL.md files)

#### Phase 5: Converter

**`src/converters/claude-to-opencode.ts`** — Simplified from compound-engineering:

Key conversion logic:
1. **Commands → `opencode.json` command map**: Each command's body becomes the `template` field
2. **Path rewriting**: `.claude/` → `.opencode/`, `~/.claude/` → `~/.config/opencode/`
3. **Model normalization**: Bare aliases (`haiku`, `sonnet`, `opus`) → `anthropic/claude-{model}` format
4. **Permissions**: Default to `broad` mode (all standard tools allowed)
5. **Skills**: Passed through as directory references for copying
6. **Setup command rewriting**: The `setup` command gets provider-specific rewrites:
   - compound-engineering install: `claude plugin marketplace add ...` + `claude plugin install ...` → `bunx @every-env/compound-plugin install compound-engineering --to opencode`
   - Atlassian plugin install: `claude plugin install atlassian@claude-plugins-official` → manual MCP configuration instructions for `opencode.json` with `ATLASSIAN_SITE_URL`, `ATLASSIAN_USER_EMAIL`, `ATLASSIAN_API_TOKEN`
   - `claude plugin list` → check for installed commands/agents in `~/.config/opencode/`
   - OL MCP server: `~/.claude/.mcp.json` → `~/.config/opencode/opencode.json` mcp section

Removed from CE version:
- Agent conversion (no agents in this plugin)
- Hook conversion (no hooks)
- MCP server conversion (user-scoped)
- Temperature inference (no agents)
- Per-command permission extraction (not needed, using broad)

#### Phase 6: Writer

**`src/targets/opencode.ts`** — Direct port from compound-engineering:
- Writes `opencode.json` to output root
- Copies skill directories to `.opencode/skills/`
- Backs up existing `opencode.json` before overwriting
- Handles both global (`~/.config/opencode`) and project (`.opencode`) paths

#### Phase 7: CLI Entry Point

**`src/index.ts`** — Simplified from compound-engineering:

```typescript
#!/usr/bin/env bun
import { defineCommand, runMain } from "citty"
import install from "./commands/install"

const main = defineCommand({
  meta: {
    name: "ol-claude-plugin",
    version: "0.1.0",
    description: "Convert Open Loyalty Claude Code plugin into OpenCode format",
  },
  subCommands: {
    install: () => install,
  },
})

runMain(main)
```

**`src/commands/install.ts`** — Adapted from compound-engineering:

Arguments:
- `plugin` (positional, required): Plugin name or path
- `--to` (string, default: "opencode"): Target format (only "opencode" supported)
- `--output` / `-o` (string): Custom output directory
- `--permissions` (string, default: "broad"): Permission mode

Plugin resolution:
- Local paths (`.`, `/`, `~` prefix) → resolve directly
- Names → clone from GitHub (`https://github.com/OpenLoyalty/openloyalty-claude-plugins`), find under `plugins/`
- Env override: `OL_PLUGIN_GITHUB_SOURCE` for custom GitHub source

Default output: `~/.config/opencode/` (OpenCode global config)

#### Phase 8: Tests

**`tests/converter.test.ts`** — Test the conversion logic:
- Commands are converted to opencode.json command entries
- Path rewriting works (`.claude/` → `.opencode/`)
- Model normalization works
- Permissions are set to broad mode
- Skills are included in the bundle

**`tests/opencode-writer.test.ts`** — Test the file writer:
- Config file is written correctly
- Skills are copied
- Backup of existing config works
- Handles both global and project paths

**Test fixture:** Create `tests/fixtures/sample-plugin/` with a minimal Claude plugin structure for testing.

#### Phase 9: Documentation

Update `README.md` to add an OpenCode install section modeled on compound-engineering's README format.

**Add after the "Quick Start" section:**

```markdown
## OpenCode Install

This repo includes a Bun/TypeScript CLI that converts Claude Code plugins to OpenCode format.

```bash
# Install the openloyalty plugin into OpenCode
bunx @open-loyalty/claude-plugin install openloyalty --to opencode
```

Output is written to `~/.config/opencode/` by default, with `opencode.json` at the root
and `skills/` alongside it.

Local dev:

```bash
bun run src/index.ts install ./plugins/openloyalty --to opencode
```

### Post-Install: Dependencies

After installing the openloyalty plugin, install the compound-engineering dependency:

```bash
bunx @every-env/compound-plugin install compound-engineering --to opencode
```

For Atlassian (Jira/Confluence) integration, add your Atlassian MCP server to
`~/.config/opencode/opencode.json` manually:

```json
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
```
```

### File Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Create | npm package with bin, deps, scripts |
| `tsconfig.json` | Create | TypeScript config for Bun |
| `src/index.ts` | Create | CLI entry point |
| `src/commands/install.ts` | Create | Install command |
| `src/converters/claude-to-opencode.ts` | Create | Converter logic |
| `src/targets/opencode.ts` | Create | File writer |
| `src/parsers/claude.ts` | Create | Plugin loader |
| `src/types/claude.ts` | Create | Claude types |
| `src/types/opencode.ts` | Create | OpenCode types |
| `src/utils/files.ts` | Create | File I/O helpers |
| `src/utils/frontmatter.ts` | Create | Frontmatter parse/format |
| `src/utils/resolve-home.ts` | Create | Path resolution |
| `tests/converter.test.ts` | Create | Converter tests |
| `tests/opencode-writer.test.ts` | Create | Writer tests |
| `tests/fixtures/sample-plugin/` | Create | Test fixture |
| `README.md` | Edit | Add OpenCode install section |
| `.gitignore` | Edit | Add `node_modules/`, `dist/`, `bun.lock` |

### Existing Files NOT Modified

- `plugins/openloyalty/` — Plugin source remains unchanged
- `.claude-plugin/marketplace.json` — No version bump needed (this is a new feature, not a plugin change)
- `plugins/openloyalty/.claude-plugin/plugin.json` — Same
- `AGENTS.md` — No changes needed
- `hooks/pre-commit` — No changes needed

## Acceptance Criteria

- [x] `bun run src/index.ts install ./plugins/openloyalty --to opencode` converts the plugin correctly
- [x] Output `opencode.json` contains all 6 commands as command entries
- [x] Skills directory (`compound-docs`) is copied to `.opencode/skills/`
- [x] Path rewriting converts `.claude/` references to `.opencode/`
- [x] Existing `opencode.json` is backed up before overwriting
- [x] `bun test` passes all converter and writer tests
- [x] Default output goes to `~/.config/opencode/`
- [ ] GitHub resolution works: `bun run src/index.ts install openloyalty --to opencode`
- [x] Converted `setup` command installs compound-engineering via `bunx @every-env/compound-plugin install compound-engineering --to opencode`
- [x] Converted `setup` command guides Atlassian MCP manual config in `opencode.json` (not Claude plugin install)
- [x] Converted `setup` command writes OL MCP server to `opencode.json` mcp section (not `~/.claude/.mcp.json`)
- [x] README documents OpenCode install method with compound-engineering and Atlassian post-install steps

## Success Metrics

- Team members using OpenCode can install the plugin with a single `bunx` command
- Conversion produces a valid OpenCode configuration
- All 6 commands are available in OpenCode after install

## Dependencies & Risks

**Dependencies:**
- Bun runtime (for development and `bunx` execution)
- npm registry access (for publishing `@open-loyalty/claude-plugin`)
- `@open-loyalty` npm scope must be accessible for publishing

**Risks:**
- OpenCode format may evolve — the spec was last verified 2026-01-21
- `bunx` requires the package to be published on npm first
- Skills (compound-docs) rely on Claude Code-specific XML tags (`<critical_sequence>`, `<validation_gate>`) — OpenCode may not support these directives

## References & Research

### Internal References

- Plugin manifest: `plugins/openloyalty/.claude-plugin/plugin.json`
- Commands: `plugins/openloyalty/commands/openloyalty/*.md` (6 files)
- Skills: `plugins/openloyalty/skills/compound-docs/SKILL.md`
- Conventions: `AGENTS.md`

### External References

- compound-engineering converter: `src/converters/claude-to-opencode.ts` in [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)
- OpenCode config spec: https://opencode.ai/docs/config
- OpenCode agents spec: https://opencode.ai/docs/agents/
- OpenCode plugins spec: https://opencode.ai/docs/plugins/
- citty CLI framework: https://github.com/unjs/citty
