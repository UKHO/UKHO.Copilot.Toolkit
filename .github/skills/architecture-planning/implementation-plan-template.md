---
description: "Template for an initial or issue-scoped RPIR implementation plan"
---

# Implementation plan

## Identity, status, lineage, and authority

- **Lifecycle and plan identity:** Planning initiative slug, or delivery Work Item ID and short slug; stable subject and pass identity; original output channel/locator; actual inspected content snapshot/version and invocation. Record the exact repository-relative canonical plan path and lifecycle folder only for a verified numbered local record.
- **Working revision and local status:** Record unresolved decisions and affected units; for an eligible numbered local plan, use `Plan drafted`, `Implementing`, `Ready for review`, or `Accepted` as applicable.
- **Plan revision and allocation:** Identify the working revision and freeze the actual version supplied to `/implement` separately before later revisions. For a new local plan, inspect the matching `-implementation-plan.md` inventory, use `001` or maximum valid three-digit prefix plus one, immediately re-inspect before creating the exact path, and never overwrite; do not infer identity or approval from prefix or recency.
- **Plan origin and predecessor envelope:** Initial Research or engineer-chosen Review findings; record predecessor kind, subject, original channel/locator, inspected substantive content/version (or immutable revision), invocation, and agreed version. Preserve source-neutral lineage for attachments, HTTPS, paste, or non-numbered sources.
- **Initial Research envelope:** Record the inspected Research version and original channel/locator, its evidence, assumptions, decisions, and sources. For a real numbered local Research record, include its exact canonical identity and matching direct one-hop link. Initial `/plan` completes and approves that inspected Research version in the same request; Review-origin `/plan` does not re-close Research.
- **Review-origin lineage:** Record the source Review report/version, its reviewed implementation report/version, previous plan/version and original Research/version. Identify each real numbered local record by exact canonical repository-relative identity and matching direct one-hop link; otherwise record its actual source-neutral locator and inspected version, never a fabricated link.
- **Review findings and fresh scope:** Name independently supported engineer-chosen findings, their evidence, new bounded scope, and any carried unresolved blockers and affected units. New issue plans have new unchecked units, validation, and acceptance; old plans and finalized reports remain historical. Do not guess a blocked fix.
- **Local relationship integrity:** For every real numbered local relationship, verify the exact canonical field/link pair, expected kind, direct one-hop relationship, accessible target, and required same-folder relationship. Record `N/A` when no such local record exists; never turn a remote label into a local link.
- **Delivery tracker (conditional):** When a Work Item exists, record its ID, short slug, tracker URL, and inspected snapshot metadata. Otherwise state `N/A`. After creation or import, the external tracker owns workflow state, priority, assignment, and discussion; this plan version governs this pass's scope and acceptance.
- **Associated reports (conditional):** Record each available implementation or Review report's inspected kind, subject, source channel/locator, identity, and version. For every real numbered local implementation report, record its verified canonical identity and matching direct link, with required same-folder checks. For an eligible numbered local Review report, also verify and record its same-folder relationship and suffix-specific two-scan/no-overwrite allocation evidence; otherwise do not invent a local path. Record Review outcomes (`No remediation required`, `Remediation required`, or `Needs clarification`) and actionable or unclear finding classifications as evidence, not lifecycle status. Record an associated implementation-report relationship only when authorized. Reports are immutable, non-authorizing evidence; do not preallocate report paths or infer a report from its prefix or recency.
- **Approval boundary:** Publication and `Plan drafted` authorize no edits, commands, acceptance, or automatic handoff. Explicit `/implement` with this actual inspected version approves only its bounded pass; every edit remains subject to its own scope, evidence, permission, and safety checks. Prior-pass approval never carries forward.

## Outcome, boundaries, and chosen approach

- **Objective and success measures:** State the intended outcome and observable acceptance.
- **Scope:** Exact included and excluded files, locations, behavior, and any conditional gates. Preserve required behavior and compatibility.
- **Evidence and requirements:** Cite Research evidence, requirements, and applicable specifications; distinguish facts, assumptions, and decisions.
- **Approach:** Record the chosen delivery approach, existing patterns to reuse, design decisions, sequencing/branching, dependencies, and material rejected alternatives with reasons. Do not defer implementation-relevant choices to Implement.
- **Assumptions and unresolved decisions:** Identify assumptions and decisions with their evidence, including named gaps and affected units. Before affected edits, resolve every material requirement, target/selection rule, branch, operation/design, safety, command/dependency, validation, acceptance, rollback, and operator-effect decision. Do not invent missing decisions; continue safe planning and investigation while gaps remain.

## Planned work items

This is the **sole authoritative Work Item register** and the sole register of scope and Research/requirement traceability. Use `N/A` or `unavailable: <reason>` where appropriate. Work Item, Task, and Step checkboxes begin unchecked and mark execution completion only—not validation, approval, authorization, review, handoff, or acceptance.

| Completion and ID/order | Outcome and exact target(s) | Research, requirement, and specification references | Acceptance scenario(s) | Dependencies and conditional gates |
| --- | --- | --- | --- | --- |
| [ ] Work Item 1 | <outcome; exact evidenced target(s)> | <evidence and specification, or N/A> | <observable scenario and expected result> | <dependencies/gates, or N/A with reason> |

## Detailed work items

