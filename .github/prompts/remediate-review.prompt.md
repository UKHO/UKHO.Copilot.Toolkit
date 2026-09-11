---
name: remediate-review
description: Launch Implement for an explicitly approved remediation pass from one lifecycle-core-eligible source Review-report alias.
argument-hint: One lifecycle-core-eligible source Review-report alias, or one inline Markdown link with that alias as its destination
agent: Implement
---

Run the existing `Implement` agent for a remediation pass using only the one lifecycle-core-eligible bounded alias supplied below.

Source Review report: ${input:reviewReportPath:One lifecycle-core-eligible alias to the source Review report, or one inline Markdown link whose destination is that alias}

Pass the value through literally. Let [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) validate the bounded alias or inline Markdown destination before `Implement` applies expected-type, lifecycle-folder, exact report-to-plan-to-reviewed-implementation-report linkage, review-state, and approval checks. `Implement` must complete those checks before any edit, marker change, or new implementation report.

The invocation and one validated predecessor—the exact canonical source Review-report evidence—are the handoff confirmation; do not ask a duplicate phase-entry question. This confirmation does not replace the separately approved remediation pass or authorize edits, commands, remediation, scope or hierarchy changes, report allocation, acceptance, or auto-send the Review handoff. Preserve the existing Implement approval, Plan-only hierarchy authority, validation, immutable-report, and manual-handoff controls.