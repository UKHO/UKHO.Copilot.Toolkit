# Implementation plan

## Lifecycle identity and status

- **Lifecycle:** Planning initiative or delivery Work Item:
- **Canonical record:** Lifecycle-core-derived exact repository-relative identity: allocated `docs/planning/<initiative-slug>/<NNN>-implementation-plan.md` or `docs/delivery/<work-item-id>-<short-slug>/<NNN>-implementation-plan.md`, with `NNN` exactly three ASCII decimal digits; do not persist a raw alias, local absolute path, or Markdown destination
- **Status:** Plan drafted / Implementing / Ready for review / Accepted:
- **Plan revision:** Initial / Material revision; supersedes:
- **Approval boundary:** `Plan drafted` is the initial plan state. This record does not authorize implementation; explicit developer approval is required before the Implement handoff, and a developer request naming this saved canonical plan authorizes only its initial non-remediation scoped Implement pass. It does not authorize later passes, remediation, acceptance, scope or hierarchy changes, or excluded command routes.
- **Artifact allocation:** Inspect matching `-implementation-plan.md` prefixes, use `001` or maximum valid prefix plus one, immediately re-inspect before creation, and never overwrite. Do not infer the current or approved plan from highest prefix, recency, or suffix alone.

## Research basis and delivery metadata

- **Approved Research brief:** Lifecycle-core-derived exact numbered repository-relative canonical identity:
- **Direct Research provenance:** The canonical Research-brief identity above is authoritative; add a direct validated one-hop renderable Markdown link from this plan to that same record (the destination is evidence only):
- **Research provenance:** Evidence, assumptions, decisions, and sources carried forward from that exact brief:
- **Research evidence used:**
- **Delivery Work Item ID:** N/A until a Work Item exists
- **Tracker URL:** N/A until a Work Item exists
- **Tracker snapshot metadata:** N/A until a Work Item exists
- **Source-of-truth boundary:** After Work Item creation or import, the external tracker remains authoritative for workflow state, priority, assignment, and discussion.
- **Associated implementation report:** Lifecycle-core-derived exact same-folder repository-relative canonical identity or `N/A` until a separately authorized Implement pass; one report per approved pass, immutable after persistence, and non-authorizing execution evidence only.
- **Associated Review report:** Lifecycle-core-derived exact same-folder repository-relative canonical identity or `N/A` until a completed evidence-based Review pass; exactly one independently allocated report per completed pass, immutable after persistence, and non-authorizing review evidence only. Record disposition as `No remediation required`, `Remediation required`, or `Blocked / clarification required`, not as a lifecycle status.

## Objective, success measures, and scope

- **Objective:**
- **Success measures:**
- **In scope:**
- **Out of scope:**
- **Preserved behavior:**
- **Conditional gates:**

## Implementation readiness and observation boundary

- **Readiness predicate:** Before persistence or handoff, every implementation-relevant requirement, exact or deterministically selected target, branch, concrete operation/design choice, safety decision, command or dependency decision, validation condition, acceptance condition, rollback, and operator effect is resolved in this plan. A missing, ambiguous, unverified, or unplanned item blocks persistence and handoff; it must not be invented or deferred to Implement.
- **Sole permitted observation boundary:** An implementation-time observation is permitted only when its exact target or deterministic selection predicate, every permitted branch and operation, stop condition, safety gate, validation, acceptance, rollback, and operator effect are fully prescribed here, and the observation cannot change scope, hierarchy, target selection, design, safety, commands, dependencies, acceptance, or any other implementation decision. Otherwise the activity is research or a decision and blocks readiness.
- **Validation disclosure:** Validation that is genuinely unavailable may remain recorded as unavailable with its reason and residual gap; it does not satisfy an implementation-relevant validation, acceptance, safety, or rollback requirement. Context explicitly demonstrated to be irrelevant to implementation may also be disclosed without blocking readiness.
- **Authority boundary:** Plan owns the initial scope and Work Item/Task/Step hierarchy. This readiness section does not authorize implementation, commands, remediation, acceptance, or automatic handoff.

## Bounded Script Runner task goals and effects

For each applicable terminal-observation task, record its phase, self-contained goal, selected opened workspace root, authorized scope, expected observation and result, anticipated file/process/external effects, prerequisites, safety stops, validation, failure disposition and rollback. If none applies, record `N/A` with a reason. Do not require a catalogue, operation ID, literal command, fixed command row or Tier. Script Runner selects a task-relevant command and cwd if needed, subject to effective VS Code permissions; a planned goal does not authorize additional scope, lifecycle mutations, acceptance, or execution when the platform denies it. Research, Plan and Review must not intentionally edit project files through Runner; Implement remains limited to approved scope. Unknown effects or missing implementation decisions block readiness rather than becoming Runner choices.

## Assumptions and unresolved decisions

- **Assumptions:**
- **Unresolved decisions:**
- **Material-question control:** Resolve every agent-discovered material unknown through [agent-question-resolution](../agent-question-resolution/SKILL.md) before completion or handoff. Omit **Open questions** unless the developer expressly declares a named question intentionally open or unknown.
- **Dependencies:**

