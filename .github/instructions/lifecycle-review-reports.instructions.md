---
name: Lifecycle Review reports
description: Govern durable Review-stage evidence in approved lifecycle folders.
applyTo: 'docs/{planning,delivery}/**/[0-9][0-9][0-9]-review-report.md'
---

# Lifecycle Review reports

Use this guidance only for a future durable numbered `review-report` created by a completed evidence-based Review pass with valid exact inputs. The [Review report template](../skills/code-review/review-report-template.md) is the sole schema owner; do not duplicate or amend its schema here.

## Lifecycle requirements

- Apply the shared [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md). Record plan, reviewed implementation report and this Review report by kind, subject, original channel/locator, inspected content/version or fingerprint and direct ancestry. Use forward-slash exact canonical paths only for verified numbered local records, never for non-local labels.
- Persist an identifiable `Draft` or `Blocked` report for iteration with unresolved findings. Freeze the version agreed at a later `/plan` separately before further draft edits. For a numbered local final report, allocate once for this pass in its plan's contained folder: inspect only `-review-report.md` inventory, use `001` or maximum valid prefix plus one, immediately re-inspect before creation and never overwrite frozen evidence; stop on malformed inventory or collision.
- Complete the sole schema template. Re-read the created report and verify its exact canonical identities, direct linkage, allocation evidence, review evidence, disposition, validation, findings, and next action.
- Admit only an inspected actual implementation report for canonical Review. For real numbered local relationships, require canonical fields and matching direct one-hop links to accessible expected-kind records in the selected folder. For other sources verify the actual inspected report/version, plan and changed work/diff without fabricated local links; stop on wrong-kind, stale, conflicting or unavailable substantive evidence, not on non-local transport alone.
- Use exactly one disposition: `No remediation required`, `Remediation required`, or `Blocked / clarification required`. A disposition is evidence, not a lifecycle status.
- Persist and verify a completed evidence-backed all-OK `No remediation required` version, matching current plan and reviewed implementation lineage, completed applicable work and validation and no unresolved finding or blocker before ending RPIR. Only then may an eligible local current plan change `Status: Ready for review` to `Accepted` with complete fresh preimage, exact local field/link and status-only postimage verification; if no eligible local status target exists, finish and record why no write occurred. `/review` admission alone never accepts and no extra routine acceptance question is required.
- The report is immutable, non-authorizing review evidence only. It cannot approve implementation, authorize remediation or acceptance, revise plan scope or hierarchy, change completion markers, or mutate plan status. The plan remains authoritative for scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation.
- An issue-bearing Review offers only the engineer's optional later `/plan` with its inspected agreed version. That request creates a distinct issue plan linked to this report/version, reviewed implementation report, previous plan and original Research; it does not authorize fixes, reopen previous hierarchy or re-close Research. For mixed blocked/actionable findings, only an engineer-chosen independently evidenced subset may enter that new plan, with unresolved blockers carried forward. Solely blocked findings require clarification.
- Apply this contract prospectively only. Do not rename, migrate, revise, or validate historical reports merely to conform to it.
- Resolve material unknowns through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md). Include **Open questions** only for a developer-expressly-declared intentionally open or unknown named question.

## Boundaries

- This instruction does not grant write, allocation, approval, remediation, acceptance, status-mutation, or handoff authority. Those controls remain with repository policy and the Review coordinator.
- Do not claim a final disposition for rejected, inaccessible, wrong-kind, stale or mismatched inputs; retain a truthful blocked working draft or provisional findings until the gap is resolved.
