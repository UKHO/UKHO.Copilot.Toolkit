# Research input coverage for architecture decisions

Use this map when a decision's significance and evidence make the input relevant. It is a coverage aid, not a 22-question script, completeness score, or requirement to repeat supplied answers. Cite existing Research sections rather than duplicating them. Record a supported fact, an attributed statement, a labelled candidate/assumption, a reasoned not-applicable disposition, or an unresolved item with its consequence and route. Unknown is not `None`.

| Sample input | Research evidence or disposition when relevant | Downstream ownership |
| --- | --- | --- |
| 1.1 Decision title | Provisional topic/decision subject; do not present a recommendation as a selected decision. | Plan establishes final title and consumer-conformant ID. |
| 1.2 Decision type | Relevant strategic, tactical, operational, security, data, or infrastructure dimensions; multiple may apply. | Plan/ADR may use an evidenced consumer taxonomy; no classification gate. |
| 1.3 Authors | Known contributors and provenance; distinguish requester from author and carry uncertainty. | Plan establishes actual author(s); do not infer names. |
| 1.4 Stakeholders | Affected teams/users and known participants; distinguish consulted people from decision-makers/approvers. | Applicable authority and actual agreement evidence must be verified. |
| 1.5 Related systems | Affected systems, interfaces, dependencies and confidence/source. | Plan refines impact boundaries and qualifies unverified relationships. |
| 2.1 Current state | Decision-relevant baseline, source citations, and stale/missing documentation limits. | ADR may summarize verified state and use a useful diagram if warranted. |
| 2.2 Problem/challenge | Engineer-stated or evidenced problem and affected people. | Preserve the problem; do not retrofit a predetermined technology. |
| 2.3 Constraints | Relevant budget, time, regulatory, security, technology, and compatibility constraints; label hard limits versus preferences. | Plan owns formal delivery boundaries and acceptance criteria. |
| 2.4 Drivers | Why a change matters, with evidence or attribution; no invented urgency or mandate. | ADR preserves rationale and verifies any claimed standard. |
| 2.5 Risks if nothing changes | Consequences and costs of retaining the current approach, when material. | Distinguish baseline risks from risks introduced by a proposed change. |
| 3.1 What is changing | Candidate architectural change and what remains unchanged. | Plan owns approved scope and design details. |
| 3.2 Decision statement | Evidence-supported recommendation separately from any actual choice, agreement, condition, and evidence/version. | Plan/ADR states whether proposed or actually agreed; new choices need actual consideration. |
| 3.3 Alternatives considered | Realistic options and evidence, including the current approach where useful. | Reuse analysis and revisit only when material new evidence warrants it. |
| 3.4 Why alternatives rejected | Reasons each material option is not recommended or was actually rejected; distinguish analysis from human decision. | Preserve option-specific reasoning without mislabelling nonselection as formal rejection. |
| 3.5 Scope/components | Likely components, blast radius, exclusions, and uncertainties—not approved delivery scope. | Plan owns formal scope, hierarchy, dependencies, and acceptance. |
| 4.1 Positive outcomes | Desired outcomes and option-specific benefits; label estimates/candidate signals. | Plan defines observable delivery acceptance; ADR retains benefit rationale. |
| 4.2 Risks introduced | Material risks, assumptions, supported mitigations, and residual unknowns. | Plan refines approved controls and validation without claiming unsupported elimination. |
| 4.3 Technical debt | Workarounds, dual-running, deferred work, follow-on burden, and exit implications. | Plan owns authorized debt-management work and ownership; do not invent commitments. |
| 4.4 Operational impact | Relevant support ownership, skills, monitoring, incidents, on-call, backup/DR, and recurring costs. | Plan owns delivery/run-book/support changes and acceptance where in scope. |
| 4.5 Delivery approach | Feasibility constraints that could change the choice (for example downtime or coexistence); do not prescribe rollout prematurely. | Plan owns rollout, migration, sequencing, and formal delivery work. |
| 4.6 Rollback strategy | Reversibility, compatibility, fallback feasibility, and irreversible steps when decision-relevant; do not promise unverified rollback. | Plan owns detailed recovery tasks and validation. |
| 4.7 Dependencies | Consequential platform, team, procurement, licensing, data, network, or provider prerequisites and their evidence/unknowns. | Plan owns delivery dependencies, sequencing, and checks; obtain rather than invent commitments. |

## Supporting ADR content

- **Practice alignment:** Include relevant security, integration, cloud, resilience, and data-governance standards only when actual sources/evidence exist. Unknown standards remain unknown; justified N/A is acceptable.
- **Assumptions and costs:** Distinguish facts, engineer statements, estimates, and untested assumptions. Capture decision-relevant licensing, compatibility, operating, and cost trade-offs.
- **Diagrams and evidence:** Inspect only relevant sources within Research's existing boundaries. Diagrams are optional; target renderer compatibility requires separate evidence.
- **Related decisions and references:** Identify related ADRs/sources where available; absence of evidence is not proof that none exist. Label local-only or unavailable RPIR references and include enough rationale in the ADR itself to remain understandable without them.
- **Open items and agreement:** Record material issue, consequence, affected decision/work, known owner or owner-to-identify, and route. Preserve actual participants, roles, chosen substantive version, date, conditions, and evidence. Empty or unverified sign-off is not approval.
- **Plan-only content:** Formal hierarchy, rollout/recovery, delivery acceptance, IDs/filenames/destination and document authorship may be finalized by their owning phase using consumer conventions. Do not make Research's map a second questionnaire or Plan's binding a second approval ritual.

Routine naming changes and local bug corrections normally need no ADR. Lasting cross-component effects, material security/data/operating commitments, difficult reversal, meaningful alternatives, or expected future challenge are relevance signals, not universal thresholds. If relevance is disputed, the engineer/consumer decides under applicable policy.
