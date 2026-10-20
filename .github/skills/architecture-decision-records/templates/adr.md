# ADR <consumer-assigned ID>: <decision title>

## Record metadata

- **Status:** <consumer convention; distinguish proposed decision state from delivery progress>
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
- **Renderer or consumer convention:** <verified requirement, or `Not established`>

---

Adapt sections to relevance and verified consumer requirements. This template does not establish enterprise governance, an approval matrix, required status vocabulary, a directory, or renderer. An `Accepted` state requires actual applicable decision authority and agreement evidence; it does not follow from Research acknowledgment, Plan invocation, `/implement`, Review, or delivery acceptance. Preserve accepted/superseded rationale; do not rewrite history.

Unconditional Accepted requires all applicable required decision approvals and decision-critical conditions to be satisfied. Otherwise retain Proposed or an explicitly qualified/pending state according to evidenced consumer conventions. Record actual agreement evidence and outstanding conditions separately from delivery approval and acceptance.
