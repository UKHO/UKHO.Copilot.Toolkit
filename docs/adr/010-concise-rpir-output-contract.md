# ADR 010: Concise, phase-owned RPIR outputs

## Record metadata

- **Status:** Accepted.
- **Substantive version:** v0.1, 2026-11-04; the full document is the decision snapshot.
- **Authored:** 2026-11-04.
- **Decision date:** 2026-11-06.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer supplied the requirements and is the decision authority for this Toolkit objective. No additional approval body is evidenced.
- **Agreement evidence:** On 2026-11-06 the engineer explicitly invoked `/implement` with the independently inspected `docs/copilot/027-concise-rpir-outputs/001-implementation-plan.md`, working v0.1, 2026-11-04, signing off only ADR 010's full Proposed substantive v0.1, 2026-11-04 preimage, D1 — One shared reader-facing contract, with phase-owned detail, for Work Items 1–3. The prospective exact-snapshot rule was effective before that invocation; the engineer is the evidenced decision authority and no additional approval body or outstanding decision-critical condition is evidenced. Preservation of A3–A4 remains binding on delivery. Research revision 1's earlier agreement covered the outcome and exclusions, not this mechanism. This metadata records the qualifying agreement event; persistence is separately verified by the Implement coordinator's complete saved-record readback.
- **Affected systems:** Toolkit RPIR reader-facing guidance, four phase templates, question presentation, evidence assessment and static contract tests.
- **Related decisions:** [ADR 009](009-rpir-handoff-reliability.md), Accepted v0.1, supplies evidence-led handoffs and authorized correction. [ADR 004](004-decision-complete-rpir-plans.md), Proposed v0.1, and [ADR 005](005-implement-invocation-adr-sign-off.md), Proposed v0.2, describe decision readiness and exact-snapshot sign-off. Their states and text remain unchanged.
- **Source revisions:** [Research revision 1](../copilot/027-concise-rpir-outputs/001-research-brief.md) and [Plan v0.1](../copilot/027-concise-rpir-outputs/001-implementation-plan.md), both 2026-11-04. These local-only contextual links are not needed to understand the decision below.

## Context and problem

RPIR has necessary checks for understanding, authority, saved records, architectural decisions, validation and independent Review. Its current output guidance also asks multiple phases to repeat background, architectural rationale and operational procedures. Mandatory question wrappers and discovery-change fields can make simple exchanges and handovers harder to read.

The requested change is to future output, not historical evidence or phase authority. Concision must not hide an unresolved decision, a failed check or an unverified save. An ADR must remain intelligible independently of local workflow reports. Static checks can test authored obligations, but cannot prove plain-English quality or improved live conversations.

## Decision and conditions

### D1 — One shared reader-facing contract, with phase-owned detail

- **Choice and rationale:** Adopt a shared output rule in the lifecycle core and align its consumers. State relevant results once, use plain English, and link inspected upstream evidence rather than retell it. Keep phase-specific content in the four existing templates. Research records the resulting agreed or provisional understanding, attributed selections and consequential unknowns, not a running discovery or Q&A history. Plan owns deliverables, work and acceptance; Implement reports delivery and actual checks; Review reports its independent conclusion and findings.
- **Question presentation:** Ask a direct contextual question when sufficient. Add supported advice, alternatives and trade-offs where they help resolve a material choice or acquire missing evidence; do not require four labels or lettered paths in every exchange. Retain the actual discovery, readback, acknowledgment/waiting, explicit-deferral and material-decision safeguards. Changing presentation does not turn an answer into approval.
- **Evidence presentation:** Separate required actions from required narration. Omit irrelevant headings and repetitive empty entries. Keep current material outcomes, failures, unavailable/not-run required checks, unresolved limits and next actions visible. Concise linked evidence may support per-boundary checkpoint and marker assessment without a running process diary; do not infer timing from final state or omit an expected boundary. Keep exact Plan/ADR handoff bindings and per-record invocation/persistence outcomes visible, without copying decision rationale into every report. A missing or unreadable source is an evidence gap, never proof of inspection or permission.
- **Realistic alternatives and reasoning:** Template-only edits are cheaper but leave conflicting mandatory guidance. Chat-only changes leave saved reports repetitive. Hard length limits are easy to count but can conceal complex risks and decision conditions. Coordinated guidance and validation are selected for this proposal because they address both outputs while preserving evidence and authority.
- **Actual selection or pending state:** The Plan specifies the coordinated design above as the sole proposed approach. The engineer has agreed the outcome, not yet signed off this exact mechanism. There is no competing unresolved design option in the Plan; the remaining decision event is exact-snapshot approval through `/implement` under effective policy.
- **Conditions and affected Work Items:** Work Items 1–3. Preserve manual transitions, physical lineage and save/readback checks, permissions, actual qualified/nonrecommended answers, bounded factual routes, complete ADR coverage and standalone rationale, exact sign-off/recording, incremental markers, checkpoint safeguards and independent Review. Do not edit historical lifecycle records, accepted ADR rationale, tools, routes, models, effort settings, packaging or activation. If implementation reveals a material authority or compatibility change, seek engineer-directed Plan resolution before that affected effect.

