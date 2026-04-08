---

## name: jcore-project-navigation

title: JCORE Project Navigation
description: Navigate and explain a standard JCORE WordPress project generated from the jcore3 template. Use when users ask where code lives, how dependencies are wired, and which workflow to use for development and maintenance, especially when the repository contains a jcore.toml file.
targets:

- claude
- cursor
- copilot
copilot:
agent: agent

# JCORE Project Navigation

## Scope

Use this skill for projects based on the `wordpress-container` `templates/jcore3` template. Ignore other templates unless the user explicitly asks.

## Use this skill when

- The user asks where parts of a JCORE WordPress project live.
- The user asks how dependency wiring and startup bootstrap work.
- The user needs orientation for development or debugging workflows.
- The current repository contains `jcore.toml`.

## Mental model of jcore3 template

- Project defaults are driven by `defaults.toml` (template name, theme, WordPress image/version, plugin behavior, debug flags).
- PHP dependencies and plugin packages are managed via `composer.json`.
- JS tooling and formatting are managed via `package.json` and pnpm workspace files.
- MU bootstrap lives in `wp-content/mu-plugins/module-loader.php`, which loads Composer autoload from `vendor/autoload.php`.
- WordPress block implementations are provided by the Lohko plugin (`jcore/lohko` package), with source in the Lohko repository and compiled assets consumed in the project.

## Navigation checkpoints

When orienting in a repository, inspect in this order:

1. `jcore.toml` for project-level JCORE settings and overrides.
2. `defaults.toml` for template runtime assumptions and plugin/theme defaults.
3. `composer.json` for installed JCORE modules/plugins and PHP platform constraints.
4. `wp-content/mu-plugins/module-loader.php` for autoload bootstrap behavior.
5. `package.json`, `Makefile`, and workspace config for frontend/tooling workflows.
6. `wp-content/plugins/lohko/` for JCORE block runtime artifacts in the project.
7. `/home/maxemilian/projects/jcore-lohko` for canonical Lohko block source code during development.
8. `wp-content/` for project-specific plugin or theme customizations.

## Development workflow

1. Install PHP deps: `composer install`
2. Install JS deps: `pnpm install`
3. Run formatting/lint workflow expected by the project.
4. Start the containerized stack via JCORE CLI in the project root.

## Debugging workflow

- Verify debug defaults in `defaults.toml` (`wpDebug`, `wpDebugLog`, `wpDebugDisplay`).
- Confirm Composer autoload is generated and readable.
- Separate dependency/bootstrap issues from runtime WordPress/plugin behavior.
- When uncertain, identify whether the issue belongs to MU loader, Composer package, or project custom code.

## Communication guidance

- Always state whether advice is template-default behavior or project-specific override.
- Call out where settings are expected to diverge (local config, per-project overrides, environment values).