# Open Loyalty Claude Plugins

Engineering workflows for the Open Loyalty development team.

## Quick Start

**Add the marketplace (once):**
```bash
/plugin marketplace add OpenLoyalty/openloyalty-claude-plugins
```

**Install the plugin:**
```bash
/plugin install openloyalty@openloyalty-claude-plugins
```

This installs engineering workflows (slash commands).

**Run setup (required after first install):**
```bash
/openloyalty:setup
```

> **Note:** Claude Code's plugin manifest (`plugin.json`) does not support declaring plugin dependencies. The `/openloyalty:setup` command handles installing all required plugins automatically. Always run it after installing.

The setup command installs the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin — automatically adds the marketplace and installs the plugin. This dependency provides review workflows and specialized agent types (architecture strategist, performance oracle, security sentinel, etc.) used by `/openloyalty:review-pr`.

---

## OpenCode Install

This repo includes a CLI that converts the Claude Code plugin to OpenCode format. Requires `bun` and `gh` CLI (authenticated).

```bash
bash <(gh api repos/OpenLoyalty/openloyalty-claude-plugins/contents/install.sh -H "Accept: application/vnd.github.raw")
```

Output is written to `~/.config/opencode/` by default, with `opencode.json` at the root and `skills/` alongside it.

### Updating

Re-run the same command to get the latest version.

### Post-Install: Dependencies

After installing the openloyalty plugin, install the compound-engineering dependency:

```bash
bunx @every-env/compound-plugin install compound-engineering --to opencode
```

### Local Development

```bash
bun run src/index.ts install ./plugins/openloyalty --to opencode
```

