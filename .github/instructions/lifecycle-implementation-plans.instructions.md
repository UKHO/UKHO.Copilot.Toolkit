---
name: Lifecycle implementation plans
description: Author durable Plan-stage implementation records in the approved planning or delivery locations.
applyTo: 'docs/{planning,delivery}/**/[0-9][0-9][0-9]-implementation-plan.md'
---

# Lifecycle implementation plans

Use this guidance only for the durable `implementation-plan.md` record produced by a Plan stage.

## Required content

- Follow the [implementation plan template](../skills/architecture-planning/implementation-plan-template.md) for the complete durable schema, fields, hierarchy, gates, validation, acceptance, rollback, provenance, report, and operator requirements. New records use `<NNN>-implementation-plan.md`, with exactly three ASCII decimal digits and an independent folder-local sequence for this suffix; existing unprefixed records are legacy and are not renamed or implicitly migrated.
- Apply the shared [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) for inspected source-neutral predecessor input, direct provenance and phase boundaries; this instruction governs numbered local plan records only, not the admissibility of other inspected documents.
- Identify the lifecycle context:
  - planning records identify the initiative slug;
  - delivery records identify the Work Item ID, short slug, tracker URL, and snapshot metadata when a Work Item exists.
- Identify initial Research-origin or later Review-origin planning. Record the predecessor's kind, subject, original channel/locator, actual inspected snapshot/version, invocation and direct ancestry. Initial `/plan` approves/completes the inspected Research version; Review-origin `/plan` agrees to plan from supported findings without re-closing Research. For actual numbered local relationships, record exact canonical repository-relative fields and matching direct one-hop renderable links; for attachment, HTTPS, paste or non-numbered sources record truthful inspected-version lineage without inventing a numbered path or link. Preserve evidence, unresolved decisions and revision history.
- For an issue plan, record its source Review report/version, reviewed implementation report/version, prior plan/version and original Research/version, plus selected independently actionable findings and carried unresolved blockers. Allocate a distinct plan with new unchecked units, scope, validation and acceptance; do not mutate the prior plan or immutable reports.
- Record only lifecycle-core-derived exact repository-relative canonical identities for the plan, lifecycle folder, allocation/provenance basis, and any authorized associated implementation-report path or contract. Reports remain immutable, non-authorizing evidence.
- For an associated completed Review, record its inspected kind, source channel/locator and version. If an eligible numbered local Review report exists, record its verified canonical identity, matching direct link and same-folder suffix-specific two-scan/no-overwrite evidence. Otherwise do not invent a local path. Finalized reports are immutable, non-authorizing evidence; rejected inputs create no final disposition.
- Record `Draft` or `Blocked` for the working plan and its unresolved decisions; a numbered local plan uses lifecycle `Status: Plan drafted`, `Implementing`, `Ready for review` or `Accepted`. Publishing a draft never authorizes edits. `/implement` with the inspected executable version supplies the routine bounded-pass approval; no duplicate approval question is needed.
- Use the template's delivery approach, bounded task goals and effects, execution-gate, validation, and acceptance fields; do not prescribe or invent commands.
- Map requirements and Research evidence to ordered work items, acceptance criteria, and validation scenarios.
- Before `/implement` edits, apply a fail-closed implementation-readiness predicate: resolve every implementation-relevant requirement, exact or deterministically selected target, branch, concrete operation/design choice, safety decision, command or dependency decision, validation condition, acceptance condition, rollback, and operator effect. A missing item can remain explicit in a persistable `Draft` or `Blocked` plan, but blocks affected edits; never invent or defer it to Implement.
- Permit implementation-time observation only as the sole bounded exception: its exact target or deterministic selection predicate, every permitted branch and operation, stop condition, safety gate, validation, acceptance, rollback, and operator effect must already be recorded, and its result must not change scope, hierarchy, target selection, design, safety, commands, dependencies, acceptance, or any other implementation decision. Otherwise it is research and blocks readiness. Genuinely unavailable validation may be disclosed with its reason and residual gap, but does not satisfy an implementation-relevant requirement; irrelevant context may remain disclosed only when shown irrelevant.
- For applicable terminal-observation tasks, record the phase, self-contained goal, selected opened root, authorized scope, expected result, effects, preflight, inspection limits, denial/failure disposition, validation and rollback. If no task needs it, record `N/A` with a reason. Do not invent command eligibility, dependencies or scope; catalogue IDs, literal command rows and Tiers are not prerequisites.
- Use the template's one authoritative register, detailed hierarchy, cross-cutting validation, acceptance, rollback, and operator fields; preserve its unchecked-marker and unknown-target rules.
- State that the record is a planning artifact and does not authorize implementation.
- Allocate each new local initial or issue plan by inspecting matching-suffix inventory, using `001` or maximum valid prefix plus one, immediately re-inspecting before creation, and never overwriting. Stop on malformed or inaccessible inventory or collision; never select by highest prefix or recency. Revise only the exact named working draft and record revision metadata; freeze an agreed version separately before further revisions. Never reopen the previous pass's plan.
- Resolve agent-discovered material unknowns through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) before completion or handoff. Omit **Open questions** unless it names a developer-declared intentionally open or unknown question.

## Source of truth

- Before a Work Item is created or imported, the planning record is the reviewable working draft.
- After creation or import, the external tracker is authoritative for workflow state, priority, assignment, and tracker discussion.
- During delivery, the local implementation plan is a versioned scope and acceptance snapshot, not an independent workflow source.

## Boundaries

- Preserve the exact selected numbered filename and lifecycle folder layout; use lifecycle-core-derived identities for authorization, identity, handoffs, and mutations. A renderable Markdown destination is provenance evidence only.
- Update only this pass's identified working plan for draft revisions and identify what changed or was superseded; never overwrite a frozen agreed version.
- Treat the template's `Planned work items` table and hierarchy as the sole scope model; Plan remains the sole author of scope and hierarchy.
- Plan authors this plan's fresh unchecked Work Item/Task/Step hierarchy. Explicit `/implement` with its inspected executable version approves its bounded pass; Implement may update only this plan's eligible status and existing completion markers. Review may update only an eligible current local plan's `Status` to `Accepted` under the report-first conditions below. Plan alone amends a working hierarchy; older finalized plans retain their history.
- After a persisted verified all-OK `No remediation required` Review report with matching current plan and implementation lineage, completed applicable work and validation and no unresolved findings, Review may change an eligible local `Ready for review` to `Accepted` using complete fresh preimage, local field/link and status-only postimage checks. If no eligible local target exists, finish and record why no write occurred; `/review` entry alone does not accept. Actionable, blocked or mixed findings never trigger `Accepted` and do not authorize edits. Only an engineer-chosen later `/plan` creates a new issue plan from supported findings.
- Treat planned goals as non-authorizing task context. Script Runner selects task-relevant commands and cwd if needed; require actual platform permissions, selected opened root, phase scope, effect inspection, denial handling and honest validation. An unplanned implementation target or effect requires Plan amendment. Native Windows must not be described as sandbox-contained; record its limitations and portable path/review controls.
- Do not turn the plan into a chat transcript, code change, tracker update, approval substitute, or implementation report. If an associated report is referenced, it remains non-authorizing and immutable execution evidence.
- If an associated numbered local Review report is referenced, verify its exact path and matching direct link; do not infer from prefix, suffix or recency. For another source, retain its inspected version and locator without a fabricated local link. Reports remain immutable, non-authorizing evidence.
- Do not create parent `README.md` files or other lifecycle artifacts unless a separate approved scope explicitly requests them.