## Approach, reuse, and alternatives

- **Existing patterns to reuse:**
- **Design decisions:**
- **Rejected alternatives and reasons:**

## Delivery approach

- **Delivery model:**
- **Sequencing, branching, or rollout:** Record only when applicable and evidenced.
- **Dependencies and controls:**
- **Key risks and mitigations:**

## Execution gates

**Purpose:** Timing and completion controls before and after each work item.

Record gates per planned work item. Do not invent commands, environments, or evidence.

| Gate | Applies to | Required evidence when available | Fallback when automation is unavailable | Completion condition |
| --- | --- | --- | --- | --- |
| Baseline |  | Approved, documented target-repository validation before item work. | Manual or structural inspection, with unavailable checks and gaps stated. | Baseline outcome or explicit gap is recorded before work begins. |
| Pre-completion |  | Approved, documented target-repository validation after item work. | Manual or structural completion evidence, residual risks, and unavailable checks. | Outcome, owner, and residual gap are recorded before completion. |

## Execution and validation observations

List evidenced candidate checks and bounded goals, not command authorization. For each, state the phase, selected opened root, scope, expected result, effects, preflight, inspection limits and denial/failure disposition. Distinguish available, unavailable and not-run checks. No arbitrary dependency installation or new implementation target is authorized by this section. Native Windows does not guarantee sandbox containment; preserve platform permissions and human review. The separate exact empty-directory cleanup exception still requires its named target, confirmed emptiness and containment, individual developer approval with terminal auto-approval disabled, non-recursion and parent-path inspection.

## Planned work items

This is the one authoritative register for requirement and Research traceability. Use `N/A` or “unavailable — <reason>” where applicable.

| Work Item completion, ID and order | Description and exact location | Research/requirement evidence | Acceptance criterion and validation scenario | Specification references, when applicable | Dependencies | Validation and gates | Rollback/backout | User or operator instructions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [ ] Work Item 1 |  |  |  |  |  |  |  |  |

## Detailed work items

Repeat this section for each planned work item. Every item must account for scope, dependencies, validation, rollback/backout, and user or operator effects. Work Item, Task, and Step boxes are unchecked execution-completion markers, not validation, authorization, review, or acceptance state; hierarchy changes require a Plan-stage amendment.

### Work item <ID> — <short description>

- [ ] **Task <work-item-id>.<task-number> — <planned outcome or purpose>**
	1. [ ] **Step <work-item-id>.<task-number>.<step-number> — <one concrete planned operation> at <exact evidenced target>.**
	2. [ ] **Step <work-item-id>.<task-number>.<step-number> — <one concrete planned operation> at <exact evidenced target>.**
- [ ] **Task <work-item-id>.<task-number> — <repeat for each additional planned outcome or purpose>.**
	1. [ ] **Step <work-item-id>.<task-number>.<step-number> — <one concrete planned operation> at <exact evidenced target>.**

	Use at least one Task and one nested Step per Task. Create separate Steps for known repeated targets. An implementation-relevant unknown target inventory blocks persistence and handoff unless covered by the prescribed observation boundary; do not invent targets. Adding, removing, or restructuring hierarchy requires a Plan-stage amendment.

**Validation purpose:** Individual-item evidence.

- [ ] **Exact files, folders, symbols, or other locations:**
- [ ] **Requirements/specification references:** N/A or cite available evidence.
- [ ] **Documentation impacts:** N/A or identify the exact documentation location and change.
- [ ] **Dependencies and execution gates:**
- [ ] **Validation:** Record available, manual/structural, and unavailable checks separately.
- [ ] **Rollback/backout:**
- [ ] **User or operator effects and instructions:** N/A only when shown irrelevant to implementation; otherwise provide the complete evidenced effect and instruction.

## Compatibility, migration, and rollback

- **Compatibility considerations:**
- **Migration or rollout:**
- **Rollback:**
- **Material implementation deviation policy:**

## Provenance and report authority

- Lifecycle-core-derived exact plan identity and repository-relative path:
- Lifecycle-core-derived exact approved research-brief identity and direct validated one-hop renderable provenance link from this plan to that same record:
- Lifecycle-core-derived exact associated implementation-report canonical identity, when authorized:
- Lifecycle-core-derived exact associated Review-report canonical identity, when authorized:
- **Review-report contract and provenance (when applicable):** Lifecycle-core-derived exact canonical identities for the plan, reviewed implementation report, and allocated Review report; lifecycle identity, suffix-specific two-scan allocation evidence, and delegated-review/omission evidence.
- **Review acceptance and remediation traceability (when applicable):** Persist the Review report before disposition/acceptance; only `No remediation required` followed by explicit developer acceptance may lead to `Accepted`. Remediation accepts exactly one source Review-report input and derives the plan identity from that report under the lifecycle core; do not require separately supplied plan or implementation-report aliases. Validate the source report's exact canonical plan field/direct local link and reviewed-implementation-report field/direct local link, then validate that the reviewed implementation report carries the same exact canonical plan field/direct local link. Map findings only to existing Work Item/Task/Step hierarchy, preserve separate approval and manual handoff, and require a Plan-stage amendment for any hierarchy change. Reports remain immutable, non-authorizing evidence and cannot authorize remediation, scope, hierarchy, status, or acceptance.
- The plan remains authoritative for scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation. Any implementation report or Review report is immutable evidence only; neither approves, authorizes, expands, revises, or replaces this plan, and a Review report cannot authorize remediation.

