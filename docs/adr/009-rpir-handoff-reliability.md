# ADR 009: Evidence-led RPIR handoffs and actionable correction

## Record metadata

- **Status:** Accepted.
- **Substantive version:** v0.1, 2026-11-04.
- **Authored:** 2026-11-04.
- **Decision date:** 2026-11-04.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer supplies the workflow direction and is the decision authority for this Toolkit objective. No separate board or approval matrix is assumed; any actually applicable additional requirement must still be satisfied.
- **Agreement evidence:** In the associated Plan conversation on 2026-11-04, the engineer selected `A` for evidence-backed readiness; selected a qualified `C` for known issues to be addressed rather than merely reported; selected `A` for authored-delivery validation; and selected `A` for drafting here in the existing `docs/adr/` directory. These are attributed design selections and destination authority, not a qualifying `/implement` invocation, formal acceptance of this exact ADR snapshot, or evidence of live effectiveness. Separately, on 2026-11-04 the engineer explicitly invoked the `/implement` prompt route with `docs/copilot/026-rpir-handoff-reliability/001-implementation-plan.md`, inspected substantive v0.5 dated 2026-11-04, signing off this exact full Proposed ADR 009 substantive v0.1 preimage dated 2026-11-04, D1–D3, visibly enumerated in that Plan's manual handoff. The exact-snapshot rule was effective before this invocation. The Implement coordinator independently inspected the physical Plan, direct Research lineage, unchanged Proposed preimage, complete choice coverage, decision authority and conditions, contained existing destination and absence of conflicting edits; no additional applicable approval or unsatisfied decision-critical condition was evidenced. This metadata-only recording preserves all decision text and substantive v0.1. Invocation is the agreement event; successful save and full postimage readback are separately reported implementation evidence, not assumed by this entry. No runtime effectiveness or delivery acceptance is asserted.
- **Affected systems:** Toolkit RPIR phase guidance, owning skills/templates, assurance, contract verifier and regression fixtures. Existing Local commitments and runtime limits are unchanged.
- **Related decisions:** [ADR 004](004-decision-complete-rpir-plans.md), D1, Proposed v0.1, supplies decision-complete planning and bounded factual routes. [ADR 005](005-implement-invocation-adr-sign-off.md), D1, Proposed v0.2, supplies the separate exact-snapshot sign-off model. This record supplements rather than revises or accepts either baseline record.
- **Source revisions:** [Research brief revision 1](../copilot/026-rpir-handoff-reliability/001-research-brief.md), 2026-11-04; associated [implementation Plan v0.5](../copilot/026-rpir-handoff-reliability/001-implementation-plan.md), 2026-11-04; attributed Plan-conversation selections above. Local records are contextual references, not substitutes for independent inspection.

## Context and problem

The RPIR workflow already says to resolve foreseeable choices where practicable, bound factual unknowns and continue independently authorized work. Correct wording alone has not established reliable handoff behavior. A recorded example contains substantial downstream decision-making and an Implement conversation that stopped, but incomplete historical chronology does not establish that every question was avoidable, an operation was denied, or any particular edit was eligible.

The improvement therefore targets preparation and response, not historical blame: make the evidence behind readiness inspectable, reuse actual decisions, and act on supported issues instead of collecting observations without correction. Validation must distinguish authored rules and hypothetical scenarios from observed conversations. Existing human decisions, manual transitions, effect guards and independent Review remain necessary.

These three choices share this handoff-reliability objective and the same decision authority and rollout. Each retains separate reasoning, conditions and affected Plan Work Items below; the Plan remains the sole delivery hierarchy. Future independently changing decisions must retain identifiable amendment/supersession evidence rather than rewrite accepted rationale.

## Decision and conditions

### D1 — Evidence-backed readiness and faithful decision reuse

- **Choice and rationale:** After the existing Research intake permits investigation, use the existing handover to connect decision-critical feasibility evidence, realistic alternatives, recommendation and actual engineer direction. A material residual explains what investigation was pursued, why it reasonably remains, the downstream consequence and supported resolution route. Plan reuses actual selections, including qualified or nonrecommended answers, and identifies new material evidence when reopening is necessary. This makes practicability assessable without moving Plan-owned scope, acceptance or hierarchy into Research.
- **Realistic alternatives and reasoning:** Retaining route-only wording is cheaper but leaves the preparation gap less directly addressed. Requiring all facts or exhaustive prototypes before Plan blocks facts available only at execution and encourages false certainty. A second checklist/register or fixed interview quota adds duplication without proving investigation. Evidence in existing owners is selected instead.
- **Actual selection:** The engineer selected evidence-backed readiness with `A` in the Plan conversation. The record remains Proposed pending exact-snapshot sign-off; this selection is not implementation permission.
- **Conditions and affected Work Items:** Work Item 1 implements the guidance and Work Item 3 validates it. Preserve Research acknowledgment/explicit-deferral limits, proportionate investigation, engineer-owned choices and current role boundaries. No new approval gate, zero-unknowns rule or mandatory prototype. A pending architectural choice is not relabeled as a factual unknown; existing bounded fact routes and dependent-effect holds remain effective.

