# JCO AI Skills

Single-source AI skills for `Claude Code`, `Cursor`, and `GitHub Copilot`.

## Goal

Author each skill once under `skills/`, then build tool-specific outputs for:

- `Claude Code` skill directories with `SKILL.md`
- `Cursor` skill directories with `SKILL.md`
- `GitHub Copilot` prompt files under `.github/prompts`

`skills/*/skill.md` is the source of truth. Anything in `dist/` is generated.

## Layout

```text
skills/
  review-code/
    skill.md
src/
  cli.ts
  repository.ts
  renderers.ts
dist/
  claude/
  cursor/
  copilot/
```

## Source format

Each canonical skill lives at `skills/<skill-name>/skill.md` and uses YAML frontmatter:

```md
---
name: review-code
title: Review Code
description: Review code for correctness, regressions, security risks, and missing tests.
targets:
  - claude
  - cursor
  - copilot
copilot:
  agent: agent
---

# Review Code
...
```

## Commands

```bash
pnpm install
pnpm check
pnpm build
```

Build output is written to `dist/`.

## Install outputs

Install the generated skills into the default local tool directories:

```bash
pnpm install:claude
pnpm install:cursor
```

Install Copilot prompt files into another repository:

```bash
pnpm install:copilot -- --dest ~/projects/some-repo
```

This copies generated prompt files into `~/projects/some-repo/.github/prompts/`.

## Next skills

Add another skill by creating `skills/<name>/skill.md`, then run `pnpm build`.
