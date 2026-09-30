---
name: Lifecycle implementation reports
description: Govern durable Implement-stage execution evidence in approved lifecycle folders.
applyTo: 'docs/{planning,delivery}/**/[0-9][0-9][0-9]-implementation-report.md'
---

# Lifecycle implementation reports

Use this guidance only for a future durable numbered `implementation-report` created by an authorized Implement pass. The [implementation report template](../skills/safe-implementation/implementation-report-template.md) is the sole schema owner; do not duplicate or amend its schema here.

## Lifecycle requirements

- Apply the shared [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md). Record each source's kind, subject, original channel/locator, inspected substantive content/version or fingerprint, invocation and direct lineage. Use forward-slash exact canonical paths and matching direct links only for verified numbered local relationships; a valid non-local plan must not be rejected for lacking local fields.
- Keep an identifiable `Draft` or `Blocked` report for iteration, with unresolved decisions and validation gaps. Freeze the version inspected and agreed at `/review` separately before later draft changes; finalized historical reports are immutable. For an eligible numbered local report, allocate once for this pass in its plan's selected contained lifecycle folder. Inspect only `-implementation-report.md` inventory, use `001` or maximum valid prefix plus one, immediately re-inspect before creation and never overwrite a frozen report; stop on malformed inventory or collision.
- Complete the sole schema template. Re-read the created report and verify its exact canonical identities, allocation evidence, pass state, completion, validation, scope, and next-action evidence.
- For actual numbered local relationships, require each canonical field and matching direct one-hop local Markdown link to the accessible expected-kind record in the selected folder. For non-local or non-numbered predecessors, verify inspected source/version and ancestry rather than inventing a local pair. Fail closed on missing content, stale or mismatched versions and actual local pair inconsistencies; do not infer a predecessor from a label.
- The report is immutable, non-authorizing execution evidence only. It cannot authorize implementation, remediation, scope or hierarchy changes, plan status or marker changes, acceptance, commands, or handoff. The plan remains authoritative for scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation.
- Apply this contract prospectively only. Do not rename, migrate, revise, or validate historical reports merely to conform to it.
- For a Review-origin pass, link this distinct issue plan's source Review/version, its reviewed implementation report, previous plan and original Research using direct local pairs only where verified. Map chosen supported findings to this new plan's own unchecked units; carry blocked findings without guessed fixes. Do not reopen the previous plan's hierarchy or reuse its approval. An unplanned new decision stops affected edits for a Plan-stage amendment to this pass's working plan.
- Resolve material unknowns through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md). Include **Open questions** only for a developer-expressly-declared intentionally open or unknown named question.

## Boundaries

- This instruction does not grant write, allocation, approval, command, remediation, acceptance, or handoff authority. Those controls remain with the approved plan, repository policy, and Implement coordinator.
- Do not claim a finalized report or Review readiness for rejected, inaccessible, stale, wrong-kind or mismatched input; a truthful working `Blocked` draft may identify the missing evidence without granting edit authority.
