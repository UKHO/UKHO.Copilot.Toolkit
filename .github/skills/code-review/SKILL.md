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
5. Continue Review investigation when evidence is incomplete or unclear. Report supported actionable and unclear findings with their classifications preserved. Use `Needs clarification` for mixed actionable and unclear findings, identify any independently supported actionable subset, and continue Review to resolve uncertainty. Any unresolved finding makes the Review non-clean and ineligible for acceptance; insufficient evidence is never all OK.
6. Treat `Blocker` only as a finding severity that guards acceptance. It is not a lifecycle phase state; do not label a phase `Blocked` or use agent readiness advice as a veto.

For a future durable Review report, the [Review report template](./review-report-template.md) is the sole schema owner. The Review coordinator continues the report while investigating evidence gaps and freezes agreed historical versions without overwriting them. Only a persisted, verified, evidence-backed all-OK report with no unresolved findings ends RPIR; `/review` admission alone is not an all-OK result. After that report, only the Review coordinator may change an eligible local Plan to `Accepted`, after report-first integrity checks and without another routine approval question. This read-only Skill grants no report-writing, allocation, approval, editing, status, scope, hierarchy, command, or handoff authority; those remain with repository policy and the Review coordinator.
