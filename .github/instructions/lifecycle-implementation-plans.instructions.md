---
name: Lifecycle implementation plans
description: Author durable Plan-stage implementation records in the approved planning or delivery locations.
applyTo: 'docs/{planning,delivery}/**/[0-9][0-9][0-9]-implementation-plan.md'
---

# Lifecycle implementation plans

Use this guidance only for the durable `implementation-plan.md` record produced by a Plan stage.

## Required content

- Follow the [implementation plan template](../skills/architecture-planning/implementation-plan-template.md). New records use `<NNN>-implementation-plan.md`, with exactly three ASCII decimal digits and an independent folder-local sequence for this suffix; existing unprefixed records are legacy and are not renamed or implicitly migrated.
- Identify the lifecycle context:
  - planning records identify the initiative slug;
  - delivery records identify the Work Item ID, short slug, tracker URL, and snapshot metadata when a Work Item exists.
- Link the exact approved numbered research brief and preserve material evidence, assumptions, unresolved decisions, and supersession or material-revision information.
- Link the exact approved numbered research-brief path and record exact plan identity, lifecycle folder, allocation/provenance basis, and any authorized associated implementation-report path or contract. A report is immutable execution evidence only and is not a source of scope, hierarchy, status, acceptance, or implementation authorization.
- Record one of exactly four prospective lifecycle statuses: `Plan drafted`, `Implementing`, `Ready for review`, or `Accepted`; retain the explicit developer approval boundary before the Implement handoff.
- Record a delivery approach covering the delivery model, applicable sequencing or rollout, dependencies, controls, and key mitigations.
- Record conditional baseline and pre-completion execution gates for each work item. Distinguish available, manual/structural, and unavailable validation, including residual gaps; do not prescribe or invent commands.
- Map requirements and Research evidence to ordered work items, acceptance criteria, and validation scenarios.
- Use one authoritative planned-work-item register for traceability, including exact locations, optional specification references, dependencies, validation, rollback/backout, and user or operator instructions.
- Follow the register with reusable detailed work-item sections and cross-cutting validation/acceptance coverage. Complete documentation, rollout, specification, and operator fields only when applicable and evidenced; otherwise record `N/A` or unavailable with justification.
- In each detailed Work Item, include one or more initially unchecked execution-completion markers, scoped Tasks using `Task <work-item-id>.<task-number>` identifiers, and in each Task one or more ordered scoped Steps using `Step <work-item-id>.<task-number>.<step-number>` identifiers. A Work Item, Task, or Step is complete only when its defined implementation work is complete; a parent may be checked only after all required children are checked. Rework unchecks the affected unit and its incomplete or affected parents. These markers do not represent validation, authorization, review, or acceptance.
- State the purpose or planned outcome of each Task. Each Step must describe one concrete planned operation and its exact target when evidenced; represent each known repeated target with a separate Step, and record an unresolved decision, conditional discovery gate, or bounded grouping when the target inventory is unknown rather than inventing targets.
- Distinguish available, manual/structural, and unavailable validation, including residual gaps.
- State that the record is a planning artifact and does not authorize implementation.
- Allocate a new plan by inspecting matching-suffix inventory, using `001` or maximum valid prefix plus one, immediately re-inspecting before creation, and never overwriting. Stop on malformed or inaccessible inventory or collision; never select a plan by highest prefix, recency, or inference. Material revisions update only the exact named plan path in place and record revision/supersession metadata.
- Resolve agent-discovered material unknowns through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) before completion or handoff. Omit **Open questions** unless it names a developer-declared intentionally open or unknown question.

## Source of truth

- Before a Work Item is created or imported, the planning record is the reviewable working draft.
- After creation or import, the external tracker is authoritative for workflow state, priority, assignment, and tracker discussion.
- During delivery, the local implementation plan is a versioned scope and acceptance snapshot, not an independent workflow source.

## Boundaries

- Preserve the exact selected numbered filename and lifecycle folder layout; use exact repository-relative paths for authorization, links, handoffs, and mutations.
- Update the one canonical plan in place for material revisions and identify what changed or was superseded.
- Treat the `Planned work items` table as the sole authoritative Work Item register, including its Work Item execution-completion marker; subordinate Task/Step markers do not create a second scope model. Completion is distinct from validation, authorization, review, and acceptance.
- Retain the manual developer approval boundary. Plan authors the initial unchecked Work Item/Task/Step hierarchy and persists the canonical plan; Implement may update only the named plan's status and existing completion markers during an approved pass; Review may update only that plan's `Status` to `Accepted` under its explicit acceptance conditions. Adding, removing, or restructuring hierarchy requires a Plan-stage amendment. Existing plans retain legacy planning-only checkbox semantics unless amended by Plan.
- Do not turn the plan into a chat transcript, code change, tracker update, approval substitute, or implementation report. If an associated report is referenced, it remains non-authorizing and immutable execution evidence.
- Do not create parent `README.md` files or other lifecycle artifacts unless a separate approved scope explicitly requests them.