### D2 — Supported issues lead to authorized correction and revalidation

- **Choice and rationale:** A known supported issue within the approved outcome is diagnosed, corrected and rechecked by its authorized owner, not merely reported as advice. Missing predicted files or debugging steps alone do not require new approval. Unknown actionability is investigated within the phase boundary. Record the correction and actual validation outcome, or the specific dependency preventing it and next permitted action. Do not relabel an actual approved-outcome defect as an optional future enhancement to evade correction.
- **Realistic alternatives and reasoning:** Explicit advisory observations improve traceability but can become a reporting sink; the engineer rejected that limitation. Findings-only reporting can miss consequential handoff problems. Automatic cross-phase repair or broad edits by Review might reduce interactions but would violate manual transitions and independent ownership. Select actionable correction through existing authority and routes, not new edit grants.
- **Actual selection:** The engineer selected a qualified `C`: “if we can report issues or record consequential hand off observation we should be able to address them. If we know we have an issue fix it!” This direction replaces feedback-only framing. It does not by itself authorize a phase transition or edits outside the active boundary.
- **Conditions and affected Work Items:** Work Item 2 owns the obligation; Work Item 1 aligns Research/Plan owners, and Work Item 3 covers regressions. Research/Plan correct only their own eligible working artifacts; Implement repairs approved-outcome defects and rechecks. Review remains source-read-only and routes supported original-criteria findings to manual Implement resumption under the original Plan, fresh implementation evidence and independent re-review. Unresolved findings prevent acceptance. Genuinely new requirements, architectural choices, authority, dependencies, security/compatibility commitments or external effects need prompt engineer-directed resolution. Real denial is not bypassed. Holds name the dependent effect while independently authorized work continues; independent investigation alone is not source-edit authority. Historical records remain unchanged.

### D3 — Validate authored delivery without claiming live effectiveness

- **Choice and rationale:** Acceptance for this bounded delivery requires passing contract verifier and fixture-suite results, plus reasoned assessment of all six positive/negative semantic scenario pairs in the Plan. These establish evidence for the authored changes, not actual conversational compliance. Live phase behavior, payload loading, effective model/effort, capabilities and compatibility remain explicitly unverified until separately authorized observations establish them.
- **Realistic alternatives and reasoning:** Static checks alone cannot assess meaning, answer retention or authorized continuation. Requiring live-session proof for this delivery would retain unmet acceptance while separate activation/session authorization is unavailable. A runtime enforcement integration changes exposure and is outside scope. Combine focused static regression coverage with semantic examples now and retain honest live-evidence limits.
- **Actual selection:** The engineer selected validation option `A`: authored delivery now, with passing checks and all six semantic pairs. Actual live evidence is not an acceptance prerequisite for this bounded delivery and is not reported as passed.
- **Conditions and affected Work Items:** Work Item 3 integrates the assessment; Work Items 1–2 validate their coherent changes with accompanying regressions. Scenarios cover actual qualified answers, decision reuse/new issues, facts versus choices, ADR content/sign-off/persistence, dependent holds with authorized correction, and independent Review routing/rejection of unsupported success. Examples include negative report-only evasion and unauthorized repairs. Preserve equivalent-wording positives and decoy/contradiction negatives. No packaging, activation, real-session launch, dependency installation or new compatibility/support claim is selected. Future live observations need their own authority and version/payload-bound evidence; they cannot be inferred from this ADR or static passes.

## Alternatives and reasoning

