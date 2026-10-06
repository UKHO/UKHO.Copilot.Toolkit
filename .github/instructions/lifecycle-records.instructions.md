---
name: RPIR lifecycle records
description: Apply the RPIR record lifecycle to numbered Research, Plan, Implement, and Review artifacts.
applyTo: 'docs/planning/**/[0-9][0-9][0-9]-research-brief.md,docs/delivery/**/[0-9][0-9][0-9]-research-brief.md,docs/planning/**/[0-9][0-9][0-9]-implementation-plan.md,docs/delivery/**/[0-9][0-9][0-9]-implementation-plan.md,docs/planning/**/[0-9][0-9][0-9]-implementation-report.md,docs/delivery/**/[0-9][0-9][0-9]-implementation-report.md,docs/planning/**/[0-9][0-9][0-9]-review-report.md,docs/delivery/**/[0-9][0-9][0-9]-review-report.md'
---

# RPIR lifecycle records

## Applies to

- **Intended files:** Numbered local Research briefs, implementation plans, implementation reports, and review reports in `docs/planning/` or `docs/delivery/` that match one of the eight exact `applyTo` patterns above.
- **Does not apply to:** Other files, unnumbered documents, or non-local candidate records.

Apply this instruction only to the eight numbered local record patterns in `applyTo`. The [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) is the canonical shared contract for source-neutral intake, lineage, transitions, allocation, and effect guards. The four links below identify the sole owners of their stage schemas.

## Rule

- **MUST:** Follow the canonical lifecycle core and the owning stage template; preserve the physical-record, direct-lineage, and effect checks below.
- **SHOULD:** Use the stage-specific links and report only evidence and validation actually established.
- **MUST NOT:** Treat a candidate, attachment, link, or runtime assumption as a substitute for the required physical record or as authority to bypass lifecycle guards.

## Shared workflow and effect contract

* Inspect the actual predecessor and bind its kind, subject, source locator, version, direct ancestry, and receiving invocation. For real numbered local relationships, verify exact canonical identities and matching direct links; do not invent local paths for other sources. Freeze an engineer-approved predecessor version before later edits and preserve finalized evidence as immutable.
* For a new lifecycle, Research alone selects one eligible parent (`docs/planning/` or `docs/delivery/`) from the request and inspected workspace evidence within one explicitly selected opened root. Reuse an existing parent only after verifying its identity and actual containment, without a setup write. Research may create one absent parent only when needed and unambiguously selected, after separate root/ancestor containment, expected identity, exact-absence, and effective tool/managed-policy permission checks; verify its resolved identity and post-create state. Material ambiguity goes to `agent-question-resolution`; do not require a routine engineer ballot on a generated child name. Preserve a historically confirmed existing lifecycle folder as valid legacy lineage without new confirmation, renaming, or migration. Later phases inherit the actual verified folder and never select, create, or reconstruct a parent or child.
* In the verified parent, Research independently allocates one immediate-child topic folder. Derive its subject slug by Unicode NFKD normalization, removing combining marks, lowercasing, retaining ASCII `a-z0-9` groups joined by single hyphens, and trimming edge hyphens. A blank/misleading slug or uncertain same-subject/legacy identity is a material conflict. Numbered topic directories must match exactly `^[0-9]{3}-[a-z0-9]+(?:-[a-z0-9]+)*$` with prefix `001`–`999`. Inventory all immediate children; treat case-equivalent names, invalid numbered-looking entries, duplicate prefixes, colliding files, inaccessible entries, and uncertain identity as conflicts. Leave unrelated unnumbered legacy folders unchanged. Allocate `001` when none exists, else maximum prefix present plus one per parent (never fill gaps; stop at `999`). Immediately repeat the full child inventory, require the exact candidate absent and no conflict, then create only that child after fresh containment/permission checks and verify its resolved identity/post-create state. Denial, collision/race, malformed or inaccessible inventory, or inconclusive evidence refuses the affected effect; no historical non-reuse or atomicity claim.
* Require an actual contained, numbered physical predecessor and the receiving phase's numbered physical output in the same verified topic folder. Successors verify and inherit their inspected predecessor and do not reconstruct a missing parent, child, or predecessor. A supplied attachment, HTTPS URL or paste may locate a candidate but cannot substitute for independently verifying the physical record. Verify direct canonical field/link pairs, expected kinds, and same-folder lineage before claiming phase output complete.
* Parent, child and numbered record are separate guarded effects. For each record, follow the [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md): inspect only the exact matching-suffix inventory inside the verified child; independently allocate `001` or one greater than the maximum valid three-digit prefix for that suffix; immediately re-inspect the same inventory; create only the absent exact candidate without overwriting; and read back the full physical file to verify identity, content and direct same-folder fields/links. A missing, denied, mismatched or unreadable predecessor/output or failed full readback remains unfinished; disclose it without inventing a path, bypassing a guard or claiming a canonical handoff.
* Continue work on the current stage document. Investigate unknowns with [agent-question-resolution](../skills/agent-question-resolution/SKILL.md), disclose evidence limits and any reversible low-impact defaults, and ask the engineer to decide material scope or policy questions. Do not label a lifecycle phase `Blocked`; a clarification resumes the same stage, and neither unresolved questions nor an agent's readiness opinion veto progression.
* Only explicit invocation of the receiving coordinator with the actual inspected predecessor version approves a transition. A separate approval, answer, report, link, or manual prefill does not transfer ownership or invoke an agent. The receiver independently checks its inputs.
* Transition approval does not authorize an unsafe effect. Apply the core's separate evidence, identity, scope, permission, and preimage/postimage checks to each consequential action. Stop only the affected unsupported or unsafe effect, continue safe investigation and truthful reporting, and never claim an unperformed validation or write.

