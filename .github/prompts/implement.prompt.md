---
name: implement
description: Launch the existing Implement agent for one approved implementation plan without inferring scope or authorizing lifecycle actions.
argument-hint: One lifecycle-core-eligible implementation-plan alias or one inline Markdown link with that alias as its destination
agent: Implement
---

Run the existing `Implement` agent for the canonical implementation-plan input provided below.

Implementation plan: ${input:implementationPlanPath:One lifecycle-core-eligible alias to the implementation plan, or one inline Markdown link whose destination is that alias}

Pass the supplied value verbatim. Accept only one bounded alias or one inline Markdown destination exactly as defined by [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md); first derive and validate its one canonical identity, then let `Implement` apply its expected-type, lifecycle-folder, scope, report, and approval checks. Stop if it is invalid or materially uncertain, and apply [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) before proceeding.

This valid phase request starts the selected Implement stage; do not ask a duplicate phase-authorization question. It does not replace the separate explicit developer approval required before editing, authorize work beyond the named plan, or auto-submit the Review handoff. Preserve the existing Implement agent's scope, validation, command, report, and manual handoff controls.
