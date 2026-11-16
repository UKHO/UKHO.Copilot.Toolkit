# ADR 014: Copilot-native role model preferences and support baseline

## Record metadata

- **Status:** Accepted.
- **Substantive version:** v0.1, 2026-11-13; the complete document is the decision preimage.
- **Authored:** 2026-11-13.
- **Decision date:** 2026-11-13.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer selects the harness/support outcome and is the evidenced Toolkit decision authority. The Plan coordinator specifies the associated configuration proposal, not independent architectural approval.
- **Agreement evidence:** Research revision 8 records Copilot-only forward development, no Local backward compatibility and acceptance of practical native/model-observation limits. In this Plan conversation the engineer confirmed the proposed VS Code 1.146.0+ baseline while keeping runtime testing and activation separately authorized. Planning/persistence requests are not exact-record sign-off, account entitlement or runtime permission. The engineer's explicit `/implement` invocation on 2026-11-13 with the inspected associated Plan working v0.1 signed off this exact complete Proposed substantive v0.1, 2026-11-13 preimage; runtime testing and activation remain separately authorized.
- **Affected systems:** Shared packaged role profile, 18 agent model/effort projections, model/authoring guidance, support metadata, verifier/fixtures and user documentation.
- **Related decisions:** [ADR 007](007-local-agent-model-selection.md), Accepted v0.1 D1-D3, and [ADR 008](008-profile-derived-effort-declarations.md), Accepted v0.1 D1. Retain allocation, shared-owner design and effort-intent semantics. D1-D2 below prospectively replace only ADR 007's Local-specific support/routing/validation commitments for forward Copilot delivery; do not rewrite its accepted text, reciprocal metadata or earlier delivery history.
- **Source revisions:** Research substantive revision 8 and associated working Plan v0.1, 2026-11-13, in the local `029-rpir-harness-portability-restart` topic.

## Context and problem

The Toolkit's current profile and native agent model values are Local-oriented display names, and support metadata declares `^1.130.0`. Research establishes Copilot runtime IDs and a released VS Code 1.146.0 root-preference mechanism, but does not identify this session's active client, installed payload or account/model catalogue.

The engineer selects Copilot-only forward work without changing the existing model allocation. Native preference is a practical supported mechanism, not guaranteed model enforcement. The converted child path does not forward every required-policy field, and event/usage evidence does not expose every effective selection or fallback cause. A new router or universal telemetry service is not needed for the selected assurance level.

These two decisions jointly bind native profile projection to the evidenced client floor. Configuration, actual dispatch, explicit overrides and effort intent must remain distinguishable.

## Decision and conditions

### D1 - Copilot-only forward support with a VS Code 1.146.0 minimum

- **Choice and rationale:** Target the native Copilot harness on VS Code 1.146.0+ within the existing 1.x major boundary, setting the manifest and root lockfile engine metadata to `^1.146.0`. Align support prose and active normative guidance with that baseline. This is the evidenced floor for the selected mechanism, not proof of the absolute earliest compatible version.
- **Realistic alternatives and reasoning:** Retaining `^1.130.0` advertises a baseline not established for the new native preference mechanism. Maintaining dual-harness support invests in a retiring implementation contrary to engineer direction. A replacement host changes UI, permissions and maintenance beyond this objective. Raising the minimum to the Research-supported release is selected.
- **Actual selection or pending state:** The engineer explicitly confirmed this baseline in the Plan conversation. Exact sign-off of this standalone record is pending.
- **Conditions and affected Work Items:** Work Items 1-4. Preserve package version, dependencies and unrelated lock data. Do not infer the active process/version or universally certify later builds from a source finding. Runtime observations identify the actual supported client/payload. No installation, migration, activation, packaging or account/settings effect is authorized.

### D2 - One retained role profile, native preferred selection and truthful observations

- **Choice and rationale:** Keep one packaged canonical profile and project one Copilot runtime ID plus each role's own effort intent into its definition. Use native preferred defaults rather than routine explicit task-call model/effort arguments, parent inheritance, arrays or a new router. Support explicit engineer overrides only through evidenced permitted paths. Report assigned model separately from observed effective model and actual override/fallback evidence.
- **Realistic alternatives and reasoning:** Guidance-only does not provide useful automatic defaults. Required-policy blocking reduces override flexibility and is not forwarded as a universal child constraint. Auto/Astra defaults, fallback arrays or silent reallocation change the selected allocation. A custom router/telemetry service adds dependencies and trust concerns. Native preferences plus truthful exceptions satisfy the practical requirement without inventing guarantees.
- **Actual selection or pending state:** Existing allocation and practical assurance are engineer directions. The exact preference/reporting contract is this complete Proposed design. No model availability, effective routing or measured cost/quality equivalence is claimed.
- **Conditions and affected Work Items:** Work Items 1-4. Preserve the allocation below and ADR 008's profile-derived `reasoning-effort` intent. Do not require runtime effort proof before declaration, infer inheritance or claim application from a header. Unknown effective selection is "not observable"; an observed fallback with unavailable reason is "cause not exposed". Do not infer fallback from absent telemetry or treat a configured ID as observed dispatch. Known persistent wrong defaults require diagnosis/disposition, not a compliant-default claim. Unknown telemetry alone does not stop independent safe work. No silent downgrade, mandatory effective-effort gate, universal fallback-cause requirement, numeric fallback target, unsupported context control or account access.