## Research brief

For `-research-brief.md`, follow the [Research brief template](../skills/codebase-research/research-brief-template.md). Preserve evidence, alternatives, assumptions, risks, recommendation, source/version provenance, and applicable tracker context. Record selected-root and eligible-parent evidence, whether the parent was reused or conditionally created and its separate checks/readback, the subject slug and numbered child inventory/allocation/second scan/conflict and creation/readback, and the independent exact-suffix brief allocation and full physical output verification. Retain historical confirmed-folder provenance without imposing a new name ballot. Keep local Research status `In progress`; only an eligible Plan coordinator may perform the guarded status-only completion after the receiving `/plan` invocation. The initiating request's source remains provenance, not a phase predecessor.

## Implementation plan

For `-implementation-plan.md`, follow the [implementation plan template](../skills/architecture-planning/implementation-plan-template.md). Plan owns scope, the Work Item/Task/Step hierarchy, acceptance, and validation. Verify the physical Research or engineer-chosen issue-Review predecessor and current Plan in the confirmed same folder. Describe an authorized implementation report relationship only; do not reserve a numbered report filename. Changed scope returns to a newly approved Plan version; renew Research only when new evidence requires it.

## Implementation report

For `-implementation-report.md`, follow the [implementation report template](../skills/safe-implementation/implementation-report-template.md). Verify the physical Plan predecessor and save/read back the pass report in the confirmed same folder. Record one bounded pass, actual edits, hierarchy completion, validation performed, failed, unavailable, or not run, deviations, and residual risks. The report is immutable, non-authorizing evidence; it does not expand scope or mutate Plan status or markers. Only the Implement coordinator may make its separately guarded, eligible pass updates.

## Review report

For `-review-report.md`, follow the [Review report template](../skills/code-review/review-report-template.md). Verify the physical implementation-report and Plan predecessors and save/read back the Review report in the confirmed same folder for every disposition. Preserve classified findings, evidence, validation limits, and one supported disposition. Mixed actionable and unclear findings use `Needs clarification`, retain both classifications, and cannot be accepted. An all-OK Review is terminal; persist and verify its report before any eligible status-only `Accepted` write under the core's guards. An issue Plan requires a later explicit `/plan` invocation and engineer-approved bounded scope.

## Validation boundaries

Instruction-pattern matching, including comma-separated glob interpretation, and runtime attachment have not been verified. Do not claim that VS Code Local or Agent Host attaches this instruction, or that a link guarantees a referenced skill or template is loaded. A nonphysical or non-local item may identify a candidate but is not a canonical phase predecessor or substitute for a physical same-folder record. Report only validation actually performed and state unavailable checks with the reason.
