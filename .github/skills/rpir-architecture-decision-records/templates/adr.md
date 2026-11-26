# ADR <consumer-assigned ID>: <decision title>

Keep this ADR self-contained: context, rationale, realistic alternatives and decision conditions remain understandable without local lifecycle records. Link supporting evidence once with its inspected section/version where material, but never substitute an unreadable link for a decision or actual agreement. Omit irrelevant optional fields, not unknown conditions or exact Plan bindings; do not keep a running Q&A/change diary. This presentation guidance does not grant ADR authorship or status-write authority.

## Record metadata

- **Status:** <consumer convention; distinguish proposed decision state from delivery progress>
- **Substantive version or snapshot:** <actual revision used for inspected Plan binding; not a floating latest>
- **Authored:** <document creation/revision date>
- **Decision date:** <actual decision date, or `Not yet decided`>
- **Author(s):** <actual authors; do not infer>
- **Decision participants and roles:** <actual participants and evidenced roles; distinguish consulted from decision authority>
- **Agreement evidence:** <source/version, actual choice, conditions, date and reference; `None verified` is not implied by an empty field>
- **Affected systems:** <verified systems/interfaces or qualified unknowns>
- **Related decisions:** <consumer-conformant IDs/links or explicitly unverified>
- **Source revisions:** <substantive Research/Plan/ADR inputs, versions or snapshots, with qualified local-only links>

## Context and problem

<Standalone, decision-relevant context, problem, drivers, current state, constraints, and evidence. Attribute statements and label assumptions. This rationale must remain understandable if local RPIR or temporary inputs are unavailable.>

## Decision and conditions

<The selected direction, or the current proposed state. Separate recommendation from actual human agreement. State required conditions and which dependent work they constrain.>

### <Identifiable choice ID or section — repeat for each grouped architectural choice>

- **Choice and rationale:** <architectural commitment, drivers and evidence; keep each choice identifiable even when context is shared>
- **Realistic alternatives and reasoning:** <option-specific benefits, trade-offs and reasons; link the alternatives table or a choice-specific subsection without hiding individual choices>
- **Actual selection or pending state:** <selected direction with actual agreement evidence, or explicit proposal/pending decision; do not infer agreement>
- **Conditions and affected Work Items:** <decision-critical conditions, dependent effects and existing associated Plan Work Item IDs; unresolved gaps need a resolution route, not invented coverage or a phase-wide veto>

Reuse verified appropriate existing ADR coverage without duplication. Group choices only where shared context, rationale and governance are meaningful; independently changing status, authority or supersession favours separate records. Proportionality reduces detail, not choice coverage, including in small reversible spikes. Routine architecture-preserving coding does not require an ADR.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| <Option> | <Evidence> | <Trade-offs/unknowns> | <Recommended, not selected, or actually rejected—with reason> |

## Consequences

- **Benefits:** <supported or labelled expected outcomes>
- **Risks and technical debt:** <introduced costs, residual risks, deferred work, or reasoned not applicable>
- **Operational impact:** <support, skills, monitoring, resilience, incident response and recurring costs where relevant>
- **Reversibility and recovery constraints:** <decision-level reversibility; detailed rollout/rollback tasks remain Plan-owned>
- **Dependencies:** <evidenced prerequisites and consequences of unresolved items>

## Standards and practice alignment

<Relevant verified standards, evidence and alignment/divergence; otherwise state what is unknown or give a reasoned not-applicable disposition. Do not invent standards or compliance.>

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| <Material item or none with reason> | <Effect> | <Known or unknown> | <Evidence to obtain / next action> | <Open/resolved/conditional> |

## References and implementation binding

- <Durable source references and substantive versions. Mark inaccessible/local-only RPIR links; retain rationale above.>
- **Associated Plan:** <Plan path/ID and substantive version when one exists; the Plan remains the sole delivery hierarchy and acceptance authority.>
- **Coverage binding:** <for each choice, the associated Plan identifies this ADR path/ID, identifiable section, inspected substantive version/snapshot, decision state, actual agreement evidence/conditions and affected Work Items; this is traceability, not another delivery register>
- **Renderer or consumer convention:** <verified requirement, or `Not established`>

---

Adapt sections to relevance and verified consumer requirements. This template does not establish enterprise governance, an approval matrix, required status vocabulary, a directory or renderer. Fresh `Accepted` requires actual applicable decision authority and agreement evidence; Research acknowledgment, Research/Plan/Review invocation, answers, reports, workers, Runner, role/picker selection, automatic Skill loading, quotes, automatic continuation, unsent prefill and delivery acceptance do not supply it. Only an eligible deliberate Implement request (manual Implement/remediation Skill invocation or retained natural-language request) with the inspected physical approved Plan under already-effective policy signs off listed complete exact Proposed snapshots without duplicate routine approval. The [core exact-record effect](../../rpir-lifecycle-core/SKILL.md#prospective-exact-adr-sign-off-recording-effect) owns separate coordinator-only Accepted/date/agreement metadata persistence and complete per-record readback; invocation alone is not persistence. On correction/resume verify unchanged already-recorded Accepted postimages, original exact Plan binding and agreement/recording evidence without requiring Proposed, re-signing or rewriting metadata. Changed/superseded content, uncertain agreement or unverifiable recording holds only dependent effects; preserve independent successes. Prior invocation/edits are not retroactive/self-activating and grant no general or worker/Runner/Review/helper ADR authorship. Preserve accepted/superseded rationale and other metadata; do not rewrite history.

Unconditional Accepted requires all applicable required decision approvals and decision-critical conditions to be satisfied. Otherwise retain Proposed or an explicitly qualified/pending state according to evidenced consumer conventions. Record actual agreement evidence and outstanding conditions separately from delivery approval and acceptance.
