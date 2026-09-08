# Stage assurance checklist

Assess the supplied stage draft against the applicable approved inputs and existing lifecycle boundaries.

## Draft completeness

- The draft has the required stage output, required evidence, and required validation or limitation statements.
- The draft covers the supplied scope and acceptance criteria without adding work, files, commands, decisions, or authority.
- Facts, assumptions, limitations, and material uncertainties are distinguishable and evidence-backed.

## Traceability

- Exact canonical lifecycle identities, direct provenance, and required artifact links are preserved where applicable.
- Claims, findings, completion statements, and validation results trace to supplied evidence.
- Unavailable or not-run checks are not represented as successful evidence.

## Authority boundaries

- The plan remains authoritative for scope, hierarchy, status, and completion markers.
- Lifecycle persistence, allocation, status or marker changes, command execution, remediation, acceptance, and developer approvals remain coordinator or developer responsibilities as applicable.
- The draft retains existing manual `send: false` handoffs and does not make any handoff automatic.

## Closure and implementation readiness

- When a Research-closure input applies, the exact canonical input, expected type and folder, accessibility, and sole permitted `Status: In progress` preimage are validated before mutation; the procedural write changes only that status to `Completed`, and postimage comparison proves no other content changed. Rejection or mismatch causes no planning handoff or allocation, and no atomicity claim is made.
- The plan contains no implementation-relevant unknown, ambiguity, unverified fact, target-selection gap, branch, design or safety choice, command or dependency decision, validation or acceptance condition, rollback, or operator effect for Implement to research or decide.
- Any unresolved implementation-relevant item blocks persistence and handback. Unavailable validation is disclosed with its reason and residual gap; it is not treated as successful evidence or as permission to defer an implementation requirement.
- The sole permitted observation is fully prescribed with an exact target or deterministic selection predicate, all branches and operations, stop conditions, safety gates, validation, acceptance, rollback, and operator effect, and cannot change scope, hierarchy, target selection, design, safety, commands, dependencies, acceptance, or another implementation decision. Anything else is research and blocks readiness.
- Plan-only hierarchy authority is preserved: the Planned work items register remains the sole scope register, and assurance does not add, remove, restructure, authorize, or complete Work Items, Tasks, or Steps.

## Unresolved issues and handback readiness

- Every agent-discovered material unknown is either resolved through the existing lifecycle controls or identified for coordinator resolution before persistence or handback.
- No implementation-relevant unknown is eligible for handback; it must be resolved or the draft must be returned for Plan amendment or a new Research pass as appropriate.
- The draft names the next developer decision or manual handback without treating it as approved or automatic.
- The draft is ready for coordinator reconciliation before persistence; report any defect with the smallest safe reconciliation action.