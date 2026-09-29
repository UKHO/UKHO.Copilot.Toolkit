---
name: create-runbook
description: Create or update a human-readable repository Run Book using the approved anatomy, navigation and source validation.
user-invocable: true
---

# Create a Run Book

Use this Skill to create or update a human-readable repository Run Book. It provides authoring guidance only; it cannot authorize Script Runner execution or commands.

## Inputs and boundaries

- Require an exact repository-contained target path, approved scope, and source material for the Run Book. Do not infer a location, operation or command.
- Keep human process guidance narrative and non-executable. A Run Book is not a Script Runner selection or execution source and cannot override Workspace Trust, VS Code permissions, or managed organization policy.

## Procedure

1. Confirm the repository-contained target, audience, purpose, approved scope, and canonical sources. Stop for clarification when any of these are unknown.
2. Start from the [Run Book template](templates/runbook.md). Complete its purpose, scope, audience, prerequisites, preparation, ordered process, expected results, diagnostics and failure disposition, safety limits, validation and limitations, and sources.
3. Keep commands, arguments, examples, rationale, and failure guidance in human-facing narrative sections only; none is Script Runner selection input.
4. Re-read the completed Run Book. Confirm its sources and links resolve, its guidance remains human-readable and non-authorizing, and no text claims authority to execute commands.

## Deliverable

Return the exact Run Book path, source references, structural checks performed, unavailable checks, and any unresolved gap. This Skill does not grant execution, command, approval, or permission authority.