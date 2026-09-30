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
5. Distinguish evidence-backed `No remediation required` with no unresolved findings from actionable, solely blocked and mixed actionable/blocked outcomes; absence of a known blocker without sufficient evidence is not all OK. In a mixed report identify an independently supported subset and preserve the blocker for an optional engineer-chosen `/plan`, never direct editing.

For a future durable Review report, the [Review report template](./review-report-template.md) is the sole schema owner. The coordinator iterates the identified `Draft` or `Blocked` report and freezes agreed historical versions without overwriting them. A persisted verified all-OK report, not `/review` admission, ends RPIR; eligible local `Accepted` status requires report-first integrity checks without another routine approval question. This read-only Skill grants no report-writing, allocation, approval, editing, status, scope, hierarchy, command or handoff authority; those remain with repository policy and the Review coordinator.
