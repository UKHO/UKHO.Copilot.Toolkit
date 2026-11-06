# ADR 011: Research-complete technical handoffs

## Record metadata

- **Status:** Accepted.
- **Substantive version:** v0.1, 2026-11-06; the full document is the decision snapshot.
- **Authored:** 2026-11-06.
- **Decision date:** 2026-11-06.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer supplies the workflow requirements and is the decision authority for this Toolkit objective. No additional approval body is evidenced.
- **Agreement evidence:** Research brief v0.1 records the engineer's “Yes continue” on 2026-11-06 acknowledging the desired boundary, not the exact mechanism. On 2026-11-06 the engineer explicitly invoked the `/implement` route with the inspected associated Plan v0.1, 2026-11-06, in active Implement mode. Under the exact-snapshot rule effective before that invocation, this signs off only ADR 011 D1's full Proposed substantive v0.1, 2026-11-06 preimage visibly bound in that Plan. The Implement coordinator independently inspected the unchanged preimage, authority and conditions and records this metadata separately; invocation alone does not establish save/readback or delivery acceptance.
- **Affected systems:** Toolkit RPIR phase responsibilities, methods and templates, entry guidance, assurance, user summaries and authored-contract validation.
- **Related decisions:** [ADR 004](004-decision-complete-rpir-plans.md), Proposed v0.1 D1, covers architecture complete by Plan and bounded residual facts. [ADR 009](009-rpir-handoff-reliability.md), Accepted v0.1 D1–D3, covers evidence-led handoffs, authorized correction and authored-delivery validation. [ADR 010](010-concise-rpir-output-contract.md), Accepted v0.1 D1, supplies concise phase-owned output. This decision strengthens the technical handover without editing, accepting or superseding those records.
- **Source revisions:** [Research brief v0.1](../copilot/028-research-complete-handoffs/001-research-brief.md) and [associated Plan v0.1](../copilot/028-research-complete-handoffs/001-implementation-plan.md), 2026-11-06. These local contextual references are not substitutes for independent inspection.

## Context and problem

The current workflow requires proportionate feasibility investigation and honest residuals, but permits essential mechanisms to remain pending when Research hands over. Plan is then instructed to investigate gaps and reach architectural completeness. Explaining a gap does not establish a viable solution, and a bounded investigation task does not make an absent solution mechanism ordinary execution work.

The engineer wants Research to resolve foreseeable feasibility/design questions, Plan to specify executable delivery, and Implement to apply, inspect, validate and diagnose without discovering the essential solution. Essential means decision-critical to whether or how the intended outcome can be achieved, not every local coding choice. Architecture classification alone is insufficient: a nonarchitectural transformation mechanism can also be essential.

This is a technical responsibility contract, not a new phase, readiness certificate, automatic transition, tool expansion or requirement to know every execution fact. Existing manual invocations, permissions and independent Review continue to govern.

## Decision and conditions

### D1 — Research establishes the viable mechanism; Plan formalizes executable delivery

- **Choice and rationale:** Adopt the following boundary in the existing owners and handover fields. Research's technically sufficient conclusion establishes an evidence-supported viable mechanism, decision-critical feasibility, realistic alternatives and a supported recommendation. Preserve actual engineer selections and qualifications separately. If an essential feasibility/design mechanism remains unestablished, report unfinished Research, affected effects and its next evidence route rather than describing it as ready to convert into executable work. A viable recommendation need not be falsely represented as already approved.
- **Plan conversion and recovery:** Plan checks freshness/applicability and turns the supported conclusion into acceptance, affected owners, dependencies, ordered actions and validation. Delivery refinement, contextual clarification and associated Proposed ADR authorship remain Plan-owned. When genuinely new evidence, changed requirements or an inherited gap reopens essential feasibility, identify it and recommend scoped engineer-directed Research continuation/supplementation; do not silently finish essential solution research inside the Plan or assign it as an implementation task. Truthful working drafts remain persistable, and readiness advice never vetoes the engineer's invocation.
- **Residual facts and execution:** Extend the existing bounded fact route with why the fact reasonably remains and the already supported mechanism it tests. Execution-dependent, newly exposed or permission-limited observations may remain when the approach is supported; an accessible but uninvestigated essential mechanism is not justified by adding a bounded route. Keep current evidence, bounded observation, expected interpretation, allowed response, affected effects/acceptance, escalation and independent continuation. An absent essential mechanism is not an ordinary factual check merely because it needs no ADR. Preserve Implement's current-file inspection, routine local decisions, related-file/test selection, diagnosis, attributable repair and relevant rechecks. Ordinary failures do not automatically restart Research.
- **Bounded searches:** Execution alignment searches state their purpose, relevant source roots/normative owners, historical exclusions and a useful completion condition. Implement may select necessary related files within the approved outcome; this is not an exhaustive filename/command whitelist. Routine contradictions with a specified rule are aligned; genuinely new material policy/architecture/authority choices receive engineer-directed resolution before dependent effects.
- **Realistic alternatives and reasoning:** Retain decision-complete-by-Plan guidance: flexible and low-cost, but leaves foreseeable essential research in planning. Require zero unknowns before Plan: nominal certainty, but obstructs execution-only observations and encourages false claims. Prohibit Implement inspection/search: simple to state, but prevents safe application and debugging. Strengthen existing owners and residual fields: addresses the responsibility gap without a new register or route; selected as the sole proposal.
- **Actual selection or pending state:** This Plan selects the coordinated design above as its proposal. The engineer agreed the desired boundary, not these exact words or the full mechanism. There is no competing unresolved design option; exact-snapshot sign-off remains pending through the existing qualifying invocation.
- **Conditions and affected Work Items:** Work Items 1–2. Preserve Research discovery acknowledgment/explicit deferral, Plan-owned scope/acceptance/hierarchy, truthful unfinished records, complete ADR coverage and proposal/agreement distinctions, exact-snapshot sign-off and separate metadata persistence, physical lineage, effective permissions, incremental markers, conditional Runner-owned checkpoints, independent work and independent Review. No new approval exchange, compulsory prototype, investigation quota or zero-unknowns rule. No historical repair, tools/models/routes change, installation, packaging, activation, network or live-session claim.

