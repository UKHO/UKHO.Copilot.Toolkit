# Implementation report template

This template is the sole schema owner for future durable implementation reports. It applies prospectively only; do not use it to revise, migrate, or validate historical reports.

# Implementation report: <short title>

## Lifecycle identity and allocation

- **Canonical implementation plan:** `<forward-slash repository-relative exact path>`.
- **Canonical implementation plan link:** `[<same exact canonical implementation-plan path>](<same exact canonical implementation-plan path>)` — a direct one-hop local Markdown link matching the canonical implementation-plan field.
- **Canonical implementation report:** `<forward-slash repository-relative exact path>`.
- **Lifecycle folder:** `<forward-slash repository-relative exact path>`.
- **Report status:** `<implementation pass status and Review readiness>`.
- **Report revision:** `<initial immutable execution evidence or remediation revision>`.
- **Authority boundary:** This immutable report is non-authorizing execution evidence only. The canonical implementation plan remains authoritative for scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation. This report cannot authorize implementation, remediation, scope or hierarchy changes, status changes, or acceptance.
- **Allocation evidence:** `<first matching-suffix inventory, candidate calculation, immediate second inventory, and no-overwrite result>`.

## Approved scope and completion

- **Approved scope:** `<exact plan-defined scope for this pass>`.
- **Completed existing hierarchy:** `<completed Work Items, Tasks, and Steps>`.
- **Remaining existing hierarchy:** `<remaining or reopened Work Items, Tasks, and Steps; state None when applicable>`.
- **Hierarchy boundary:** `<confirm no hierarchy was added, removed, restructured, or expanded; otherwise record the Plan-amendment blocker>`.

## Changed files and delivered behavior

- `<exact changed file>` — `<delivered behavior>`.

## Acceptance and validation

- **Acceptance readiness:** `<ready/not ready; acceptance remains a developer decision>`.
- **Performed:** `<validation actually performed and outcome>`.
- **Failed:** `<failed validation and disposition; state None when applicable>`.
- **Unavailable:** `<unavailable validation and reason; state None when applicable>`.
- **Not run:** `<available but intentionally unattempted validation and reason; state None when applicable>`.

## Execution evidence and reconciliation

- **Commands:** `<sanitized approved-command or cleanup evidence; state None invoked when applicable>`.
- **Worker and assurance evidence:** `<delegation, direct-work, and Stage Assurance reconciliation evidence>`.
- **Diff and preserved behavior:** `<scope/diff inspection and preserved-boundary evidence>`.

## Deviations, limitations, and risks

- **Scope decisions and deviations:** `<approved deviation or None>`.
- **Limitations:** `<remaining validation or evidence limits>`.
- **Residual risks:** `<known risks and controls>`.

## Remediation traceability

Use this section only for a remediation pass.

- **Canonical source Review report:** `<forward-slash repository-relative exact path>`.
- **Canonical source Review report link:** `[<same exact canonical source Review-report path>](<same exact canonical source Review-report path>)` — a direct one-hop local Markdown link matching the source Review-report field.
- **Canonical implementation plan:** `<forward-slash repository-relative exact path>`.
- **Canonical implementation plan link:** `[<same exact canonical implementation-plan path>](<same exact canonical implementation-plan path>)` — a direct one-hop local Markdown link matching the canonical implementation-plan field.
- **Reviewed implementation report:** `<forward-slash repository-relative exact path>`.
- **Reviewed implementation report link:** `[<same exact reviewed implementation-report path>](<same exact reviewed implementation-report path>)` — a direct one-hop local Markdown link matching the reviewed implementation-report field.
- **Finding resolution or blocker:** `<each finding mapped only to an existing plan Work Item, Task, or Step>`.

## Next developer action

`<required developer decision and manual handoff, if applicable>`

## Open questions

Include only a specifically named question that the developer expressly declared intentionally open or unknown, with that declaration's provenance.
