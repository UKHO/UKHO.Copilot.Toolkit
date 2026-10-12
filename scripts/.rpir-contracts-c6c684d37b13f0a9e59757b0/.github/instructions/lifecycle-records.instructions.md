---
name: RPIR lifecycle records
description: Apply the RPIR record lifecycle to numbered Research, Plan, Implement, and Review artifacts.
applyTo: 'docs/planning/**/[0-9][0-9][0-9]-research-brief.md,docs/delivery/**/[0-9][0-9][0-9]-research-brief.md,docs/planning/**/[0-9][0-9][0-9]-implementation-plan.md,docs/delivery/**/[0-9][0-9][0-9]-implementation-plan.md,docs/planning/**/[0-9][0-9][0-9]-implementation-report.md,docs/delivery/**/[0-9][0-9][0-9]-implementation-report.md,docs/planning/**/[0-9][0-9][0-9]-review-report.md,docs/delivery/**/[0-9][0-9][0-9]-review-report.md,**/copilot/[0-9][0-9][0-9]-[a-z0-9]*/[0-9][0-9][0-9]-research-brief.md,**/copilot/[0-9][0-9][0-9]-[a-z0-9]*/[0-9][0-9][0-9]-implementation-plan.md,**/copilot/[0-9][0-9][0-9]-[a-z0-9]*/[0-9][0-9][0-9]-implementation-report.md,**/copilot/[0-9][0-9][0-9]-[a-z0-9]*/[0-9][0-9][0-9]-review-report.md'
---

# RPIR lifecycle records

## Applies to

- **Intended files:** Numbered local Research briefs, implementation plans, implementation reports and review reports in verified historical `docs/planning/` or `docs/delivery/` topics, or in a verified documentation root's direct `copilot/` numbered topic, matching one of the twelve declared candidate patterns.
- **Does not apply to:** Other files, unnumbered documents, non-local candidate records, or an unrelated `copilot/` tree merely because its path looks like a lifecycle record.

Treat `applyTo` as candidate coverage only, not proof of physical identity, attachment or write authority. The broad prefix covers `docs/copilot/001-subject/001-research-brief.md` and an evidenced nested root such as `team/handbook/copilot/001-subject/001-implementation-plan.md`; a wrong suffix, unnumbered topic or record, or a non-`copilot/` prospective path is not intended to match. An unrelated `archive/copilot/001-subject/001-review-report.md` can match: refuse RPIR-specific action unless independent inspection establishes a real contained lifecycle folder, its physical records and direct same-folder lineage. The wildcard topic suffix does not enforce the core's exact slug grammar. Preserve the eight legacy patterns for established folders. The [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) is the canonical shared contract for source-neutral intake, lineage, transitions, allocation, and effect guards. The four links below identify the sole owners of their stage schemas.

## Rule

- **MUST:** Follow the canonical lifecycle core and the owning stage template; preserve the physical-record, direct-lineage, and effect checks below.
- **SHOULD:** Use the stage-specific links and report only evidence and validation actually established.
- **MUST NOT:** Treat a candidate, attachment, link, or runtime assumption as a substitute for the required physical record or as authority to bypass lifecycle guards.

## Shared workflow and effect contract

* Follow the [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) for intake, material boundaries, manual transitions, physical record allocation and supported recovery; do not duplicate its procedure here. A matching glob is candidate coverage, not proof of attachment, actual containment, lifecycle identity or write authority. Independently verify the real Research folder, expected-kind predecessor/content, direct same-folder links and effective permission. Historical `docs/planning/` and `docs/delivery/` topics remain readable without renaming or migration.
* Inspect the intended verified topic and exact artifact-suffix inventory, select an absent numbered filename, save without overwrite and read back the physical content and links. On a collision, re-read and choose an absent next number in the same verified topic if subject, identity and ownership remain clear; otherwise resolve the ambiguity. A denied or failed save is not persisted output; do not evade real denial or blindly repeat uncertain destructive or external effects. No mandatory double inventory, fingerprint, duplicate canonical path field or status-only write ritual is required. A concise identity/lineage section suffices; optional status mirrors are not approval or acceptance.
* Continue the current phase on a clear Research request; investigate facts and ask promptly for material decisions with [agent-question-resolution](../skills/agent-question-resolution/SKILL.md). Approved outcome and original acceptance govern ordinary local diagnosis, related repair and relevant recheck. Review findings alone do not authorize edits; supported in-boundary corrections use manual Implement resumption with the original Plan and linked Review context, followed by fresh evidence and independent re-review. Material expansion needs a Plan-owned decision. Report open questions, failed or unavailable validation and incomplete output truthfully.

## Stage schemas

- **Research brief:** Follow the [Research brief template](../skills/codebase-research/research-brief-template.md); retain cited evidence, source provenance, useful recommendation and real questions without compulsory confirmation.
- **Implementation plan:** Follow the [implementation plan template](../skills/architecture-planning/implementation-plan-template.md). Plan alone owns the outcome, scope, hierarchy and acceptance; the work register need not predict every debugging action.
- **Implementation report:** Follow the [implementation report template](../skills/safe-implementation/implementation-report-template.md). Record actual delivery, progress/corrections and validation as passed, failed, unavailable or not run; partial work is a checkpoint.
- **Review report:** Follow the [Review report template](../skills/code-review/review-report-template.md). Independently compare actual work and validation to the original criteria; classify severity, actionable/unclear findings and correction/material scope. Accept only a verified clean result with no unresolved finding.

## Validation boundaries

The twelve authored patterns retain eight legacy suffix paths and four prospective broad-prefix shapes. Static examples do not prove glob attachment in VS Code Local or Agent Host. An unrelated RPIR-shaped `copilot/` tree can match: refuse RPIR-specific action unless independent inspection establishes physical lifecycle identity, actual containment and direct lineage. Wrong-suffix, unnumbered record/topic and non-`copilot/` prospective paths are not intended matches. A link does not prove its target is loaded; report only validation actually observed and state unavailable checks with the reason.
