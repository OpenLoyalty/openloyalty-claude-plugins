import { defineCommand } from "citty"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { loadClaudePlugin } from "../parsers/claude"
import { convertClaudeToOpenCode } from "../converters/claude-to-opencode"
import { writeOpenCodeBundle } from "../targets/opencode"
import { pathExists } from "../utils/files"
import { expandHome } from "../utils/resolve-home"
import type { PermissionMode } from "../converters/claude-to-opencode"

const permissionModes: PermissionMode[] = ["none", "broad"]

export default defineCommand({
  meta: {
    name: "install",
    description: "Install and convert a Claude plugin into OpenCode format",
  },
  args: {
    plugin: {
      type: "positional",
      required: true,
      description: "Plugin name or local path",
    },
    to: {
      type: "string",
      default: "opencode",
      description: 'Target format (only "opencode" supported)',
    },
    output: {
      type: "string",
      alias: "o",
      description: "Output directory",
    },
    permissions: {
      type: "string",
      default: "broad",
      description: "Permission mode: none | broad",
    },
  },
  async run({ args }) {
    const targetName = String(args.to)
    if (targetName !== "opencode") {
      throw new Error(
        `Unknown target: ${targetName}. Only "opencode" is supported.`,
      )
    }

    const permissions = String(args.permissions)
    if (!permissionModes.includes(permissions as PermissionMode)) {
      throw new Error(`Unknown permissions mode: ${permissions}`)
    }

    const resolvedPlugin = await resolvePluginPath(String(args.plugin))

    try {
      const plugin = await loadClaudePlugin(resolvedPlugin.path)
      const outputRoot = resolveOutputRoot(args.output)

      const bundle = convertClaudeToOpenCode(plugin, {
        permissions: permissions as PermissionMode,
      })

      await writeOpenCodeBundle(outputRoot, bundle)

      console.log(`Installed ${plugin.manifest.name} to ${outputRoot}`)
      console.log(
        `  Commands: ${Object.keys(bundle.config.command ?? {}).length}`,
      )
      console.log(`  Skills: ${bundle.skillDirs.length}`)
    } finally {
      if (resolvedPlugin.cleanup) {
        await resolvedPlugin.cleanup()
      }
    }
  },
})

type ResolvedPluginPath = {
  path: string
  cleanup?: () => Promise<void>
}

async function resolvePluginPath(input: string): Promise<ResolvedPluginPath> {
  // Local paths: starts with . / ~ /
  if (input.startsWith(".") || input.startsWith("/") || input.startsWith("~")) {
    const expanded = expandHome(input)
    const directPath = path.resolve(expanded)
    if (await pathExists(directPath)) return { path: directPath }
    throw new Error(`Local plugin path not found: ${directPath}`)
  }

  // Named plugin: clone from GitHub and find under plugins/
  return await resolveGitHubPluginPath(input)
}

function resolveOutputRoot(value: unknown): string {
  if (value && String(value).trim()) {
    const expanded = expandHome(String(value).trim())
    return path.resolve(expanded)
  }
  return path.join(os.homedir(), ".config", "opencode")
}

async function resolveGitHubPluginPath(
  pluginName: string,
): Promise<ResolvedPluginPath> {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "ol-claude-plugin-"),
  )
  const source = resolveGitHubSource()

  try {
    await cloneGitHubRepo(source, tempRoot)
  } catch (error) {
    await fs.rm(tempRoot, { recursive: true, force: true })
    throw error
  }

  const pluginPath = path.join(tempRoot, "plugins", pluginName)
  if (!(await pathExists(pluginPath))) {
    await fs.rm(tempRoot, { recursive: true, force: true })
    throw new Error(`Could not find plugin ${pluginName} in ${source}.`)
  }

  return {
    path: pluginPath,
    cleanup: async () => {
      await fs.rm(tempRoot, { recursive: true, force: true })
    },
  }
}

function resolveGitHubSource(): string {
  const override = process.env.OL_PLUGIN_GITHUB_SOURCE
  if (override && override.trim()) return override.trim()
  return "https://github.com/OpenLoyalty/openloyalty-claude-plugins"
}

async function cloneGitHubRepo(
  source: string,
  destination: string,
): Promise<void> {
  const proc = Bun.spawn(
    ["git", "clone", "--depth", "1", source, destination],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  )
  const exitCode = await proc.exited
  const stderr = await new Response(proc.stderr).text()
  if (exitCode !== 0) {
    throw new Error(`Failed to clone ${source}. ${stderr.trim()}`)
  }
}
