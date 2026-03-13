# Open Loyalty Claude Plugins

Engineering, sales, QA, and marketing workflows for the Open Loyalty team. Four department plugins, all commands use the `/ol:` namespace.

## Quick Start

**Add the marketplace (once):**
```bash
/plugin marketplace add OpenLoyalty/openloyalty-claude-plugins
```

**Install plugins:**
```bash
/plugin install openloyalty@openloyalty-claude-plugins
```

This installs all four 💜 department plugins (Engineering, Sales, Marketing, QA).

**Run setup (required after first install):**
```bash
/ol:setup
```

> **Note:** Claude Code's plugin manifest (`plugin.json`) does not support declaring plugin dependencies. The `/ol:setup` command handles installing all required plugins automatically. Always run it after installing.

The setup command installs the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin — automatically adds the marketplace and installs the plugin. This dependency provides review workflows and specialized agent types (architecture strategist, performance oracle, security sentinel, etc.) used by `/ol:review-pr`.
