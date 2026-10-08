---
name: remediate-review
description: Manually resume Implement for supported in-boundary Review corrections under the original approved Plan.
argument-hint: Original approved Plan and linked issue-bearing Review report
agent: Implement
---

## Purpose

This VS Code Local shortcut **changes semantics**: it was a deprecated Plan alias; it now enters Implement for supported corrections to the original approved outcome. It is not backward-compatible with the former Plan route and does not approve material expansion.

## Inputs

Original Plan: ${input:implementationPlanDocument:Actual original approved Plan and inspected version, supplied by attachment, accessible HTTPS URL, paste or contained local path}

Review context: ${input:reviewReportDocument:Actual issue-bearing Review report and inspected version identifying supported in-boundary corrections}

If either input or the correction classification is missing, conflicting or unverifiable, stop the affected edit and clarify; do not infer authority from a finding.

## Constraints

- Apply [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md): independently inspect the contained numbered physical original Plan, Review report, reviewed implementation report and direct same-folder Research lineage. Locators alone are not canonical records.
- The engineer's explicit invocation of Implement with the inspected original Plan and linked Review context approves only its original outcome and supported in-boundary correction. Review findings are evidence, not scope or edit authority. Preserve original acceptance criteria, user work, and unresolved findings; produce fresh implementation evidence and request fresh independent Review manually (`send: false`). A partial report is a checkpoint, not completed delivery.
- New requirements, material public behavior, consequential dependencies, security or compatibility commitments or additional external effects require an engineer decision and a Plan-owned amendment/new Plan via `/plan`; do not implement that portion through this shortcut. Actual denial is not a fallback opportunity. Prompt references do not guarantee attachment in Agent Host.

## Output

Implement reports actual corrected work and passed, failed, unavailable and not-run checks; persist and read back a fresh report only under the coordinator's lifecycle guards. No automatic handoff or acceptance.
