---
name: code-review
description: Review customization or code changes for correctness, security, maintainability, and policy-boundary defects with cited, severity-ranked findings. Use when independently reviewing an implementation before acceptance.
user-invocable: false
---

# Code review

Use this skill for read-only, evidence-based review.

1. Read the requested scope and changed files, then compare them with repository instructions and the approved plan.
2. Examine correctness, security, maintainability, compatibility, and least-privilege boundaries relevant to the change.
3. Use the [review rubric](./review-rubric.md) and report only actionable findings supported by evidence.
4. Avoid editing files, duplicating findings, or treating stylistic preference as a defect.
5. State explicitly when no blocking issue is found.

For a future durable Review report, the [Review report template](./review-report-template.md) is the sole schema owner. This read-only Skill does not grant report-writing, allocation, approval, remediation, acceptance, status, scope, hierarchy, command, or handoff authority; those remain with repository policy and the Review coordinator.