---
name: Lifecycle Review reports
description: Govern durable Review-stage evidence in approved lifecycle folders.
applyTo: 'docs/{planning,delivery}/**/[0-9][0-9][0-9]-review-report.md'
---

# Lifecycle Review reports

Use this guidance only for a future durable numbered `review-report` created by a completed evidence-based Review pass with valid exact inputs. The [Review report template](../skills/code-review/review-report-template.md) is the sole schema owner; do not duplicate or amend its schema here.

## Lifecycle requirements

- Apply the shared [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md). Persist only forward-slash repository-relative exact canonical identities for the plan, reviewed implementation report, Review report, and lifecycle folder; raw aliases are transient evidence only.
- Create exactly one report only after the completed review draft and assurance reconciliation, in the exact canonical plan's same lifecycle folder. Inspect only existing files whose suffix is exactly `-review-report.md`; use `001` when none has a valid three-digit prefix, otherwise one greater than the maximum valid prefix. Immediately re-inspect that same suffix-specific inventory before creation. Stop on malformed or inaccessible inventory, collision, or material allocation uncertainty; never overwrite, revise, substitute, or select by prefix, recency, or contents.
- Complete the sole schema template. Re-read the created report and verify its exact canonical identities, direct linkage, allocation evidence, review evidence, disposition, validation, findings, and next action.
- For every future Review report, require direct one-hop local Markdown links matching both the canonical implementation-plan and reviewed implementation-report fields. Admit only the validated implementation-report input, then validate the two field/link pairs as accessible expected-type artifacts in the exact same lifecycle folder, with the reviewed implementation report and plan resolving to the exact same plan; fail closed on missing, non-local, indirect, mismatched, wrong-type, inaccessible, or wrong-folder evidence and do not discover or infer a predecessor.
- Use exactly one disposition: `No remediation required`, `Remediation required`, or `Blocked / clarification required`. A disposition is evidence, not a lifecycle status.
- Persist the completed immutable report before any disposition handling or acceptance request. Only a persisted `No remediation required` report followed by explicit developer acceptance may change only the named canonical plan's `Status` to `Accepted`. `Remediation required` and `Blocked / clarification required` leave status unchanged and cannot authorize remediation.
- The report is immutable, non-authorizing review evidence only. It cannot approve implementation, authorize remediation or acceptance, revise plan scope or hierarchy, change completion markers, or mutate plan status. The plan remains authoritative for scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation.
- A separately approved remediation pass must use the exact canonical plan and source Review report and map each finding only to existing plan hierarchy. It must stop for a Plan-stage amendment if hierarchy would be added, removed, restructured, or expanded.
- Apply this contract prospectively only. Do not rename, migrate, revise, or validate historical reports merely to conform to it.
- Resolve material unknowns through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md). Include **Open questions** only for a developer-expressly-declared intentionally open or unknown named question.

## Boundaries

- This instruction does not grant write, allocation, approval, remediation, acceptance, status-mutation, or handoff authority. Those controls remain with repository policy and the Review coordinator.
- Do not create a report for rejected, malformed, inaccessible, wrong-folder, wrong-plan, or mismatched lifecycle input.
