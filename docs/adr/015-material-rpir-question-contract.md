# ADR 015: Material RPIR question contract

## Record metadata

- **Status:** Accepted.
- **Substantive version or snapshot:** v0.1, 2026-11-17; the complete document is the decision snapshot.
- **Authored:** 2026-11-17.
- **Decision date:** 2026-11-17.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer is the evidenced decision authority for this Toolkit objective. No additional approval body is established.
- **Agreement evidence:** On 2026-11-17 at 10:01:25 UTC the engineer explicitly invoked `/implement` with the inspected associated Plan working substantive v0.1, 2026-11-17, signing off only this complete Proposed substantive v0.1, 2026-11-17 preimage, D1, for WI-1. The exact-snapshot rule was effective before this invocation; the engineer is the evidenced decision authority and no additional approval body or unsatisfied decision-critical condition is established. Preserve D1's actual-answer, free-text, waiting and manual-transition conditions. Research revision 11's earlier direction established the outcome, not exact-preimage agreement. This metadata records the invocation separately from the Implement coordinator's save and complete postimage readback; it does not establish delivery acceptance or runtime behavior.
- **Affected systems:** Shared question-resolution guidance, clarification and discovery resources, phase-coordinator wording, assurance, and authored-contract checks.
- **Related decisions:** [ADR 010](010-concise-rpir-output-contract.md), Accepted v0.1 D1, currently makes structured labels and lettered paths optional. Preserve its accepted text and history; this proposal would prospectively refine the material-choice presentation rule only. [ADR 011](011-research-complete-technical-handoffs.md), Accepted v0.1 D1, retains phase ownership and actual-answer safeguards.
- **Source revisions:** [Research revision 11](../copilot/030-rpir-fresh-project-test-failures/001-research-brief.md), especially “Question presentation” and “ADR inputs and remaining gaps.”

## Context and problem

The current shared question guidance permits direct questions without labels or lettered alternatives, including for material choices. The engineer's reported test expected a sequential, explained decision with meaningful options, a recommended route and a wait for the actual answer. The loaded guidance and static checks did not consistently encode that desired presentation, and the observed conversation also bundled independent decisions.

The change concerns how material engineer decisions are presented, not a new interface or approval route. Actual qualified, nonrecommended, unknown and free-text answers must remain valid. A recommendation is not a substitute for the engineer's choice, and a response is not approval of a phase transition.

## Decision and conditions

### D1 — Ask one material decision at a time using a structured, non-forcing presentation

- **Choice and rationale:** For a material engineer-facing choice, ask one decision at a time. Briefly explain the relevant known facts, uncertainty and affected action in plain English; present meaningful lettered alternatives ending with a genuine free-text/unknown/other route; identify the recommendation and its reason; then stop for the engineer's actual response before dependent questions or effects. Keep simple factual evidence requests to one direct question and offer practical evidence routes rather than inventing competing facts.
- **Realistic alternatives and reasoning:** Retaining optional lettered choices preserves concise simple questions but repeats the observed omission for material decisions. Requiring a new question UI or hook adds machinery without evidence it is needed. A coordinated shared-owner contract and focused authored checks address the demonstrated policy inconsistency without claiming deterministic model enforcement.
- **Actual selection or pending state:** This is the Plan's Proposed mechanism. Research records the engineer's intended outcome and format, but no agreement to this exact ADR preimage is claimed.
- **Conditions and affected Work Items:** Work Item 1 in the associated Plan. Preserve actual qualified, nonrecommended and unknown answers and their conditions; do not force a letter-only answer or the recommendation. Treat automatic continuation, tool output, worker output and unsent prefills as distinct from deliberate engineer input. Waiting, acknowledgment and manual phase-transition safeguards remain unchanged.

## Consequences

- **Benefits:** A material choice is presented sequentially with enough context to support an informed answer and without silently treating the recommendation as the selection.
- **Risks and technical debt:** A mandatory structure can make trivial factual questions needlessly verbose if applied indiscriminately; retain the simple factual-request distinction. Authored guidance and static checks do not prove live adherence.
- **Operational impact:** Align the shared question owner, its clarification/discovery resources, directly affected coordinator guidance, assurance and focused contract fixtures. No UI, tool, hook, dependency or automatic-transition mechanism is introduced.
- **Reversibility and recovery constraints:** A future material reversal requires a newly approved Plan and decision record; preserve this Proposed record and ADR 010's accepted history.
- **Dependencies:** The shared guidance and test surfaces must be updated together. Runtime conversation claims require separately authorized, version-bound observation.

## Standards and practice alignment

Use the existing numbered Markdown `docs/adr/` convention and shipped ADR template. No external standard or enterprise governance is asserted.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Exact-preimage agreement and recording | Work Item 1 | Engineer and Implement coordinator under the policy effective at invocation | A qualifying deliberate Implement request with the inspected approved Plan and this exact Proposed preimage visibly bound; separately verify any permitted metadata recording and full readback | Pending; proposal content is complete |
| Actual question behavior | Runtime claims only | Engineer-directed authorization if needed | Version-bound observation after implementation; static checks establish authored contract only | Not observed |

## References and implementation binding

- [Research revision 11](../copilot/030-rpir-fresh-project-test-failures/001-research-brief.md), “Question presentation” and “ADR inputs and remaining gaps”; the research identifies the conflict with ADR 010 and the engineer's intended outcome.
- **Associated Plan:** [001-implementation-plan.md](../copilot/030-rpir-fresh-project-test-failures/001-implementation-plan.md), working v0.1; sole delivery hierarchy and acceptance authority.
- **Coverage binding:** This complete Proposed v0.1 preimage, D1 → Work Item 1. The Plan binds this ADR's path, section, version, state, actual agreement evidence/conditions and affected Work Item.
- **Renderer or consumer convention:** Existing numbered Markdown files in `docs/adr/`, as verified in this repository.

---

Only a qualifying deliberate Implement request with the inspected Plan can sign off this exact Proposed preimage under the prospective exact-snapshot rule, when that rule was effective before invocation. Plan requests, answers, reports, workers, Script Runner, role selection and unsent prefills are not sign-off. Invocation and any separately guarded metadata persistence are distinct; a failed or unverifiable save is not `Accepted`. This record grants no runtime permission.
