---
name: rpir-stage-assurance
description: Assess RPIR evidence, traceability, authority boundaries, unresolved issues, and effect-specific safeguards for coordinator reconciliation.
user-invocable: false
---

# RPIR Stage Assurance

Use this Skill for an independent, read-only assessment of a stage's actual working document and intended outcome before the coordinator reconciles it. Report incomplete evidence and unresolved questions without assigning a phase-level `Blocked` state or vetoing an engineer-approved inspected-version transition.

1. Read the supplied working document, inspected predecessor envelope where applicable, scope, acceptance criteria, constraints and intended action: continue iteration, implement, Review admission, all-OK finish, actionable Plan offer or clarification.
2. Apply only the applicable [stage assurance checklist](./stage-assurance-checklist.md) sections. For this lifecycle, check Research's exact subject-folder proposal and engineer confirmation before use/creation, then the physical brief; for each successor, check the actual physical predecessor and current output in that same folder. Compare with inspected evidence and lifecycle boundaries, including local status integrity only when an eligible local write is proposed; an unfinished no-write outcome is not completed output. Do not infer missing authority or require an executable plan to save a draft.
3. Return an advisory result naming the phase/outcome, whether the document accurately represents its evidence, and which specific dependent effects satisfy their guards. List passed checks, each defect or uncertainty with evidence and smallest safe coordinator action, unavailable checks, residual risks and effects that must stop. Assurance does not decide phase readiness or admission.
4. Treat the result as advisory evidence for coordinator reconciliation only. It neither approves a document nor authorizes persistence, lifecycle changes, scope or hierarchy changes, commands, implementation, acceptance or a handoff. The engineer-approved invocation with the inspected predecessor controls transition; do not add another approval question or let assurance advice veto it.

Do not edit files, run commands, invoke subagents, allocate or persist lifecycle records, or request or replace developer decisions. Escalate agent-discovered material unknowns to the coordinator for resolution under the existing lifecycle controls.
