---
description: "Template for an evidence-backed RPIR Review report"
---

# Review report: <short title>

Use prospectively; preserve finalized historical reports. Review evidence never grants edit scope.

## Disposition and comparison

- **Disposition:** `<No remediation required / Remediation required / Needs clarification>`; mixed actionable and unclear findings cannot be all OK.
- **Approved criteria and actual output:** `<inspected Plan/version, original acceptance and material boundary compared with actual full relevant diff/range, remaining work, principal artifact existence/content and implementation report/version; a report alone is not delivery>`.
- **Implementation range and checkpoint evidence:** `<baseline/range and how determined; unavailable facts without guessing; relevant verified commit IDs/content/parents if any; remaining uncommitted/local-only changes. Commit history does not substitute for inspecting the intended range or acceptance evidence.>`
- **Evidence and risks:** `<validation results, unresolved gaps, preservation/security/compatibility concerns and why disposition follows>`.

## Findings

List deduplicated findings, or `None` only when clean evidence supports acceptance. For each: `<severity; actionable or unclear; original-criteria correction or material change; file/section; cited evidence; impact; smallest supported next action>`. Preserve unresolved questions; an unclear finding prevents acceptance. Supported in-boundary corrections may return manually to Implement under the **original approved Plan** plus linked Review context for fresh implementation evidence and fresh independent Review. Material changes need an engineer decision and Plan-owned amendment/new Plan; Review never edits source or approves expansion.

## Validation

- **Performed:** `<checks actually performed and outcome; None if applicable>`.
- **Failed:** `<failed checks and disposition; None if applicable>`.
- **Unavailable:** `<unavailable checks and reason; None if applicable>`.
- **Not run:** `<available checks not attempted and reason; None if applicable>`.

## Identity, lineage and next action

- **This Review:** `<subject, pass and inspected version; actual contained numbered record when physically saved>`.
- **Direct predecessors:** `<inspected implementation report/version, approved Plan/version and Research ancestry, with direct same-folder links for real numbered records only; retain actual channel/locator for other sources>`.
- **Record outcome:** `<observed containment, permission, non-overwriting selection or collision resolution, saved content and complete physical readback; if save/readback failed state unfinished>`. Do not rewrite a finalized report. Optional Plan status bookkeeping neither authorizes edits nor erases verified technical evidence.
- **Next action:** `<none if verified clean Review; manual original-Plan /implement for supported correction; engineer-chosen /plan for material scope; or further Review investigation for unclear evidence>`. Neither publication nor a manual handoff invokes another phase.
