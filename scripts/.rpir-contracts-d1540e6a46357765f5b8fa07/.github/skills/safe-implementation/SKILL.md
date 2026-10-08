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

## Limits

The approved Plan defines the outcome, acceptance and material constraints, not every debugging operation. Investigate factual gaps, choose ordinary in-boundary repairs, rerun relevant checks and continue independent safe work. Ask promptly for new requirements, material public behavior, consequential dependencies, altered security or compatibility commitments, additional external effects or genuinely unresolved identity/ownership. Respect actual platform denial and reconcile uncertain destructive or external completion before repetition. A local failing test is not an uncertain deployment. Do not silently revert user work, invent a successful result or repeat an unchanged failing operation indefinitely. If no useful permitted route remains, ask a specific question with evidence. A material change requires a Plan-owned decision and newly approved version; renew Research only when new evidence requires it.

The [implementation report template](./implementation-report-template.md) is the sole prospective report schema owner. This Skill does not grant new tools, permissions, lifecycle, acceptance or handoff authority.

Use the [RPIR lifecycle core](../rpir-lifecycle-core/SKILL.md) for candidate locators, physical identity, direct same-folder lineage and non-overwriting records. A locator, report or finding is not Plan approval or edit authority. For a material Review-origin Plan inspect its Review, report, previous Plan and Research ancestry; use that new Plan's scope. For an original-criteria correction use the original approved Plan plus linked Review evidence, preserve finalized records, produce fresh implementation evidence and obtain fresh Review. Keep handoffs manual.

## Execution, validation and record evidence

Implement may use its actually permitted direct command capability for ordinary local checks, or consult the non-editing Script Runner when useful. Delegation is not compulsory per unit; Test and Validation Workers remain read-only. If a specialist is unavailable, use only an actually available same-scope route or ask about the capability. Never evade a real platform denial, access secrets intentionally or infer containment from prose. Inspect relevant command effects and reconcile uncertain destructive/external completion before repeating; correct local invocation or implementation failures and recheck productively. Record chosen command/cwd, permission outcome, exit, sanitized output, observed artifacts and external effects with inspection limits; execution is not validation or acceptance.

Classify validation as **Performed**, **Failed**, **Unavailable**, and **Not run** with outcomes and reasons. Compare the Plan-promised artifact with actual existence and content before claiming completion. Independent Review evaluates original criteria, not just the report. The responsible coordinator alone saves a fresh numbered report in the verified Research folder: establish identity, containment and effective permission, choose an absent exact-suffix number without overwrite, re-inspect and choose another on collision when safe, and read back the saved physical content and direct same-folder Plan link. A failed save is not persisted evidence. Optional status/completion bookkeeping does not approve a transition or erase verified technical evidence. The report remains non-authorizing; explicit `/review` with its inspected version admits independent Review.

## Outputs

- Actual changed files and delivered behavior, completed and remaining Plan work, correction history and four validation states.
- A truthful report using the [implementation report template](./implementation-report-template.md), including refused effects and limitations; no partial report is successful delivery.
