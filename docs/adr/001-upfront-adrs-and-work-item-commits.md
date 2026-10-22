# ADR 001: Upfront architectural coverage and expected Work Item checkpoints

## Record metadata

- **Status:** Proposed.
- **Substantive version:** v0.1, 2026-10-21.
- **Authored:** 2026-10-21.
- **Decision date:** Not yet decided as an accepted architectural record.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The requesting engineer supplied the requirements recorded in Research and selected this ADR destination/template/Proposed state in the Plan conversation. GitHub Copilot provides analysis and drafting, not decision authority. No enterprise decision authority or approval matrix has been established.
- **Agreement evidence:** The inspected Research v1.0 records the engineer's final direction: all architectural decisions upfront during Research/Plan, minor coding choices in Implement without ADR reference, and normal commits after completed validated Work Items with justified departures. In the Plan conversation on 2026-10-21, the engineer replied “A” to the option selecting `docs/adr/001-upfront-adrs-and-work-item-commits.md`, its directory creation, existing template and Proposed state. That answer selects the record arrangement; it is not unconditional agreement to this substantive ADR, an Accepted claim, an Implement invocation or Git authority.
- **Affected systems:** Prospective UKHO Copilot Toolkit RPIR customization policy, Research/Plan/Implement/Review guidance, shared skills/templates, static contract checks and user documentation. No calculator application changes.
- **Related decisions:** No other adopted toolkit ADR was established by the bounded investigation. No reciprocal register or other ADR is changed.
- **Source revisions:** Physical Research brief v1.0 and associated working Plan v0.2, both dated 2026-10-21, linked below. These local lifecycle records may be ignored/unavailable in a versioned checkout; the rationale here is standalone.

## Context and problem

A reported calculator trial initially omitted an ADR and produced no local implementation commits. The inspected Research records that an ADR was later created after engineer intervention, while the physical calculator Plan expressly prohibited staging and commits. The implementation report recorded unattempted, prohibited checkpoints rather than failed Git operations. Those documents do not establish the actual repository history, installed extension loading or full conversation chronology.

Current toolkit guidance intentionally makes ADR applicability selective and Plan Git strategy conditional on commits being intended. The existing template has conditional ADR binding and no per-Work-Item commit field. Downstream checks mainly test consistency with records that happen to be bound. The verifier also couples a Research checkpoint assertion to an architectural-discovery paragraph opener. A template-only change could therefore remain contradicted by policy, downstream assessment and static tests.

The engineer's desired outcome is proactive architectural coverage and normal Work Item checkpoint planning in future sessions, without repeated prompting. The final Research clarification excludes minor technical coding choices from ADR reference requirements. Project size or easy reversibility must not justify missing architectural coverage. Existing ownership, containment, approval and Git safety limits must remain intact.

## Decision and conditions

The proposed operating model aligns existing capability owners, not a new agent, execution service or runtime hook. The two related choices below share the same cross-phase policy context and governance, but retain distinct rationale and alternatives. The associated Plan remains the only delivery hierarchy.

### D1 — Identify architecture early and reconcile complete coverage by Plan

Research identifies architectural choices, drivers, realistic alternatives, existing decision evidence, actual engineer selections and unresolved conditions after permitted discovery. Plan reconciles those choices and planning discoveries against inspected ADR coverage before dependent architectural effects.

Coverage can reuse verified appropriate ADRs or group tightly related choices with shared rationale. Each choice remains identifiable with its alternatives, reasoning, state, conditions and affected work. Independently changing decision states, authorities or supersession paths favour separate records. Proportionality controls detail, not whether architecture is covered; a vague umbrella ADR is insufficient.

Component topology, technology/toolchain commitments, public contracts and security/data boundaries are useful architecture signals. Dependency or test-framework changes require context rather than automatic classification. Naming, helper extraction and architecture-preserving repairs remain ordinary implementation choices without an ADR reference. Material ambiguity goes to the engineer with evidence.

