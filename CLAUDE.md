# Project Instructions for Claude Code

## Project Overview
This is a production-oriented software project. Before making changes, understand the existing architecture, naming conventions, and dependency boundaries.

## Core Rules
- Do not rewrite large parts of the codebase unless explicitly asked.
- Prefer small, incremental, reviewable changes.
- Before editing, inspect the relevant files and explain the intended change briefly.
- After editing, run the smallest relevant validation command first.
- Do not introduce new dependencies unless there is a clear reason.
- Do not touch `.env`, secrets, credentials, or deployment keys.

## Development Workflow
For non-trivial tasks:
1. Explore the relevant files.
2. Propose a short implementation plan.
3. Wait for approval if the change is architectural or touches many files.
4. Implement incrementally.
5. Run tests, lint, or build commands if available.
6. Summarize changed files and remaining risks.

## Code Style
- Keep code simple, idiomatic, and maintainable.
- Prefer explicit error handling.
- Avoid clever abstractions unless they reduce real duplication.
- Preserve existing formatting and naming conventions.

## Go Backend Guidelines
- Keep handlers, services, repositories, and models separated if the project already uses that structure.
- Use context-aware database calls where applicable.
- Return structured errors consistently.
- Avoid global mutable state unless already part of the design.
- For API changes, update related DTOs, validation, and tests.

## Frontend Guidelines
- Preserve existing component structure.
- Keep UI changes minimal unless the task is specifically about design.
- Avoid unnecessary state management libraries.
- Reuse existing components and styling conventions.

## Database Guidelines
- Do not change schema casually.
- If a migration is needed, explain why.
- Keep migrations backward-compatible when possible.

## Testing and Validation
Prefer targeted validation:
- Go: `go test ./...`
- Node/Frontend: `npm run lint`, `npm run build`, or the existing package manager command
- Docker: only run compose/build commands when necessary

## Context Management
- Do not read the entire repository unless necessary.
- Use targeted search before opening large files.
- Summarize findings instead of pasting long file contents.
- If the context gets large, suggest `/compact` or a fresh `/clear` after summarizing the current state.

## Compact Instructions
When compacting, preserve:
- current task goal
- files changed
- key architectural decisions
- test/build results
- unresolved issues
