---
description: "Template for an evidence-backed RPIR Review report"
---

# Review report: <short title>

Use prospectively; preserve finalized historical reports. Review evidence never grants edit scope.

## Disposition and comparison

- **Disposition:** `<No remediation required / Remediation required / Needs clarification>`; mixed actionable and unclear findings cannot be all OK.
- **Approved criteria and actual output:** `<inspected Plan/version, original acceptance and material boundary compared with actual full relevant diff/range, remaining work, principal artifact existence/content and implementation report/version; a report alone is not delivery>`.
- **Implementation range and checkpoint evidence:** `<baseline/range and how determined; unavailable facts without guessing; inspected Plan strategy/approval reference where applicable; expected completed-Work-Item and earlier coherent-Task opportunities, including no-commit dispositions; evidence of timely completion-to-save/readback, observed late/omitted action, or unverified timing; relevant verified commit IDs/content/parents if any; remaining uncommitted/local-only changes. Commit history does not substitute for inspecting the intended range or acceptance evidence; silence and final markers do not prove chronology, and a missing commit alone is not defective code.>`
- **Planned-versus-actual boundary assessment:** `<assess one explicit bounded strategy per prospective Plan and each detailed Work Item's strategy reference, normal post-validation boundary/coherent content/purpose or specific justified combination/deferral/no-commit exception. For each exception/departure assess actual constraint/reason, affected IDs, validation/dependency consequence, later boundary if one exists and why normal is unsuitable. Missing entries, empty headings, generic exemptions and unexplained blanket bans fail planning assessment but actual prohibitions, including historical Plans, grant no Git authority. Compare every expected boundary with actual disposition evidence before unrelated work, including earlier coherent validated Task consideration. Record omissions/unjustified departures, fabricated future obstacles or retrospective substantive approved-Plan exceptions as findings where supported; do not rewrite historical Plans. Distinguish timely handling, observed late/omitted handling and unverified chronology without inferring timing from final history/markers or silence. Preserve distinct skipped—not applicable/no eligible changes, not attempted, unavailable/unresolved, failed, no commit verified, verified, unexpected and uncertain outcomes with reconciliation limits. Commit count is not technical acceptance; supported no-commit outcomes are not defective delivery.>`
- **Evidence and risks:** `<validation results, unresolved gaps, preservation/security/compatibility concerns and why disposition follows>`.
- **Architectural choice coverage and ADR comparison:** `<independently assess complete architectural choice coverage against Research, the approved Plan and actual changes, including missing or partial coverage even when a valid ADR is bound; reconcile each choice's rationale, alternatives, selection/pending state, conditions and affected Work Items to inspected ADR identity/section/version/state or an explicit gap. Verify substantive applicability of reused/grouped coverage, not a vague umbrella record. For unexpected uncovered or changed architecture, require engineer-directed Plan resolution before dependent architectural effects; continue independent approved work. Routine naming, helper extraction and architecture-preserving repairs remain Implement-owned without ADR reference; resolve material classification ambiguity with the engineer using evidence. Give an evidence-supported routine-only disposition if none are architectural. Compare actual invocation and per-record persistence evidence with the exact ADR preimage/postimage and conditions; do not infer `Accepted` from invocation, or retroactive sign-off from a prior invocation when the policy was not effective before it. A clean delivery Review is not ADR sign-off or architectural approval and grants no ADR authorship or status-write authority>`.

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
