# ADR 008: Profile-derived effort declarations without runtime-support claims

## Record metadata

- **Status:** Accepted.
- **Substantive version or snapshot:** v0.1, 2026-10-28; the complete physical record, including D1, is the exact preimage for the associated Plan.
- **Authored:** 2026-10-28.
- **Decision date:** 2026-10-28.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer selected declaration of intended effort and owns later testing. The Plan coordinator selects the narrow prospective coverage and static projection design. Read-only Architecture Analyst advice supplies evidence, not agreement or authority.
- **Agreement evidence:** Research Recommendation v1.0 records the engineer's answer: “A but i dont want you to ask me about support for the tag. I will tset that once the work has been completed.” That selects declaration rather than observed enforcement; it does not sign off this exact record. The current Plan invocation approves planning only. Exact-record sign-off awaits the qualifying explicit `/implement` invocation with the associated inspected Plan; no earlier invocation is retroactive. On 2026-10-28 the engineer explicitly invoked the Implement prompt with the independently inspected `docs/copilot/024-agent-model-targeting/002-implementation-plan.md` substantive v1.0, signing off this complete Proposed ADR 008 substantive v0.1 preimage, authored 2026-10-28, and its D1 section visibly bound in that Plan. The prospective rule was effective before this invocation. This records exact-snapshot agreement and bounded delivery authorization, not runtime support, testing authorization or delivery acceptance.
- **Affected systems:** Existing Toolkit agent frontmatter; the canonical role-profile Skill/resource; projection checker and fixtures; directly affected agent authoring, maintenance and consumer guidance.
- **Related decisions:** [ADR 007](007-local-agent-model-selection.md), Accepted substantive v0.1, D1–D3. This record prospectively replaces only D1's supported-before-declaration condition for profile-derived effort headers, and corresponding effort-only restrictions in D2/D3. It does not replace the allocation, automatic-model acceptance, native Local architecture, evidence requirements for model configuration, or shared-profile ownership. No reciprocal edit of accepted ADR 007 is authorized. ADR 005 supplies the existing exact-snapshot sign-off procedure, not substantive effort coverage.
- **Source revisions:** Research Recommendation v1.0 and associated follow-on Plan v1.0 in the existing `agent-model-targeting` topic. Those ignored/local-only records are supplementary traceability; the decision below stands alone.

## Context and problem

The existing canonical profile assigns one model and target effort to each Toolkit role. The current 18 agents declare model preferences but no effort. The engineer wants the existing intended effort visible in each agent definition, without reopening allocation or requiring support evidence first. The engineer will test runtime consumption after implementation.

Accepted ADR 007 permitted effort configuration only where supported and evidenced. Merely adding headers under that historical rule would contradict the contract. A prospective, separately signable decision is therefore needed; rewriting its accepted rationale or treating the old invocation as approval of this policy would be incorrect.

The retained allocation is fifteen `high` and three `xhigh`: Feasibility Investigator, Implementation Worker and Test Strategist receive `xhigh`; the other fifteen current roles receive `high`. The canonical packaged profile remains the operational source. These values reflect existing role recommendations, not new performance measurements or a runtime guarantee.

## Decision and conditions

### D1 — Declare profile-derived effort; observe application separately

- **Choice and rationale:** Declare exactly one nonempty scalar `reasoning-effort` beside the existing model field in every current agent, matching that role's canonical effort. Extend the existing profile projection check and bounded scalar parser usage, not a second allocation owner or runtime enforcement mechanism. Update canonical, authoring, maintenance and affected user guidance to distinguish recommendation, declared header and separately observed effective effort.
- **Realistic alternatives and reasoning:** Guidance-only avoids a new header but does not meet the engineer's selected outcome. Requiring observed support before declaration retains the old condition but conflicts with the explicit declaration-first choice and later engineer-owned testing. Profile-derived declaration now provides visible, statically maintainable intent with honest uncertainty and no new service; it is selected. Universal `high`, model-family inference and copied operational allocation tables lose role-specific intent and are not selected.
- **Actual selection or pending state:** The engineer selected declaration-only delivery. The coordinator's concrete implementation contract is complete and Proposed for exact-snapshot sign-off, not an unresolved architectural alternative. No runtime-support conclusion or sign-off of this exact preimage is claimed.
- **Conditions and affected Work Items:** Follow-on Plan Work Items 1–2. Preserve all model values, allocation rows, roles, tools, visibility, delegates, handoffs and authority. Static checks must validate serialized headers against the canonical profile and retain independent expected-pair and authority checks. Future roles receive deliberate classification and their own profile-derived effort; the inert starter must not activate a placeholder or impose universal `high`. Preserve the separate supported-model configuration requirement. No prompt/handoff effort overrides are needed by this decision.

