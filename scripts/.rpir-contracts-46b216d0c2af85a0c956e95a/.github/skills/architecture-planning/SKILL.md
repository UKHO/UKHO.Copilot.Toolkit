---
name: architecture-planning
description: Convert approved requirements and repository evidence into a file-level implementation plan with trade-offs, risks, and acceptance criteria. Use when planning a feature, refactor, or customization workflow before edits.
user-invocable: false
---

# Architecture planning

## Trigger

Use this Skill to produce and iterate an evidence-based working plan for a feature, refactor, or customization workflow before edits.

## Inputs

- Approved requirements, the inspected Research document or agreed issue-bearing Review report, and relevant repository evidence.
- For a Review-origin plan, its direct implementation-report, previous-plan, and original-Research lineage.

## Procedure

Use this skill to produce and iterate an evidence-based working plan without independently changing repository files. Investigate and disclose uncertainty; an agent readiness opinion does not veto an engineer-approved, inspected-version transition. Plan defines the outcome, acceptance and material boundaries; Implement chooses ordinary in-boundary details.

### Delegated analyst boundary

When this skill is applied by a delegated analyst, perform only the applicable evidence-gathering and analysis steps below, then return a narrow planning-lens report. The report may identify requirements, affected locations, reusable patterns, options, trade-offs, risks, validation considerations, and unanswered questions with citations. It is non-persistent input to the Plan coordinator: do not complete a plan template, author or alter Work Item, Task, or Step hierarchy, allocate, select, create, persist, revise, or authorize lifecycle artifacts, handoffs, commands, cleanup, scope, hierarchy, or approvals. Only the Plan coordinator may synthesize, author, and persist the canonical implementation plan.

1. Read the inspected Research document or agreed issue-bearing Review report and its direct implementation-report, previous-plan and original-Research lineage; inspect the affected repository areas.
2. Map each requirement to affected files, symbols, interfaces, or documentation sections.
3. Identify existing patterns to reuse and alternatives that should be rejected.
4. Define the delivery approach, including sequencing or rollout only when applicable, dependencies, controls, and key mitigations.
5. Inspect relevant build, test and script surfaces before finalizing validation. Specify the outcome, material constraints and useful checks without predicting every debugging invocation. Do not invent commands, evidence, paths, frameworks or dependencies.
6. Complete the [implementation plan template](./implementation-plan-template.md) with the inspected predecessor, one outcome/work register, material boundaries, acceptance and useful validation. Plan owns substantive scope and any hierarchy it chooses; markers and status are optional bookkeeping. An engineer-approved material Review finding may warrant a new Plan; a supported original-criteria correction instead returns manually to Implement under the original approved Plan. Do not rewrite historical evidence or invent unresolved choices.
7. Identify relevant checks and their expected effects. Implement may run permitted local checks directly or use Script Runner as an optional specialist; Research, Plan and Review remain source-read-only. Real platform denial and uncertain destructive or external completion still require reconciliation.
8. Direct the owning Plan coordinator to persist an identified working plan when local persistence is appropriate, or deliver a complete identified non-local document. Keep the plan's current questions and evidence limits explicit while continuing planning work. Freeze the inspected version when later supplied to `/implement`; persistence alone never authorizes edits.

### Resolve material planning gaps

Investigate material planning gaps and disclose what remains unresolved. Use [agent-question-resolution](../agent-question-resolution/SKILL.md) to route factual questions and obtain engineer decisions on material scope or policy choices. Continue the Plan document while answers or evidence are pending; an unresolved question does not veto an engineer-approved transition for the inspected version. An effect that depends on unresolved scope or authority remains ineligible until its own guard is satisfied.

1. Inspect the request, the inspected predecessor and relevant repository evidence before treating anything as a gap. Record each material gap with its supporting facts, inferences and remaining unknowns.
2. For every material gap, derive and record an evidence-supported answer. Do not invent a target, design, rule, dependency, validation condition or operator choice.
3. For factual gaps, investigate directly or use a suitable read-only specialist when useful. Specialists report facts and recommendations; they do not decide operator-owned choices or authorize work.
4. For operator-owned choices, or material questions still unresolved after evidence inspection and suitable specialist investigation, use [agent-question-resolution](../agent-question-resolution/SKILL.md) to explain what is known, what remains unknown and which decision or dependent effect cannot proceed, then ask the engineer directly one decision at a time. Do not delegate an operator-owned decision.
5. Revise the plan when an answer changes its material scope or acceptance. Continue planning while investigating; record unresolved questions and evidence limits accurately. A clarification answer resumes planning and is not approval of a transition.

The plan may retain unresolved questions and incomplete evidence. The engineer's `/implement` invocation with the inspected Plan transfers ownership of the bounded outcome even if an agent advised further planning. Identify effects dependent on unresolved **material** decisions; ask the engineer before changing those commitments. Ordinary implementation investigation, related-file/test selection and attributable repair need no predicted branch or new approval. Continue independent work and report evidence limits honestly.

Specify the approved outcome, material boundaries and acceptance without requiring prediction of every local repair, test or related file. Implement chooses ordinary in-boundary details and preserves original criteria. Missing material scope, new dependency or changed security/compatibility commitment requires an engineer decision; publication alone does not authorize edits.

## Limits

For a material Review-origin plan, record the inspected source Review/version, reviewed implementation report/version, prior Plan/version and original Research/version. Use direct same-folder links only for real numbered records; otherwise retain the actual locator and inspected version. Do not require a new Plan for supported corrections to the original criteria: the engineer can resume Implement with the original approved Plan and linked Review context for fresh implementation evidence and independent re-review. Preserve mixed/unclear findings without guessing fixes. A verified clean Review records acceptance; optional status bookkeeping does not create it.

## Validation

Check that the plan's outcome, boundaries, acceptance and relevant validation are evidence-based and feasible. Describe consequential command/external effects when known, without requiring a command inventory for ordinary debugging. Implement may execute permitted local checks directly or consult Script Runner; neither route overrides platform denial. Reconcile uncertain destructive or external effects before repeating them. Record saves still require actual containment, permission, non-overwrite and readback under the lifecycle core. Mark material unresolved decisions explicitly; do not invent dependencies, commands or facts. Plan persistence does not authorize implementation.

## Outputs

- A narrow, cited planning-lens report for a delegated analyst; it is non-persistent input to the Plan coordinator.
- A complete identified working implementation plan authored and persisted only by the Plan coordinator, with its unresolved questions and evidence limits explicit.
