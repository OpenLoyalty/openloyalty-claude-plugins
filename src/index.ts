#!/usr/bin/env bun
import { defineCommand, runMain } from "citty"
import install from "./commands/install"

const main = defineCommand({
  meta: {
    name: "ol-claude-plugin",
    version: "0.1.0",
    description:
      "Convert Open Loyalty Claude Code plugin into OpenCode format",
  },
  subCommands: {
    install: () => install,
  },
})

runMain(main)
