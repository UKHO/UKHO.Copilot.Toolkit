# ADR 021: Mechanical and executable test protection without English-policy recognition

## Record metadata

- **Status:** Accepted.
- **Substantive version:** v0.1, 2026-11-25; the complete physical document is the decision preimage.
- **Authored:** 2026-11-25.
- **Decision date:** 2026-11-25.
- **Author:** AI assistant using Copilot SDK in VS Code, acting as the Plan coordinator.
- **Decision participants and roles:** The engineer selected the testing strategy in the 24 November Research conversation. The Plan coordinator supplies analysis and this draft, not decision authority. No additional approval body is established.
- **Agreement evidence:** The engineer's deliberate `/implement` request on 25 November 2026 supplied the physical associated Plan v0.1, 2026-11-25, visibly binding ADR 021 D1's complete Proposed v0.1 preimage dated 2026-11-25. Under the policy effective before that invocation, the request signs off only that exact preimage. The Implement coordinator independently inspected the complete Plan, Research revision 2 and unchanged ADR preimage; no additional required approval or unsatisfied decision-critical condition was evidenced. This records exact-record agreement, not delivery acceptance or runtime permission.
- **Affected systems:** Customization verifier, its fixtures and CI invocation, executable archive/candidate fixtures, and directly related testing guidance.
- **Related decisions:** [ADR 019](019-specialist-led-rpir-coordination.md), Accepted v0.1, D3, previously selected focused authored-contract checks. This decision prospectively replaces only that English-recognition protection strategy, not its specialist, waiting, execution, or authority contracts. Earlier ADR validation descriptions remain historical evidence; their accepted text and statuses are not rewritten.
- **Source revisions:** Research revision 2 and associated implementation Plan v0.1, identified below. Lifecycle records are local-only and may be absent from another checkout.

## Context and problem

The Toolkit combines three types of automated evidence: mechanical customization integrity, recognition of English policy, and executable packaging/candidate behavior. English recognizers inspect obligations, ownership paragraphs, alternatives, contradictions and selected vocabulary. Their fixtures also depend on particular source phrases and headings. A behavior-preserving wording change can therefore require maintaining both the recognizer and its mutation selectors.

The research identified equivalent wording rejected by finite recognition rules and fixture needles removed by a structured-list refactor. These are source-derived examples, not proof of the precise recent incident or measured runtime cost. Static recognition cannot establish that an agent actually follows an instruction.

The engineer deliberately intends to change artifact wording freely and judge its effectiveness through subsequent use and observation. The engineer does not want prose recognizers retained as advisory checks, high-risk exceptions, synonym lists or replacement semantic judges.

Mechanical checks still detect defects such as unsupported frontmatter, inconsistent model projections, missing resources, unsafe links and stale manifest contributions. Archive/candidate tests exercise real JavaScript mechanisms, including byte fidelity, collisions, tampering, drift and explicit failure outcomes. Removing English recognition must not disable these protections.

## Decision and conditions

### D1 - Retain mechanical and executable automation; remove authored-English recognition

- **Choice and rationale:** Remove production recognizers, routine invocations, assertions, fixtures and exclusive helpers whose subject is the meaning or wording of authored English policy. Preserve mechanical customization integrity and executable archive/candidate behavior. Use subsequent engineer-led user testing to assess artifact effectiveness, without introducing an automated evaluator.
- **Actual selection:** The engineer selected this direction during Research on 24 November. This exact complete v0.1 ADR remains Proposed until a qualifying Implement request signs off the visibly bound preimage under the policy effective at invocation.
- **Mechanical boundary:** Retain supported metadata/frontmatter, invocation and tool fields, structured model/profile tables, manifest parity, instruction applicability patterns, required resource references, local link integrity and explicit errors for required inputs. A mechanically consumed field, table or link does not become an English-policy assertion merely because it appears in Markdown.
- **Executable boundary:** Retain archive payload equality, supported README transformations, evidence validation, confirmation/preimage protocols and candidate failure handling. Exact strings used by an implemented file/CLI protocol and comparisons of actual source bytes are not semantic policy recognition.
- **Mixed responsibilities:** Split mixed checks and fixtures. In particular, preserve native-agent metadata, ADR Skill metadata/resources, lifecycle applicability patterns and inert agent-template metadata when removing their surrounding prose recognizers. Do not retain successful no-op exports or silently default missing retained inputs.
- **Unchanged contracts:** Do not weaken or refactor the underlying agent rules, delegation, waiting, ADR, execution, approval or reporting obligations. This changes their automated protection strategy, not those obligations. Directly related testing descriptions may be aligned with this decision.
- **Conditions and affected work:** Associated Plan Work Item 1. Preserve existing script interfaces, toolchain/dependency baselines, mechanical diagnostics and executable safeguards. Do not add mandatory fixture CI gates or enable packaging. Actual runtime testing, activation, packaging and publication require separate authorization.

