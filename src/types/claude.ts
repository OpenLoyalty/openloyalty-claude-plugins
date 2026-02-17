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
