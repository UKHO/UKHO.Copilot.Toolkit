# ADR 004: Decision-complete Research and Plan handoffs

## Record metadata

- **Status:** Proposed.
- **Substantive version:** v0.1, 2026-10-26.
- **Authored:** 2026-10-26.
- **Decision date:** Not yet accepted as an architectural record.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer is the decision authority for this workflow, as recorded in Research. No separate board or approval matrix is assumed; apply any other actual, evidenced requirement if one is applicable.
- **Agreement evidence:** Research brief v2 records the engineer's direction that architectural choices be resolved before Plan completion while bounded factual unknowns may remain. This is attributed requirements evidence, not an `/implement` sign-off or an Accepted state for this record.
- **Affected systems:** Prospective RPIR Research/Plan handover, planning guidance and templates, Implement readiness, static contract checks and user-facing summaries in the UKHO Copilot Toolkit.
- **Related decisions:** ADR 001 D1 concerns early architectural identification and complete ADR coverage, but does not establish this decision-readiness rule. ADR 005 separately covers the `/implement` sign-off event and its bounded record effect. No existing ADR is revised.
- **Source revisions:** Physical Research brief v2, 2026-10-26, and associated working Plan v0.2 in `docs/copilot/022-research-plan-readiness/`; these local links are not a substitute for physical inspection.

## Context and problem

Research and Plan already identify architectural choices and reconcile them to ADR coverage, while permitting factual investigation and preserving engineer-owned choices. The current Plan guidance can nevertheless carry unresolved decisions or generic “TBD/investigate” facts forward without a consistent actionable resolution route. Treating every unknown as a blocker would be equally wrong: an ordinary environment fact may be observable only during implementation and need not imply an undecided architecture.

The requested outcome is a decision-complete Plan, not a prediction of every debugging step. A complete Proposed ADR may accurately await the engineer's separate sign-off event; decision completeness and approval state are distinct.

## Decision and conditions

### D1 — Resolve architectural choices before Plan completion; bound residual facts

- **Choice and rationale:** Research resolves foreseeable engineer-owned architectural choices where practicable. A completed Plan contains no unresolved architectural choice: every identified Research choice and planning discovery has an actual selection, complete rationale and realistic alternatives, conditions, affected Work Items, and inspected ADR coverage. An associated ADR may remain Proposed pending the engineer's exact-version sign-off. This reduces rediscovery without falsely treating Proposed as incomplete content.
- **Realistic alternatives and reasoning:** Leaving broad gap language unchanged is low-cost but can pass unresolved thinking forward without an actionable route. Requiring zero unknown facts would block ordinary implementation investigation and confuse evidence gaps with decisions. Making every implementation detail an ADR decision adds noise and exceeds the requested scope.
- **Actual selection or pending state:** The engineer selected the decision-complete-by-Plan direction and the bounded-factual-unknown exception in Research. This Proposed record has not yet been formally accepted; the exact approval event is separately defined by ADR 005.
- **Conditions and affected Work Items:** WI1 establishes the Research/Plan readiness contract and bounded-fact representation. A remaining factual unknown must record current evidence, a bounded observation/check, expected interpretation and permitted in-scope response, dependent Work Items/effects, the engineer-escalation condition, and independent work that may continue. If the fact changes or invalidates an architectural choice, affected work waits for engineer direction; no implementation agent may select a replacement architecture. Routine debugging need not be predicted.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| Keep current broad gap language | Lowest authoring cost; factual investigation is already permitted | Does not make a residual fact route consistently actionable or distinguish it from a decision | Not selected for the stated outcome |
| Require all facts known before Plan completion | Superficially maximizes certainty | Creates a zero-unknowns gate, blocks facts observable only during implementation, and conflates evidence with decisions | Rejected as broader than the requirement |
| Decision-complete Plan with a bounded fact exception | Resolves architecture before handoff while preserving safe, evidence-led investigation | Requires semantic classification and concise per-effect routing | Proposed direction selected in Research |
| Require ADRs for every implementation detail | Maximizes nominal documentation | Contradicts the routine-coding boundary and creates unnecessary ADR/Plan churn | Outside scope |

## Consequences

- **Benefits:** Architectural choices are not deferred as generic questions; facts that can safely be checked later retain a usable route and do not block independent work.
- **Risks and technical debt:** Static wording checks cannot determine semantic completeness of arbitrary Plans; reviewers must inspect actual choices and factual routes.
- **Operational impact:** Research and Plan templates/agents need aligned language; Implement reports factual-check outcomes and escalations without changing accepted architecture.
- **Reversibility and recovery constraints:** Future policy changes use a newly approved Plan where material; preserve finalized reports and accepted/superseded decision rationale.
- **Dependencies:** ADR 005's sign-off model and the existing lifecycle's physical lineage, manual transitions, permission and effect safeguards.

## Standards and practice alignment

No external architecture standard, universal ADR directory or consumer-wide status convention is asserted. This decision uses the Toolkit's existing RPIR owners and requires evidence-based consumer conventions.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Effective adoption of this Proposed decision | ADR 004's later Accepted state and dependent workflow claims | Engineer; Implement coordinator only under effective policy | The associated Plan records a prospective-only initial rollout; any later sign-off requires then-effective policy and a qualifying invocation bound to the exact ADR snapshot | Proposed; no Accepted claim |

## References and implementation binding

- [Research brief v2](../copilot/022-research-plan-readiness/001-research-brief.md), 2026-10-26; physical local source.
- **Associated Plan:** [001-implementation-plan.md](../copilot/022-research-plan-readiness/001-implementation-plan.md), working v0.2; Plan owns the sole delivery hierarchy and acceptance.
- **Coverage binding:** Plan WI1 -> D1 in this ADR, Proposed substantive snapshot v0.1; affected work and the exact inspected section are recorded in the Plan.
- **Renderer or consumer convention:** Existing `docs/adr/` numbered records and `.github/skills/architecture-decision-records/templates/adr.md`; no universal convention is claimed.

This supplementary Proposed ADR is not a canonical RPIR phase record, approval, transition, implementation authorization or delivery acceptance.
