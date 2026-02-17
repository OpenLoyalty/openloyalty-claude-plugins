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