| Runtime ID | Target effort | Retained roles |
| --- | --- | --- |
| `gpt-6.1-sol` | `high` | Research; Plan; Implement; Review; Architecture Analyst; Correctness Reviewer; Script Runner; Security Reviewer; Stage Assurance |
| `gpt-6.1-terra` | `high` | Codebase Investigator; Domain Investigator; Maintainability Reviewer; Requirements Analyst; Test Worker |
| `gpt-6.1-terra` | `xhigh` | Feasibility Investigator; Implementation Worker; Test Strategist |
| `gpt-6-luna` | `high` | Validation Worker |

This table states the standalone decision baseline, not a second operational profile owner. The packaged profile remains authoritative; configuration/tests are checked projections. Future roles receive deliberate capability/consequence classification rather than a permanent 18-role ceiling.

## Consequences

- **Expected benefits:** Consistent useful native role defaults, one maintainable profile and an honest client support claim.
- **Risks:** Availability, overrides, resumed sessions and exposed observation fields vary. Native preference can resolve differently; static validation is not runtime routing certification. Known mismatches and unobservable values need different dispositions.
- **Operational impact:** Agent/profile/authoring projections, support fields, checks and documentation change. No model allocation, dependency, required setting or runtime service is added.
- **Recovery:** Preserve accepted history and unrelated work. Diagnose attributable configuration/default-routing defects within the approved outcome; a changed model allocation, support baseline, host or security commitment requires engineer-directed Plan resolution.
- **Dependencies:** Research-supported released preference/effort transport, actual runtime availability and separately authorized representative validation. Source configuration and independent authored work can proceed before live evidence, with dependent validation/retirement still unmet.

## Standards and practice alignment

Reuse the packaged resource-backed profile, explicit role boundaries, scalar projection checks, existing numbered Markdown ADR convention and actual platform permission. No enterprise approval matrix, all-user entitlement, universal runtime enforcement or compatibility across every future version is asserted.

## Open items and decision conditions

| Item | Affected effects | Owner / route | State |
| --- | --- | --- | --- |
| Exact-preimage agreement and recording | Dependent implementation | Qualifying explicit engineer `/implement` with the inspected Plan; Implement verifies authority/conditions and records only guarded metadata with full readback | Pending; decision content complete |
| Actual model catalogue/defaults/overrides and observation fields | Work Item 3 and dependent Work Item 4 validation | Authorized representative observations or supplied sanitized evidence; no account/settings query or forced reallocation | Unperformed; telemetry opacity is an allowed stated limit |
| Runtime activation/loading permission | Only affected live checks | Engineer authorizes exact effects separately if needed; retain static checkpoint otherwise | Not granted by this record or baseline confirmation |

## References and implementation binding

- [Research revision 8](../copilot/029-rpir-harness-portability-restart/001-research-brief.md), "Pre-planning assessment", M1-M3 and "Practical native delivery mechanism"; ignored/local-only evidence. Source findings are attributed to the inspected Research, not independent runtime observations here.
- [Released 1.146.0 root model resolver](https://github.com/microsoft/vscode/blob/1.146.0/src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptModelResolver.ts) and [Copilot CLI reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#supported-models), as inspected in Research.
- **Associated Plan:** [001-implementation-plan.md](../copilot/029-rpir-harness-portability-restart/001-implementation-plan.md), working substantive v0.1, 2026-11-13; sole delivery hierarchy.
- **Coverage binding:** Complete Proposed v0.1 preimage, D1-D2 -> Work Items 1-4. Retained ADR 007/008 sections are not additional sign-off or status-write targets.
- **Retention/renderer:** Existing `docs/adr/` Markdown convention; preserve accepted decision text and prior lifecycle records without reciprocal metadata changes.

Only a qualifying explicit `/implement` under policy already effective before invocation signs off this exact visibly bound Proposed preimage. Answers, Plan requests, reports, workers, Runner, prefills and Review do not. Implement-only guarded metadata persistence is separate; failure is not Accepted and holds only dependent effects. No session self-upgrade, general ADR authorship or runtime authorization follows.
