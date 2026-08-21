---
name: review
description: Launch the Review agent for an independent read-only review of an implementation against its exact approved plan and linked implementation report.
argument-hint: Provide the exact numbered implementation-plan and implementation-report paths.
agent: Review
---

Review the implementation using the exact paths supplied below:

- Approved implementation plan: ${input:implementationPlanPath:exact numbered repository-relative implementation-plan path}
- Linked implementation report: ${input:implementationReportPath:exact numbered repository-relative implementation-report path}

Pass both values verbatim to the `Review` agent. They must be exact, numbered repository-relative paths and must identify the linked plan and report. Do not infer, substitute, select by prefix, suffix, recency, or availability, or repair either path. Stop if either input is missing, malformed, or mismatched, and resolve any material uncertainty through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) rather than guessing.

The `Review` agent remains authoritative for the read-only review, required findings, validation limitations, and acceptance boundary. Invocation of this prompt does not auto-accept the implementation and does not grant acceptance authority; acceptance requires the explicit developer decision required by the `Review` agent.
