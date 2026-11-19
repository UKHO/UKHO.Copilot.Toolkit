# ADR 019: Specialist-led RPIR coordination and resilient Research gates

## Record metadata

- **Status:** Accepted.
- **Substantive version or snapshot:** v0.1; this complete physical record is the proposed decision preimage.
- **Authored:** 2026-11-18.
- **Decision date:** 2026-11-18.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer selected mandatory specialist execution for significant phase work, mandatory Research Q&A/readback, and technical safeguards where feasible with a workable fallback. This is agreement to the direction recorded in Research, not sign-off of this exact ADR preimage. No additional approval body is established.
- **Agreement evidence:** [Research revision 6](../copilot/033-rpir-harness-test-failures/001-research-brief.md), “Answer and scope,” “Intent and discovery,” and “ADR inputs and remaining gaps”; the engineer's deliberate `/implement` request on 2026-11-18 with the inspected physical [Plan v0.1](../copilot/033-rpir-harness-test-failures/001-implementation-plan.md), binding this exact ADR 019 Proposed v0.1 preimage.
- **Affected systems:** The four RPIR coordinator agent definitions, their phase Skills, named specialist routes, static contract checks, and separately authorized Agent Host conformance observations.
- **Related decisions:** [ADR 010](010-concise-rpir-output-contract.md), D1, retains the readback and actual-answer safeguards. [ADR 012](012-copilot-native-rpir-entry-and-consent.md), D1, retains the four-agent workflow and manual transitions. [ADR 013](013-copilot-role-capabilities-and-research-setup.md), D1, establishes named specialists and behavioral rather than native per-parent delegation boundaries. [ADR 015](015-material-rpir-question-contract.md), D1, retains the material-question contract and its existing position on new question UI/hooks. [ADR 018](018-phase-scoped-script-runner-execution-and-directory-setup.md), D1-D3, retains the Script Runner execution and setup route.
- **Source revisions:** Research revision 6 and the associated working Plan v0.1, 2026-11-18, in `docs/copilot/033-rpir-harness-test-failures/`.

## Context and problem

The two supplied harness reports describe different failures. Harness 1 reports substantive work without a clarifying exchange and machine-scope effects; its active Research role was not established. Harness 2 reports that Research asked an appropriate question, but a later critique/repair path rejected the phase-correct response and produced implementation changes. The Research brief treats these as reported observations, not independently verified logs or proof of a single cause.

The current four coordinators have named specialist routes, but their instructions say to use specialists “when useful.” Their native Copilot configuration does not provide a documented per-coordinator worker allowlist or a “must delegate” field. The Research readback rule is authored, but no documented custom-agent setting verifies human acknowledgment or prevents a later answer-revision step from replacing the surfaced response. Static text checks cannot establish runtime enforcement.

The engineer selected the work boundaries below: existing coordinators remain coordinators; significant work is performed by named specialists; Research waits for actual engineer input and acknowledged understanding; technical safeguards are used where supported, while a workable manual fallback remains available. This decision does not claim that a prompt is a platform boundary.

## Decision and conditions

### D1 — Require named specialists to perform significant work

- **Choice and rationale:** The four existing coordinators assign every significant investigation, analysis, drafting, source edit, command, test, or review to the appropriate named specialist. Coordinator-owned exceptions are brief orientation, engineer dialogue and decisions, bounded assignment, verification of returned evidence/effects, synthesis, and authorship/readback of that coordinator’s physical phase record. Preserve the current phase-specific worker lists; do not introduce a fifth orchestrator or generic worker.
- **Realistic alternatives and reasoning:** Optional delegation preserves the current wording but does not satisfy the engineer’s selected requirement and matches the observed risk. Coordinator self-substitution would leave the specialist outcome unfulfilled. A new central orchestrator adds an unselected role and authority. The four existing coordinators with mandatory specialist assignments are selected.
- **Actual selection or pending state:** The requirement is selected in Research. This ADR records the proposed operating contract; it does not establish a native enforcement mechanism or runtime compliance.
- **Conditions and affected Work Items:** Associated Plan Work Item 1. Research, Plan, Implement, and Review each use their existing named specialist routes. A missing or ambiguous specialist is reported and referred to the engineer for an alternate route; the coordinator does not silently perform the assigned significant work. Script Runner remains the command executor where the applicable phase requires that route. Worker findings do not grant scope, edit, approval, lifecycle, or acceptance authority.

### D2 — Preserve the Research gate in the final surfaced response

- **Choice and rationale:** Research asks and waits for the engineer’s actual answer and acknowledged/corrected readback before significant investigation or other substantive effects. A later critic, repair instruction, or automatic continuation must not turn a phase-correct Research question or stop into implementation work. The final surfaced response and observed effects, not only an intermediate draft, are the relevant conformance evidence.
- **Realistic alternatives and reasoning:** Treating the first draft as sufficient does not protect against a later replacement and does not address the Harness 2 report. A dedicated question UI, hook, or controller could add a technical gate, but the inspected evidence does not establish its availability, acknowledgment awareness, or fail-closed behavior on the target host. The human-mediated question/answer/readback gate is the workable fallback selected by the engineer; no new UI, hook, or controller is selected in this decision.
- **Actual selection or pending state:** Mandatory Q&A/readback and a non-blocking fallback are selected in Research. The exact native host mechanism remains unverified and is not represented as a selected technical guarantee.
- **Conditions and affected Work Items:** Associated Plan Work Items 1 and 3. Before acknowledgment, Research performs no significant investigation delegation, source edit, command, package install, environment change, or other substantive effect. It accepts natural-language answers and corrections and does not infer acknowledgment from silence, a tool result, or automatic continuation. Manual phase handoffs remain deliberate and separate from acknowledgment.

