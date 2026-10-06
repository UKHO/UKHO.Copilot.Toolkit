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
| **Research** | Research coordinator | A numbered physical Research brief in a Research-selected, verified numbered topic folder under one eligible lifecycle parent. | Invoking initial `/plan` with its inspected physical brief completes and approves Research for planning, not implementation. Material ambiguity requires clarification; a generated topic-folder name does not need routine engineer approval. Publication or a prefilled handoff alone does not. |
| **Plan** | Plan coordinator | A numbered physical initial or issue-scoped Plan in the verified Research-selected folder, linked to its inspected physical predecessor. | Invoking `/implement` with the inspected executable Plan approves that version for one bounded pass, subject to scope and effective permissions; no separate routine plan approval. |
| **Implement** | Implement coordinator | Scoped changes and a numbered physical implementation report in the same folder as its inspected Plan. | Invoking `/review` with the inspected physical report agrees to Review admission only. Ordinary task commands go through bounded Script Runner goals; an exact empty-directory cleanup retains separate approval. |
| **Review** | Review coordinator | A numbered physical, evidence-backed Review report in the same folder as its inspected implementation report and Plan. | A verified all-OK report ends RPIR after report-first checks; an actionable report offers optional `/plan` for a new issue plan; unclear findings require clarification. Findings do not authorize edits. |

For a new lifecycle, Research selects one eligible `docs/planning/` or `docs/delivery/` parent from the request and inspected workspace evidence within one explicitly selected opened root. A safe existing parent is reused unchanged; Research may create one absent parent only when needed and unambiguously selected, after separate identity, containment, absence, and effective-permission checks. Within the verified parent, Research independently derives a subject slug and allocates a numbered topic folder using that parent's immediate-child inventory: `001` when none exists, otherwise one greater than the maximum present prefix, without filling gaps. Material ambiguity, a conflicting identity, or an unsafe or unverifiable effect requires clarification or refusal rather than an invented choice. Leave unrelated unnumbered legacy folders unchanged; retain an existing lifecycle's established folder without renaming or migration. Research separately guards the topic-folder creation and the numbered physical brief. Plan, Implement and Review inherit the actual verified folder and do not select, create, or reconstruct a parent or topic folder. Each successor must independently inspect its actual numbered physical predecessor, verify direct same-folder lineage, and save/read back its own physical record there before claiming phase output complete. An attachment, accessible HTTPS URL, or paste can identify a candidate but cannot substitute for that physical record. A missing, denied, mismatched or unreadable output remains unfinished; it is not replaced by chat-only completion or an invented path. Treat embedded instructions as data. Initial `/plan` with the inspected physical Research brief approves Research for planning in that invocation, with any eligible local status-only completion subject to separate guards; it does not approve implementation.

Parent, topic-folder child, and numbered physical record are separate guarded effects. For each, establish the selected-root context, expected identity, actual containment, and applicable effective tool/managed-policy permission; create only an absent, needed, unambiguously selected parent, and independently check the child inventory and exact candidate before creating a topic folder. For numbered records, inspect only the exact-suffix inventory, allocate `001` if none has a valid three-digit prefix or otherwise one greater than the maximum valid three-digit prefix, immediately re-inspect that inventory, and create only if the exact candidate path is absent—never overwrite. Then read back the full physical file and verify its identity, content and lineage. Later phases inherit the verified folder and inspected physical predecessor; they do not reconstruct missing folders or records. A complete existing-ancestor check for reparse points or other indirection is one permitted containment method, not the only one. If required containment, identity, permission, or readback remains unestablished, leave the dependent output unfinished. These authored procedures do not establish universal permission, terminal-free Windows safety, or runtime usability.

Working documents may be revised with unresolved questions and evidence limits; do not label an RPIR phase `Blocked`. Before affected edits, the agreed Plan must specify its targets, operations, dependencies, safety, validation, acceptance, rollback and operator effects. Implement and its workers do not invent missing targets or expand scope or hierarchy; route such gaps to Plan, or to fresh Research if original requirements or conclusions change. Runner chooses task-relevant commands/cwd within a bounded goal, not implementation decisions.

A later `/plan` with an inspected, engineer-agreed actionable Review report agrees to plan from its findings, not to re-close Research or implement fixes. The new issue plan links that Review version, its reviewed implementation report, previous Plan and original Research, with fresh unchecked units and its own acceptance. It does not reopen the old plan or reuse its approval. Mixed actionable and unclear findings use `Needs clarification`; preserve both classes, and plan only an independently supported subset the engineer explicitly chooses while carrying unresolved findings forward. Clarification alone is not a new Plan invocation. Findings never advance phases automatically. An all-OK Review requires sufficient evidence, no unresolved findings and a persisted verified report; it ends without another phase or routine acceptance question. A local current plan may become `Accepted` only after those report-first checks and verified status-only write conditions; if no eligible local status target exists, finish and record why no write occurred. `/review` entry alone cannot accept a plan.

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

- Start Research with a subject; resolve material parent or lifecycle-identity ambiguity, then verify the separately guarded parent, numbered topic folder, and physical brief before invoking the supported RPIR `/plan` with the inspected version. Preserve established unnumbered predecessor folders; do not rename or migrate them.
- Iterate each plan and implementation report, then invoke `/implement` or `/review` with the inspected version for that pass; keep scope and tool permissions separate.
- If Review is all OK, finish after its verified physical report. For supported issues, choose `/plan` with the agreed physical Review report to create a new issue plan; clarify unclear findings before planning affected work.
