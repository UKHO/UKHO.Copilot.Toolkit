---
name: safe-implementation
description: Apply an approved implementation plan with a narrow diff, explicit safety boundaries, and honest validation reporting. Use when making repository changes after plan approval.
user-invocable: false
---

# Safe implementation

## Trigger

Use this skill to keep implementation within the approved scope.

## Inputs

- This pass's inspected and explicitly approved Plan version, its direct lineage, and the bounded work it authorizes.
- For each intended effect, its approved target and scope, supporting evidence, acceptance criteria, and effective permissions.

## Procedure

1. Inspect the actual Plan/version, direct Research lineage, scope and original acceptance; explicit `/implement` with that version approves the bounded outcome. For supported original-criteria Review corrections, inspect linked Review context and resume under the original approved Plan, not a new issue Plan.
2. Make the smallest coherent in-boundary change, selecting related files and tests when necessary. Preserve unrelated user work and public commitments.
3. Diagnose ordinary failures, correct implementation or invocation and rerun relevant checks. Restore attributable accidental changes from actual preimages without overwriting user edits. A failed check keeps dependent acceptance unmet until a passing recheck.
4. Re-read changed files, inspect the diff, links and principal output, and apply the [validation checklist](./validation-checklist.md). Seek fresh independent Review after corrections.
5. Report actual files, behavior, correction history, four validation states and limitations. A partial report is a checkpoint, not successful delivery.

For a Plan-bound ADR, inspect its exact identity and substantive version/snapshot, decision state, actual agreement evidence, conditions and dependent Work Items before affected changes. Resolve material mismatch, unavailable content or unsatisfied conditions before dependent effects; continue independent approved work. Do not adopt a floating newer version or revise an ADR without applicable scope.

### Incremental Plan progress

During the pass, use this primary loop before moving to an unrelated unit: inspect unit/evidence → make the coherent change, check and repair → determine newly supported Step/Task outcomes and any Work Item gate that passed → inspect the actual Plan preimage → update eligible existing markers only, save and read back/verify preservation → handle checkpoint disposition → select the next unit. Persist supported progress in the existing active approved Plan at that completion boundary; do not defer updates to the final report. Legitimately simultaneous completions may share a save. Only the Implement coordinator updates already-existing markers, under the marker-only exception in the [RPIR lifecycle core](../rpir-lifecycle-core/SKILL.md):

- Check a Step when its intended outcome is achieved, including any required check with its specified successful result. Merely attempting a check is not completion; a Step explicitly intended to record a diagnosis may complete when that diagnosis is supported, without implying the defect is fixed.
- Check a Task when its intended outcome and all required constituent work/checks are complete. A completed child remains checked if a parent-only gate fails or work pauses.
- Check the Work Item only after its explicit approved exit gate passes: its acceptance is met and every required validation has the specified successful result. Checked children alone do not pass the gate; required failed, unavailable or not-run evidence leaves it unmet.
- On resume, inspect actual current markers and evidence. If later evidence disproves completion, reopen only the invalidated markers and dependent parent markers whose completion is no longer supported; preserve unaffected completed work and record the evidence/reason in fresh implementation evidence. Recompletion requires the original outcome and gate to be supported again.
- For each bounded update, inspect current Plan content and evidence, edit only eligible existing marker states, then read back and verify the postimage against the actual preimage. Reconcile conflicts without overwriting substantive or concurrent user edits. A failed, denied or unverifiable save is unsaved tracking: report it separately from verified technical work and do not claim persistence. No substantive Plan amendment, historical backfill, finalized-report edit, backup/hash ritual or new approval is authorized.

If marker persistence is denied, fails, conflicts or cannot be verified, promptly disclose affected Step/Task/Work Item IDs as unsaved tracking, retain technical evidence and user edits, and continue independent permitted work. Do not describe a later reconciliation as timely. A parent-only failure or pause preserves supported children; on resume reopen only disproved completion and dependent parents, with evidence. Final checked state alone does not prove completion-to-save timing.

## Limits

The approved Plan defines the outcome, acceptance and material constraints, not every debugging operation. Investigate factual gaps, choose ordinary in-boundary repairs, rerun relevant checks and continue independent safe work. Ask promptly for new requirements, material public behavior, consequential dependencies, altered security or compatibility commitments, additional external effects or genuinely unresolved identity/ownership. Respect actual platform denial and reconcile uncertain destructive or external completion before repetition. A local failing test is not an uncertain deployment. Do not silently revert user work, invent a successful result or repeat an unchanged failing operation indefinitely. If no useful permitted route remains, ask a specific question with evidence. A material change requires a Plan-owned decision and newly approved version; renew Research only when new evidence requires it.

