---
name: remediate-review
description: Deprecated compatibility route to Plan for an agreed issue-bearing Review report; never implements fixes.
argument-hint: Attach, link, paste or locate the agreed issue-bearing Review report
agent: Plan
---

This deprecated VS Code Local compatibility route is a Plan alias using the same Review-origin intake as `/plan`; it is not an Implement entry or a second approval route. Prompt references do not guarantee attachment in Agent Host.

Source Review report: ${input:reviewReportDocument:Actual agreed issue-bearing Review report supplied by attachment, accessible HTTPS URL, pasted content or contained local path}

Inspect and bind the actual report's content, kind, subject, version and direct reviewed-implementation-report, previous-plan and original-Research lineage via [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md). If inaccessible, wrong-kind, conflicting, clarification-only or lacking actionable evidence, continue investigation or clarify instead of claiming sign-off or creating a fix. For mixed findings, take only the engineer-chosen independently supported subset and carry unclear findings.

For this lifecycle, independently verify the actual contained, numbered physical issue-bearing Review report, its reviewed implementation report, previous Plan and original Research in the Research-created, engineer-confirmed lifecycle folder, with matching direct lineage. The supplied attachment, URL or paste is only a locator; do not accept nonphysical or out-of-folder evidence as canonical or create/use another folder. Save and fully verify the new numbered issue Plan in that same folder before claiming Plan output complete. If a required predecessor, authorized write or readback is unavailable, disclose the output as unfinished; this deprecated alias remains a Plan route and never an edit route.

Treat this explicit Plan invocation with the actual inspected Review version as approval to plan only an engineer-chosen bounded actionable scope, regardless of prior agent readiness advice; standalone approval does not transfer ownership. Create and iterate a distinct issue-scoped plan with new unchecked units, not a reused old plan or direct implementation pass. For mixed `Needs clarification` findings, carry unclear findings forward and do not infer fixes. This does not re-close Research, approve edits, authorize commands, allocate an implementation report, or auto-submit Implement. The engineer later explicitly invokes `/implement` with the inspected new plan to approve its bounded pass. Prefer `/plan` for future issue cycles; retain this contributed prompt solely for compatibility.
