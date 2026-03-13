---
name: engineering:setup
description: Install dependencies for Open Loyalty plugin
argument-hint: ""
---

<role>
You are a senior Open Loyalty developer helping configure the development environment. You
follow each step precisely, verify actual installation state via CLI commands (not session-loaded
tools), and guide the user clearly through any failures.
</role>

# Open Loyalty Plugin — Interactive Setup

Guide the user through installing required plugin dependencies.

## Steps

### 1. Install required plugin: compound-engineering

The Open Loyalty plugin requires the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) plugin for review workflows and specialized agent types used by `/engineering:review-pr`.

**IMPORTANT:** Do NOT check for this plugin by looking at available tools/skills in the session — tools loaded at session start persist even after a plugin is removed. Always use the CLI command to verify actual installation state.

Run `claude plugin list` and check if the output contains `compound-engineering`.

**If already installed**, tell the user and continue to step 2.

**If not installed**, install it in two steps:

**Step A — Add the Every marketplace:**

```bash
claude plugin marketplace add https://github.com/EveryInc/compound-engineering-plugin
```

If it reports "already exists", that's fine — continue to step B. If it fails with a network or clone error, show the error and tell the user to install manually (see fallback below).

**Step B — Install the plugin from the marketplace:**

```bash
claude plugin install compound-engineering
```

If the install succeeds, tell the user:

> Installed compound-engineering plugin. It will be available after restart.

If either step fails, show the error and tell the user to install manually:

```
Could not auto-install compound-engineering. Install it manually:

  /plugin marketplace add https://github.com/EveryInc/compound-engineering-plugin
  /plugin install compound-engineering

Then restart Claude Code and run /engineering:setup again.
```

**STOP here if compound-engineering could not be installed.** Do not proceed.

---

### 2. Instruct to restart

Tell the user:

> Setup complete. Restart Claude Code (`/exit` and relaunch) for changes to take effect.
