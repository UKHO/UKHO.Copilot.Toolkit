---
name: review
description: Launch the Review agent for an independent read-only review against an implementation plan and linked implementation report.
argument-hint: Provide lifecycle-core-eligible plan and implementation-report aliases, or inline Markdown links with those aliases as their destinations.
agent: Review
---

Review the implementation using the exact paths supplied below:

- Approved implementation plan: ${input:implementationPlanPath:One lifecycle-core-eligible alias to the implementation plan, or one inline Markdown link whose destination is that alias}
- Linked implementation report: ${input:implementationReportPath:One lifecycle-core-eligible alias to the implementation report, or one inline Markdown link whose destination is that alias}

Pass both values verbatim to the `Review` agent. Let [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) validate each bounded alias or inline Markdown destination before `Review` applies its expected-type, lifecycle-folder, and exact canonical linkage checks.

This phase-entry confirmation approves only the manual handoff of the preceding exact canonical implementation-plan and linked implementation-report evidence to Review; do not ask a duplicate phase-entry question. It does not authorize edits, commands, remediation, scope or hierarchy changes, report allocation, status changes, or acceptance. The `Review` agent remains authoritative for the read-only review, required findings, validation limitations, and acceptance boundary; acceptance requires its separate explicit developer decision.