## Consequences

- **Expected benefit:** Less repeated background and process narration in saved reports and chat. This is an intended improvement, not a measured runtime result.
- **Risk:** Authors may mistake shorter reporting for permission to skip checks. Explicit protected obligations and negative regression fixtures must guard that distinction. Links reduce repetition but require inspected destinations, sections and versions; essential unresolved outcomes must not disappear behind them.
- **Validation:** Existing contract checks plus manually assessed synthetic output pairs cover concise success, complex qualified decisions, failed/partial delivery and unavailable sources. These establish authored-delivery evidence only. No word-count gate, automated prose judge, new dependency or live-session requirement is introduced.
- **Operational impact:** Existing roles, tools, manual transitions and support commitments remain unchanged. Current-session policy is not upgraded by editing its files.
- **Recovery:** Correct attributable changes using actual preimages without overwriting user work. A material future reversal requires a newly approved Plan and decision record rather than rewriting accepted history.

## Standards and practice alignment

Uses the existing numbered Markdown `docs/adr/` convention and repository ADR template. No external standard compliance, new renderer or enterprise governance is asserted.

## Open items and decision conditions

| Item | Affected work | Resolution route | State |
| --- | --- | --- | --- |
| Exact-snapshot sign-off and separately verified recording | Source effects implementing D1, Work Items 1–3 | Engineer explicitly invokes `/implement` with Plan v0.1 and this exact Proposed v0.1 D1 snapshot under policy already effective before invocation; Implement verifies authority/conditions, records only permitted metadata and reads it back | Pending invocation and persistence, not missing design content |
| Actual validation capability and results | Required Work Item exit gates and claims | Follow the Plan's bounded capability check; report unavailable or failed evidence without installing dependencies or claiming success | Execution facts not yet observed |
| Actual conversational improvement | Runtime claims only | Separately authorized version-bound live observation | Outside this delivery and unverified |

## References and implementation binding

- **Associated Plan:** [001-implementation-plan.md](../copilot/027-concise-rpir-outputs/001-implementation-plan.md), v0.1, 2026-11-04; sole delivery hierarchy and acceptance authority.
- **Coverage binding:** D1, this full Proposed substantive v0.1 snapshot → Work Items 1–3. Related ADRs 004, 005 and 009 are baseline evidence, not additional sign-off or status-write targets.
- **Retention:** Preserve prior records and accepted history; no reciprocal ADR or register edits.

Only a qualifying explicit `/implement` with the inspected Plan signs off this exact visibly identified Proposed snapshot, when the rule is effective before invocation. Plan creation, answers, reports, workers, Script Runner, manual prefills and `/review` are not sign-off. Implement alone may separately record the guarded status/date/agreement metadata; invocation is not proof of persistence. A failed, denied, conflicting or unreadable save is not persisted `Accepted`: only the affected work must wait. No retroactivity, general ADR authorship or runtime permission is granted.