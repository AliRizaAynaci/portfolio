---
name: codebase-map
description: Build a concise architecture map of the project without reading unnecessary files.
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(find *) Bash(tree *)
argument-hint: "[area: backend/frontend/auth/db/etc.]"
---

Create a concise codebase map for: $ARGUMENTS

Rules:
- Do not read the whole repository.
- Start with directory structure.
- Identify entrypoints, core modules, and data flow.
- Prefer summaries over large file dumps.
- Mention files worth reading next.

Output:
## High-level architecture
## Key directories
## Main execution flow
## Important files
## Unknowns / next files to inspect