## Risks and controls

| Risk | Impact | Control or mitigation |
| --- | --- | --- |
|  |  |  |

## Validation strategy and residual gaps

**Purpose:** Overall summary of available, manual, and unavailable validation capabilities.

- **Available automated checks:**
- **Manual or structural checks:**
- **Unavailable checks and why:**
- **Residual validation gaps:**

## Cross-cutting validation and acceptance

**Purpose:** Validation evidence that spans multiple work items.

Cover only applicable scenarios and do not require checks unavailable in the target repository.

| Validation area | Applicable scope | Expected evidence or outcome | Check method | Result, owner, or gap |
| --- | --- | --- | --- | --- |
| Build or static checks |  |  |  |  |
| Unit or integration behavior |  |  |  |  |
| Manual or structural review |  |  |  |  |
| Security, compatibility, or migration |  |  |  |  |
| Documentation and operator acceptance |  |  |  |  |

## Validation matrix

**Purpose:** Happy-path, boundary, negative, and regression scenario coverage.

| Scenario type | Scenario | Expected result | Check method | Result or owner |
| --- | --- | --- | --- | --- |
| Happy path |  |  |  |  |
| Boundary |  |  |  |  |
| Negative |  |  |  |  |
| Regression/compatibility |  |  |  |  |

## Acceptance checklist

**Purpose:** Plan-completeness review, not test evidence.

- [ ] Scope and exclusions are explicit.
- [ ] Lifecycle-core-derived exact numbered plan, research-brief, and any authorized report canonical identities are recorded; provenance is cited and reports are explicitly non-authorizing.
- [ ] Every requirement maps to a planned work item, acceptance criterion, and validation scenario in the authoritative register.
- [ ] Exact files, sections, symbols, sequencing, and dependencies are identified.
- [ ] Each detailed Work Item contains at least one scoped unchecked Task, and each Task contains at least one nested ordered unchecked scoped Step.
- [ ] Each Task states a planned outcome or purpose, and each Step states one concrete planned operation with exact evidenced target guidance.
- [ ] Known repeated targets have separate Steps; an implementation-relevant unknown target inventory is resolved or blocks persistence and handoff, while only an irrelevant or fully prescribed observation target may remain bounded rather than invented.
- [ ] The prospective lifecycle defines only `Plan drafted`, `Implementing`, `Ready for review`, and `Accepted`; `Plan drafted` is initial, developer approval gates Implement, and explicit developer acceptance gates `Accepted`.
- [ ] The Planned work items table remains the sole authoritative Work Item register, with an initially unchecked Work Item execution-completion marker in each entry; subordinate Task/Step markers represent defined implementation-work completion only and do not represent validation, approval, authorization, review, handoff, or acceptance.
- [ ] Completion requires completed children before a parent, permits affected units and parents to be unchecked for rework, and requires a Plan-stage amendment for hierarchy changes; Plan retains hierarchy authorship and canonical persistence.
- [ ] Risks, compatibility, migration, rollback, gates, and unresolved decisions are recorded.
- [ ] No implementation-relevant requirement, target, branch, design, safety, command, dependency, validation, acceptance, rollback, or operator-effect gap remains; any unresolved item blocks persistence and handoff.
- [ ] Any implementation-time observation is fully prescribed, bounded, non-decision-changing, and satisfies the sole observation boundary; otherwise it is treated as research and blocks readiness.
- [ ] Available, manual, and unavailable validation are distinguished honestly.
- [ ] Applicable task goals and effects are phase-scoped, self-contained, and bounded by the selected opened root; unavailable checks and denied permissions are disclosed.
- [ ] No catalogue ID, literal command row, or Tier is a prerequisite; pass-scoped authority and excluded routes remain explicit.
- [ ] Developer approval is recorded before the Implement handoff.
- [ ] Every agent-discovered material unknown is resolved through the shared Skill before completion or handoff; **Open questions** is omitted unless a named developer-declared intentional unknown exists.

## Implementation handoff

- **Approved implementation input:** This saved exact numbered implementation-plan path, after explicit developer approval.
- **Handoff:** Manual only; do not auto-submit.
- **Lifecycle:** Begin at `Plan drafted`; Implement records `Implementing` only after the named-plan developer authorization for the initial non-remediation scoped pass, may report `Ready for review` only when completion and available-validation predicates are met, and Review records `Accepted` only after its explicit acceptance conditions. Existing plans retain their own approved scope and constraints until amended by Plan.
- **Implement must report:** Files changed, acceptance status, validation performed, deviations from this plan, limitations, and follow-up risks.