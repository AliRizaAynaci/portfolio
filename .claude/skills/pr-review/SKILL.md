---
name: pr-review
description: Review current git diff for correctness, maintainability, security, and test coverage.
disable-model-invocation: true
allowed-tools: Bash(git diff *) Bash(git status) Read Grep Glob
argument-hint: "[optional focus area]"
---

Review the current diff.

Focus area: $ARGUMENTS

Steps:
1. Run `git status`.
2. Inspect `git diff`.
3. Review only changed code and directly related call sites.
4. Do not rewrite code unless asked.
5. Return findings grouped by severity.

Output format:
## Critical
## Important
## Minor
## Suggested tests
## Overall verdict
