---
name: Lifecycle implementation reports
description: Govern durable Implement-stage execution evidence in approved lifecycle folders.
applyTo: 'docs/{planning,delivery}/**/[0-9][0-9][0-9]-implementation-report.md'
---

# Lifecycle implementation reports

Use this guidance only for a future durable numbered `implementation-report` created by an authorized Implement pass. The [implementation report template](../skills/safe-implementation/implementation-report-template.md) is the sole schema owner; do not duplicate or amend its schema here.

## Lifecycle requirements

- Apply the shared [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md). Persist only forward-slash repository-relative exact canonical identities for the plan, report, and lifecycle folder; raw aliases are transient evidence only.
- Create exactly one report only during final reconciliation of an approved pass, in the exact canonical plan's same lifecycle folder. Inspect only existing files whose suffix is exactly `-implementation-report.md`; use `001` when none has a valid three-digit prefix, otherwise one greater than the maximum valid prefix. Immediately re-inspect that same suffix-specific inventory before creation. Stop on malformed or inaccessible inventory, collision, or material allocation uncertainty; never overwrite, revise, substitute, or select by prefix, recency, or contents.
- Complete the sole schema template. Re-read the created report and verify its exact canonical identities, allocation evidence, pass state, completion, validation, scope, and next-action evidence.
- The report is immutable, non-authorizing execution evidence only. It cannot authorize implementation, remediation, scope or hierarchy changes, plan status or marker changes, acceptance, commands, or handoff. The plan remains authoritative for scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation.
- Apply this contract prospectively only. Do not rename, migrate, revise, or validate historical reports merely to conform to it.
- For remediation, link the exact canonical source Review report and map every finding only to existing plan hierarchy. Reopen existing markers only as separately authorized; stop for a Plan-stage amendment if hierarchy must be added, removed, restructured, or expanded.
- Resolve material unknowns through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md). Include **Open questions** only for a developer-expressly-declared intentionally open or unknown named question.

## Boundaries

- This instruction does not grant write, allocation, approval, command, remediation, acceptance, or handoff authority. Those controls remain with the approved plan, repository policy, and Implement coordinator.
- Do not create a report for rejected, malformed, inaccessible, wrong-folder, wrong-plan, or mismatched lifecycle input.
