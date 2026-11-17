# ADR 018: Phase-scoped Script Runner execution and directory setup

## Record metadata

- **Status:** Accepted.
- **Substantive version or snapshot:** v0.1, 2026-11-17; the complete document is the exact preimage for Plan binding.
- **Authored:** 2026-11-17.
- **Decision date:** 2026-11-17.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer is the evidenced Toolkit workflow decision authority. Script Runner capability observations and specialist findings are evidence, not approval.
- **Agreement evidence:** [Research revision 2](../copilot/032-research-directory-setup/001-research-brief.md), “Intent and discovery” and “ADR inputs and remaining gaps,” records the engineer's direction that Runner should run scripts and that Git-only scope was not intended. In the Plan conversation on 2026-11-17, the engineer selected option A: declare `execute` on Research, Plan and Review and require them to delegate commands through Runner. The engineer's deliberate Implement invocation on 2026-11-17 with the inspected associated Plan working v0.2 signed off this exact complete Proposed substantive v0.1 preimage; runtime trials remain separately authorized.
- **Affected systems:** Script Runner and Research/Plan/Review role declarations and instructions; lifecycle directory allocation; related skills, repository policy, documentation and contract checks.
- **Related decisions:** [ADR 013](013-copilot-role-capabilities-and-research-setup.md), Accepted v0.1 D1 and D3, contains the no-terminal and no-Runner-directory-authority conditions that this proposal supersedes in part. [ADR 001](001-upfront-adrs-and-work-item-commits.md) supplies the existing guarded Runner-owned Git checkpoint context; preserve it.
- **Source revisions:** Research revision 2 and associated working Plan v0.2, 2026-11-17, in `docs/copilot/032-research-directory-setup/`.

## Context and problem

The engineer requires Script Runner to execute scripts and commands for all RPIR phases, including lifecycle directory setup, rather than being limited to observation and Git checkpoints. The current Runner contract declares `execute` but limits mutation to Git. Research and Review also lack `execute`; repeated observations report that their Runner children lack a shell, while Implement's Runner has executed commands. The Research brief cites an upstream report of parent-tool filtering on the matching client/runtime versions. These observations support the proposed mechanism but do not prove the updated roles will receive a usable shell.

Automatic lifecycle setup is a separate effect from saving lifecycle records. Coordinators must retain selection, numbering, physical record authorship and readback. Script execution can create outputs, but a delegated command does not create its own authority: its actual effects must fit the coordinator's assigned phase and approved outcome, the bounded goal, local policy and effective platform permission. A text contract on a coordinator with `execute` does not enforce that coordinator's delegation behavior at the platform level.

## Decision and conditions

### D1 — Permit phase-scoped script execution by Script Runner

- **Choice and rationale:** Script Runner may run observational commands, scripts, checks, builds and tests for Research, Plan, Implement and Review within the calling phase's existing authority and the coordinator's bounded assignment. The engineer selected a general script-execution role rather than Git-only or directory-only authority. A script may produce or modify output files only when those actual effects are within that phase's authority, the approved outcome where applicable, the assigned goal and effective permission. Running a script does not authorize an otherwise prohibited effect.
- **Realistic alternatives and reasoning:** Retaining Git as the only mutation or allowing only directory creation would not satisfy the engineer's explicit direction. Unrestricted command effects would detach execution from the phase's scope and permission. The selected contract restores useful script execution while preserving coordinator ownership of RPIR lifecycle records and markers, explicit phase authority and actual effect inspection.
- **Actual selection or pending state:** The engineer's Research direction and Plan clarification select general phase-scoped script execution. This ADR remains Proposed; no exact-snapshot sign-off is claimed.
- **Conditions and affected Work Items:** WI-1 defines the authored contract and tests; WI-2 checks actual runtime reachability and selected effects. Runner does not select scope, author or edit canonical lifecycle records or existing Plan markers, delete data, delegate, approve work, accept phases, or bypass denial. A phase's existing source/edit restrictions still apply. Review remains observational. Git index/history effects remain subject to the separate Runner-only checkpoint strategy and safeguards. Inspect relevant effects before and after commands, preserve user work and reconcile uncertain completion before repetition. A command that encounters a real denial stops; it does not switch roles or routes.

### D2 — Declare `execute` on Research, Plan and Review and route commands through Runner

- **Choice and rationale:** Add the supported `execute` alias to Research, Plan and Review so their Script Runner child can receive a shell. Those coordinators' authored instructions require command execution to be delegated through Runner. This matches the observed Implement pattern and the Research recommendation selected by the engineer.
- **Realistic alternatives and reasoning:** Waiting for an upstream fix has no evidenced timeline and leaves the capability gap open. A contributed script/directory tool has no established advantage because the cited parent-filtering behavior may filter child tools too and would introduce additional machinery. Giving coordinators `execute` without the Runner routing rule would broaden the expected command path unnecessarily. The selected route is the smallest evidence-supported change, with runtime effectiveness explicitly unproven until tested.
- **Actual selection or pending state:** In the Plan conversation on 2026-11-17, the engineer selected option A, the recommended `execute` declaration plus behavioral Runner-routing rule.
- **Conditions and affected Work Items:** WI-1 updates role contracts, declarations and static fixtures; WI-2 verifies child tools and actual command execution under separately authorized runtime conditions. Coordinators receive a shell capability, so their Runner-only command rule is behavioral, not a platform-enforced boundary. Do not claim otherwise. Reassess the route if the relevant upstream behavior changes or runtime evidence contradicts it. Existing Implement command capability is unchanged.

### D3 — Delegate selected lifecycle directory setup to Script Runner

