import path from "path"
import { backupFile, copyDir, ensureDir, pathExists, readJson, writeJson } from "../utils/files"
import type { OpenCodeBundle, OpenCodeConfig } from "../types/opencode"

export async function writeOpenCodeBundle(
  outputRoot: string,
  bundle: OpenCodeBundle,
): Promise<void> {
  const paths = resolveOpenCodePaths(outputRoot)
  await ensureDir(paths.root)

  const backupPath = await backupFile(paths.configPath)
  if (backupPath) {
    console.log(`Backed up existing config to ${backupPath}`)
  }

  // Merge into existing config to preserve other plugins, MCP servers, etc.
  let merged: Record<string, unknown> = {}
  if (await pathExists(paths.configPath)) {
    try {
      merged = await readJson<Record<string, unknown>>(paths.configPath)
    } catch {
      // Corrupted config — start fresh
    }
  }

  // Merge commands (existing + new, new wins on conflict)
  const existingCommands = (merged.command ?? {}) as Record<string, unknown>
  const newCommands = (bundle.config.command ?? {}) as Record<string, unknown>
  merged.command = { ...existingCommands, ...newCommands }

  // Merge permissions and tools (additive)
  if (bundle.config.permission) {
    merged.permission = { ...(merged.permission as Record<string, unknown> ?? {}), ...bundle.config.permission }
  }
  if (bundle.config.tools) {
    merged.tools = { ...(merged.tools as Record<string, unknown> ?? {}), ...bundle.config.tools }
  }

  // Preserve $schema
  if (bundle.config.$schema) {
    merged.$schema = bundle.config.$schema
  }

  await writeJson(paths.configPath, merged)

  if (bundle.skillDirs.length > 0) {
    for (const skill of bundle.skillDirs) {
      await copyDir(skill.sourceDir, path.join(paths.skillsDir, skill.name))
    }
  }
}

function resolveOpenCodePaths(outputRoot: string) {
  const base = path.basename(outputRoot)
  // Global install: ~/.config/opencode (basename is "opencode")
  // Project install: .opencode (basename is ".opencode")
  if (base === "opencode" || base === ".opencode") {
    return {
      root: outputRoot,
      configPath: path.join(outputRoot, "opencode.json"),
      skillsDir: path.join(outputRoot, "skills"),
    }
  }

  // Custom output directory
  return {
    root: outputRoot,
    configPath: path.join(outputRoot, "opencode.json"),
    skillsDir: path.join(outputRoot, ".opencode", "skills"),
  }
}