## Alternatives and reasoning

| Option | Benefits | Costs and limitations | Disposition |
| --- | --- | --- | --- |
| Keep and organize English recognizers | Retains automatic detection of selected omissions and contradictions | Continues source/recognizer/fixture co-maintenance and finite-language false failures | Not selected |
| Keep targeted or advisory policy recognition | Reduces blocking while retaining some automatic policy protection | Still imposes the category the engineer chose to remove | Not selected |
| Mechanical/executable automation plus subsequent user observation | Removes semantic wording coupling while retaining deterministic integrity and executable protections | Deliberately loses automatic detection of English-policy omissions, wrong owners and contradictions | Engineer-selected direction |
| Add automated runtime evaluation | Could observe behavior source checks cannot establish | Adds unrequested machinery, environment dependencies and authorization requirements | Not selected |

## Consequences

- **Expected benefit:** Narrative changes no longer fail because an English recognizer or prose-fixture selector rejects them. Actual metadata, links and packaged bytes must still be correct.
- **Deliberate loss:** Automated checks no longer detect semantic omissions, conflicting instructions or weakened policy obligations. Human review and subsequent use must assess those concerns; no equivalent automatic guarantee is claimed.
- **Operational impact:** The existing verifier remains the routine mechanical CI check. Existing fixture entry points remain available. No provider, framework, dependency, role, tool grant or new mandatory CI stage is introduced.
- **Validation:** Demonstrate meaning-independence with neutral in-memory bodies, preserving mechanical inputs; pair that with retained negative fixtures. Keep real-checkout validation separate from controlled fixture success.
- **Existing failures:** Research and current planning observations identify manifest parity and agent model-metadata failures in the dirty checkout. This decision neither suppresses those checks nor authorizes unrelated metadata repairs.
- **Recovery:** Preserve actual preimages and engineer work. An attributable implementation mistake may be repaired within the approved Plan. Reintroducing English recognition later would be a new strategy decision, not an automatic rollback requirement.

## Standards and practice alignment

Reuse the existing numbered Markdown records in `docs/adr/` and the repository ADR template. Preserve prior accepted history and distinguish strategy selection, exact-record sign-off, metadata persistence and delivery acceptance. No external standard, certification, special renderer or additional governance authority is asserted.

## Decision conditions

The direction is selected and its mechanism is supported. Only exact-preimage sign-off and its separately verified metadata recording remain before dependent implementation effects; no missing essential research is assigned to Implement. Newly evidenced governance requirements or a material preimage mismatch constrain only their dependent effects and require engineer resolution.

User testing remains a future effectiveness measure, not a permission grant, an automated delivery gate or a claim that runtime checks have occurred.

## References and implementation binding

- [Research brief revision 2](../copilot/034-test-value-and-refactoring-strategy/001-research-brief.md), 24 November 2026: "Selected strategy and alternatives" and "ADR inputs and remaining gaps"; local-only evidence. The context and alternatives above stand independently of that link.
- **Associated Plan:** [001-implementation-plan.md](../copilot/034-test-value-and-refactoring-strategy/001-implementation-plan.md), substantive v0.1, 25 November 2026; sole delivery hierarchy and acceptance authority.
- **Coverage binding:** D1, complete Proposed v0.1 preimage, 25 November 2026, affects Work Item 1.
- [ADR capability and template](../../.github/skills/architecture-decision-records/SKILL.md) and [lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) govern exact-record sign-off and separate guarded metadata recording.

Only a deliberate engineer-sent Implement request with the inspected physical Plan, visibly binding this exact Proposed preimage under already-effective policy, signs off this record. This Plan-stage draft is not that event. Invocation is distinct from a successful Accepted-metadata save and full readback; this ADR grants no commands, source edits, Git effects or runtime authorization.