The [implementation report template](./implementation-report-template.md) is the sole prospective report schema owner. This Skill does not grant new tools, permissions, lifecycle, acceptance or handoff authority.

Use the [RPIR lifecycle core](../rpir-lifecycle-core/SKILL.md) for candidate locators, physical identity, direct same-folder lineage and non-overwriting records. A locator, report or finding is not Plan approval or edit authority. For a material Review-origin Plan inspect its Review, report, previous Plan and Research ancestry; use that new Plan's scope. For an original-criteria correction use the original approved Plan plus linked Review evidence, preserve finalized records, produce fresh implementation evidence and obtain fresh Review. Keep handoffs manual.

## Execution, validation and record evidence

Implement may use its actually permitted direct command capability for ordinary local checks, or consult the file-nonauthoring Script Runner when useful. When the inspected approved Plan explicitly includes a bounded local staging/append-only commit strategy, its approval supplies authority for covered commits after `/implement` without a separate grant exchange. Script Runner's only mutation exception is local Git index/history checkpointing under the [shared capability](../local-git-checkpoints/SKILL.md); provide Plan/version and approval/invocation evidence, a literal candidate, and candidate-relevant validation. A silent/prohibiting Plan, unapproved option, revocation or material drift is not authority. Runtime identity/state, staged-snapshot validation, helper compatibility and effective permission remain prerequisites. Runner cannot author files or markers. Delegation is not compulsory per unit; Test and Validation Workers remain read-only. If a specialist is unavailable, use only an actually available same-scope route or ask about the capability. Never evade a real platform denial, access secrets intentionally or infer containment from prose. Inspect relevant command effects and reconcile uncertain destructive/external completion before repeating; correct local invocation or implementation failures and recheck productively. Record chosen command/cwd, permission outcome, exit, sanitized output, observed artifacts and external effects with inspection limits; execution is not validation or acceptance.

Local Git checkpoints are optional in effect but their consideration is part of the planned cadence when an approved strategy covers them. Normally checkpoint eligible coherent work after each completed Work Item and before unrelated items; proactively consider earlier coherent validated Task boundaries within larger items. At each expected boundary, record the verified checkpoint or an evidence-based combination, deferral, skip, unavailable or failure disposition. Explain inseparable dependencies or candidate-validation issues; do not invent count/time/file thresholds, artificial splitting or a session-end-sweep default. Use the shared [local Git checkpoint capability](../local-git-checkpoints/SKILL.md): coordinators propose coherent, candidate-relevant content; only Script Runner performs covered index/local-history effects. A verified no-repository or no-eligible-change case skips normally; it never blocks source work, marker persistence, physical evidence, validation or handoff. Save/read back eligible phase records before proposing their checkpoint. Preserve ignored/local-only work, report incomplete reproducibility, and keep validation, commits and Review acceptance distinct. No checkpoint, commit count or commit failure independently closes a Plan gate.

Runner remains source-read-only even during Implement and must stop before a source-mutating helper; Implement's source authority does not transfer through the Git grant or delegation. Any independently permitted source operation uses Implement's normal authorized route, separate from Runner's checkpoint invocation. Inspect its actual result and freshly inspect/revalidate the candidate before reconsidering a checkpoint. Do not bypass required hooks or other controls; if checkpointing still requires Runner source writes, report it as unavailable and continue independent safe work. The shared checklist's helper/effect preflight also precedes observational Git commands, not just staging/commit, and covers incidental index writes.

Classify validation as **Performed**, **Failed**, **Unavailable**, and **Not run** with outcomes and reasons. Compare the Plan-promised artifact with actual existence and content before claiming completion. Independent Review evaluates original criteria, not just the report. The responsible coordinator alone saves a fresh numbered report in the verified Research folder: establish identity, containment and effective permission, choose an absent exact-suffix number without overwrite, re-inspect and choose another on collision when safe, and read back the saved physical content and direct same-folder Plan link. A failed save is not persisted evidence. Lifecycle status mirrors remain optional bookkeeping and do not approve a transition or erase verified technical evidence; required Plan execution-marker tracking follows the incremental procedure above and is not itself validation proof or acceptance. The report remains non-authorizing; explicit `/review` with its inspected version admits independent Review.

## Outputs

- Actual changed files and delivered behavior, completed and remaining Plan work, correction history and four validation states.
- A truthful report using the [implementation report template](./implementation-report-template.md), including refused effects and limitations; no partial report is successful delivery.
