import { describe, expect, test, beforeEach, afterEach } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { writeOpenCodeBundle } from "../src/targets/opencode"
import { pathExists, readJson } from "../src/utils/files"
import type { OpenCodeBundle, OpenCodeConfig } from "../src/types/opencode"

let tempDir: string

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "opencode-writer-test-"))
})

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true })
})

function makeBundle(overrides?: Partial<OpenCodeBundle>): OpenCodeBundle {
  return {
    config: {
      $schema: "https://opencode.ai/config.json",
      command: {
        "test:hello": {
          description: "Test command",
          template: "Say hello",
        },
      },
    },
    skillDirs: [],
    ...overrides,
  }
}

describe("opencode writer", () => {
  test("writes opencode.json to output root", async () => {
    const outputRoot = path.join(tempDir, "opencode")
    await writeOpenCodeBundle(outputRoot, makeBundle())

    const configPath = path.join(outputRoot, "opencode.json")
    expect(await pathExists(configPath)).toBe(true)

    const config = await readJson<OpenCodeConfig>(configPath)
    expect(config.$schema).toBe("https://opencode.ai/config.json")
    expect(config.command!["test:hello"].template).toBe("Say hello")
  })

  test("copies skill directories", async () => {
    const fixtureSkillDir = path.join(
      import.meta.dir,
      "fixtures",
      "sample-plugin",
      "skills",
      "test-skill",
    )
    const outputRoot = path.join(tempDir, "opencode")
    await writeOpenCodeBundle(
      outputRoot,
      makeBundle({
        skillDirs: [{ sourceDir: fixtureSkillDir, name: "test-skill" }],
      }),
    )

    const skillPath = path.join(outputRoot, "skills", "test-skill", "SKILL.md")
    expect(await pathExists(skillPath)).toBe(true)
  })

  test("backs up existing opencode.json", async () => {
    const outputRoot = path.join(tempDir, "opencode")
    await fs.mkdir(outputRoot, { recursive: true })

    // Write an initial config
    const configPath = path.join(outputRoot, "opencode.json")
    await fs.writeFile(configPath, JSON.stringify({ old: true }), "utf8")

    // Write the bundle (should backup the old one)
    await writeOpenCodeBundle(outputRoot, makeBundle())

    // Check backup exists
    const files = await fs.readdir(outputRoot)
    const backups = files.filter((f) => f.startsWith("opencode.json.bak."))
    expect(backups).toHaveLength(1)

    // Check new config is correct
    const config = await readJson<OpenCodeConfig>(configPath)
    expect(config.$schema).toBe("https://opencode.ai/config.json")
  })

  test("handles custom output directory with .opencode nesting", async () => {
    const outputRoot = path.join(tempDir, "my-project")
    const fixtureSkillDir = path.join(
      import.meta.dir,
      "fixtures",
      "sample-plugin",
      "skills",
      "test-skill",
    )

    await writeOpenCodeBundle(
      outputRoot,
      makeBundle({
        skillDirs: [{ sourceDir: fixtureSkillDir, name: "test-skill" }],
      }),
    )

    // Config at root
    expect(
      await pathExists(path.join(outputRoot, "opencode.json")),
    ).toBe(true)
    // Skills nested under .opencode
    expect(
      await pathExists(
        path.join(outputRoot, ".opencode", "skills", "test-skill", "SKILL.md"),
      ),
    ).toBe(true)
  })
})
