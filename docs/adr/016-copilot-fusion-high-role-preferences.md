# ADR 016: Uniform Fusion High preferences for Toolkit roles

## Record metadata

- **Status:** Accepted.
- **Substantive version or snapshot:** v0.1, 2026-11-17; the complete physical record is the exact preimage for Plan binding.
- **Authored:** 2026-11-17.
- **Decision date:** 2026-11-17.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer selected the evaluation candidate in Research; this is not sign-off of this exact ADR or authorization to change or trial models.
- **Agreement evidence:** [Research v0.4](../copilot/031-copilot-fusion-model-selection/001-research-brief.md), “Intent and discovery” and “Selected evaluation candidate for all 18 roles,” records the engineer's selection of uniform Fusion High. The engineer's explicit `/implement` invocation on 2026-11-17 with the inspected approved [Plan v1.0](../copilot/031-copilot-fusion-model-selection/001-implementation-plan.md) signs off this exact Proposed ADR 016 substantive v0.1 preimage, including D1, visibly bound in the Plan. This agreement and bounded delivery authorization do not establish model availability, dispatch, runtime performance, activation, packaging, or delivery acceptance.
- **Affected systems:** The shared role profile, the 18 current Toolkit agent model preferences, their contract checks, and directly related model-selection guidance.
- **Related decisions:** [ADR 007](007-local-agent-model-selection.md), Accepted substantive v0.1 D3, retains one packaged profile owner. [ADR 014](014-copilot-model-preferences-and-support-baseline.md), Accepted substantive v0.1 D1–D2, retains the VS Code support baseline and native-preference approach; this proposal would prospectively replace only the current Copilot model allocation in D2. Preserve accepted text and history; do not edit those records.
- **Source revisions:** Research v0.4 and associated working Plan v1.0, 2026-11-17, in `docs/copilot/031-copilot-fusion-model-selection/`.

## Context and problem

The current profile and agent headers project the existing Sol, Terra and Luna allocation. Research traced the supported Copilot path in released VS Code 1.146.0: Fusion High has the scalar runtime ID `hydrafusion`, and the custom-agent converter forwards a scalar model preference to a child. This supports a configurable preference, not proof of catalogue availability or effective root/child execution in any particular environment.

The engineer selected uniform High as the candidate to assess across all 18 current Toolkit roles. That choice avoids relying on the unestablished independent Standard child-tier binding. The candidate prioritizes one supported uniform preference over an unmeasured role-tiered cost hypothesis; it does not establish that High is cheapest, best for every role, or operationally approved.

## Decision and conditions

### D1 — Use the Fusion High scalar preference for the current 18-role candidate

- **Choice and rationale:** Propose `model: hydrafusion` as the single native preferred model for each of the 18 current Toolkit agent definitions, with the same value represented in the shared role profile. Retain the single profile owner and native preferred-model semantics.
- **Realistic alternatives and reasoning:** Retaining current profiles preserves the known allocation but does not develop the engineer-selected Fusion candidate. Uniform Standard lacks an evidenced per-child tier binding and is not the selected candidate. Max everywhere increases potential cost and latency and narrows availability without supporting comparative evidence. A role-tiered Fusion allocation, custom router, fallback array, parent setting, or per-call override adds an unsupported mechanism or changes scope. These alternatives are not selected.
- **Actual selection or pending state:** The engineer selected uniform High for evaluation in Research v0.4. This ADR remains Proposed; source changes require the approved Plan transition, and this exact snapshot has not been signed off.
- **Conditions and affected Work Items:** Associated Plan Work Item WI-1. Apply the preference only to the 18 current Toolkit-contributed agent definitions; preserve their names, tools, delegation, visibility, handoffs and authority. Do not infer a permanent 18-role ceiling or automatically classify future roles. Keep the existing VS Code 1.146.0+ support baseline. Do not configure `hydrafusion-max`, `balance`, `auto`, a fallback list, a custom router, or global/per-call settings as substitutes. A header or static check does not establish availability, dispatch, entitlement, or Fusion orchestration inside a child. Runtime evaluation, packaging, activation and release are outside this proposal and require their own applicable authorization.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| Retain the current per-role allocation | Preserves current authored model IDs | Does not implement the selected Fusion candidate | Interim state only; not the selected candidate |
| Fusion Standard for all roles | Published as a cost/quality/latency balance | No supported independent Standard child binding was established | Not selected |
| Fusion High for the current 18 roles | Uses the evidenced scalar ID and avoids the Standard child gap | Cost, latency and role-level quality remain unmeasured | Selected evaluation candidate |
| Fusion Max for all roles | Requests the highest published tier | Potentially higher cost/latency and narrower availability without evidence of corresponding value | Not selected |
| Role-tiered Fusion, fallback lists, or a custom router | Could pursue different cost/capability assignments | Independent Standard mechanism is missing; router/fallback behavior is unsupported and out of scope | Not selected |

