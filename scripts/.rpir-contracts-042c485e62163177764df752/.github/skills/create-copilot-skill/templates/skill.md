---
name: your-skill-name
description: Describe what this Skill does, when it applies, and relevant user vocabulary.
---

# <Skill title>

Briefly state the reusable capability this Skill provides.

## Trigger

Use this Skill when <describe the repeatable task and recognizable request vocabulary>.

Do not use it when <identify a different primitive or out-of-scope case>; explain the better fit and stop or ask for the needed decision.

## Inputs

- **Required:** <inputs and their source or evidence>
- **Optional:** <optional context and how it affects the procedure>
- **Unknowns:** <what must be clarified rather than assumed>

## Procedure

1. <Inspect the supplied inputs and relevant local evidence.>
2. <Perform the bounded, task-specific steps in order.>
3. <Check the result against the stated constraints and stop conditions.>

## Outputs

- <Expected result and format>
- <Files or other artifacts, only when explicitly in scope>
- <Assumptions, unresolved questions, and validation evidence to report>

## Limits

- MUST <state the task's essential scope or evidence boundary>.
- MUST NOT <state prohibited actions, inferred authority, or out-of-scope effects>.
- If <a material input, permission, or safety condition> is missing or conflicts, stop the affected action and request the necessary decision; do not guess.

## Validation

- <Structural or content checks to perform>
- <Representative request or scenario and expected behavior>
- <Checks that require a runtime or platform capability; report them as unavailable if not performed>

## Optional linked resources

Add only resources needed for this workflow and link each one with a relative Markdown link. Omit this section when no bundled resources are needed.

- [<Resource title>](<relative-path>) — <purpose>
