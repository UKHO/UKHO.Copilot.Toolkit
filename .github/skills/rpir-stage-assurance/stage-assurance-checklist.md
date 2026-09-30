---
description: "Phase- and outcome-specific RPIR assurance checklist"
---

# Stage assurance checklist

Assess the supplied stage draft against the applicable approved inputs and existing lifecycle boundaries.

## Draft completeness

- The draft identifies its subject, kind, original channel/locator, inspected content/version or fingerprint, stable working identity, `Draft` or `Blocked` state and unresolved decisions; required evidence and validation limits match the actual phase and intended outcome.
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

- For Research, check the subject, cited evidence and open decisions; a working `Draft` or `Blocked` brief is valid for iteration but publication does not complete Research. Only initial `/plan` with the inspected version completes and approves it. If an eligible numbered local status write is proposed, require the exact in-progress record, complete fresh preimage, canonical field/link checks and status-only `Completed` postimage. For other sources record sign-off in the receiving plan with no invented local write.
- For Plan, inspect Research-origin or Review-origin ancestry and any chosen supported subset with blockers carried forward. A truthful incomplete working plan can be saved and iterated, but no affected `/implement` edits are ready while requirement, target, branch, design, safety, command/dependency, validation, acceptance, rollback or operator-effect decisions remain unresolved. The bounded observation exception requires every target/selection predicate, branch, operation, stop, safety, validation, acceptance, rollback and effect to be prescribed, with no decision-changing result. Unavailable checks remain gaps, not passes. Plan alone authors its fresh unchecked hierarchy; assurance never revises it.
- For Implement, check `/implement` with this inspected executable plan version, bounded scope, completed applicable work and honest passed/failed/unavailable/not-run validation. Review-origin work uses the new plan's units, never the prior plan's markers or approval. Keep Script Runner non-editing and phase-scoped except for approved Implement effects, platform permissions and the separate exact empty-directory cleanup exception. An iteratable report draft is not `/review` admission until the engineer supplies its inspected version.
- For Review, `/review` with the inspected implementation report approves admission only. An all-OK terminal outcome requires a persisted verified `No remediation required` report, matching current plan/report/diff, completed applicable work and validation, and no unresolved finding or blocker. Only then check an eligible local plan's complete fresh `Ready for review` preimage, canonical field/link pairs and status-only `Accepted` postimage; otherwise record why no local write occurred. Actionable findings offer optional `/plan` for a distinct issue plan, mixed findings limit it to an engineer-chosen supported subset with blockers carried, and solely blocked findings request clarification. None of these issue outcomes authorizes edits or acceptance.

## Unresolved issues and handback readiness

- Every agent-discovered material unknown is resolved when required for the intended effect, or accurately identified as a blocker in a working draft. A named developer-declared intentional unknown may remain open but cannot authorize affected edits.
- An implementation-relevant unknown blocks affected edits, not truthful draft persistence or handback for iteration. Escalate a changed requirement to Research or an implementation decision to Plan without inventing a choice.
- Name the applicable manual next action without treating publication, a prefill or assurance as the engineer's invocation or a duplicate sign-off.
- Report defects with the smallest safe coordinator reconciliation action; `ready to reconcile` is not an approval or persistence decision.