### D3 — Use tested behavioral fallback; do not invent technical enforcement

- **Choice and rationale:** Retain the existing role and Script Runner tool routes while encoding the selected coordinator boundaries and adding focused authored-contract checks. Use only a technical control that is actually documented and verified for the supported Agent Host; any newly proposed hook, broker, record writer, or tool-boundary change requires evidence and a separately scoped engineer decision before adoption. Until then, disclose that the manual workflow and static checks are behavioral/authored safeguards, not a sandbox or guaranteed gate.
- **Realistic alternatives and reasoning:** Adding an unverified hook or relying on a hypothetical blocking question tool asserts a control that may not be exposed or fail closed. Removing tools without a supported record-writing or execution route may break phase-record ownership or Script Runner delegation and cannot force specialist use. Keeping only prose without tests would not protect the authored contract against regressions. The selected near-term route is explicit instructions, focused static checks, and separately authorized end-to-end observation.
- **Actual selection or pending state:** The engineer selected technical safeguards where feasible and a working fallback if a strict control is unavailable. No new technical control or tool grant is selected by this ADR.
- **Conditions and affected Work Items:** Associated Plan Work Items 1 and 3. Preserve current tool boundaries and ADR 018. Do not rely on `ask_user`, hooks, native agent allowlists, or tool propagation until the exact host behavior is observed. Static passes establish authored text only; runtime claims require separately authorized observations.

## Consequences

- **Benefits:** Specialist execution and Research’s manual gate become explicit, testable authored requirements, with the final surfaced answer and actual tool events included in runtime evidence.
- **Risks and technical debt:** The Copilot host may still permit behavior contrary to agent prose. Static checks do not prove delegation, answer blocking, tool denial, or absence of side effects. The fallback is usable but not a technical sandbox.
- **Operational impact:** The four coordinator files, their directly relevant phase Skills, and owner-local contract fixtures change together. Runtime conformance requires a disposable workspace and separately authorized host/package effects; this ADR grants none.
- **Reversibility and recovery constraints:** Preserve accepted ADR text and history. A newly evidenced technical enforcement option or material tool/security-boundary change requires engineer-directed Plan resolution and appropriate ADR coverage.
- **Dependencies:** Existing named worker availability, the applicable native agent/task route, current coordinator tools, static contract checks, and separate authorization for runtime observations. Unavailable specialists or denied tools remain visible failures, not permission to bypass the boundary.

## Standards and practice alignment

Use the existing numbered Markdown `docs/adr/` convention and the supported named custom-agent catalogue. This is a behavioral workflow contract, not a platform-enforced delegation policy, security certification, or guarantee that a final response cannot be revised.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Exact-preimage agreement and recording | Source changes dependent on D1-D3 | Engineer and Implement coordinator under the policy effective at invocation | Deliberate Implement request with the inspected Plan visibly binding this Proposed preimage; separately verify any permitted metadata recording and full readback | Pending; direction is selected, exact preimage is not signed off |
| Actual Q&A, evaluator/repair, specialist, and tool behavior | Runtime conformance claims in Work Item 3 | Engineer authorizes the exact disposable host/package effects | Test the final surfaced response and actual subagent/tool events on the supported Agent Host; retain unavailable results and do not infer enforcement from static text | Not observed; no runtime authorization inferred |
| A newly evidenced technical control or material tool-boundary change | Only effects depending on that control | Engineer through a new scoped Plan decision | Provide version-matched host evidence and affected security/compatibility consequences before selecting or implementing a control | Not selected or tested |

## References and implementation binding

- [Research revision 6](../copilot/033-rpir-harness-test-failures/001-research-brief.md), “Evidence and reasoning,” “Enforcement feasibility and limits,” “ADR inputs and remaining gaps,” and “Recommendation and validation.”
- **Associated Plan:** [001-implementation-plan.md](../copilot/033-rpir-harness-test-failures/001-implementation-plan.md), working substantive v0.1; sole delivery hierarchy and acceptance authority.
- **Coverage binding:** This exact Proposed v0.1 preimage: D1 → Work Item 1; D2 → Work Items 1 and 3; D3 → Work Items 1 and 3. The Plan binds this path/ID, identifiable sections, complete substantive snapshot, state, actual Research selections, conditions, and affected Work Items.
- **Renderer or consumer convention:** Existing numbered Markdown records in `docs/adr/`; no new directory or external publication is required.

Only a qualifying deliberate Implement request with the inspected Plan can sign off this exact Proposed preimage under the prospective exact-snapshot rule when it is effective before invocation. Plan requests, answers, reports, workers, Script Runner, role selection, skills, and unsent prefills are not sign-off. Invocation and any separately guarded metadata persistence are distinct. Preserve accepted history; this ADR grants no runtime permission.
