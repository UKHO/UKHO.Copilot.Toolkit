# Lifecycle evidence and authority

## Purpose and audience

**Purpose:** Clarify which lifecycle record governs scope and status, and how to interpret research, implementation, and review evidence without treating it as authorization.

**Audience:** Anyone reading or contributing to RPIR records, especially consumers who need to know whether a document permits an action.

## Prerequisites

- Read [RPIR](rpir.md) for the phase sequence and coordinator responsibilities.
- Use the exact repository-relative path of the relevant canonical lifecycle record; do not select records by filename prefix, suffix, recency, or inference.

## Content

### What is authoritative

The approved implementation plan is the authority for its scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation. Its planned-work-item register is the authoritative scope register. A phase request, handoff, or Wiki page does not replace the plan or authorize implementation.

### What is evidence only

- A **research brief** records cited findings, assumptions, options, risks, and recommendations. It informs planning but is not Plan authority or implementation approval.
- An **implementation report** records what an approved pass changed and how it was validated. It is immutable, non-authorizing evidence and cannot expand scope, change hierarchy, or authorize acceptance or remediation.
- A **review report** records independent review evidence and a disposition. It is immutable, non-authorizing evidence and cannot approve implementation, authorize remediation or acceptance, revise the plan, change completion markers, or mutate plan status.

### Manual boundaries still apply

Developer approval is required before an approved plan enters implementation. Commands need fresh per-invocation confirmation of the unchanged approved literal and fixed directory. Review acceptance requires explicit developer acceptance after the applicable persisted review evidence; a review finding alone cannot authorize remediation. Any scope or hierarchy expansion requires a Plan-stage amendment.

## Canonical references

- [RPIR lifecycle core](../.github/skills/rpir-lifecycle-core/SKILL.md) — Canonical plan-authority, provenance, and phase-boundary semantics.
- [Repository Copilot instructions](../.github/copilot-instructions.md) — Repository policy for status, approval, reports, handoffs, and scope limits.
- [Lifecycle implementation-plan instructions](../.github/instructions/lifecycle-implementation-plans.instructions.md) — Plan-record authority, approval, and report-boundary requirements.
- [Lifecycle research-brief instructions](../.github/instructions/lifecycle-research-briefs.instructions.md) — Research-record evidence and non-authority requirements.
- [Approved implementation plan for the Wiki initiative](planning/new-wiki/001-implementation-plan.md) — The plan governing this documentation initiative's scope and acceptance criteria.

## Related links

- [RPIR](rpir.md) — Follow the phase and coordinator model.
- [Choose an artifact](choose-an-artifact.md) — Return to consumer artifact selection.

## Next steps

- Identify the canonical plan before assessing scope or completion.
- Treat reports and briefs as cited evidence, then obtain the required manual approval or acceptance decision before consequential action.
