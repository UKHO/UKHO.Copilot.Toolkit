---
name: create-runbook
description: Create or update a human-readable repository Run Book using the approved anatomy and, when intended for Script Runner selection, its strict stable-ID section grammar.
user-invocable: true
---

# Create a Run Book

Use this Skill to create or update a human-readable repository Run Book. It provides authoring guidance only; it cannot authorize Script Runner execution, commands, or catalogue mutation.

## Inputs and boundaries

- Require an exact repository-contained target path, approved scope, and source material for the Run Book. Do not infer a location, operation, command, argument, or catalogue entry.
- Establish whether the Run Book has Script Runner intent. When it does not, omit the `## Script Runner operations` section rather than inventing an operation list.
- Keep human process guidance narrative and non-executable. Only a compliant dedicated Script Runner section can be a selection source; it does not authorize execution or override Workspace Trust, VS Code permissions, or managed organization policy.
- Do not add, remove, or mutate catalogue entries. Refer only to existing stable IDs that are unique in the fixed root catalogue.

## Procedure

1. Confirm the repository-contained target, audience, purpose, approved scope, and canonical sources. Stop for clarification when any of these are unknown.
2. Start from the [Run Book template](templates/runbook.md). Complete its purpose, scope, audience, prerequisites, preparation, ordered process, expected results, diagnostics and failure disposition, safety limits, validation and limitations, and sources.
3. Keep commands, arguments, examples, rationale, and failure guidance in the narrative sections only. Narrative content is not Script Runner input.
4. If the Run Book has Script Runner intent, add exactly one literal `## Script Runner operations` H2 section. It must be followed immediately by one contiguous top-level ordered list containing one or more plain-text lowercase-kebab-case stable IDs in the intended order.
5. Validate that every listed stable ID exists exactly once in the fixed root catalogue and that requested IDs are unique. Refuse blank lines, nested items, Markdown decoration or links, comments, commands, arguments, or any other content in the section until the next H2 heading or end of file.
6. Re-read the completed Run Book. Confirm its narrative remains human-readable and non-executable, its conditional selection section is compliant or absent, and no text claims authority to execute commands or mutate the catalogue.

## Deliverable

Return the exact Run Book path, whether it has Script Runner intent, the ordered stable IDs when present, source references, structural checks performed, unavailable checks, and any unresolved gap. This Skill does not grant execution, command, catalogue-mutation, approval, or permission authority.