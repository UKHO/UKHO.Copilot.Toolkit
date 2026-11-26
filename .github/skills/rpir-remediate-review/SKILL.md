---
name: rpir-remediate-review
description: Manually resume Implement for supported in-boundary Review corrections under the original approved Plan.
disable-model-invocation: true
argument-hint: Original approved Plan and linked issue-bearing Review report
---
## Purpose

This retained adapter describes supported corrections to the original approved outcome; it does not select or invoke RPIR Implement or approve material expansion. The engineer selects RPIR Implement and deliberately sends the request with the physical original Plan and linked Review. Apply the policy effective at invocation; no policy edit self-upgrades a session.

## Inputs

The placeholders below are optional adapter text, not required expansions or role selectors; the actual physical inputs must be supplied and inspected.

Original Plan: ${input:implementationPlanDocument:Actual original approved Plan and inspected version, supplied by attachment, accessible HTTPS URL, paste or contained local path}

Review context: ${input:reviewReportDocument:Actual issue-bearing Review report and inspected version identifying supported in-boundary corrections}

If either input or the correction classification is missing, conflicting or unverifiable, stop the affected edit and clarify; do not infer authority from a finding.

## Constraints

- Apply [RPIR lifecycle core](../rpir-lifecycle-core/SKILL.md): independently inspect the contained numbered physical original Plan, Review report, reviewed implementation report and direct same-folder Research lineage. Locators alone are not canonical records.
- The engineer's deliberate sent Implement request with the inspected physical original Plan and linked Review context approves only its original outcome and supported in-boundary correction. Review findings are evidence, not scope or edit authority. Preserve original acceptance criteria, user work, and unresolved findings; produce fresh implementation evidence and offer manual independent Review with the physical report; an unsent prefill does not invoke it. A partial report is a checkpoint, not completed delivery.
- New requirements, material public behavior, consequential dependencies, security or compatibility commitments or additional external effects require an engineer decision and a Plan-owned amendment/new Plan through a deliberate engineer-sent Plan request with the physical Review; do not implement that portion through this adapter. Actual denial is not a fallback opportunity. References do not guarantee attachment.
- Apply the [safe implementation skill](../rpir-safe-implementation/SKILL.md) to assess missing/partial architectural coverage even with valid bindings. Unexpected uncovered or changed architecture needs engineer-directed Plan resolution before dependent effects; continue independent approved correction. Routine coding needs no ADR reference; this shortcut grants no ADR authorship.
- Apply that skill's planned-versus-actual checkpoint accounting at every expected correction boundary before unrelated work, retaining earlier coherent validated Task consideration and specific actual disposition/exception evidence. Do not backfill substantive exceptions into the original approved Plan, override historical prohibitions or infer Git authority from findings. Only RPIR Script Runner executes covered effects under the [checkpoint capability](../rpir-local-git-checkpoints/SKILL.md); unchanged Plan-covered effects need no duplicate grant and commit count is not technical acceptance.

## Output

Implement reports actual corrected work and passed, failed, unavailable and not-run checks; persist and read back a fresh report only under the coordinator's lifecycle guards. No automatic handoff or acceptance.
