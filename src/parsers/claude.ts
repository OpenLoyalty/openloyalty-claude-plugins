import path from "path"
import { parseFrontmatter } from "../utils/frontmatter"
import { readJson, readText, pathExists, walkFiles } from "../utils/files"
import type {
  ClaudeCommand,
  ClaudeManifest,
  ClaudePlugin,
  ClaudeSkill,
} from "../types/claude"

const PLUGIN_MANIFEST = path.join(".claude-plugin", "plugin.json")

export async function loadClaudePlugin(inputPath: string): Promise<ClaudePlugin> {
  const root = await resolveClaudeRoot(inputPath)
  const manifestPath = path.join(root, PLUGIN_MANIFEST)
  const manifest = await readJson<ClaudeManifest>(manifestPath)

  const commands = await loadCommands(
    resolveComponentDirs(root, "commands", manifest.commands),
  )
  const skills = await loadSkills(
    resolveComponentDirs(root, "skills", manifest.skills),
  )

  return { root, manifest, commands, skills }
}

async function resolveClaudeRoot(inputPath: string): Promise<string> {
  const absolute = path.resolve(inputPath)
  const manifestAtPath = path.join(absolute, PLUGIN_MANIFEST)
  if (await pathExists(manifestAtPath)) {
    return absolute
  }

  if (absolute.endsWith(PLUGIN_MANIFEST) || absolute.endsWith("plugin.json")) {
    return path.dirname(path.dirname(absolute))
  }

  throw new Error(`Could not find ${PLUGIN_MANIFEST} under ${inputPath}`)
}

async function loadCommands(commandsDirs: string[]): Promise<ClaudeCommand[]> {
  const files = await collectMarkdownFiles(commandsDirs)

  const commands: ClaudeCommand[] = []
  for (const file of files) {
    const raw = await readText(file)
    const { data, body } = parseFrontmatter(raw)
    const name = (data.name as string) ?? path.basename(file, ".md")
    const allowedTools = parseAllowedTools(data["allowed-tools"])
    commands.push({
      name,
      description: data.description as string | undefined,
      argumentHint: data["argument-hint"] as string | undefined,
      model: data.model as string | undefined,
      allowedTools,
      body: body.trim(),
      sourcePath: file,
    })
  }
  return commands
}

async function loadSkills(skillsDirs: string[]): Promise<ClaudeSkill[]> {
  const entries = await collectFiles(skillsDirs)
  const skillFiles = entries.filter((file) => path.basename(file) === "SKILL.md")
  const skills: ClaudeSkill[] = []
  for (const file of skillFiles) {
    const raw = await readText(file)
    const { data } = parseFrontmatter(raw)
    const name = (data.name as string) ?? path.basename(path.dirname(file))
    skills.push({
      name,
      description: data.description as string | undefined,
      sourceDir: path.dirname(file),
      skillPath: file,
    })
  }
  return skills
}

function parseAllowedTools(value: unknown): string[] | undefined {
  if (!value) return undefined
  if (Array.isArray(value)) {
    return value.map((item) => String(item))
  }
  if (typeof value === "string") {
    return value
      .split(/,/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return undefined
}

function resolveComponentDirs(
  root: string,
  defaultDir: string,
  custom?: string | string[],
): string[] {
  const dirs = [path.join(root, defaultDir)]
  for (const entry of toPathList(custom)) {
    const resolved = path.resolve(root, entry)
    if (resolved === path.resolve(root) || resolved.startsWith(path.resolve(root) + path.sep)) {
      dirs.push(resolved)
    }
  }
  return dirs
}

function toPathList(value?: string | string[]): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

async function collectMarkdownFiles(dirs: string[]): Promise<string[]> {
  const entries = await collectFiles(dirs)
  return entries.filter((file) => file.endsWith(".md"))
}

async function collectFiles(dirs: string[]): Promise<string[]> {
  const files: string[] = []
  for (const dir of dirs) {
    if (!(await pathExists(dir))) continue
    const entries = await walkFiles(dir)
    files.push(...entries)
  }
  return files
}