Repeat the following structure for every registered Work Item. Keep each Task outcome and its ordered, unchecked Steps adjacent to the register; Plan alone amends this hierarchy. Complete child Steps before Tasks and Tasks before their Work Item. Include separate Steps for known repeated targets. Record an unknown target and its affected unit explicitly; do not perform affected edits unless the target is resolved or covered by the sole observation boundary below.

### Work Item <ID>: <short description>

- [ ] **Task <work-item-id>.<task-number>: <outcome or purpose>**
  1. [ ] **Step <work-item-id>.<task-number>.<step-number>: <one concrete operation at an exact evidenced target>; state every allowed branch.**
  2. [ ] **Step <work-item-id>.<task-number>.<step-number>: <one concrete operation at an exact evidenced target>; state every allowed branch.**

For each Work Item, record its applicable decisions once:

- **Targets, operations, and requirements/specifications:** Exact files, folders, symbols, or other locations and concrete operations/allowed branches for each Step; Task outcome; requirement, Research, and specification references.
- **Dependencies and gates:** Dependencies and controls. State conditional baseline and pre-completion gates, applicable targets, required evidence and completion condition; identify available evidence, manual/structural fallback, or `unavailable: <reason>` and residual gap. Do not invent commands, environments, or evidence.
- **Acceptance and validation:** Observable acceptance scenario(s) and expected result; available automated checks, manual/structural checks, and unavailable checks separately, with reasons and residual gaps. Validation genuinely unavailable does not satisfy an implementation-relevant requirement.
- **Documentation impacts:** Exact documentation location and change, or `N/A` with reason.
- **Safety stop:** Applicable safety gates and explicit stop conditions for denial, failure, unexpected effects, unknown effects, or mismatched evidence. Preserve effective VS Code/platform permissions and Workspace Trust; native Windows is not sandbox containment.
- **Rollback/backout:** Exact bounded backout or rollback and its conditions, or `N/A` with reason. Do not imply silent rollback or authorize cleanup not in scope.
- **User/operator effects and instructions:** All applicable effects, user actions, rollout/operator instructions, and limits; use `N/A` only when shown irrelevant.
- **Script Runner goal and effects:** For an applicable terminal-observation task, record phase, self-contained goal, selected opened workspace root, exact authorized scope, expected observation/result, anticipated file/process/external effects, preflight, inspection limits, denial/failure disposition, validation, and rollback. Otherwise record `N/A` with a reason. Ordinary task commands route only through Script Runner; it selects task-relevant command(s) and cwd if needed. Do not prescribe commands, operation IDs, catalogue rows, or Tiers. A goal grants no extra scope or lifecycle authority and does not authorize arbitrary dependency installation or a new implementation target.

## Cross-cutting validation, risks, and handoff

- **Compatibility and migration:** State compatibility considerations and migration/rollout applicability once across the plan, including affected items and evidence; use `N/A` with reason when irrelevant. No migration or deployment is implied.
- **Cross-item validation:** Identify only validation that genuinely spans multiple Work Items, its applicable scope, expected evidence, method, owner/result, and any unavailable capability or residual gap. Keep item-specific checks in that item's decisions; do not duplicate generic matrices or completeness checklists.
- **Shared risks and controls:** Record cross-cutting risks, impacts, and mitigations; item-specific risks remain with their Work Item.
- **Sole implementation-time observation boundary:** An observation may remain for Implement only when its exact target or deterministic selection predicate, every permitted branch and operation, stop condition, safety gate, validation, acceptance, rollback, and operator effect are fully prescribed here, and its result cannot change scope, hierarchy, target selection, design, safety, commands, dependencies, acceptance, or any other implementation decision. Otherwise it is research or a decision, and affected edits must wait for resolution. Research, Plan, and Review must not intentionally use Script Runner to edit project files; Implement may intentionally edit only this plan's approved scope. Respect actual platform permissions, selected opened root, and effect inspection; denial, failed execution, unexpected writes, or unknown effects stop the affected work without alternate-role retry or silent rollback. The separate direct-terminal cleanup exception remains limited to an exact plan-listed directory confirmed empty and contained, with manual approval for that invocation and terminal auto-approval disabled; removal is non-recursive, uses no wildcard or traversal, and is followed by parent-path inspection. It is not an ordinary command or validation route.
- **Material-question control:** Investigate agent-discovered material unknowns through [agent-question-resolution](../agent-question-resolution/SKILL.md) during Plan work; disclose remaining questions and affected units. A clarification resumes this work and is not approval to transition. Omit **Open questions** unless the developer expressly declares a named question intentionally open or unknown.
- **Manual handoff:** Handoff is manual; do not auto-submit. The implementation input is this plan's actual inspected content/version through an admissible source. Implement reports changed files, acceptance status, validation performed/not run/unavailable/failed, deviations, limitations, and residual risks. A report remains non-authorizing evidence; it does not expand scope or trigger the next phase.
- **Report-first `Accepted` rule:** Only after a persisted and verified all-OK `No remediation required` Review report matches the current plan and implementation lineage, applicable work and validation are complete, and no finding or blocker remains, may Review update an eligible local plan's `Ready for review` status to `Accepted` with required fresh integrity checks. If no eligible local target exists, finish and record why no local write occurred. `/review` admission alone never accepts. Actionable, unclear, or mixed findings do not trigger `Accepted` or authorize edits; a later engineer-chosen `/plan` creates a distinct issue plan with fresh unchecked work.
