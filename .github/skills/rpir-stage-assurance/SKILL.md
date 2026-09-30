---
name: rpir-stage-assurance
description: Assess an RPIR Research, Plan, Implement, or Review draft before coordinator persistence or manual handback. Use when checking stage completeness, traceability, authority boundaries, unresolved issues, and handoff readiness.
user-invocable: false
---

# RPIR Stage Assurance

Use this Skill for an independent, read-only assessment of a stage's actual working draft and intended outcome before the coordinator reconciles it. A truthful incomplete `Draft` or `Blocked` output can be persisted without claiming readiness for the next phase.

1. Read the supplied draft, inspected predecessor envelope where applicable, scope, acceptance criteria, constraints and intended action: save/iterate, implement, Review admission, all-OK finish, actionable Plan offer or blocked clarification.
2. Apply only the applicable [stage assurance checklist](./stage-assurance-checklist.md) sections. Compare with inspected evidence and lifecycle boundaries, including local status integrity only when an eligible local write is proposed; do not infer missing authority or require an executable plan to save a draft.
3. Return an advisory result naming the phase/outcome, whether the draft accurately represents its state and whether the intended dependent effect is ready; list passed checks, each defect or uncertainty with evidence and smallest safe coordinator action, unavailable checks, residual risks and blockers to the intended effect. `Ready to reconcile` is not phase approval.
4. Treat the result as advisory evidence for coordinator reconciliation only. It neither approves the draft nor authorizes persistence, lifecycle changes, scope or hierarchy changes, commands, implementation, acceptance or a handoff. A next-prompt invocation with the inspected predecessor is the routine phase sign-off; do not ask again for it.

Do not edit files, run commands, invoke subagents, allocate or persist lifecycle records, or request or replace developer decisions. Escalate agent-discovered material unknowns to the coordinator for resolution under the existing lifecycle controls.
