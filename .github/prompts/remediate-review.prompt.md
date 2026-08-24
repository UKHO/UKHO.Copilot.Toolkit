---
name: remediate-review
description: Launch Implement for an explicitly approved remediation pass from one exact canonical plan and one exact source Review report.
argument-hint: Exact canonical plan path and exact source Review-report path
agent: Implement
---

Run the existing `Implement` agent for a remediation pass using only the two literal repository-relative paths supplied below.

Canonical implementation plan: ${input:implementationPlanPath:Exact saved prefixed canonical implementation-plan path}

Source Review report: ${input:reviewReportPath:Exact saved prefixed source review-report path}

Pass both values through literally. Do not select, normalize, repair, substitute, reuse, or infer either path from a prefix, suffix, recency, “latest”, directory contents, or any other heuristic. Fail closed if either value is missing, malformed, inaccessible, ambiguous, not an exact saved prefixed path, incorrectly foldered, incorrectly linked, or otherwise materially uncertain. Implement must validate the report-to-plan-to-reviewed-implementation-report linkage and review state before any edit, marker change, or new implementation report.

This invocation does not approve editing, authorize scope expansion, approve remediation, or auto-send the Review handoff. Preserve the existing Implement approval, existing-hierarchy-only scope, validation, immutable-report, and manual handoff controls. The developer must provide any required approval separately.