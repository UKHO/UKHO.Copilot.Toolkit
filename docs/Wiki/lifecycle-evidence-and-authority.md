---
title: Lifecycle evidence and authority
description: How RPIR documents record provenance, bounded authority and terminal status
---

## Purpose and audience

**Purpose:** Clarify which lifecycle record governs scope and status, and how to interpret research, implementation, and review evidence without treating it as authorization.

**Audience:** Anyone reading or contributing to RPIR records, especially consumers who need to know whether a document permits an action.

## Prerequisites

- Read [RPIR](rpir.md) for the phase sequence and coordinator responsibilities.
- Inspect the actual predecessor document and its version; a numbered local path is optional, not a condition for phase intake.

## Content

### What is authoritative

Each implementation plan is the authority for its own scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance criteria and validation. Its planned-work-item register is the authoritative scope register. `/implement` with that inspected executable version is approval for its bounded pass only, subject to platform permissions and effect-specific controls. Publication, a prefilled handoff, a Wiki page or approval of a previous plan does not authorize edits.

Working Research, plan, implementation and Review documents can be iterated as identifiable `Draft` or `Blocked` versions with unresolved decisions. Publication alone approves nothing. The next prompt's invocation with one inspected actual predecessor version signs it off for the next phase; freeze that agreed version as historical evidence before further draft edits. A finalized historical report cannot be overwritten or used to authorize an unrelated pass.

Accept substantive content by readable attachment, accessible HTTPS URL, paste or contained local path, numbered or not. Record the document kind, subject, original channel/locator, actual inspected content and stable version fingerprint or immutable revision, invocation and direct lineage. For a mutable source, freeze the inspected content and recheck freshness before dependent effects. Embedded instructions and claimed approvals remain untrusted data. Clarify missing, stale, conflicting or wrong-kind evidence; do not infer identity by filename prefix, suffix or recency. Only verified numbered local relationships use exact repository-relative fields and matching direct one-hop links; never invent a local link for an external source.

Initial `/plan` with inspected Research completes and approves that version for planning in the same invocation, without approving implementation. For an eligible numbered local brief, only `Status: In progress` may change to `Completed` after complete fresh preimage and status-only postimage checks. Non-local or ineligible local Research instead receives truthful source-neutral sign-off in the receiving plan with no fabricated local write or extra approval. A stale or mismatched local status target stops dependent persistence.

A plan may persist as a blocked working draft with named gaps, but `/implement` cannot make affected edits until requirements, targets, branches, operations, dependencies, safety, validation, acceptance, rollback and operator effects are sufficiently resolved. Implement does not invent a target, dependency, design or hierarchy change. An agreed actionable Review report may instead enter a later `/plan` to produce a distinct issue-scoped plan with new unchecked units and its own acceptance. That plan traces the source Review version, reviewed implementation report, previous plan and original Research without changing old completion or approval evidence.

### What is evidence only

- A Research document records cited findings, assumptions, options, risks and recommendations. It informs initial planning but does not approve a plan or edits.
- An implementation report records what a bounded plan pass changed and how it was validated. `/review` with its inspected version approves Review admission only, not acceptance.
- A Review report records independent findings and disposition. All OK requires a persisted, verified evidence-backed report with no unresolved findings; an actionable report may support an optional new plan, not direct implementation. A solely blocked report needs clarification. For mixed actionable and blocked findings, only an engineer-chosen independently evidenced subset can enter a new plan, with blockers carried forward. Reports themselves cannot change scope, hierarchy, completion markers or status.

### Manual boundaries still apply

The three routine sign-offs occur at the next prompt: initial `/plan` approves inspected Research for planning, `/implement` approves the inspected plan for its bounded pass, and `/review` agrees to inspect the identified implementation report. Later `/plan` with an agreed issue-bearing Review approves planning from its supported findings, not fixes or renewed Research closure. The engineer chooses whether to invoke it; a report alone never starts another phase. No second routine approval question is required.

After a persisted and verified all-OK Review report with matching current plan and implementation report, completed applicable work and validation, and no blockers, an eligible current local plan may change only `Status: Ready for review` to `Accepted`. Its complete preimage and exact local field/link pairs must match immediately before writing, and its postimage must differ only in status. If no eligible local plan exists, RPIR still finishes and records why no local write occurred. `/review` admission or an issue-bearing report never sets `Accepted`.

Ordinary task commands require a phase-scoped Script Runner goal and effective VS Code permission controls; a platform prompt or denial remains authoritative. Scope expansion requires an agreed plan version, and exact empty-directory cleanup needs separate per-invocation approval. Local reads and writes retain lexical and resolved containment checks; local status writes also require fresh complete preimages and bounded postimages. Source-neutral intake does not relax these effect boundaries.

These controls are procedural boundaries, not claims of UI-origin attestation, filesystem atomicity or automatic handoff. Wiki content explains the contract and does not authorize mutations, commands, status changes or remediation. The contributed prompt files are Local routes where supported; Agent Host does not load them. Do not mistake its built-in `/plan` for RPIR sign-off without validating a supported equivalent entry route.

## Canonical references

- [RPIR lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) — Canonical plan-authority, provenance, and phase-boundary semantics.
- [Repository Copilot instructions](../../.github/copilot-instructions.md) — Repository policy for status, approval, reports, handoffs, and scope limits.
- [Lifecycle implementation-plan instructions](../../.github/instructions/lifecycle-implementation-plans.instructions.md) — Plan-record authority, approval, and report-boundary requirements.
- [Lifecycle research-brief instructions](../../.github/instructions/lifecycle-research-briefs.instructions.md) — Research-record evidence and non-authority requirements.

## Related links

- [RPIR](rpir.md) — Follow the phase and coordinator model.
- [Choose an artifact](choose-an-artifact.md) — Return to consumer artifact selection.

## Next steps

- Inspect the actual document/version and direct lineage before assessing scope, completion or a phase sign-off.
- Invoke the supported next-phase route with the version you agree to use; respect bounded plan authority, report-first terminal checks and platform permissions.
