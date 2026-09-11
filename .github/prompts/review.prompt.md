---
name: review
description: Launch the Review agent for an independent read-only review from an implementation report.
argument-hint: Provide one lifecycle-core-eligible implementation-report alias, or one inline Markdown link with that alias as its destination.
agent: Review
---

Review the implementation using the exact implementation-report alias supplied below:

- Linked implementation report: ${input:implementationReportPath:One lifecycle-core-eligible alias to the implementation report, or one inline Markdown link whose destination is that alias}

Pass the value verbatim to the `Review` agent. Let [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) validate the bounded alias or inline Markdown destination before `Review` applies its expected-type, lifecycle-folder, and exact canonical plan linkage checks.

The invocation and one validated predecessor—the exact canonical implementation-report evidence—are the handoff confirmation; do not ask a duplicate phase-entry question. This confirmation does not authorize edits, commands, remediation, scope or hierarchy changes, report allocation, status changes, or acceptance. The `Review` agent remains authoritative for the read-only review, required findings, validation limitations, and acceptance boundary; acceptance requires its separate explicit developer decision.
