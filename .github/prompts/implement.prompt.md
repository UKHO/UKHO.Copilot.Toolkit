---
name: implement
description: Launch the existing Implement agent for one approved implementation plan without inferring scope or authorizing lifecycle actions.
argument-hint: One lifecycle-core-eligible implementation-plan alias or one inline Markdown link with that alias as its destination
agent: Implement
---

Run the existing `Implement` agent for the canonical implementation-plan input provided below.

Implementation plan: ${input:implementationPlanPath:One lifecycle-core-eligible alias to the implementation plan, or one inline Markdown link whose destination is that alias}

Pass the supplied value verbatim. Let [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) validate the one bounded alias or inline Markdown destination before `Implement` applies its expected-type, lifecycle-folder, scope, report, and approval checks.

This phase-entry confirmation approves only the manual handoff of the preceding exact canonical implementation-plan evidence to Implement; do not ask a duplicate phase-entry question. It does not authorize edits, commands, remediation, scope or hierarchy changes, acceptance, report allocation, or auto-submit the Review handoff. Separate explicit developer approval is required before editing; preserve the existing Implement agent's validation, command, report, and manual-handoff controls.
