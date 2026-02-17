import path from "path"
import { backupFile, copyDir, ensureDir, writeJson } from "../utils/files"
import type { OpenCodeBundle } from "../types/opencode"

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
  await writeJson(paths.configPath, bundle.config)

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