| Option | Benefits | Costs and limits | Disposition |
| --- | --- | --- | --- |
| Current route-only readiness and local wording fixes | Smallest authoring cost | Does not substantiate practicable preparation | Not selected for D1 |
| Evidence-led readiness in existing owners | Makes preparation, actual choices and justified residuals inspectable | Requires proportionate judgment; can become paperwork if duplicated | Selected for D1, with no new register or gate |
| Require every fact before Plan | Nominal certainty | Blocks execution-only facts and encourages invented certainty | Rejected for D1 |
| Report handoff observations only | Clearer feedback trail | Can knowingly leave authorized defects unfixed | Replaced by the engineer's D2 qualification |
| Correct through existing phase owners and manual routes | Addresses issues while retaining independent Review | Review-to-Implement corrections still require manual invocation | Selected for D2 |
| Automatic cross-phase repair or expanded Review edits | Potentially fewer interactions | Changes authority and independence | Not selected; outside scope |
| Static checks only | Repeatable and inexpensive | Cannot assess semantic or live compliance | Insufficient for D3 |
| Static checks plus semantic pairs; live evidence separately authorized | Feasible authored validation and truthful claims | Actual behavioral improvement remains unverified | Selected for D3 |
| Live success required before this delivery's acceptance | Stronger observed evidence | Unavailable without separate authorization; no authored-only completion | Not selected for this delivery |

## Consequences

- **Expected benefits:** Less avoidable downstream rediscovery, faithful decision reuse, and correction/revalidation rather than report-only deferral. These are intended outcomes, not measured runtime results.
- **Risks and technical debt:** Additional prose can obscure rather than improve behavior; keep the procedure in its canonical owners and assess concrete scenarios. Hypothetical examples can overstate effectiveness unless their limits are retained. Historical attribution and actual live behavior remain limited by available evidence.
- **Operational impact:** Existing roles, tools, delegation, models and manual transitions are unchanged. Authors and reviewers assess preparation, correction outcomes and evidence quality rather than question or commit counts.
- **Reversibility and recovery:** Material future changes need engineer-directed planning and appropriate decision coverage. Preserve accepted rationale and finalized evidence; correct attributable implementation mistakes without overwriting user work. Denial and uncertain completion retain their existing safeguards.
- **Dependencies:** Existing lifecycle intake, sign-off, authorship, permission and Review contracts; the associated Plan's bounded outcome, checks and conditional checkpoint strategy. This record creates no runtime permission or enforcement mechanism.

## Standards and practice alignment

Uses this repository's inspected numbered `docs/adr/` convention and ADR template. No external standard compliance, enterprise governance, universal consumer directory, mandatory renderer or new support commitment is asserted.

## Open items and decision conditions

| Item | Consequence / affected work | Owner | Resolution route | State |
| --- | --- | --- | --- | --- |
| Exact-snapshot sign-off and persisted acceptance | Source effects dependent on recorded sign-off for D1–D3 | Engineer; Implement coordinator for metadata only | Qualifying explicit `/implement` with inspected Plan v0.5 and this Proposed v0.1 preimage, under then-effective policy; separately inspect authority, conditions, permission and conflicts, save metadata only and fully read back | Pending invocation/persistence, not an unresolved design choice |
| Actual effective capabilities and local validation results | Particular checks/effects and their acceptance evidence | Implement coordinator | Observe at execution; diagnose ordinary in-boundary failures, report unavailable evidence truthfully and hold only dependent acceptance/effects | Execution facts, not assumed passes |
| Future live effectiveness | Runtime claims only, not authored-delivery acceptance | Engineer for separate authorization | Separately authorized version/payload-bound phase sessions and actual chronological evidence | Unverified and outside this delivery |

## References and implementation binding

- [Research brief revision 1](../copilot/026-rpir-handoff-reliability/001-research-brief.md), 2026-11-04, local physical source.
- **Associated Plan:** [001-implementation-plan.md](../copilot/026-rpir-handoff-reliability/001-implementation-plan.md), v0.5, 2026-11-04; sole delivery hierarchy and acceptance criteria.
- **Coverage binding:** D1 → Work Items 1 and 3; D2 → Work Items 1, 2 and 3; D3 → Work Items 1, 2 and 3. Plan binds this exact Proposed v0.1 snapshot and its conditions. ADRs 004/005 remain baseline evidence only, not additional sign-off or status-write targets.
- **Renderer/retention:** Existing Markdown ADR convention; no extra renderer requirement established. Preserve prior records without reciprocal/register edits.

Only a qualifying explicit `/implement` under policy effective before that invocation can sign off this exact visibly bound Proposed snapshot. Plan answers, destination selection, record save, manual prefill and Review are not sign-off. Implement alone may separately record the guarded metadata outcome under the lifecycle core, preserving decision text and substantive v0.1. A failed/denied/unverified save is not persisted Accepted state; hold only effects dependent on the missing sign-off record and continue independent approved work. No retroactivity, general ADR authorship or authority expansion is implied.