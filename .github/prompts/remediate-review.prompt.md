---
name: remediate-review
description: Launch Implement for an explicitly approved remediation pass from one lifecycle-core-eligible plan alias and one lifecycle-core-eligible source Review-report alias.
argument-hint: Lifecycle-core-eligible plan and source Review-report aliases, or inline Markdown links with those aliases as their destinations
agent: Implement
---

Run the existing `Implement` agent for a remediation pass using only the two lifecycle-core-eligible bounded aliases supplied below.

Implementation plan: ${input:implementationPlanPath:One lifecycle-core-eligible alias to the implementation plan, or one inline Markdown link whose destination is that alias}

Source Review report: ${input:reviewReportPath:One lifecycle-core-eligible alias to the source Review report, or one inline Markdown link whose destination is that alias}

Pass both values through literally. Accept each only as one bounded alias or one inline Markdown destination exactly as defined by [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md); first derive and validate one canonical identity for each before `Implement` applies expected-type, lifecycle-folder, exact report-to-plan-to-reviewed-implementation-report linkage, review-state, and approval checks. Fail closed if either value is invalid, incorrectly foldered, incorrectly linked, or otherwise materially uncertain. `Implement` must complete those checks before any edit, marker change, or new implementation report.

This valid phase request starts the remediation route; do not ask a duplicate phase-authorization question. It does not replace the separately approved remediation pass, approve editing or scope expansion, or auto-send the Review handoff. Preserve the existing Implement approval, existing-hierarchy-only scope, validation, immutable-report, and manual handoff controls.