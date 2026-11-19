# ADR 020: Fixed model and reasoning preferences for RPIR coordinators

## Record metadata

- **Status:** Accepted.
- **Substantive version or snapshot:** v0.1; this complete physical record is the proposed decision preimage.
- **Authored:** 2026-11-18.
- **Decision date:** 2026-11-18.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer selected GPT-6.1 Sol at high reasoning with `model-policy: required` for Research, Plan, Implement, and Review, built into each coordinator definition. This is agreement to the direction recorded in Research, not sign-off of this exact ADR preimage. No additional approval body is established.
- **Agreement evidence:** [Research revision 6](../copilot/033-rpir-harness-test-failures/001-research-brief.md), “Answer and scope,” “Intent and discovery,” “Fusion on the orchestrators: theory assessment,” and “Recommendation and validation”; the engineer's deliberate `/implement` request on 2026-11-18 with the inspected physical [Plan v0.1](../copilot/033-rpir-harness-test-failures/001-implementation-plan.md), binding this exact ADR 020 Proposed v0.1 preimage.
- **Affected systems:** The four RPIR coordinator agent definitions, the packaged model-selection Skill/profile, related agent-authoring and maintenance guidance, and model-projection contract checks.
- **Related decisions:** [ADR 007](007-local-agent-model-selection.md), D1, records the pre-Fusion Sol/high role allocation. [ADR 008](008-profile-derived-effort-declarations.md), D1, records profile-derived effort declarations. [ADR 014](014-copilot-model-preferences-and-support-baseline.md), D1-D2, establishes the Copilot support baseline and runtime ID `gpt-6.1-sol` with target `high` for these roles, while selecting preferred native defaults. [ADR 016](016-copilot-fusion-high-role-preferences.md), D1, selects `hydrafusion` for the current 18-role candidate. [ADR 017](017-fusion-managed-reasoning-preferences.md), D1, omits authored effort for the Fusion profile. Preserve all accepted text and history; this proposal prospectively changes only the four coordinator projections.
- **Source revisions:** Research revision 6 and the associated working Plan v0.1, 2026-11-18, in `docs/copilot/033-rpir-harness-test-failures/`.

## Context and problem

The current packaged profile and all 18 agent definitions use `hydrafusion` and omit `reasoning-effort`. The engineer selected a different built-in coordinator configuration after reporting that RPIR behavior had changed: GPT-6.1 Sol at high reasoning with `model-policy: required` for the four phase coordinators. This is not evidence that Fusion caused the reported failures or that Sol prevents them.

The existing Copilot profile decision lists `gpt-6.1-sol` as the runtime ID and `high` as its target effort for these four roles. The custom-agent reference describes the `model`, `model-policy`, and `reasoning-effort` fields, but the exact behavior of the packaged VS Code 1.146 Agent Host, model availability, and policy persistence across follow-up turns remain unobserved. A declared preference is not proof of effective dispatch or effort.

## Decision and conditions

### D1 — Configure the four coordinators for the selected Sol/high model

- **Choice and rationale:** Propose `model: gpt-6.1-sol`, `model-policy: required`, and `reasoning-effort: high` for Research, Plan, Implement, and Review only. Represent the same assignments in the single packaged role profile and statically verify each agent projection against it. The selected model, policy, and target effort are distinct configuration facts; none establishes the effective runtime settings.
- **Realistic alternatives and reasoning:** Retaining `hydrafusion` for all 18 roles preserves ADR 016 but does not implement the engineer’s selected coordinator direction. A preferred Sol model allows a user model change and conflicts with the selected required policy. A fallback list, silent downgrade, global setting, or task-call override introduces a different model-selection mechanism and is not selected. The native scalar Sol preference with the selected required policy and high effort is the proposed configuration.
- **Actual selection or pending state:** The engineer selected the Sol/high/required direction in Research. The exact ADR content remains Proposed; no runtime configuration or delivery acceptance is claimed.
- **Conditions and affected Work Items:** Associated Plan Work Item 2. Restrict this projection to the four coordinator files. The other 14 specialist definitions retain their existing `hydrafusion` preference and Fusion-managed reasoning with no authored effort override. Do not use a model fallback or change the selection silently. If the required Sol/high configuration cannot be represented or resolved on the target host, report the discrepancy and ask the engineer for direction before changing it.

### D2 — Preserve the current Fusion profile for specialists

