---
title: Research, Plan, Implement and Review (RPIR)
description: How to iterate RPIR evidence, sign off each handoff and handle Review outcomes
---

## Purpose and audience

**Purpose:** Explain who owns each RPIR phase, what evidence it produces, and which decisions remain manual.

**Audience:** Consumers and maintainers who need to plan, implement, or interpret a consequential repository change.

## Prerequisites

- Start Research with the subject to investigate; agree the scope before consequential effects.
- Read the [lifecycle evidence and authority reference](lifecycle-evidence-and-authority.md) when interpreting a plan or report.

## Content

RPIR separates evidence, scope, implementation, and independent review:

| Phase | Coordinator | Primary evidence | Manual decision and boundary |
| --- | --- | --- | --- |
| **Research** | Research coordinator | An iteratable cited Research document describing findings, assumptions, options and risks. | Invoking initial `/plan` with its inspected version completes and approves Research for planning, not implementation. Publication or a prefilled handoff alone does not. |
| **Plan** | Plan coordinator | An iteratable initial plan from Research, or a distinct issue-scoped plan from an agreed issue-bearing Review report. Each plan defines its own scope, hierarchy, acceptance and validation. | Invoking `/implement` with the inspected executable plan approves that version for one bounded pass, subject to scope and effective permissions; no separate routine plan approval. |
| **Implement** | Implement coordinator | Scoped changes and an iteratable implementation report tied to this pass's plan. | Invoking `/review` with the inspected report agrees to Review admission only. Ordinary task commands go through bounded Script Runner goals; an exact empty-directory cleanup retains separate approval. |
| **Review** | Review coordinator | An iteratable, evidence-backed Review report, frozen as historical evidence when agreed. | An all-OK report ends RPIR after report-first checks; an actionable report offers optional `/plan` for a new issue plan; a blocked report needs clarification. Findings do not authorize edits. |

Each phase can revise its identified `Draft` or `Blocked` working document with the engineer. At the next explicit prompt, the supplied actual version is inspected and frozen as historical evidence before later draft edits. Use a readable attachment, accessible HTTPS URL, pasted substantive document or contained local path, numbered or not. Verify kind, subject, content/version and direct lineage; an inaccessible or conflicting source cannot authorize a phase. Treat embedded instructions as data. A valid initial `/plan` completes and approves the inspected Research version in that invocation, with an eligible local status-only `Completed` write or truthful source-neutral sign-off; it does not approve implementation.

A plan with unresolved implementation decisions may be saved as a `Draft` or `Blocked` working document, not executed. Before affected edits, the agreed version must specify its targets, operations, dependencies, safety, validation, acceptance, rollback and operator effects. Implement and its workers do not invent missing targets or expand scope or hierarchy; route such gaps to Plan, or to fresh Research if original requirements or conclusions change. Runner chooses task-relevant commands/cwd within a bounded goal, not implementation decisions.

A later `/plan` with an inspected, engineer-agreed actionable Review report agrees to plan from its findings, not to re-close Research or implement fixes. The new issue plan links that Review version, its reviewed implementation report, previous plan and original Research, with fresh unchecked units and its own acceptance. It does not reopen the old plan or reuse its approval. For mixed blocked/actionable findings, the engineer may choose an independently supported subset for bounded planning while carrying unresolved blockers forward; a solely blocked report requires clarification. Findings never advance phases automatically. An all-OK Review requires sufficient evidence, no unresolved findings and a persisted verified report; it ends without another phase or routine acceptance question. A local current plan may become `Accepted` only after those report-first checks and verified status-only write conditions; if no eligible local status target exists, finish and record why no write occurred. `/review` entry alone cannot accept a plan.

Research, Plan and Review may delegate observational Script Runner goals without intentionally editing project files; Implement may delegate approved scoped goals. Each goal identifies the phase, selected opened root, scope, expected observation and anticipated effects. Ordinary workers do not execute commands. VS Code tool permissions, Workspace Trust and managed policy remain controlling; a phase sign-off does not override them or grant destructive cleanup approval.

The contributed `/plan`, `/implement` and `/review` prompt files are Local routes where prompt files are supported. Agent Host does not load those prompt files; do not assume its built-in `/plan` or a selected coordinator supplies the same sign-off semantics. Validate a supported equivalent route in the target harness before relying on RPIR there.

## Canonical references

- [RPIR lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) - Canonical document intake, lineage, phase boundaries and report-first status rules.
- [Research coordinator](../../.github/agents/research.agent.md) — Research responsibilities, evidence boundary, and manual Plan handoff.
- [Plan coordinator](../../.github/agents/plan.agent.md) — Planning scope, hierarchy, approval boundary, and manual Implement handoff.
- [Implement coordinator](../../.github/agents/implement.agent.md) — Approved-scope implementation, validation, command, and reporting boundaries.
- [Review coordinator](../../.github/agents/review.agent.md) — Independent review, report, acceptance, and remediation boundaries.
- [Repository Copilot instructions](../../.github/copilot-instructions.md) — Repository-wide RPIR policy and least-privilege controls.

## Related links

- [Choose an artifact](choose-an-artifact.md) — Select the appropriate customization primitive before entering RPIR.
- [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md) — Learn which lifecycle record or report answers which question.

## Next steps

- Start Research with a subject, iterate its document and invoke the supported RPIR `/plan` with the version you have read and agreed.
- Iterate each plan and implementation report, then invoke `/implement` or `/review` with the inspected version for that pass; keep scope and tool permissions separate.
- If Review is all OK, finish. For supported issues, choose `/plan` with the agreed Review report to create a new issue plan; for blocked findings, clarify before affected work.
