---
name: review
description: Launch the Review agent for an independent read-only review against an implementation plan and linked implementation report.
argument-hint: Provide lifecycle-core-eligible plan and implementation-report aliases, or inline Markdown links with those aliases as their destinations.
agent: Review
---

Review the implementation using the exact paths supplied below:

- Approved implementation plan: ${input:implementationPlanPath:One lifecycle-core-eligible alias to the implementation plan, or one inline Markdown link whose destination is that alias}
- Linked implementation report: ${input:implementationReportPath:One lifecycle-core-eligible alias to the implementation report, or one inline Markdown link whose destination is that alias}

Pass both values verbatim to the `Review` agent. Accept each only as one bounded alias or one inline Markdown destination exactly as defined by [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md); first derive and validate one canonical identity for each, then let `Review` apply its expected-type, lifecycle-folder, and exact canonical linkage checks. Stop if either input is invalid or mismatched, and resolve any material uncertainty through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) rather than guessing.

This valid phase request starts the Review stage; do not ask a duplicate phase-authorization question. The `Review` agent remains authoritative for the read-only review, required findings, validation limitations, and acceptance boundary. Invocation does not auto-accept the implementation or grant acceptance authority; acceptance requires the separate explicit developer decision required by the `Review` agent.