Runtime consumption, warnings, rejection, effective effort, inheritance, provider differences and floor/current behavior are unobserved. Neither support, harmless ignoring nor effective application is established. Do not request tag-support evidence as a prerequisite to this declaration objective or conduct assistant activation/model trials. The engineer owns later testing. If ordinary static validation reveals a new material incompatibility, report it and hold only affected acceptance/effects for engineer direction; do not silently select a new mechanism, harness or baseline.

## Alternatives and reasoning

| Option | Benefits | Costs and limitations | Disposition |
| --- | --- | --- | --- |
| Retain guidance-only effort | No new declaration surface | Does not satisfy explicit visible headers | Not selected |
| Prove applied effort before declaring | Stronger runtime evidence | Reopens a settled requirement and makes later testing a gate | Not selected |
| Declare each canonical effort now; report observations separately | Visible role intent; existing static owner/checker reuse | Runtime behavior remains unknown | Selected D1 |
| Universal effort or independent tables | Superficially simpler editing | Loses allocation or creates drift | Not selected |
| Custom router/enforcement or harness migration | Could pursue a stronger enforcement outcome | New dependencies, permissions and support scope | Excluded |

## Consequences

- **Expected benefits:** Visible intended effort for every current role; checked profile consistency; future-role and maintenance guidance aligned with the declarations.
- **Risks and technical debt:** A runtime may consume, warn about, reject or ignore the field; none is verified. Static validity is not editor compatibility or effort enforcement. Original model-routing and Review gaps remain open unless independently resolved under their own authority.
- **Operational impact:** Static source, tests and guidance only. No dependency, engine/version, manifest inventory, setting, role, tool grant, packaging, activation, account query or publication is introduced.
- **Reversibility and recovery constraints:** Restore attributable follow-on changes from inspected preimages while preserving user work. A material policy reversal takes its own engineer-directed Plan/ADR route, not a rewrite of accepted history or Git cleanup.
- **Dependencies:** Exact Plan/ADR inspection, applicable sign-off recording and actual edit permission; canonical profile and existing checker. Runtime observations are deliberately not declaration acceptance dependencies.

## Standards and practice alignment

Reuse the Toolkit's numbered standalone ADR convention, packaged Skill/profile owner, bounded frontmatter parser and independent authority checks. This is a repository declaration contract, not certification against an editor schema, enterprise standard or runtime model API. No new governance body is inferred.

## Open items and decision conditions

| Item | Consequence / affected work | Owner | Resolution route | State |
| --- | --- | --- | --- | --- |
| Exact-record agreement and persistence | Dependent implementation of D1 | Engineer; Implement coordinator records only permitted metadata | Qualifying explicit `/implement` with follow-on Plan v1.0 binding this complete Proposed v0.1 preimage, then guarded metadata save/full readback | Pending sign-off; decision content complete |
| Runtime consumption and effective effort | Limits claims, not declaration acceptance | Engineer owns later testing | Engineer tests after implementation; assistant reports unobserved facts without requesting support proof | Unobserved; not a prerequisite |
| Original delivery/Review gaps | Original acceptance remains unmet | Original lifecycle owners | Existing original Plan and fresh implementation/Review evidence, outside this follow-on's excluded work | Unchanged |

## References and implementation binding

- **Associated Plan:** [002-implementation-plan.md](../copilot/024-agent-model-targeting/002-implementation-plan.md), substantive v1.0, 2026-10-28; ignored/local-only. The Plan alone owns delivery hierarchy, criteria and checkpoint strategy.
- **Research:** [003-research-brief.md](../copilot/024-agent-model-targeting/003-research-brief.md), Recommendation v1.0, 2026-10-28; ignored/local-only.
- **Retained coverage:** ADR 007 Accepted v0.1 D1 allocation, D2 native Local boundaries and D3 single packaged owner remain applicable except for the exact effort-declaration condition prospectively changed here.
- **Operational owner:** [Selection Skill](../../.github/skills/agent-model-selection/SKILL.md) and [role profiles](../../.github/skills/agent-model-selection/references/role-profiles.md); their current prose requires the approved implementation changes, and is not evidence this Proposed decision is already active.
- **Coverage binding:** This exact path/ID, complete Proposed v0.1 snapshot and identifiable D1 section cover the changed policy for follow-on Work Items 1–2. Reuse of ADR 007 does not sign it again or amend its accepted text.
- **Destination and renderer:** Existing `docs/adr/` location selected by the engineer for this same topic, recorded in the inspected original Plan v1.0; numbered kebab-case Markdown. No directory creation or external publication.

Only a qualifying explicit engineer `/implement` invocation with the inspected associated Plan signs off this exact preimage when the prospective rule is already effective. Publication, `/plan`, clarification answers, workers, Script Runner, manual prefills and `/review` do not. Implement alone may record the separately guarded metadata-only sign-off, preserving all substantive text/history. Invocation is not persisted Accepted state, delivery acceptance or runtime-test authorization.