Plan alone retains the narrow associated-Proposed-ADR authorship exception, including verified consumer conventions and separately guarded directory/file effects. Research, Implement, Review, workers and Script Runner gain no ADR authorship. Unexpected uncovered or changed architecture in Implement is surfaced for engineer-directed Plan resolution before dependent effects; independent approved work continues. Required coverage does not invent decisions, Accepted state or a phase-wide invocation veto.

### D2 — Require explicit checkpoint planning; retain conditional execution

Every prospective Plan states one bounded local staging/append-only strategy. Each Work Item references it and states its normal post-validation checkpoint boundary, coherent content and purpose, or a specific justified combination, deferral or no-commit exception. Reasons identify the actual constraint, affected work, validation/dependency impact and later boundary where applicable. Unknown future obstacles are not invented planning-time excuses.

Implement accounts for each expected boundary before unrelated work using verified checkpoint evidence or a specific actual disposition. Runtime obstacles belong in fresh implementation evidence, not substantive edits to an approved Plan. Review and advisory assurance assess omissions and reasons, not commit count as technical correctness or acceptance.

An inspected Plan strategy authorises covered local Git effects only after the explicit Implement transition and subject to runtime safeguards. Silent/prohibiting/unapproved Plans still supply no Git authority. Script Runner alone executes compatible local index/history effects. Preserve candidate identity/ownership, staged-snapshot validation, local excludes, helper/signing/permission constraints, drift checks and uncertain-completion reconciliation. Verified non-Git/no-eligible-change cases differ from unavailable or ambiguous Git facts. No init, force-add, empty commits, identity invention, hook bypass, network effect or history rewrite is permitted to meet cadence.

### Conditions and effect boundaries

- This record is Proposed, not Accepted. Documented engineer requirements and the destination selection are attributed above; architectural agreement, delivery approval, runtime permission and Review acceptance remain separate.
- The associated Plan binds this exact v0.1 snapshot for Work Items 2 and 3. Implement must inspect it and resolve any material mismatch or newly evidenced decision-critical condition before dependent effects. Work Item 1's behaviour-preserving verifier repair does not depend on D1/D2 adoption.
- No additional enterprise approval prerequisite or decision-critical condition has been evidenced; none is invented. If an applicable governance requirement or disputed architectural choice emerges, identify and resolve that particular dependency with the engineer while continuing independent approved work. Proposed state alone is not an automatic ban on Plan invocation or independent delivery.
- This draft does not itself authorise implementation, staging, commits or checkpointing of this ADR/Plan. The Plan's G1 excludes earlier Plan-phase authorship effects; a distinct applicable bounded grant would be needed to checkpoint them. A versioned implementation checkpoint may therefore omit this decision record, which must be disclosed rather than called self-contained.
- Historical records, calculator source and current prohibitions remain unchanged. Runtime activation, packaging, installation and distribution remain outside this objective.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| Retain selective ADRs and discretionary commit planning | Least authoring effort; matches current owners | Allows the reported omissions and repeated engineer intervention | Not recommended for the stated outcome |
| Amend only the Plan template | Visible at engineer inspection; small diff | Conflicting shared policy, downstream owners and verifier assertions remain | Not recommended as the sole change |
| Align existing owners for D1 and D2 | Reuses established roles, capabilities and safeguards; makes omissions assessable across phases | Coordinated policy/test/documentation maintenance; semantic judgement still needed | Recommended proposal; not an Accepted decision |
| Record every coding choice in an ADR | Maximises nominal traceability | Contradicts the final routine-coding exclusion; excessive noise and unnecessary Plan returns | Outside the final requirement |
| Add automatic enforcement hooks/service | Potential mechanical enforcement of some boundaries | New permission/execution effects; cannot guarantee semantic architecture completeness; need not bypass real constraints | Not selected in this proposal; no established need |
| Force every Task/file into a commit or defer all commits to session end | Simple mechanical cadence | Artificial splits, incoherent snapshots or silent boundary omissions | Not recommended; use coherent Work Item checkpoints and justified exceptions |

## Consequences

