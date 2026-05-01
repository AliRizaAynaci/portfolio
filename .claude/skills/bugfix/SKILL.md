---
name: bugfix
description: Debug and fix a specific bug using targeted investigation.
disable-model-invocation: true
argument-hint: "[bug description or failing test]"
---

Fix this bug: $ARGUMENTS

Workflow:

1. Reproduce or inspect the failure.
2. Identify the narrowest suspected area.
3. Read only relevant files.
4. Explain the likely root cause.
5. Apply the smallest safe fix.
6. Run targeted validation first.
7. If targeted validation passes, suggest broader validation.

Output format:
- Root cause
- Fix summary
- Files changed
- Validation result
- Any remaining uncertainty
