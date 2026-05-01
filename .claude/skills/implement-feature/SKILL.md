---
name: implement-feature
description: Implement a focused feature with minimal, reviewable code changes.
disable-model-invocation: true
argument-hint: "[feature description]"
---

Implement this feature: $ARGUMENTS

Follow this workflow:

1. Identify the smallest relevant area of the codebase.
2. Read only the files required to understand the change.
3. Produce a short implementation plan.
4. Avoid broad refactors unless required.
5. Implement incrementally.
6. Run the smallest relevant test/build command.
7. Summarize:
   - files changed
   - behavior added
   - validation result
   - remaining risks

Hard constraints:
- Do not introduce new dependencies without justification.
- Do not modify unrelated files.
- Do not change public API behavior unless explicitly requested.