- **Expected benefits:** Architectural omissions and unexplained checkpoint departures become explicit before engineer inspection and in downstream evidence. Routine coding discretion and existing execution ownership are retained.
- **Risks and debt:** Architecture classification, meaningful grouping and exception quality require judgement. Headings/keywords can produce superficial compliance; use semantic inspection and owner-local negative/additive fixtures. Documentation effort grows with real architectural complexity, not every local edit.
- **Operational impact:** No new service, dependency, tool, permission or enterprise governance process is introduced. Maintainers must keep policy, agents, skills, templates, tests and user summaries aligned. Static passes cannot establish installed loading or actual agent behaviour.
- **Reversibility and recovery:** Future policy can be reconsidered with new evidence and a new decision/Plan. Preserve accepted/superseded rationale and historical approved records rather than rewrite them. The associated Plan owns attributable repair, sequencing and verification; this ADR grants no Git rollback or history-rewrite permission.
- **Dependencies:** Existing lifecycle, ADR and checkpoint capability boundaries; bound Plan/version and manual transition; actual local runtime facts for each Git effect. Installed conversation behaviour remains unverified pending separate activation authorisation.

## Standards and practice alignment

The proposal preserves the inspected repository's manual RPIR transitions, one delivery hierarchy, contained physical lineage, Plan-only Proposed-ADR exception and Runner-only guarded Git mutation. It changes prospective applicability/planning defaults, not the twelve lifecycle-record patterns or the current session's permissions. No enterprise architecture standard, mandatory renderer, approval matrix or compliance certification has been established or claimed.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Record destination and Proposed format | This ADR's guarded directory/file save and Plan binding | Requesting engineer; Plan coordinator performs authorised draft save | Engineer's Plan-chat “A” on 2026-10-21 selects the offered path/template/state | Resolved selection; actual persistence verified separately |
| Substantive architectural acceptance | No unconditional Accepted claim or invented approval evidence | Applicable decision authority not established beyond the attributed engineer requirements | Record actual applicable agreement/conditions if supplied; escalate any newly evidenced governance requirement before dependent effects | Proposed; no unconditional acceptance asserted |
| Runtime effectiveness | Static delivery cannot prove unprompted coverage or actual commit timing | Engineer selects any future authorised evaluation | Separately authorised consumer conversation/Git evaluation; no activation by this record | Unverified; outside required static delivery |
| Actual Git eligibility and snapshot safety | Each local checkpoint | Implement coordinator and Script Runner within their existing boundaries | Runtime inspection under the actual approved Plan and shared checkpoint procedure | Deferred to each candidate; not a reason to invent a no-commit exception |

## References and implementation binding

- [Research brief v1.0](../copilot/020-upfront-adrs-and-work-item-commits/001-research-brief.md), 2026-10-21: final intent, existing evidence, options and limits. Local-only lifecycle input; may be unavailable outside this workspace.
- **Associated Plan:** [001-implementation-plan.md](../copilot/020-upfront-adrs-and-work-item-commits/001-implementation-plan.md), working substantive v0.2, 2026-10-21; pending its separate save/readback at ADR drafting time. Work Items 2 and 3 depend on D1/D2; Work Item 1 is independent. The Plan alone owns scope, hierarchy, acceptance and bounded G1 strategy.
- [ADR capability](../../.github/skills/architecture-decision-records/SKILL.md), [ADR template](../../.github/skills/architecture-decision-records/templates/adr.md), [lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) and [checkpoint capability](../../.github/skills/local-git-checkpoints/SKILL.md): inspected current operating constraints, not evidence that proposed future defaults already operate.
- **Consumer convention:** The engineer selected this contained path, the existing template, Proposed state and retained rationale for this directly associated record. It does not establish a universal consumer destination or approval matrix.
- **Renderer:** No special requirement established; ordinary repository Markdown.

This supplementary ADR is not a canonical RPIR predecessor, approval, phase invocation or acceptance record. Its actual save/readback and the separate Plan binding are reported independently by the coordinator.