- **Choice and rationale:** Research and Plan coordinators may assign Script Runner the bounded creation of each explicitly selected missing directory needed for Research lifecycle setup or Plan's selected ADR destination. Runner creates one literal directory at a time; it does not select or number topics, create implicit ancestors, save records, or replace coordinator readback. Reuse an existing safe directory without a creation effect.
- **Realistic alternatives and reasoning:** Manual setup is recovery, not an automatic setup pass. Implicit file-save parent creation hides the separate directory effect. Relying solely on the existing dedicated directory operation does not address the reported Agent Host publication gap; it may remain an alternative only where actually exposed and permitted. The engineer's selected Runner route is covered by D1 and D2.
- **Actual selection or pending state:** The engineer directed that Runner perform this class of script work; the destination/numbering and guarded record-save ownership remain with coordinators.
- **Conditions and affected Work Items:** WI-1 aligns directory-operation policy and checks; WI-2 tests the bounded effects. For each directory, establish selected literal identity, containment, absence including collisions and effective permission before execution; create only that directory; inspect the result before another effect. Refuse an out-of-root target, collision, overwrite, implicit ancestor or real denial. The coordinator independently verifies the result and separately saves/read-backs the physical record. A missing shell or denied operation remains an actual limitation, not permission to use another route.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| Keep Runner Git-only | Preserves current narrow contract | Conflicts with the engineer's explicit script-running requirement and prevents the intended setup workflow | Rejected by the engineer |
| Restrict Runner to directory creation | Adds only the immediate setup effect | Does not restore the requested general script executor | Rejected as too narrow |
| Give Research, Plan and Review `execute` and route their commands through Runner | Matches observed Implement behavior and the supported parent-tool mechanism | Coordinators themselves receive shell capability; delegation restriction is behavioral; runtime result remains unverified | Selected by the engineer in Plan |
| Wait for an upstream fix or add a new contributed tool | Could avoid exposing coordinator shell access or add a dedicated interface | No fix/timeline is established; parent filtering may also remove a contributed tool; additional implementation feasibility is unestablished | Not selected for this proposal |
| Let Runner select lifecycle destinations or author lifecycle records | Could combine setup and record persistence | Transfers coordinator-owned scope, numbering and canonical record authorship | Excluded |
| Permit commands to bypass phase/Plan scope or local permissions | Fewest operational constraints | Removes the authority boundary and permits effects not approved by the phase | Rejected |

## Consequences

- **Benefits:** Script Runner can perform the intended cross-phase command work, and lifecycle setup no longer depends on a directory API that was not observed on the demonstrated Agent Host route.
- **Risks and technical debt:** Native `execute` exposure gives Research, Plan and Review their own shell capability; authored delegation instructions do not enforce a platform security boundary. A script can have effects beyond a simple directory creation, so the assigned scope, effective permission and actual effects must be inspected. Tool propagation remains a live compatibility fact.
- **Operational impact:** Runner instructions and three coordinator declarations change together with lifecycle guidance, checks, tests and user documentation. No dependency or new service is proposed.
- **Reversibility and recovery constraints:** Preserve ADR 013's accepted text and supersede only the conflicting clauses prospectively. Diagnose attributable in-scope problems and recheck; a real denial or material security-boundary change requires engineer-directed resolution, not a workaround.
- **Dependencies:** Applicable Plan approval and any exact-snapshot sign-off required by effective policy; actual `execute` availability, workspace and platform permissions; bounded directory identity/containment checks; existing local Git safeguards.

## Standards and practice alignment

This proposal uses the existing phase-owned RPIR workflow and native `execute` alias already present on Implement and Script Runner. The authored delegation rule does not establish a native per-parent filter, a sandbox, effective permission or runtime behavior. No enterprise standard or external approval process is inferred.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Exact agreement to this Proposed preimage | Source effects dependent on this decision | Engineer / Implement coordinator | A qualifying deliberate Implement request with the inspected approved Plan visibly binding this exact Proposed ADR preimage, under policy effective before invocation; record separately under the lifecycle core | Pending |
| Actual child shell and directory effects | Runtime claim and WI-2 acceptance | Implement coordinator under separate runtime authorization | Test each updated coordinator's Runner child on the identified candidate; inspect tool availability, run a harmless script, and exercise authorized directory create/reuse/refusal paths | Unperformed; no runtime behavior or permission inferred |
| Upstream filtering behavior changes or live result contradicts the selected route | Effects dependent on C2/C3 | Engineer / Plan coordinator | Reassess with version-matched evidence and obtain a new scoped decision where needed; hold only dependent effects | Conditional |

## References and implementation binding

- [Research revision 2](../copilot/032-research-directory-setup/001-research-brief.md), “Evidence and reasoning,” “ADR inputs and remaining gaps,” and “Remaining factual gap.”
- **Associated Plan:** [001-implementation-plan.md](../copilot/032-research-directory-setup/001-implementation-plan.md), working substantive v0.2, 2026-11-17.
- **Coverage binding:** This complete Proposed v0.1 preimage covers D1 (WI-1, WI-2), D2 (WI-1, WI-2) and D3 (WI-1, WI-2). The associated Plan binds the exact path/ID, D section, substantive snapshot, state, actual engineer selections and conditions.
- **Renderer or consumer convention:** Existing numbered Markdown records in `docs/adr/` and the repository ADR template; no directory creation or external publication is required.

This ADR is supplementary, not a canonical RPIR record, implementation approval or runtime authorization. Preserve ADR 013's accepted history. Only the qualifying Implement request described in the effective lifecycle policy may sign off this exact preimage; a Plan request or the engineer's selection of option A is not that sign-off.
