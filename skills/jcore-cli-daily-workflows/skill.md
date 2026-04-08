---
name: jcore-cli-daily-workflows
title: JCORE CLI Daily Workflows
description: Guide everyday usage of JCORE CLI commands for WordPress project lifecycle tasks. Use when users ask how to initialize, start, inspect, sync, update, or run commands in JCORE projects, especially when the repository contains a jcore.toml file.
targets:
  - claude
  - cursor
  - copilot
copilot:
  agent: agent
---

# JCORE CLI Daily Workflows

## Use this skill when

- The user asks "which jcore command should I run?"
- The task is project lifecycle work (create, run, sync, update, clean).
- The user needs command sequencing instead of source-level CLI development.
- The current repository contains `jcore.toml`.

## Canonical command map

- Project bootstrap: `jcore init`, `jcore clone`
- Runtime control: `jcore start`, `jcore stop`, `jcore status`, `jcore attach`
- In-container execution: `jcore run <command>`, `jcore shell`
- Sync/update: `jcore pull [db|plugins|media|all]`, `jcore update [self|<file...>]`
- Config and maintenance: `jcore config`, `jcore checksum`, `jcore clean`, `jcore doctor`
- Scaffolding: `jcore create block|user`

## Recommended flow by task

### New project

1. `jcore init <projectname> --template <template>`
2. `jcore start`
3. `jcore status`

### Existing project

1. `jcore clone <projectname>`
2. `jcore start --force` (if another JCORE project is already running)
3. `jcore attach` for logs

### Sync from upstream

1. `jcore pull db|plugins|media|all`
2. `jcore checksum list`
3. Re-apply any local overrides if needed

## Important options

- `--template/-t`, `--branch/-b` for init/clone setup
- `--force/-f` for overwrite or forced start behaviors
- `--global/-g` and `--local/-l` for config scope
- `--verbose/-v` or `--debug/-d` for investigations

## Safety and communication

- Explain destructive implications before `clean all` or broad overwrite flows.
- Prefer targeted operations (`update <file...>`, `pull db`) before "all".
- Show command examples that match the user’s exact goal and current directory.
