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


