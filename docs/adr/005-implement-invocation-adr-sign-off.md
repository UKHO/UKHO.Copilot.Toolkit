# ADR 005: Engineer `/implement` invocation as ADR sign-off

## Record metadata

- **Status:** Proposed.
- **Substantive version:** v0.2, 2026-10-26.
- **Authored:** 2026-10-26.
- **Decision date:** Not yet accepted as an architectural record.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** Research records the engineer as decision authority for this workflow. No separate board or approval matrix is assumed; apply any other actual, evidenced approval requirement if one is applicable.
- **Agreement evidence:** Research brief v2 records the engineer's selection that explicit `/implement` sign-off should apply to the exact ADR bound by the inspected Plan and be recorded `Accepted`. This is attributed requirements evidence, not an `/implement` invocation or Accepted state for this record.
- **Affected systems:** Prospective RPIR Plan-to-Implement transition, ADR status/evidence metadata, Implement permissions and reports, Review/assurance guidance, static contract checks and Toolkit user summaries.
- **Related decisions:** ADR 004 defines decision-complete planning and bounded residual factual checks. ADR 001's Proposed D1/D2 and historical Review finding remain unchanged and are not accepted by this record.
- **Source revisions:** Physical Research brief v2, 2026-10-26, and associated working Plan v0.2 in `docs/copilot/022-research-plan-readiness/`.

## Context and problem

The current lifecycle defines `/implement` as bounded delivery authorization, keeps architectural agreement separate, and does not authorize Implement to update an ADR. The engineer selected a prospective model in which explicit `/implement`, with the exact approved Plan and its visibly identified ADR snapshot, also records architectural agreement for that snapshot. A clean `/review` remains the separate delivery-acceptance event.

The change requires a narrow write boundary, not general ADR authorship: only the Implement coordinator may record the sign-off metadata on the exact bound Proposed ADR after inspecting its preimage and verifying applicable conditions. It must preserve the substantive decision and accepted history, and it must not claim persistence after a failed or denied save.

## Decision and conditions

### D1 — One explicit `/implement` invocation signs off exact bound Proposed ADR snapshots

- **Choice and rationale:** The engineer's explicit `/implement` invocation with the inspected approved Plan is both bounded delivery authorization and agreement to each exact, decision-complete Proposed ADR snapshot that the Plan visibly binds. The manual Plan handoff identifies every ADR path/ID, decision section, substantive version/snapshot, state, conditions and dependent Work Items, and explains that invocation is the sign-off event. No duplicate approval round is requested. `/plan`, an answer, report, `send: false` prefill, worker action or `/review` is not sign-off.
- **Realistic alternatives and reasoning:** A separate approval message adds a second action despite the selected invocation contract. Treating any Plan invocation as ADR agreement obscures which decision text was inspected. Keeping `/implement` delivery-only preserves current policy but does not meet the engineer's selected outcome. Combining agreement with delivery approval is selected only when the Plan makes the exact reviewed snapshot and meaning explicit.
- **Actual selection or pending state:** The engineer selected this event in Research. The agreement event is the qualifying invocation itself; until a permitted metadata write is successfully saved and read back, this record remains Proposed and no persisted Accepted state is claimed. A failed write does not erase the actual invocation; it leaves a separate persistence failure to report.
- **Conditions and affected Work Items:** WI2 implements the transition and write boundary; WI3 aligns reporting, review, assurance and tests. At invocation, Implement independently reads the exact bound physical ADR and compares it to the Plan-bound Proposed preimage; it does not float to a newer version. The qualifying invocation must occur while this policy is actually effective and use the inspected approved Plan; an earlier invocation cannot be counted retroactively. All architectural choices must already be resolved, and all applicable decision-critical conditions/required approvals must be satisfied. Only the Implement coordinator may perform a one-time metadata-only update on that exact Proposed record: set `Status: Accepted`, set the actual decision date, and append actual agreement evidence naming the engineer's invocation, approved Plan version and exact ADR preimage snapshot. Preserve the decision text and existing metadata. The substantive version remains the same where the only change is acceptance metadata; the accepted postimage is separately identified and read back. If consumer versioning conventions require a different representation, use only the inspected convention and bind/report the actual postimage—never invent one.