- **Choice and rationale:** Retain `model: hydrafusion` and no authored `reasoning-effort` for the 14 non-coordinator roles. This keeps the separate specialist candidate already selected in ADR 016 and avoids extending the coordinator decision to workers without evidence or engineer direction.
- **Realistic alternatives and reasoning:** Applying Sol/high to all roles expands the engineer’s selection beyond the four named coordinators. Choosing a different specialist tier or fallback would reopen ADR 016 without new agreement. The bounded four-role change preserves the selected specialist profile.
- **Actual selection or pending state:** Fusion High for specialists remains the existing profile and candidate, not a new performance finding. Any runtime claim about Fusion High child execution under a Sol coordinator remains unobserved.
- **Conditions and affected Work Items:** Associated Plan Work Item 2. Do not infer child model selection from a coordinator’s `model-policy`; separately observe the child model and its tools only in an authorized runtime test. A failed child-route observation does not authorize changing the specialist profile.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| Keep `hydrafusion` for all roles | Preserves ADR 016 and the current profile | Does not implement the engineer-selected fixed coordinator model | Not selected for the four coordinators; retained for specialists |
| Sol/high as a preferred coordinator model | Uses the existing `gpt-6.1-sol` profile ID and target effort | Permits a user model change, contrary to the selected `required` policy | Not selected |
| Sol/high with `model-policy: required` for four coordinators | Encodes the selected model and policy in each coordinator definition | Packaged-host resolution, availability, and follow-up persistence remain unobserved | Proposed |
| Fallback list, silent downgrade, or global/per-call override | Might continue work when Sol is unavailable | Changes the selected model, adds unsupported routing, or escapes the per-agent configuration | Not selected |
| Move all 18 roles to Sol/high/required | Makes the profile uniform under the coordinator selection | Expands the explicit selection to 14 specialists and displaces ADR 016 without agreement | Not selected |

## Consequences

- **Benefits:** Coordinator model preference, required policy, and target effort are explicit and statically checked in the packaged profile and agent definitions.
- **Risks and technical debt:** Static declarations cannot show model availability, effective routing, policy enforcement, or observed effort. A required policy may constrain use when the selected model is unavailable. Child resolution remains a separate runtime fact.
- **Operational impact:** Four agent headers, the profile owner, model-selection/authoring guidance, and existing projection tests change together. No account query, setting, package creation, activation, model trial, or external publication is included.
- **Reversibility and recovery constraints:** Preserve ADR 007, 008, 014, 016, and 017. Any fallback model, changed specialist tier, or broader model allocation requires engineer direction and appropriate ADR coverage.
- **Dependencies:** Exact model identifier and schema evidence, static projection validation, the approved Plan transition and actual edit permission. Packaged Agent Host behavior and model availability require separate runtime authorization.

## Standards and practice alignment

Use the existing packaged model-selection Skill and scalar native custom-agent preferences. The official custom-agent reference describes the fields; the repository’s version-matched Research evidence does not establish their effective behavior in the active Agent Host. This ADR does not certify entitlement, dispatch, or reasoning enforcement.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Exact-preimage agreement and recording | Source changes dependent on D1-D2 | Engineer and Implement coordinator under the policy effective at invocation | Deliberate Implement request with the inspected Plan visibly binding this Proposed preimage; separately verify any permitted metadata recording and full readback | Pending; direction is selected, exact preimage is not signed off |
| Effective Sol/high/required behavior and follow-up persistence | Runtime model claims and Work Item 3 | Engineer authorizes the exact disposable host/package effects | Inspect all four coordinator definitions in the supported Agent Host, follow-up turns, observed effective model/effort, and behavior when Sol is unavailable; do not infer fallback or silently substitute another model | Not observed; no runtime authorization inferred |
| Fusion High child execution and tool propagation from a Sol coordinator | Specialist-runtime claims in Work Item 3 | Engineer authorizes the exact disposable host/package effects | Delegate a bounded harmless task to a named specialist and inspect its model and tools separately from coordinator metadata | Not observed |

## References and implementation binding

- [Research revision 6](../copilot/033-rpir-harness-test-failures/001-research-brief.md), “Evidence and reasoning,” “Fusion on the orchestrators: theory assessment,” “ADR inputs and remaining gaps,” and “Recommendation and validation.”
- **Associated Plan:** [001-implementation-plan.md](../copilot/033-rpir-harness-test-failures/001-implementation-plan.md), working substantive v0.1; sole delivery hierarchy and acceptance authority.
- **Coverage binding:** This exact Proposed v0.1 preimage: D1 → Work Item 2; D2 → Work Items 2 and 3. The Plan binds this path/ID, identifiable sections, complete substantive snapshot, state, actual Research selections, conditions, and affected Work Items.
- **Renderer or consumer convention:** Existing numbered Markdown records in `docs/adr/`; no new directory or external publication is required.

Only a qualifying deliberate Implement request with the inspected Plan can sign off this exact Proposed preimage under the prospective exact-snapshot rule when it is effective before invocation. Plan requests, answers, reports, workers, Script Runner, role selection, skills, and unsent prefills are not sign-off. Invocation and any separately guarded metadata persistence are distinct. Preserve accepted history; this ADR grants no runtime permission.
