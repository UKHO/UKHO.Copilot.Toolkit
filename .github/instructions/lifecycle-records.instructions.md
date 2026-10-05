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
* For a new lifecycle, Research alone proposes one exact subject-based folder under an evidenced `docs/planning/` or `docs/delivery/` parent and obtains the engineer's confirmation of that exact location through `agent-question-resolution` before using or creating it. A declined proposal is not used; any revised or engineer-selected alternative needs its own confirmation. Research performs fresh containment, identity, collision and effective-permission checks and creates the confirmed folder only if absent. Later phases inherit this existing folder and do not select, create, or reconstruct another.
* Require an actual contained, numbered physical predecessor and the receiving phase's numbered physical output in that same confirmed folder. Successors must verify their inspected predecessor and do not reconstruct a missing folder or predecessor. A supplied attachment, HTTPS URL or paste may locate a candidate but cannot substitute for independently verifying the physical record. Verify direct canonical field/link pairs, expected kinds, and same-folder lineage before claiming phase output complete.
* For each numbered output, follow the [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) for containment and allocation outcomes: inspect only the exact matching-suffix inventory, allocate `001` or the next valid prefix, immediately re-inspect, create only the absent exact candidate without overwriting, and read back the full physical file to verify its identity, content and direct same-folder fields/links. A missing, denied, mismatched or unreadable predecessor/output or failed full readback remains unfinished; disclose it without inventing a path, bypassing a guard or claiming a canonical handoff.
* Continue work on the current stage document. Investigate unknowns with [agent-question-resolution](../skills/agent-question-resolution/SKILL.md), disclose evidence limits and any reversible low-impact defaults, and ask the engineer to decide material scope or policy questions. Do not label a lifecycle phase `Blocked`; a clarification resumes the same stage, and neither unresolved questions nor an agent's readiness opinion veto progression.
* Only explicit invocation of the receiving coordinator with the actual inspected predecessor version approves a transition. A separate approval, answer, report, link, or manual prefill does not transfer ownership or invoke an agent. The receiver independently checks its inputs.
* Transition approval does not authorize an unsafe effect. Apply the core's separate evidence, identity, scope, permission, and preimage/postimage checks to each consequential action. Stop only the affected unsupported or unsafe effect, continue safe investigation and truthful reporting, and never claim an unperformed validation or write.

## Research brief

For `-research-brief.md`, follow the [Research brief template](../skills/codebase-research/research-brief-template.md). Preserve evidence, alternatives, assumptions, risks, recommendation, source/version provenance, and applicable tracker context; record the proposed exact folder, engineer confirmation, fresh checks and verified physical brief output. Keep local Research status `In progress`; only an eligible Plan coordinator may perform the guarded status-only completion after the receiving `/plan` invocation. The initiating request's source remains provenance, not a phase predecessor.

## Implementation plan

For `-implementation-plan.md`, follow the [implementation plan template](../skills/architecture-planning/implementation-plan-template.md). Plan owns scope, the Work Item/Task/Step hierarchy, acceptance, and validation. Verify the physical Research or engineer-chosen issue-Review predecessor and current Plan in the confirmed same folder. Describe an authorized implementation report relationship only; do not reserve a numbered report filename. Changed scope returns to a newly approved Plan version; renew Research only when new evidence requires it.

## Implementation report

For `-implementation-report.md`, follow the [implementation report template](../skills/safe-implementation/implementation-report-template.md). Verify the physical Plan predecessor and save/read back the pass report in the confirmed same folder. Record one bounded pass, actual edits, hierarchy completion, validation performed, failed, unavailable, or not run, deviations, and residual risks. The report is immutable, non-authorizing evidence; it does not expand scope or mutate Plan status or markers. Only the Implement coordinator may make its separately guarded, eligible pass updates.

## Review report

For `-review-report.md`, follow the [Review report template](../skills/code-review/review-report-template.md). Verify the physical implementation-report and Plan predecessors and save/read back the Review report in the confirmed same folder for every disposition. Preserve classified findings, evidence, validation limits, and one supported disposition. Mixed actionable and unclear findings use `Needs clarification`, retain both classifications, and cannot be accepted. An all-OK Review is terminal; persist and verify its report before any eligible status-only `Accepted` write under the core's guards. An issue Plan requires a later explicit `/plan` invocation and engineer-approved bounded scope.

## Validation boundaries

Instruction-pattern matching, including comma-separated glob interpretation, and runtime attachment have not been verified. Do not claim that VS Code Local or Agent Host attaches this instruction, or that a link guarantees a referenced skill or template is loaded. A nonphysical or non-local item may identify a candidate but is not a canonical phase predecessor or substitute for a physical same-folder record. Report only validation actually performed and state unavailable checks with the reason.
