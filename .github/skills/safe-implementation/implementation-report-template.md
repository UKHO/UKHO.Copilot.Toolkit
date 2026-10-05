---
description: "Template for an iteratable RPIR implementation report"
---

# Implementation report: <short title>

This template is the sole schema owner for future durable implementation reports. It applies prospectively only; do not use it to revise, migrate, or validate historical reports.

## Lifecycle identity and allocation

- **Report identity and working revision:** `<subject, this pass, stable record identity, revision, unresolved decisions and evidence gaps>`.
- **Plan envelope:** `<kind, subject, original channel/locator, inspected content/version or fingerprint, /implement invocation agreeing this executable version, and direct Research or Review-origin lineage>`.
- **This report envelope:** `<kind, subject/pass, output channel/locator and inspected content snapshot/version or fingerprint>`.
- **Verified local record pairs (only when real):** `<exact forward-slash canonical plan and report paths; matching direct one-hop local Markdown link for each canonical relationship field; same-folder evidence>`; otherwise record `N/A`, not an invented link.
- **Physical predecessor and phase output:** `<verified contained numbered Plan predecessor, its matching direct field/link lineage and Research-confirmed lifecycle-folder identity; evidence that the actual report destination is contained within the selected opened root; applicable VS Code/tool/managed-policy permission and write outcome; this report's physical same-folder identity and complete-file readback/postimage evidence>`; otherwise record the unavailable or inconclusive evidence. If the predecessor, required containment, applicable permission, authorized save or full readback is unavailable or mismatched, record the output as unfinished and do not claim a canonical handoff. Do not require a routine command or separate ACL probe merely to save the record.
- **Allocation evidence (numbered local only):** `<inventory of existing files with the exact `-implementation-report.md` suffix; candidate selected as 001 when no valid three-digit prefix exists, otherwise one greater than the maximum valid prefix; immediate second inventory of that exact suffix; confirmation the exact candidate path is absent and was not overwritten>`; otherwise `N/A` with reason. Stop on inaccessible or malformed inventory or a collision; do not infer allocation from another suffix.
- **Historical version:** `<freeze the inspected report version agreed at /review separately before any further working-revision edits; finalized snapshots are immutable>`.
- **Authority boundary:** This report is non-authorizing execution evidence only. This pass's plan alone owns scope, hierarchy, status, completion markers and acceptance; publication alone is not Review admission.

## Approved scope and completion

- **Approved scope:** `<exact scope of this plan's /implement pass, not the previous plan's scope>`.
- **Completed this-plan hierarchy:** `<completed Work Items, Tasks, and Steps>`.
- **Remaining this-plan hierarchy:** `<remaining Work Items, Tasks, and Steps; state None when applicable>`.
- **Hierarchy boundary:** `<confirm no hierarchy was added, removed, restructured, or expanded; describe any discrepancy and return changed scope to Plan>`.

## Changed files and delivered behavior

- `<exact changed file>`: `<delivered behavior>`.

## Acceptance and validation

- **Review evidence:** `<record completed and remaining work and evidence gaps honestly; an explicit /review invocation with this inspected report version admits Review but does not imply an all-OK result>`.
- **Performed:** `<validation actually performed and outcome>`.
- **Failed:** `<failed validation and disposition; state None when applicable>`.
- **Unavailable:** `<unavailable validation and reason; state None when applicable>`.
- **Not run:** `<available but intentionally unattempted validation and reason; state None when applicable>`.

## Execution evidence and reconciliation

- **Delegated Runner goals and commands:** `<phase, selected opened root, approved goal/scope, each chosen command and cwd, platform prompt/outcome, exit state, sanitized output, tracked/untracked/generated artifacts and process/external effects, inspection limitations and deviations; state None invoked when applicable>`.
- **Cleanup (separate direct-terminal exception):** `<exact plan-listed target, observed emptiness and containment, individual developer approval with auto-approval disabled, operation result and parent-path inspection; state None requested or invoked when applicable>`.
- **Worker and assurance evidence:** `<delegation, direct-work, and Stage Assurance reconciliation evidence>`.
- **Diff and preserved behavior:** `<scope/diff inspection and preserved-boundary evidence>`.

## Deviations, limitations, and risks

- **Scope decisions and deviations:** `<approved deviation or None>`.
- **Limitations:** `<remaining validation or evidence limits>`.
- **Residual risks:** `<known risks and controls>`.

## Issue-plan traceability

For a Review-origin pass, record the new plan's source Review, its reviewed implementation report, previous plan and original Research, each with inspected kind, channel/locator and version. Use exact canonical field and matching direct one-hop link only for real numbered local records; do not invent a link for non-local inputs.

- **Selected findings and this plan's new work units:** `<each independently evidenced chosen finding mapped to this new plan's units, result or remaining blocker>`.
- **Carried unresolved blockers:** `<unresolved findings not approved for edits; do not claim these are fixed or reopen the previous plan>`.

## Next developer action

`<manual /review with this report's actual inspected version; no extra routine approval or automatic handoff; identify any unresolved evidence or decision without treating it as a phase veto>`

<!-- Add an Open questions section only for a specifically named question that the developer expressly declared intentionally open or unknown, with that declaration's provenance. -->