## Consequences

- **Benefits:** One source-supported scalar preference can represent the selected candidate across the current contributed roles.
- **Risks and technical debt:** The actual client catalogue, effective root and child model, orchestration, quality, latency and cost remain unknown. Static configuration is not runtime routing evidence.
- **Operational impact:** The proposed implementation is limited to repository customization, checks and directly affected guidance. No dependency, engine baseline, account setting, package, activation, live trial, publication or external effect is proposed.
- **Reversibility and recovery constraints:** Preserve accepted ADR history and unrelated model configuration. A material tier or support-policy change requires an engineer-directed Plan and applicable ADR coverage.
- **Dependencies:** Exact Plan/ADR inspection, applicable exact-snapshot sign-off and actual edit permission. Live observations and comparative evaluation are separate, not acceptance evidence for the static candidate.

## Standards and practice alignment

Use the existing shared profile, scalar native preference path, numbered `docs/adr/` convention and Markdown renderer. The cited VS Code release establishes the inspected source mechanism, not active-client compatibility or a universal entitlement.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Agreement to this exact ADR snapshot | Source changes dependent on D1 | Engineer; Implement coordinator records only the separately guarded metadata effect | Deliberate Implement request with the associated inspected Plan visibly binding this Proposed v0.1 D1 preimage, if the prospective sign-off rule is effective before invocation | Pending; candidate selection is not exact-snapshot sign-off |
| Actual model availability and root/child execution | Limits any later operational adoption claim | Engineer authorizes any runtime observation separately | Bounded, separately authorized runtime observation of the catalogue and root and child behavior; a negative result holds dependent rollout and requires scoped evidence/engineer resolution | Unobserved; not established by this ADR |
| Comparative quality, time and cost | No superiority or savings claim | Engineer, through a separately scoped evaluation | A separate approved evaluation defines workloads, safeguards and thresholds before any trial | Not performed or authorized here |

## References and implementation binding

- [Research v0.4](../copilot/031-copilot-fusion-model-selection/001-research-brief.md), “Configuration findings and supported representations,” “Toolkit baseline and likely impact,” and “Selected evaluation candidate for all 18 roles.”
- **Associated Plan:** [001-implementation-plan.md](../copilot/031-copilot-fusion-model-selection/001-implementation-plan.md), working substantive v1.0, 2026-11-17.
- **Coverage binding:** This exact path/ID, complete Proposed v0.1 snapshot and identifiable D1 cover the model-selection choice for Work Item WI-1. The Plan records the actual candidate selection and conditions separately from exact-snapshot sign-off.
- **Renderer or consumer convention:** Existing numbered Markdown records in `docs/adr/`; no external publication or new directory is required.

Only the qualifying deliberate Implement request with the inspected physical approved Plan can sign off this exact Proposed preimage under the prospective rule already effective before invocation. This proposal is not an approval, runtime authorization or acceptance result. Preserve accepted decision text and history.
