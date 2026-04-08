---

## name: jcore-cli-troubleshooting

title: JCORE CLI Troubleshooting
description: Diagnose and fix common JCORE CLI failures including PATH issues, Docker/runtime errors, permission problems, and project configuration drift. Use when commands fail, environments are inconsistent, or users request debugging help, especially when the repository contains a jcore.toml file.
targets:

- claude
- cursor
- copilot
copilot:
agent: agent

# JCORE CLI Troubleshooting

## Use this skill when

- `jcore` commands fail or behave unexpectedly.
- The user reports environment, Docker, or permission issues.
- Output indicates config drift or dependency mismatches.
- The current repository contains `jcore.toml`.

## Triage order

1. Capture failing command and exact stderr/stdout.
2. Confirm current directory is the intended JCORE project.
3. Run `jcore doctor` and note missing dependencies.
4. Run with `--verbose` or `--debug` for a second pass.
5. Narrow to one subsystem at a time (PATH, Docker, config, project state).

## Common failure patterns

- **Command not found**: ensure the correct `jcore` binary is on `PATH`.
- **Permission denied**: verify executable bits and user/group Docker access.
- **Docker unavailable**: confirm Docker engine is running and reachable.
- **Project config issues**: inspect `jcore config list`, `defaults.toml`, and local overrides.
- **Unexpected file updates**: check `jcore checksum list` before overwrite operations.

## Recovery playbooks

### PATH or binary mismatch

1. Re-source environment (`source add-to-path.sh` when developing CLI locally).
2. Re-check command resolution.
3. Re-run the failing command.

### Docker/runtime instability

1. `jcore status`
2. `jcore stop`
3. `jcore start --force`
4. `jcore attach` to inspect startup logs

### Suspected config drift

1. `jcore config list`
2. Compare global vs local scope values.
3. `jcore config unset <key>` for bad overrides, then set known-good values.

## Escalation

If still blocked, report:

- JCORE CLI version
- OS and shell
- Exact command and full error output
- Whether failure reproduces in a fresh project