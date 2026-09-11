---
name: implement
description: Launch the existing Implement agent for one approved implementation plan without inferring scope or authorizing lifecycle actions.
argument-hint: One lifecycle-core-eligible implementation-plan alias or one inline Markdown link with that alias as its destination
agent: Implement
---

Run the existing `Implement` agent for the canonical implementation-plan input provided below.

Implementation plan: ${input:implementationPlanPath:One lifecycle-core-eligible alias to the implementation plan, or one inline Markdown link whose destination is that alias}

Pass the supplied value verbatim. Let [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) validate the one bounded alias or inline Markdown destination before `Implement` applies its expected-type, lifecycle-folder, scope, report, and approval checks.

The invocation supplies one lifecycle-core-validated canonical implementation-plan route; routing is not approval and do not ask a duplicate phase-entry question. The recorded developer approval for that exact canonical plan authorizes only its initial non-remediation scoped pass. This confirmation and approval do not authorize remediation, scope or hierarchy changes, acceptance, report allocation, or auto-submit the Review handoff; preserve the existing Implement agent's validation, command, report, and manual-handoff controls.
