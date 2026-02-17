import { describe, expect, test } from "bun:test"
import path from "path"
import { loadClaudePlugin } from "../src/parsers/claude"
import { convertClaudeToOpenCode } from "../src/converters/claude-to-opencode"

const FIXTURE_DIR = path.join(import.meta.dir, "fixtures", "sample-plugin")
const PLUGIN_DIR = path.join(import.meta.dir, "..", "plugins", "openloyalty")

describe("converter: sample plugin", () => {
  test("converts commands to opencode command entries", async () => {
    const plugin = await loadClaudePlugin(FIXTURE_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    expect(bundle.config.command).toBeDefined()
    expect(bundle.config.command!["sample:hello"]).toBeDefined()
    expect(bundle.config.command!["sample:review"]).toBeDefined()

    const hello = bundle.config.command!["sample:hello"]
    expect(hello.description).toBe("Say hello")
    expect(hello.template).toContain("Say hello to the user")
  })

  test("rewrites .claude/ paths to .opencode/", async () => {
    const plugin = await loadClaudePlugin(FIXTURE_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    const hello = bundle.config.command!["sample:hello"]
    expect(hello.template).toContain("~/.config/opencode/settings.json")
    expect(hello.template).toContain(".opencode/config")
    expect(hello.template).not.toContain("~/.claude/")
    expect(hello.template).not.toContain(".claude/")
  })

  test("normalizes bare model aliases", async () => {
    const plugin = await loadClaudePlugin(FIXTURE_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    const review = bundle.config.command!["sample:review"]
    expect(review.model).toBe("anthropic/claude-haiku-4-5")
  })

  test("sets broad permissions", async () => {
    const plugin = await loadClaudePlugin(FIXTURE_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    expect(bundle.config.permission).toBeDefined()
    expect(bundle.config.permission!["read"]).toBe("allow")
    expect(bundle.config.permission!["bash"]).toBe("allow")
    expect(bundle.config.tools!["read"]).toBe(true)
    expect(bundle.config.tools!["bash"]).toBe(true)
  })

  test("sets no permissions when mode is none", async () => {
    const plugin = await loadClaudePlugin(FIXTURE_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "none" })

    expect(bundle.config.permission).toBeUndefined()
    expect(bundle.config.tools).toBeUndefined()
  })

  test("includes skills in bundle", async () => {
    const plugin = await loadClaudePlugin(FIXTURE_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    expect(bundle.skillDirs).toHaveLength(1)
    expect(bundle.skillDirs[0].name).toBe("test-skill")
  })
})

describe("converter: openloyalty plugin", () => {
  test("converts all 6 commands", async () => {
    const plugin = await loadClaudePlugin(PLUGIN_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    const commandNames = Object.keys(bundle.config.command!)
    expect(commandNames).toHaveLength(6)
    expect(commandNames).toContain("openloyalty:help")
    expect(commandNames).toContain("openloyalty:setup")
    expect(commandNames).toContain("openloyalty:compound")
    expect(commandNames).toContain("openloyalty:review-pr")
    expect(commandNames).toContain("openloyalty:backend-pr-create")
    expect(commandNames).toContain("openloyalty:jira-ticket-breakdown")
  })

  test("includes compound-docs skill", async () => {
    const plugin = await loadClaudePlugin(PLUGIN_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    expect(bundle.skillDirs).toHaveLength(1)
    expect(bundle.skillDirs[0].name).toBe("compound-docs")
  })

  test("setup command uses bunx for compound-engineering install", async () => {
    const plugin = await loadClaudePlugin(PLUGIN_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    const setup = bundle.config.command!["openloyalty:setup"]
    expect(setup.template).toContain(
      "bunx @every-env/compound-plugin install compound-engineering --to opencode",
    )
  })

  test("setup command has Atlassian MCP manual config", async () => {
    const plugin = await loadClaudePlugin(PLUGIN_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    const setup = bundle.config.command!["openloyalty:setup"]
    expect(setup.template).toContain("@modelcontextprotocol/server-atlassian")
    expect(setup.template).toContain("ATLASSIAN_SITE_URL")
    expect(setup.template).toContain("ATLASSIAN_API_TOKEN")
  })

  test("setup command rewrites OL MCP path to opencode.json", async () => {
    const plugin = await loadClaudePlugin(PLUGIN_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    const setup = bundle.config.command!["openloyalty:setup"]
    expect(setup.template).toContain("~/.config/opencode/opencode.json")
    expect(setup.template).not.toContain(".mcp.json")
  })

  test("no .claude/ paths remain in any command", async () => {
    const plugin = await loadClaudePlugin(PLUGIN_DIR)
    const bundle = convertClaudeToOpenCode(plugin, { permissions: "broad" })

    for (const [name, cmd] of Object.entries(bundle.config.command!)) {
      expect(cmd.template).not.toContain("~/.claude/")
      // Allow .claude-plugin in paths (that's the manifest directory name, not a user path)
      const lines = cmd.template.split("\n")
      for (const line of lines) {
        if (line.includes(".claude/") && !line.includes(".claude-plugin")) {
          throw new Error(
            `Found .claude/ path in ${name}: ${line.trim().slice(0, 100)}`,
          )
        }
      }
    }
  })
})