The coordinator must establish identity, containment, absence of conflicting edits, effective permission and the expected preimage before writing; save without overwriting; then read back the complete postimage. A mismatch, unavailable ADR, unresolved decision, unsatisfied condition or applicable additional approval holds only dependent effects. If persistence fails, is denied or cannot be verified, report the invocation and the unpersisted state separately, do not claim `Accepted`, and hold source effects dependent on recorded sign-off while independent approved work may continue. Reconcile the actual file before any safe retry; a real denial is not bypassed. Workers and Script Runner receive no ADR write authority. Previously accepted/superseded records are immutable. `/review` remains delivery acceptance and gains no ADR approval/write authority.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| Keep `/implement` delivery-only | Matches current lifecycle and avoids a new write effect | Does not meet the engineer's selected sign-off event | Not selected prospectively |
| Add a separate ADR approval invocation/message | Makes agreement distinct from delivery | Adds the extra approval round the engineer rejected | Not selected |
| Treat `/implement` as sign-off to an exact, visibly bound snapshot, then record only guarded metadata | Matches the selected workflow and preserves traceability between decision and delivery | Requires exact-version inspection, narrow authority, verified persistence and an explicit bootstrap boundary | Proposed direction selected in Research |
| Allow broad Implement ADR editing or let a helper/worker update status | Could simplify file mutation | Exceeds least privilege, weakens ownership and can rewrite accepted history | Rejected |

## Consequences

- **Benefits:** One clear engineer action authorizes the bounded Plan and signs off only the exact identified ADR decision text; the record exposes that agreement.
- **Risks and technical debt:** Textual tests cannot prove that a human inspected the ADR or that an agent received the intended runtime invocation. File writes can fail or conflict, so acceptance persistence and dependent effects must be separated.
- **Operational impact:** The future policy changes the Implement coordinator's authority narrowly; no worker, Script Runner, Review or Plan status authority is added. Reports must record actual preimage/postimage evidence.
- **Reversibility and recovery constraints:** Do not rewrite accepted substantive rationale. A changed decision uses the evidenced amendment/supersession route and a newly approved Plan; do not silently re-sign a newer version.
- **Dependencies:** ADR 004, the lifecycle's physical-record/effect safeguards, explicit manual transition, and actual applicable decision authority/conditions.

## Standards and practice alignment

This proposal uses the Toolkit ADR template's `Proposed` and `Accepted` terms for this Toolkit workflow only. It does not infer a universal consumer directory, status vocabulary, enterprise approval matrix or renderer. For another consumer, inspect its actual convention and required authority before applying a status effect.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Bootstrap under currently effective policy | This record's own Proposed-to-Accepted write cannot be performed by the currently loaded Implement policy, which explicitly grants no ADR status-write authority; editing policy does not self-upgrade the loaded session | Engineer / policy owner | The associated Plan records option A: the initial implementation is prospective-only; any later status update requires effective policy and a qualifying invocation bound to the exact inspected ADR snapshot | Resolved for initial rollout; this ADR remains Proposed |
| Additional actually applicable approvals or decision-critical conditions | Whether an exact ADR can be marked Accepted | Engineer and any evidenced authority | Inspect governing evidence; do not invent a board or mark Accepted while a real prerequisite is unsatisfied | Resolve per bound ADR before its dependent effects |

## References and implementation binding

- [Research brief v2](../copilot/022-research-plan-readiness/001-research-brief.md), 2026-10-26; physical local source.
- **Associated Plan:** [001-implementation-plan.md](../copilot/022-research-plan-readiness/001-implementation-plan.md), working v0.2; Plan owns the sole delivery hierarchy and acceptance.
- **Coverage binding:** Plan WI2 -> D1 in this ADR, Proposed substantive snapshot v0.2; the exact preimage, prospective-only initial rollout and any future Accepted metadata effect are recorded in the Plan.
- **Renderer or consumer convention:** Existing `docs/adr/` numbered records and `.github/skills/architecture-decision-records/templates/adr.md`; no universal convention is claimed.

This supplementary Proposed ADR is not a canonical RPIR phase record, approval, transition, implementation authorization or delivery acceptance. Its proposed future write permission is not effective in the currently loaded session.
