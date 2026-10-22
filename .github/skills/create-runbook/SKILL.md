---
name: create-runbook
description: Create or update a human-readable repository Run Book using the approved anatomy, navigation and source validation.
user-invocable: true
---

# Create a Run Book

## Trigger

Use this Skill to create or update a human-readable repository Run Book.

## Inputs

- Require an exact repository-contained target path, approved scope, and source material for the Run Book. Do not infer a location, operation or command.
- Identify whether this specific Run Book is human-followed by default or is explicitly intended to be Agent-followable under a separately inspected authority source.

## Limits

This Skill provides authoring guidance only; it cannot authorize a workflow, command, or Script Runner execution. Run Books are human-guidance documents by default. A specific Run Book may describe an Agent-followable workflow only when a separate applicable policy or explicit authorization covers that exact objective and its effects. Cite that authority and its limits in the Run Book; the Run Book's existence or wording never grants authority or permission. Confirm every documented command, argument, cwd, and effect against an implemented interface. If an interface is absent or uncertain, state the gap and stop condition rather than inventing a command or presenting an improvised script as supported. A Run Book is never Script Runner command-selection input and cannot change Runner's tools or authority. Workspace Trust, VS Code permissions, and managed organization policy continue to apply.

## Procedure

1. Confirm the repository-contained target, audience, purpose, approved scope, and canonical sources. Stop for clarification when any of these are unknown.
2. Start from the [Run Book template](templates/runbook.md). Complete its operating mode and authority, purpose, scope, audience, prerequisites, preparation, ordered process, expected results, diagnostics and failure disposition, safety limits, validation and limitations, and sources.
3. Keep the procedure human-readable. For a specifically authorized Agent-followable Run Book, state the separate authority and exact bounded effects; document only source-verified implemented commands, arguments, cwd, expected output, and stop behavior. Keep human decisions and responsibilities explicit. Do not imply that examples authorize execution or that a Run Book selects commands for Script Runner.
4. Re-read the completed Run Book. Confirm its sources and links resolve, every asserted interface exists, unsupported steps are disclosed as unavailable, and the document does not claim to create its own authority or override platform/organization controls.

## Deliverable

Return the exact Run Book path, source references, structural checks performed, unavailable checks, and any unresolved gap. This Skill does not grant execution, command, approval, or permission authority.

## Validation

- Re-read the completed Run Book; confirm its sources and links resolve, its operating mode and separately supplied authority are accurately stated, documented interfaces are implemented, and no Run Book claims self-authorizing or Script Runner-selection status.
- Report structural checks performed and checks that were unavailable, as part of the deliverable.