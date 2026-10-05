---
description: "Template for an evidence-backed, conditional RPIR Review report"
---

# Review report: <short title>

This template is the sole schema owner for future durable Review reports. It applies prospectively only; do not use it to revise, migrate, or validate historical reports.

## Lifecycle identity and allocation

- **Lifecycle:** `<planning initiative or delivery Work Item identity>`.
- **Review pass and working revision:** `<stable pass identity, revision and unresolved evidence/decisions>`.
- **Plan envelope:** `<kind, subject, original channel/locator, inspected version/fingerprint and initial Research or issue-plan lineage>`.
- **Reviewed implementation report envelope:** `<kind, subject/pass, original channel/locator, inspected snapshot/version or fingerprint, and /review invocation agreeing it for admission>`.
- **This Review envelope:** `<kind, subject/pass, output channel/locator and inspected snapshot/version or fingerprint; freeze an agreed historical version separately before further working-revision edits>`.
- **Verified local record pairs (only when real):** `<exact canonical plan, reviewed report and Review report paths; matching direct one-hop local Markdown link for each relationship field; same-folder evidence>`; otherwise `N/A` with reason, never an invented link.
- **Physical predecessors and phase output:** `<verified contained numbered implementation-report and Plan predecessors, matching direct field/link lineage in the Research-confirmed folder; this Review report's canonical same-folder identity and full physical postimage/readback confirming its content and direct relationship fields/links for this disposition>`; if a predecessor, authorized save or complete readback is unavailable, record the output as unfinished and do not claim a canonical handoff.
- **Destination and permission evidence (numbered local only):** `<evidence that the exact destination is lexically and actually within the opened root, has the expected lifecycle identity, and has no unresolved indirection; applicable effective tool/managed-policy permission and observed save outcome>`; record evidence and outcome, not a routine command or ACL-probe requirement. If containment is inconclusive, permission is unavailable or denied, or the save outcome is unexpected, leave the output unfinished; otherwise `N/A` with reason.
- **Allocation evidence (numbered local only):** `<two inventories of existing files with the exact requested suffix; candidate is 001 if none has a valid three-digit prefix, otherwise one greater than the maximum valid prefix; immediately re-inspected absent exact candidate and no-overwrite result>`; stop on collision or malformed/inaccessible inventory and leave the output unfinished; otherwise `N/A` with reason.
- **Disposition:** `<No remediation required / Remediation required / Needs clarification; mixed actionable and unclear findings must preserve both classifications and cannot be all OK>`.
- **Authority boundary:** This Review evidence is non-authorizing. A finalized historical version is immutable; it cannot approve implementation, expand scope, alter hierarchy or completion markers. Publication alone does not approve a transition or acceptance.

## Inputs and linkage

- **Input validation:** `<actual inspected plan/report content, kind, subject, accessible source and version, verified direct ancestry and changed work/diff; verify same-folder field/link pairs only for real numbered local relationships; record evidence gaps and continue investigation without claiming unsupported all-OK>`.
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

`<No findings, or ordered and deduplicated findings. Each finding includes severity, exact file and section or symbol location, evidence, impact, smallest safe fix and classification: independently actionable or unclear. For mixed outcomes use Needs clarification, preserve both classifications, and identify any independently supported subset eligible for engineer-chosen planning.>`

## Acceptance boundary and next action

- Persist and verify an evidence-backed all-OK `No remediation required` historical report, its current plan and reviewed implementation lineage, completed applicable work/validation and absence of unresolved findings or blockers before RPIR finishes; `/review` entry alone is not an all-OK result.
- After that report, an eligible current local plan may change only `Status: Ready for review` to `Accepted` after complete fresh preimage, canonical field/link and status-only postimage checks. For non-local/ineligible plans finish and record why no local write occurred; no duplicate acceptance question.
- An actionable report offers only the engineer's optional later `/plan` with its inspected agreed version for a distinct issue-scoped plan, not edits to or reopening of this plan. For mixed findings, use `Needs clarification`, preserve both classifications, carry unresolved blockers, and limit any later Plan to an engineer-chosen supported subset. A solely unclear report continues Review clarification. Neither outcome changes status to `Accepted` or authorizes edits.
- **Next developer action:** `<none if all OK; optional explicit /plan for engineer-approved bounded actionable scope; otherwise continue Review to resolve unclear evidence>`.

<!-- Add an Open questions section only for a specifically named question that the developer expressly declared intentionally open or unknown, with that declaration's provenance. -->
