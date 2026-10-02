---
description: "Phase- and outcome-specific RPIR assurance checklist"
---

# Stage assurance checklist

Assess the supplied stage draft against the applicable approved inputs and existing lifecycle boundaries.

## Draft completeness

- The working document identifies its subject, kind, original channel/locator, inspected content/version or fingerprint, stable working identity and unresolved decisions; required evidence and validation limits match the actual phase and intended outcome. Do not represent uncertainty as a phase-level `Blocked` state.
- The draft covers the supplied scope and acceptance criteria without adding work, files, commands, decisions, or authority.
- Facts, assumptions, limitations, and material uncertainties are distinguishable and evidence-backed.

## Traceability

- Direct inspected-version lineage is preserved: initial Research to plan, or Review report to its reviewed implementation report, previous plan and original Research, then this pass's plan to implementation and Review reports. Exact canonical identities and matching one-hop links apply only to verified numbered local relationships; never invent a local link for another channel.
- An agreed version is frozen separately before later draft edits; distinct issue plans have new unchecked units and do not rewrite a prior finalized plan or report.
- Claims, findings, completion statements, and validation results trace to supplied evidence.
- Unavailable or not-run checks are not represented as successful evidence.

## Authority boundaries

- The plan remains authoritative for scope, hierarchy, status, and completion markers.
- Lifecycle persistence, allocation, status or marker changes, command execution, bounded implementation, acceptance and developer choices remain coordinator or developer responsibilities as applicable. Assurance grants neither additional scope nor tool permission and is not a second approval.
- The draft retains existing manual `send: false` handoffs and does not make any handoff automatic.

## Phase and outcome checks

- For Research, check the subject, cited evidence and open decisions; continue the working brief while investigating and disclose evidence limits. Only initial `/plan` with the inspected version approves the Research-to-Plan transition. If an eligible numbered local status write is proposed, require the exact in-progress record, complete fresh preimage, canonical field/link checks and status-only `Completed` postimage. For other sources record sign-off in the receiving Plan with no invented local write.
- For Plan, inspect Research-origin or Review-origin ancestry and any chosen supported subset with unresolved findings carried forward. The engineer-approved `/implement` invocation with this inspected Plan version admits one bounded pass regardless of earlier readiness advice. Separately identify any edit whose requirement, target, branch, design, safety, command/dependency, validation, acceptance, rollback or operator-effect guard is not met; stop only that effect. Any observation intended to authorize an effect must have its target/selection predicate, branch, operation, stop, safety, validation, acceptance, rollback and effect prescribed, with no decision-changing result. Unavailable checks remain gaps, not passes. Plan alone authors its fresh unchecked hierarchy; assurance never revises it.
- For Implement, check `/implement` with this inspected Plan version, bounded scope, applicable work and honest passed/failed/unavailable/not-run validation. Review-origin work uses the new Plan's units, never the prior Plan's markers or approval. Keep Script Runner non-editing and phase-scoped except for approved Implement effects, platform permissions and the separate exact empty-directory cleanup exception. A report that records effect refusals or evidence gaps can still be delivered for engineer-approved Review admission; `/review` with its inspected version admits Review, not acceptance.
- For Review, `/review` with the inspected implementation report approves admission only. An all-OK terminal outcome requires a persisted verified `No remediation required` report, matching current Plan/report/diff, completed applicable work and validation, and no unresolved finding or blocker. Only then check an eligible local Plan's complete fresh `Ready for review` preimage, canonical field/link pairs and status-only `Accepted` postimage; otherwise record why no local write occurred. Actionable findings may be offered for optional `/plan` on a distinct issue plan. Mixed actionable and unclear findings use `Needs clarification`, preserve both classifications, and may be planned only within an engineer-approved supported subset. Solely unclear findings remain Review questions. `Blocker` severity guards acceptance but is not a phase state. No non-clean outcome authorizes edits or acceptance.

## Unresolved issues and affected effects

- Every agent-discovered material unknown is investigated and recorded accurately; disclose unavailable evidence and identify any effect that depends on an unresolved decision. A named developer-declared intentional unknown may remain open but cannot authorize an affected edit.
- An implementation-relevant unknown stops the affected edit, not continued phase work, truthful reporting or an engineer-approved transition. Escalate changed scope to Plan; renew Research only when new evidence requires it. Do not invent a choice.
- Name the applicable manual next action without treating publication, a prefill or assurance as the engineer's invocation or a duplicate sign-off.
- Report defects with the smallest safe coordinator reconciliation action; `ready to reconcile` is not an approval or persistence decision.
