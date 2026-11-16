# ADR 012: Copilot-native RPIR entry and exact-snapshot consent

## Record metadata

- **Status:** Accepted.
- **Substantive version:** v0.1, 2026-11-13; the complete document is the decision preimage.
- **Authored:** 2026-11-13.
- **Decision date:** 2026-11-13.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer supplies the Toolkit workflow requirements and is the evidenced decision authority. No additional approval body is established.
- **Agreement evidence:** Research revision 8 records Copilot-only forward development, best-practical assurance, agent-first entry, preservation of one-action exact-ADR agreement and guarded entry-adapter retirement. The engineer requested planning, confirmed the proposed VS Code 1.146.0+ baseline with runtime testing/activation remaining separately authorized, and requested physical Plan persistence in the existing topic. These are requirements/planning directions, not sign-off of this exact ADR or implementation/runtime authorization. The engineer's explicit `/implement` invocation on 2026-11-13 with the inspected associated Plan working v0.1 signed off this exact complete Proposed substantive v0.1, 2026-11-13 preimage; runtime testing and activation remain separately authorized.
- **Affected systems:** Four RPIR coordinators, lifecycle/ADR/implementation/review owners, four entry skills, manifest inventory, contract checks and user guidance.
- **Related decisions:** [ADR 005](005-implement-invocation-adr-sign-off.md), Proposed v0.2 D1, supplies exact-snapshot slash-based safeguards; [ADR 009](009-rpir-handoff-reliability.md), Accepted v0.1 D1-D3, supplies evidence-led handoffs/correction; [ADR 010](010-concise-rpir-output-contract.md), Accepted v0.1 D1, supplies concise outputs. None is rewritten or signed off by this record.
- **Source revisions:** Research substantive revision 8 and associated working Plan v0.1, 2026-11-13, in the local `029-rpir-harness-portability-restart` topic.

## Context and problem

The Toolkit has distinct Research, Plan, Implement and Review agents, but its converted entry skills retain prompt-file language, placeholders and slash-based authority assumptions. Loading a skill into a parent context does not bind that context to its named coordinator. A built-in `/plan` also exists, so an entry name alone cannot establish the Toolkit role or consent event. The reported picker change on Send has not been diagnosed as a historical root cause.

The engineer wants a practical native Copilot workflow rather than Local compatibility or a replacement host. Preserve deliberate human transitions, physical evidence, bounded approval, exact ADR sign-off and independent Review. A selected role, generated suggestion or apparent UI state must not become authorization by implication.

The three decisions share one entry/consent contract and rollout. Each remains separately identifiable; the Plan owns the sole delivery hierarchy.

## Decision and conditions

### D1 - Deliberate receiving-agent requests replace entry-adapter dependence

- **Choice and rationale:** Use the existing receiving custom agent and an explicit engineer-sent stage request with the actual physical predecessor. The receiver independently inspects kind, subject, substantive version, containment and direct lineage. Natural language need not use a fixed phrase or slash command. Identify the executing role from available actual evidence, not an assistant claim or picker label alone.
- **Realistic alternatives and reasoning:** Retaining or renaming entry skills preserves a discoverable shortcut but does not restore role binding. Restoring prompts reintroduces an adapter and unsupported cross-harness assumptions. A central orchestrator adds authority, tools and maintenance not needed for this outcome. Existing distinct agents are selected.
- **Actual selection or pending state:** Agent-first natural-language entry is the Plan's complete proposed implementation of the direction carried in Research. Exact-record sign-off is pending, not an unresolved competing architecture.
- **Conditions and affected Work Items:** Work Items 1-4. Publication, picker selection, skill loading, clarification, a report, worker output or an unsent/manual prefill does not invoke a phase. Missing or conflicting input/role identity constrains the dependent effect. Preserve discovery acknowledgment/explicit deferral, original-Plan correction, fresh evidence and independent re-review.

### D2 - One qualifying Implement request signs off only exact listed ADR preimages

- **Choice and rationale:** Under policy already effective before invocation, one explicit engineer request to the Implement coordinator with the inspected approved Plan both authorizes bounded delivery and signs off only each exact, decision-complete Proposed ADR preimage visibly enumerated in its handoff. No duplicate routine approval is requested.
- **Realistic alternatives and reasoning:** A second routine confirmation adds the action the engineer wishes to avoid. Generic agreement or any Plan-related message obscures the exact decision text and authorized effects. Retaining slash-only consent does not deliver the selected native entry experience. Extend the event while preserving the existing guards.
- **Actual selection or pending state:** The one-action outcome is carried from the engineer's direction; this exact natural-language contract is Proposed. It does not reinterpret any earlier invocation.
- **Conditions and affected Work Items:** Work Items 1, 3 and 4. Preserve exact path/ID, section, version/snapshot, Proposed state, actual authority/conditions and affected work. Implement alone may separately record permitted status/date/agreement metadata after preimage, containment, conflict, permission and condition checks, preserving decision text/history and reading back the complete postimage. Invocation is not persistence; failed/denied/unverified recording is not Accepted. Assess ADRs independently and hold only dependent effects. Workers, Runner, Review and helpers gain no ADR authorship/status authority. Bootstrap this delivery through the currently effective explicit `/implement` route; editing policy never self-upgrades a loaded session or gives retroactive sign-off.

