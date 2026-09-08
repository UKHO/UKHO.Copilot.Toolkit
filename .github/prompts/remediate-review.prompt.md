---
name: remediate-review
description: Launch Implement for an explicitly approved remediation pass from one lifecycle-core-eligible plan alias and one lifecycle-core-eligible source Review-report alias.
argument-hint: Lifecycle-core-eligible plan and source Review-report aliases, or inline Markdown links with those aliases as their destinations
agent: Implement
---

Run the existing `Implement` agent for a remediation pass using only the two lifecycle-core-eligible bounded aliases supplied below.

Implementation plan: ${input:implementationPlanPath:One lifecycle-core-eligible alias to the implementation plan, or one inline Markdown link whose destination is that alias}

Source Review report: ${input:reviewReportPath:One lifecycle-core-eligible alias to the source Review report, or one inline Markdown link whose destination is that alias}

Pass both values through literally. Let [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) validate each bounded alias or inline Markdown destination before `Implement` applies expected-type, lifecycle-folder, exact report-to-plan-to-reviewed-implementation-report linkage, review-state, and approval checks. `Implement` must complete those checks before any edit, marker change, or new implementation report.

This phase-entry confirmation approves only the manual handoff of the preceding exact canonical implementation-plan and source Review-report evidence to Implement; do not ask a duplicate phase-entry question. It does not replace the separately approved remediation pass or authorize edits, commands, remediation, scope or hierarchy changes, report allocation, acceptance, or auto-send the Review handoff. Preserve the existing Implement approval, Plan-only hierarchy authority, validation, immutable-report, and manual-handoff controls.