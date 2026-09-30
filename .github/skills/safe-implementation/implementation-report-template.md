---
description: "Template for an iteratable RPIR implementation report"
---

# Implementation report: <short title>

This template is the sole schema owner for future durable implementation reports. It applies prospectively only; do not use it to revise, migrate, or validate historical reports.

## Lifecycle identity and allocation

- **Report identity and working state:** `<subject, this pass, stable draft identity, Draft or Blocked, revision, unresolved decisions and Review readiness>`.
- **Plan envelope:** `<kind, subject, original channel/locator, inspected content/version or fingerprint, /implement invocation agreeing this executable version, and direct Research or Review-origin lineage>`.
- **This report envelope:** `<kind, subject/pass, output channel/locator and inspected content snapshot/version or fingerprint>`.
- **Verified local record pairs (only when real):** `<exact forward-slash canonical plan and report paths; matching direct one-hop local Markdown link for each canonical relationship field; same-folder evidence>`; otherwise record `N/A`, not an invented link.
- **Allocation evidence (numbered local only):** `<matching-suffix first inventory, candidate, immediate second inventory and no-overwrite result>`; otherwise `N/A` with reason.
- **Historical version:** `<freeze the inspected report version agreed at /review separately before any further draft revision; finalized snapshots are immutable>`.
- **Authority boundary:** This report is non-authorizing execution evidence only. This pass's plan alone owns scope, hierarchy, status, completion markers and acceptance; publishing a draft is not Review admission.

## Approved scope and completion

- **Approved scope:** `<exact scope of this plan's /implement pass, not the previous plan's scope>`.
- **Completed this-plan hierarchy:** `<completed Work Items, Tasks, and Steps>`.
- **Remaining this-plan hierarchy:** `<remaining Work Items, Tasks, and Steps; state None when applicable>`.
- **Hierarchy boundary:** `<confirm no hierarchy was added, removed, restructured, or expanded; otherwise record the Plan-stage blocker>`.

## Changed files and delivered behavior

- `<exact changed file>`: `<delivered behavior>`.

## Acceptance and validation

- **Acceptance readiness:** `<ready/not ready for Review; only an evidence-backed all-OK Review report can finish RPIR>`.
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

`<manual /review with this report's inspected agreed version when ready; no extra routine approval or automatic handoff; otherwise name the blocked evidence or decision>`

## Open questions

Include only a specifically named question that the developer expressly declared intentionally open or unknown, with that declaration's provenance.