### D3 - Retire the four entry adapters only after their replacements are verified

- **Choice and rationale:** Remove the `plan`, `implement`, `review` and `remediate-review` entry skills only after their useful functions have surviving normative owners, meaningful owner-local checks and separately authorized representative workflow evidence. Couple source removal, both manifest surfaces, inventory assertions and live references.
- **Realistic alternatives and reasoning:** Immediate deletion resolves naming overlap but can discard input, consent or administrative safeguards. Keeping corrected/renamed helpers or restoring prompts retains extra entry surfaces without solving their binding limitation. Guarded retirement preserves functionality before removing redundancy.
- **Actual selection or pending state:** Guarded retirement is carried from Research; the Plan proposes its explicit delivery/validation gate.
- **Conditions and affected Work Items:** Work Item 4 depends on Work Items 1-3. Preserve physical records, progress markers, checkpoints, correction and independent acceptance. Unavailable required workflow evidence leaves retirement incomplete, not passed. Retain detailed procedural skills; introduce no replacement entry helper. Bind post-retirement discovery evidence to the final payload/source.

## Consequences

- **Expected benefits:** Less entry ambiguity and one deliberate, inspectable consent event without a new coordinator or adapter layer.
- **Risks:** Native selection, Send and resume can behave differently; authored policy and static checks do not prove role continuity or instruction compliance. Runtime evidence must identify the actual client/payload and distinguish these cases.
- **Operational impact:** Coupled lifecycle, agent, verifier, fixture, inventory and documentation changes. Runtime testing/activation remains separately authorized.
- **Recovery:** Preserve user work and historical records. Repair attributable in-scope defects through Implement and fresh independent Review; changed architecture needs Plan-owned resolution. Do not silently restore adapters or rewrite accepted rationale.
- **Dependencies:** Supported native role discovery/selection, physical predecessor inspection, actual permission, exact sign-off conditions and separately authorized observations. Missing facts constrain their effects, not unrelated permitted work.

## Standards and practice alignment

Use the existing numbered Markdown ADR convention and lifecycle ownership. This is a practical workflow contract, not a platform-enforcement guarantee, enterprise approval matrix or new runtime permission.

## Open items and decision conditions

| Item | Affected effects | Owner / route | State |
| --- | --- | --- | --- |
| Exact-preimage agreement and recording | Dependent source changes | Engineer explicitly invokes Implement with the inspected Plan under already-effective policy; Implement separately verifies and records only guarded metadata with full readback | Pending; decision content complete |
| Actual role/loading/workflow evidence | Work Item 3 and dependent retirement in Work Item 4 | Separately authorized disposable observations or suitable supplied sanitized evidence, with actual identity/version | Unperformed; no authorization inferred |
| Any newly evidenced additional approval/condition | Only its dependent record/effect | Engineer-directed resolution; no invented board or blanket phase stop | None additionally established |

## References and implementation binding

- [Research revision 8](../copilot/029-rpir-harness-portability-restart/001-research-brief.md), especially the carry-forward requirements and shortcut-preservation map; ignored/local-only supporting evidence.
- **Associated Plan:** [001-implementation-plan.md](../copilot/029-rpir-harness-portability-restart/001-implementation-plan.md), working substantive v0.1, 2026-11-13; the only delivery hierarchy.
- **Coverage binding:** This complete Proposed v0.1 preimage: D1 -> Work Items 1-4; D2 -> Work Items 1, 3 and 4; D3 -> Work Item 4, with prerequisite preservation/validation in Work Items 1-3.
- **Retention/renderer:** Existing `docs/adr/` Markdown convention. Preserve prior ADRs and finalized lifecycle evidence; no reciprocal state/history edits.

Plan publication, answers, reports, workers, Runner, manual prefills and Review do not sign off this record. Only a qualifying explicit `/implement` with the inspected Plan, under policy effective before invocation, signs off this exact visibly bound Proposed preimage. Recording remains a separate Implement-only metadata effect; no general ADR authorship or runtime authorization is granted.
