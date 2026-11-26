---
name: rpir-implement
description: Deliver an inspected approved Plan or resume original-Plan Review corrections.
disable-model-invocation: true
argument-hint: Actual approved Plan and, for correction, linked Review report
---
## Purpose

Describe the inspected approved outcome for `RPIR Implement`, including supported original-criteria correction when linked Review context is supplied. This adapter does not select or invoke the agent.

## When to use

For initial delivery or supported correction, select RPIR Implement and deliberately send a request with the actual physical approved Plan and, for correction, the inspected Review report. No slash or fixed phrase is required under the prospective policy; use the route actually effective at invocation, without session self-upgrade. Material new scope instead requires an engineer decision and Plan-owned amendment/new Plan.

## Inputs

The placeholders below are optional adapter text, not required expansions or role selectors; the actual physical inputs must be supplied and inspected.

Implementation plan: ${input:implementationPlanDocument:Actual plan supplied by attachment, accessible HTTPS URL, pasted content or contained local path}

For a Review correction: ${input:reviewReportDocument:Actual linked Review report and inspected version; omit for initial delivery}

If the actual plan or its identity is missing, inaccessible, or ambiguous, stop dependent edits and clarify; do not guess.

## Constraints

- The engineer's deliberate sent Implement request with the actual inspected physical Plan version approves only that bounded initial or issue-resolution pass, regardless of prior agent readiness advice; role selection, skill loading, a standalone approval or unsent prefilled handoff does not transfer ownership. Do not ask a duplicate routine approval.
- For original-criteria corrections inspect the physical Review, its reviewed implementation report, original approved Plan and Research lineage; the Review is evidence, not edit authority. Preserve original acceptance, produce fresh implementation evidence and seek fresh independent Review. New material scope requires a newly inspected, explicitly approved Plan version; do not expand work from Review findings alone.
- Verify the approved outcome, evidence, local-write integrity and platform/effect permissions independently before each effect. Diagnose ordinary failures, repair attributable in-boundary mistakes without overwriting user changes and rerun relevant checks; a failed check leaves dependent acceptance unmet. Refuse material expansion or a real denial, not useful safe diagnosis.
- Apply the supported essential mechanism; if missing or invalid, whether architectural or not, identify affected effects/evidence and seek engineer-directed Plan resolution, with scoped Research continuation when evidence is needed. Continue independent approved work; an ordinary test failure alone does not restart Research. Use the [safe implementation skill](../rpir-safe-implementation/SKILL.md) for justified residual facts and purpose-bounded alignment scans, preserving ordinary inspection, local decisions and related-file/test selection without an exhaustive whitelist.
- Apply the [safe implementation skill](../rpir-safe-implementation/SKILL.md) to assess architectural coverage, not only existing ADR bindings. Unexpected uncovered or changed architecture needs engineer-directed Plan resolution before dependent effects; continue independent approved work and retain routine coding without ADR reference. This grants no ADR authorship.
- For each Plan-bound ADR, bind the exact path/ID, section, substantive Proposed preimage, agreement evidence/conditions and dependent Work Items. Only when the prospective rule was effective before this deliberate Implement request with the inspected physical approved Plan does the request sign off that exact snapshot. The Implement coordinator alone may perform the separate, guarded metadata-only Accepted/date/agreement-evidence update before dependent source effects; inspect preimage, authority/conditions, identity, containment, conflicts and permission, preserve decision text/history, save and read back the full postimage. A prior invocation is not retroactive. Report invocation separately from persistence; failure/denial/unverifiable state is not Accepted and holds only dependent effects. Assess each bound ADR independently. Workers/Runner/Review/helpers gain no ADR authorship, status or sign-off authority.
- Under that skill and the [checkpoint capability](../rpir-local-git-checkpoints/SKILL.md), account for planned versus actual disposition at every expected boundary before unrelated work, including earlier coherent validated Task consideration. Record verified checkpoint or specific actual disposition evidence and justified departures; never invent retrospective substantive Plan exceptions or override a prohibition, including historical Plans. Only RPIR Script Runner executes authorized Git effects; commit count is not technical acceptance and unchanged Plan-covered effects need no duplicate grant.
- Publication alone does not approve the report for Review. Offer a manual Review request with the physical report; do not auto-submit it. References do not guarantee attachment.

## Process

1. Apply [RPIR lifecycle core](../rpir-lifecycle-core/SKILL.md) to inspect and bind the plan's content, kind, subject, version and lineage, not just its locator.
2. Independently verify the actual contained, numbered physical Plan and direct lineage in the verified Research folder, plus the linked physical Review/report chain for a correction; an attachment, URL or paste is only a locator.
3. Resolve unknowns using [rpir-agent-question-resolution](../rpir-agent-question-resolution/SKILL.md) while continuing safe pass work. Continue investigating unknowns and clarify identity/evidence; refuse only an affected edit whose scope, evidence or permission guard fails. Return a truthful report even when a guarded effect cannot proceed.

## Output

Produce fresh implementation evidence with passed, failed, unavailable and not-run checks. A partial report is a checkpoint, not completion. Save this pass's numbered implementation report in that same folder and verify its postimage before claiming persistence. If the predecessor, authorized write or readback is unavailable, disclose the output as unfinished without changing scope or claiming a canonical handoff. This adapter does not select or invoke the receiving role.
