# Review report template

This template is the sole schema owner for future durable Review reports. It applies prospectively only; do not use it to revise, migrate, or validate historical reports.

# Review report: <short title>

## Lifecycle identity and allocation

- **Lifecycle:** `<planning initiative or delivery Work Item identity>`.
- **Canonical implementation plan:** `<forward-slash repository-relative exact path>`.
- **Reviewed implementation report:** `<forward-slash repository-relative exact path>`.
- **Canonical Review report:** `<forward-slash repository-relative exact path>`.
- **Lifecycle folder:** `<forward-slash repository-relative exact path>`.
- **Review pass:** `<pass identity and prior-review context>`.
- **Allocation evidence:** `<first matching-suffix inventory, candidate calculation, immediate second inventory, and no-overwrite result>`.
- **Disposition:** `<exactly one of: No remediation required; Remediation required; Blocked / clarification required>`.
- **Authority boundary:** This immutable report is non-authorizing review evidence only. It cannot approve implementation, authorize remediation or acceptance, revise plan scope or hierarchy, change completion markers, or mutate plan status. The canonical plan remains authoritative. A later Review pass creates a new report and never revises this evidence.

## Inputs and linkage

- **Canonical input validation:** `<exact plan/report type, accessibility, same-folder, and direct-linkage evidence>`.
- **Plan authority:** The plan remains authoritative for scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation. The implementation report is immutable, non-authorizing execution evidence only.

## Delegation and evidence considered

| Reviewer or evidence source | Lens | Result incorporated or omission rationale |
| --- | --- | --- |
| `<source>` | `<lens>` | `<evidence>` |

## Comparison to approved plan

- **Scope:** `<comparison>`.
- **Acceptance criteria:** `<comparison>`.
- **Risks and validation strategy:** `<comparison>`.

## Validation performed and limitations

- **Performed:** `<validation actually performed and outcome>`.
- **Failed:** `<failed validation and disposition; state None when applicable>`.
- **Unavailable:** `<unavailable validation and reason; state None when applicable>`.
- **Not run:** `<available but intentionally unattempted validation and reason; state None when applicable>`.
- **Residual risks:** `<remaining risks>`.

## Findings

`<No findings, or ordered and deduplicated findings. Each finding includes severity, exact file and section or symbol location, evidence, impact, smallest safe fix, and scope classification: in-scope existing plan unit, out-of-scope requiring Plan amendment, or blocked/unclear.>`

## Acceptance boundary and next action

- Persist this completed report before any disposition handling or acceptance request.
- Only `No remediation required` followed by explicit developer acceptance may change only the named canonical plan's `Status` to `Accepted`.
- `Remediation required` and `Blocked / clarification required` leave plan status unchanged and cannot authorize remediation. A remediation pass requires separate developer approval and maps every finding only to existing plan hierarchy.
- **Next developer action:** `<accept, clarify, or separately approve remediation>`.

## Open questions

Include only a specifically named question that the developer expressly declared intentionally open or unknown, with that declaration's provenance.
