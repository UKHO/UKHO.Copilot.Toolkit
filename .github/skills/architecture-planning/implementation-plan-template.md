# Implementation plan

## Lifecycle identity and status

- **Lifecycle:** Planning initiative or delivery Work Item:
- **Canonical record:** Exact allocated `docs/planning/<initiative-slug>/<NNN>-implementation-plan.md` or `docs/delivery/<work-item-id>-<short-slug>/<NNN>-implementation-plan.md`, with `NNN` exactly three ASCII decimal digits
- **Status:** Plan drafted / Implementing / Ready for review / Accepted:
- **Plan revision:** Initial / Material revision; supersedes:
- **Approval boundary:** `Plan drafted` is the initial plan state. This record does not authorize implementation; explicit developer approval is required before the Implement handoff, and a developer request naming this saved canonical plan authorizes its scoped Implement pass.
- **Artifact allocation:** Inspect matching `-implementation-plan.md` prefixes, use `001` or maximum valid prefix plus one, immediately re-inspect before creation, and never overwrite. Do not infer the current or approved plan from highest prefix, recency, or suffix alone.

## Research basis and delivery metadata

- **Approved Research brief:** Exact numbered repository-relative path:
- **Research provenance:** Evidence, assumptions, decisions, and sources carried forward from that exact brief:
- **Research evidence used:**
- **Delivery Work Item ID:** N/A until a Work Item exists
- **Tracker URL:** N/A until a Work Item exists
- **Tracker snapshot metadata:** N/A until a Work Item exists
- **Source-of-truth boundary:** After Work Item creation or import, the external tracker remains authoritative for workflow state, priority, assignment, and discussion.
- **Associated implementation report:** Exact same-folder path or `N/A` until a separately authorized Implement pass; one report per approved pass, immutable after persistence, and non-authorizing execution evidence only.

## Objective, success measures, and scope

- **Objective:**
- **Success measures:**
- **In scope:**
- **Out of scope:**
- **Preserved behavior:**
- **Conditional gates:**

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

## Planned work items

This is the one authoritative register for requirement and Research traceability. Use `N/A` or “unavailable — <reason>” for inapplicable or unsupported fields.

| Work Item completion, ID and order | Description and exact location | Research/requirement evidence | Acceptance criterion and validation scenario | Specification references, when applicable | Dependencies | Validation and gates | Rollback/backout | User or operator instructions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [ ] Work Item 1 |  |  |  |  |  |  |  |  |

## Detailed work items

Repeat this section for each planned work item. Keep headings conditional, but every item must account for scope, dependencies, validation, rollback/backout, and user or operator effects. Work Item, Task, and Step boxes are initially unchecked execution-completion markers: check a unit only when its defined implementation work is complete, and check a parent only after all required children are complete. Uncheck the affected unit and its affected parents when rework is needed. These markers are not validation, authorization, review, or acceptance state; hierarchy changes require a Plan-stage amendment.

### Work item <ID> — <short description>

- [ ] **Task <work-item-id>.<task-number> — <planned outcome or purpose>**
	1. [ ] **Step <work-item-id>.<task-number>.<step-number> — <one concrete planned operation> at <exact evidenced target>.**
	2. [ ] **Step <work-item-id>.<task-number>.<step-number> — <one concrete planned operation> at <exact evidenced target>.**
- [ ] **Task <work-item-id>.<task-number> — <repeat for each additional planned outcome or purpose>.**
	1. [ ] **Step <work-item-id>.<task-number>.<step-number> — <one concrete planned operation> at <exact evidenced target>.**

	Use at least one Task and at least one nested Step per Task. Create a separate Step for each known repeated target. When the target inventory is unknown, record the target as unresolved, conditional on evidence-gathering, or bounded to an evidenced grouping; do not invent target paths, symbols, or entries. Task and Step checkboxes track defined implementation-work completion only, not validation, approval, authorization, review, handoff, or acceptance status. Plan owns the initial hierarchy and canonical persistence; adding, removing, or restructuring Work Items, Tasks, or Steps requires a Plan-stage amendment.

**Validation purpose:** Individual-item evidence.

- [ ] **Exact files, folders, symbols, or other locations:**
- [ ] **Requirements/specification references:** N/A or cite available evidence.
- [ ] **Documentation impacts:** N/A or identify the exact documentation location and change.
- [ ] **Dependencies and execution gates:**
- [ ] **Validation:** Record available, manual/structural, and unavailable checks separately.
- [ ] **Rollback/backout:**
- [ ] **User or operator effects and instructions:** N/A or provide evidenced guidance.

## Compatibility, migration, and rollback

- **Compatibility considerations:**
- **Migration or rollout:**
- **Rollback:**
- **Material implementation deviation policy:**

## Provenance and report authority

- Exact plan identity and repository-relative path:
- Exact approved research-brief path:
- Associated implementation-report path, when authorized:
- The plan remains authoritative for scope, Work Item/Task/Step hierarchy, lifecycle status, acceptance, and validation. Any implementation report is immutable evidence only; it does not approve, authorize, expand, revise, or replace this plan.

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

**Purpose:** Plan-completeness review, not duplicate test evidence.

- [ ] Scope and exclusions are explicit.
- [ ] Exact numbered plan, research-brief, and any authorized report paths are recorded; provenance is cited and reports are explicitly non-authorizing.
- [ ] Every requirement maps to a planned work item, acceptance criterion, and validation scenario in the authoritative register.
- [ ] Exact files, sections, symbols, sequencing, and dependencies are identified.
- [ ] Each detailed Work Item contains at least one scoped unchecked Task, and each Task contains at least one nested ordered unchecked scoped Step.
- [ ] Each Task states a planned outcome or purpose, and each Step states one concrete planned operation with exact evidenced target guidance.
- [ ] Known repeated targets have separate Steps, and unknown target inventories are unresolved, conditional, or bounded rather than invented.
- [ ] The prospective lifecycle defines only `Plan drafted`, `Implementing`, `Ready for review`, and `Accepted`; `Plan drafted` is initial, developer approval gates Implement, and explicit developer acceptance gates `Accepted`.
- [ ] The Planned work items table remains the sole authoritative Work Item register, with an initially unchecked Work Item execution-completion marker in each entry; subordinate Task/Step markers represent defined implementation-work completion only and do not represent validation, approval, authorization, review, handoff, or acceptance.
- [ ] Completion requires completed children before a parent, permits affected units and parents to be unchecked for rework, and requires a Plan-stage amendment for hierarchy changes; Plan retains hierarchy authorship and canonical persistence.
- [ ] Risks, compatibility, migration, rollback, gates, and unresolved decisions are recorded.
- [ ] Available, manual, and unavailable validation are distinguished honestly.
- [ ] Developer approval is recorded before the Implement handoff.
- [ ] Every agent-discovered material unknown is resolved through the shared Skill before completion or handoff; **Open questions** is omitted unless a named developer-declared intentional unknown exists.

## Implementation handoff

- **Approved implementation input:** This saved exact numbered implementation-plan path, after explicit developer approval.
- **Handoff:** Manual only; do not auto-submit.
- **Lifecycle:** Begin at `Plan drafted`; Implement records `Implementing` only after the named-plan developer authorization, may report `Ready for review` only when completion and available-validation predicates are met, and Review records `Accepted` only after its explicit acceptance conditions. Existing plans remain legacy unless amended by Plan.
- **Implement must report:** Files changed, acceptance status, validation performed, deviations from this plan, limitations, and follow-up risks.