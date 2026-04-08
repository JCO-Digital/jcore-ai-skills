---
name: review-code
title: Review Code
description: Review code for correctness, regressions, security risks, and missing tests. Use when reviewing pull requests, examining code changes, or when the user asks for a code review.
targets:
  - claude
  - cursor
  - copilot
copilot:
  agent: agent
---

# Review Code

## Focus

Prioritize findings that could break behavior, introduce regressions, create security risks, or leave important cases untested. Keep summaries brief.

## Review workflow

1. Read the full change set before commenting on individual lines.
2. Start with logic bugs, unsafe assumptions, and user-visible regressions.
3. Check whether tests cover the changed behavior and edge cases.
4. Call out risky migrations, backwards-compatibility issues, and missing rollout notes.
5. Keep feedback actionable and specific.

## Feedback format

Use this structure:

- `Critical`: Must fix before merge.
- `Risk`: Likely regression or missing validation.
- `Gap`: Missing tests, docs, or rollout details.

## Output

Return findings first, ordered by severity. If no issues are found, say that explicitly and mention any residual testing gaps.