## Consequences

- **Expected benefit:** Less avoidable downstream discovery of the essential solution; clearer executable planning without disabling safe implementation investigation. This is an intended improvement, not measured behavior.
- **Risks:** Authors may confuse a detailed task with an established mechanism or readiness advice with authority. Owner-local checks and semantic counterexamples must assess both mistakes. Excess prose can obscure the distinction; reuse existing sections and link rationale.
- **Validation:** Existing static verifier and mutation fixtures plus reasoned positive/negative handover assessment establish authored-contract evidence. They cannot decide arbitrary Plan semantics or prove actual loading, conversation chronology or live effectiveness.
- **Recovery:** Diagnose ordinary implementation defects within the approved outcome; materially changed feasibility needs scoped engineer/Research resolution and Plan-owned changes. Preserve historical records and accepted ADR rationale. Correct attributable changes using actual preimages without overwriting user work.
- **Dependencies:** Existing lifecycle and sign-off safeguards remain authoritative. No new runtime technology, dependency, packaging path or consumer support commitment is selected.

## Standards and practice alignment

Uses the inspected numbered Markdown `docs/adr/` convention and repository ADR template. No external standard compliance, renderer or enterprise governance is asserted.

## Open items and decision conditions

| Item | Affected work | Resolution route | State |
| --- | --- | --- | --- |
| Exact-snapshot sign-off and separate recording | Source effects implementing D1, Work Items 1–2 | Qualifying explicit `/implement` with inspected Plan v0.1 and this full Proposed v0.1 D1 snapshot under policy already effective before invocation; Implement verifies authority/conditions, records only permitted metadata and fully reads back | Pending invocation/persistence, not incomplete design content |
| Actual validation capability/results | Required Work Item exit gates | Observe the existing local executor/runtime at execution; no installation or baseline change; report failures/unavailability truthfully | Execution fact |
| Live effectiveness | Runtime claims only | Separate authorization and version/payload-bound observations | Unverified and outside this delivery |

## References and implementation binding

- **Associated Plan:** [001-implementation-plan.md](../copilot/028-research-complete-handoffs/001-implementation-plan.md), v0.1, 2026-11-06; sole delivery hierarchy and acceptance authority.
- **Coverage binding:** D1, this full Proposed substantive v0.1 snapshot → Work Items 1–2. Related ADRs 004, 009 and 010 are baseline evidence, not additional sign-off or status-write targets.
- **Retention:** Preserve prior records and accepted history; no reciprocal ADR/register edits. This record remains understandable without local lifecycle evidence.

Only a qualifying explicit `/implement` with the inspected Plan signs off this exact visibly identified Proposed snapshot when the rule is effective before invocation. Plan invocation, answers, reports, workers, Script Runner, manual prefills and `/review` are not sign-off. Implement alone may separately record the guarded status/date/agreement metadata; invocation is not proof of persistence. A failed, denied, conflicting or unreadable save is not persisted `Accepted`: hold only dependent effects. No retroactivity, general ADR authorship or runtime permission is granted.