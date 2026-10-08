---
name: code-review
description: Review customization or code changes for correctness, security, maintainability, and policy-boundary defects with cited, severity-ranked findings. Use when independently reviewing an implementation before acceptance.
user-invocable: false
---

# Code review

## Trigger and inputs

Use this Skill for independent, source-read-only review of actual changed work, its approved Plan, inspected implementation report, original criteria and validation evidence. Follow the [review rubric](./review-rubric.md) and use the [Review report template](./review-report-template.md) for prospective durable reports. This Skill itself grants no edit, command, lifecycle, approval, delegation or acceptance authority.

## Procedure

1. Inspect Plan/report versions and direct physical same-folder lineage, actual diff and principal artifact. Compare changed work to original acceptance, security, compatibility and least-privilege boundaries; a saved report alone is not delivery.
2. Record evidence-backed findings with precise location, impact, severity and smallest supported correction. Classify **severity**, **actionability/uncertainty**, and **original-criteria correction versus material change** separately. Avoid stylistic-only or duplicate findings.
3. Continue investigating factual uncertainty; retain unclear findings when evidence is insufficient. Mixed supported and unclear findings permit independent supported correction but prevent acceptance until every unresolved finding is settled. `Blocker` is severity, not a phase status.
4. For supported in-boundary corrections, offer manual resumption of Implement with the original approved Plan and linked Review context; findings supply evidence, not edit authority or new scope. Require fresh implementation evidence and fresh independent Review. Material new requirements, public behavior, dependencies, security/compatibility commitments or external effects require engineer choice and Plan-owned amendment/new Plan; renew Research only if new evidence requires it.
5. Do not edit source, delegate fixes or self-accept. `/review` admits assessment, not acceptance; a clean, physically verified evidence-backed Review with no unresolved findings records acceptance. Optional status bookkeeping cannot substitute for it.

## Output and validation

Return cited, severity-ranked findings with actionable/unclear and correction/material classification, or a supported clean result. State checks **Performed**, **Failed**, **Unavailable**, **Not run** separately. Preserve physical lineage, non-overwriting record saves and full readback where the coordinator persists a report; a failed save is not persisted. Keep handoffs manual and preserve finalized historical evidence.
