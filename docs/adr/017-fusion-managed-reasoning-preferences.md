# ADR 017: Fusion-managed reasoning with no authored effort override

## Record metadata

- **Status:** Accepted.
- **Substantive version or snapshot:** v0.1, 2026-11-17; the complete physical record is the exact preimage for Plan binding.
- **Authored:** 2026-11-17.
- **Decision date:** 2026-11-17.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer selected Fusion-managed reasoning for the candidate in Research; this is not sign-off of this exact ADR or authorization to change or trial models.
- **Agreement evidence:** [Research v0.4](../copilot/031-copilot-fusion-model-selection/001-research-brief.md), “Intent and discovery” and “Reasoning omission is resolved,” records the engineer's selection of no authored `reasoning-effort` header. The engineer's explicit `/implement` invocation on 2026-11-17 with the inspected approved [Plan v1.0](../copilot/031-copilot-fusion-model-selection/001-implementation-plan.md) signs off this exact Proposed ADR 017 substantive v0.1 preimage, including D1, visibly bound in the Plan. This agreement and bounded delivery authorization do not establish effective runtime reasoning or external settings and do not authorize runtime trials, activation, packaging, or delivery acceptance.
- **Affected systems:** The shared role profile, all current Toolkit agent headers, the model projection verifier and tests, agent authoring and maintenance guidance, and user-facing profile documentation.
- **Related decisions:** [ADR 008](008-profile-derived-effort-declarations.md), Accepted substantive v0.1 D1, and [ADR 014](014-copilot-model-preferences-and-support-baseline.md), Accepted substantive v0.1 D2, contain the current profile-derived effort declaration contract. This proposal would prospectively replace that contract only for the selected Fusion profile; preserve both accepted records and do not edit them. ADR 007 history is not changed.
- **Source revisions:** Research v0.4 and associated working Plan v1.0, 2026-11-17, in `docs/copilot/031-copilot-fusion-model-selection/`.

## Context and problem

The current profile assigns a target effort to each role and the agent definitions declare it as `reasoning-effort`. The inspected released converter omits that SDK property when it is absent. Fusion selects model and reasoning per step; its tier names are not provider reasoning-effort values. The supported omission representation establishes only that the Toolkit authors no per-agent override. It does not reset applicable parent, per-call, service or runtime settings, nor establish observed effective reasoning.

The engineer selected Fusion-managed reasoning for the uniform High candidate. The existing per-role `high` and `xhigh` declarations are not a supported substitute for that selected policy, and no fixed Fusion reasoning value was selected or evidenced.

## Decision and conditions

### D1 — Omit the authored reasoning-effort override for the Fusion profile

- **Choice and rationale:** Propose that the canonical profile explicitly state “Fusion-managed reasoning; no Toolkit-authored effort override,” and that all 18 current Fusion agent definitions omit the `reasoning-effort` property. The profile and agent headers must agree without inventing `auto`, `default`, `none`, or another provider effort value.
- **Realistic alternatives and reasoning:** Retaining current `high`/`xhigh` headers does not implement the selected policy and their combined Fusion behavior is not established. Replacing them with a fixed effort value was not selected and lacks evidence of Fusion semantics. Setting a global or parent value, or adding a reset mechanism, changes scope and cannot be inferred from omission. The omission path is supported by released converter behavior and its tests; Fusion-managed reasoning is selected for the candidate.
- **Actual selection or pending state:** The engineer selected the no-authored-override policy in Research v0.4. This ADR remains Proposed; the exact snapshot has not been signed off.
- **Conditions and affected Work Items:** Associated Plan Work Item WI-1. Apply omission to the same current 18-role candidate covered by ADR 016. Statically require that agent frontmatter has no `reasoning-effort` property; an empty or alternate value is not equivalent. Report declared policy separately from effective runtime effort. Do not claim omission clears inherited or external settings, proves effective reasoning, or guarantees runtime consumption. Do not change global, parent, account, or per-call settings. Future roles and a future fixed-effort requirement need their own supported evidence and deliberate classification.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| Keep the existing per-role `high`/`xhigh` declarations | Preserves current role effort labels | The combined effect with Fusion is not established and does not implement the selected no-override policy | Not selected |
| Declare a fixed Fusion effort for each role | Could express a per-role value if supported | No such Fusion value was established or selected | Not selected |
| Omit `reasoning-effort` and document Fusion-managed reasoning | Uses the inspected converter's supported omission behavior | Does not reset external settings or prove effective reasoning | Selected |
| Add a global/parent override or reset | Could attempt to influence execution more broadly | Out of scope, unsupported as a reset mechanism, and not authorized by the selection | Excluded |

## Consequences

- **Benefits:** Profile and frontmatter represent the selected no-authored-override policy without conflating Fusion tiers with provider effort labels.
- **Risks and technical debt:** Applicable external overrides and effective effort remain unobserved. Absence of the property is not evidence that no other setting applies.
- **Operational impact:** The proposed implementation is limited to repository profile, agent, verifier, test and guidance changes. No settings, dependencies, activation, packaging or live trial are proposed.
- **Reversibility and recovery constraints:** Preserve ADR 008 and ADR 014 accepted text and history. A future requirement to pin or reset effort needs a separate evidence-based Plan and decision.
- **Dependencies:** Exact Plan/ADR inspection, applicable exact-snapshot sign-off and actual edit permission. Effective effort observation is outside this proposal and cannot be inferred from static validation.

## Standards and practice alignment

Reuse the current shared profile and static projection checks, and the omission behavior established by the inspected released converter and source tests. This is a Toolkit-authored preference policy, not a guarantee of Fusion's internal reasoning or an external runtime standard.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Agreement to this exact ADR snapshot | Source changes dependent on D1 | Engineer; Implement coordinator records only the separately guarded metadata effect | Deliberate Implement request with the associated inspected Plan visibly binding this Proposed v0.1 D1 preimage, if the prospective sign-off rule is effective before invocation | Pending; policy selection is not exact-snapshot sign-off |
| Applicable external overrides and effective reasoning | Limits runtime claims, not static omission acceptance | Engineer authorizes any runtime observation separately | In an authorized future runtime check, inspect only actual exposed override/effort evidence; report unobservable values honestly and do not reset settings | Unobserved; no runtime permission granted |

## References and implementation binding

- [Research v0.4](../copilot/031-copilot-fusion-model-selection/001-research-brief.md), “Reasoning omission is resolved,” “Configuration findings and supported representations,” and “ADR inputs and remaining gaps.”
- **Associated Plan:** [001-implementation-plan.md](../copilot/031-copilot-fusion-model-selection/001-implementation-plan.md), working substantive v1.0, 2026-11-17.
- **Coverage binding:** This exact path/ID, complete Proposed v0.1 snapshot and identifiable D1 cover the Fusion effort-policy choice for Work Item WI-1. The Plan retains no-authored override as a selected policy, separate from runtime observations.
- **Renderer or consumer convention:** Existing numbered Markdown records in `docs/adr/`; no external publication or new directory is required.

Only the qualifying deliberate Implement request with the inspected physical approved Plan can sign off this exact Proposed preimage under the prospective rule already effective before invocation. This proposal is not an approval, runtime authorization or acceptance result. Preserve accepted decision text and history.
