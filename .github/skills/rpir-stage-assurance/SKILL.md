---
name: rpir-stage-assurance
description: Assess an RPIR Research, Plan, Implement, or Review draft before coordinator persistence or manual handback. Use when checking stage completeness, traceability, authority boundaries, unresolved issues, and handoff readiness.
user-invocable: false
---

# RPIR Stage Assurance

Use this Skill for an independent, read-only assessment of a coordinator's completed stage draft before the coordinator reconciles and persists it or offers its manual handback.

1. Read the supplied draft, approved inputs, exact scope, acceptance criteria, constraints, and intended persistence or handback.
2. Apply the [stage assurance checklist](./stage-assurance-checklist.md). Compare the draft only with the supplied evidence and existing lifecycle boundaries; do not infer missing authority or facts.
3. Return an assurance result with: readiness (`ready to reconcile` or `reconciliation required`); passed checks; each defect or material uncertainty with its precise evidence and smallest safe coordinator action; unavailable checks and why; and residual risks.
4. Treat the result as advisory evidence for coordinator reconciliation only. It neither approves the draft nor authorizes persistence, lifecycle changes, scope or hierarchy changes, commands, remediation, acceptance, or a handoff.

Do not edit files, run commands, invoke subagents, allocate or persist lifecycle records, or request or replace developer decisions. Escalate agent-discovered material unknowns to the coordinator for resolution under the existing lifecycle controls.