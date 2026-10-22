---
description: "Checklist for scoped RPIR implementation and honest validation"
---

# Safe implementation validation checklist

## Scope and recovery

- [ ] Inspect the approved physical Plan/version, Research lineage and original criteria; Review correction uses the original approved Plan plus inspected Review context. Findings alone grant no edits.
- [ ] Compare actual changes and principal output to the approved outcome. Related-file/test selection and ordinary repair stay within its material boundary; preserve unrelated user work and compatibility/security commitments.
- [ ] Assess complete architectural choice coverage against Research, the approved Plan and actual changes, including missing or partial coverage even when a valid ADR is bound. For unexpected uncovered or changed architecture, obtain engineer-directed Plan resolution before dependent architectural effects; continue independent approved work. Routine naming, helper extraction and architecture-preserving repairs remain Implement-owned without ADR reference; resolve material classification ambiguity with the engineer using evidence. No Implement/worker ADR authorship is granted.
- [ ] If an ADR is Plan-bound, inspect its exact identity and substantive version/snapshot, decision state, agreement evidence, conditions and affected Work Items. Resolve material drift or pending conditions before dependent effects; do not float to a newer ADR or infer approval. Continue independent approved work and record any gap.
- [ ] Diagnose local failures, correct attributable mistakes using actual preimages, and rerun relevant checks. A failed check stays failed until evidence of a passing recheck; a partial report is not the principal artifact.
- [ ] Ask promptly for new requirements, material public behavior, consequential dependencies, altered security/compatibility commitments, additional external effects or genuine identity/ownership uncertainty. Continue independent safe work.

## Capabilities and effects

- [ ] Use only actually permitted tools. Implement and editable Implementation Worker may execute ordinary local checks when available; Script Runner is optional and cannot author files, with only Plan-covered Git-metadata effects under the [shared capability](../local-git-checkpoints/SKILL.md). Read-only Test/Validation Workers and reviewers never edit source; delegation is useful, not compulsory per unit.
- [ ] If a local Git checkpoint is relevant, follow the [shared capability](../local-git-checkpoints/SKILL.md): verify the inspected approved Plan explicitly covers the bounded effect and phase, retain normal non-Git/no-eligible-change skips, preserve ignored and unrelated work, bind validation to the complete candidate, and verify actual history/content/state. Only Script Runner performs the Git mutation; commit evidence is not source authorship, validation success, phase approval or acceptance.
- [ ] Respect a real platform denial. Reconcile uncertain destructive/external completion before repetition; a local failed check can be diagnosed and rerun productively. Do not infer permission, invent results, silently overwrite user work or assume Windows is a sandbox.
- [ ] If commands ran, record command/cwd, permission outcome, exit, sanitized output, observed artifacts and process/external effects and inspection limits. Execution success is not validation or installed-runtime proof.

## Evidence, records and independent review

- [ ] Inspect diff, relevant links/frontmatter and retained behavior. Confirm actual deliverable existence before marking work complete.
- [ ] For the active approved Plan, compare existing Step/Task/Work Item markers with actual outcomes and the explicit Work Item exit gate; preserve completed children when only the parent gate fails, and reopen only disproved markers and unsupported dependent parents with evidence/reasons. Verify marker-only postimages and disclose unsaved tracking separately from verified work. Assess available completion-to-save/readback order: timely before unrelated work, observed late backfill, or unverified timing; final marker state alone is not chronology evidence.
- [ ] Record **Performed**, **Failed**, **Unavailable**, **Not run** separately, with outcomes/dispositions/reasons. Do not describe failed or unavailable checks as passes.
- [ ] Report expected checkpoint opportunities and their disposition even when no commit is reported. Reference the inspected approved Plan's covered strategy and approval/phase evidence; distinguish observed timely action, observed late/omitted action and unverified chronology without inferring compliance from silence. Report skipped, unavailable, not attempted, failed, verified, unexpected or uncertain only as supported; identify verified commit content/parent and remaining local work. Do not infer commit creation from command exit or put a report's own future commit ID into that report.
- [ ] Save any new report only in the verified Research folder with contained non-overwriting numbered identity, effective permission, direct same-folder Plan link and full readback. On a safe collision re-inspect and choose an absent number; never claim a failed save persisted. Preserve finalized records; lifecycle status mirrors are optional. Required active-Plan execution markers are progress evidence only, not standalone validation, approval or acceptance.
- [ ] Keep handoff manual. `/review` with the inspected report admits independent Review; supported corrections produce fresh implementation evidence and fresh independent review. Unresolved findings prevent acceptance.

## Read-only Validation Worker

When delegated, inspect approved scope, actual files and structural/evidence claims only. Return cited passed, failed, unavailable and not-run checks and risks. Do not edit, run commands, delegate, allocate records, update status, approve scope or accept work. Leave implementation/reconciliation to the coordinator.
