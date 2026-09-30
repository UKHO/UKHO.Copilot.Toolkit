---
name: remediate-review
description: Deprecated compatibility route to Plan for an agreed issue-bearing Review report; never implements fixes.
argument-hint: Attach, link, paste or locate the agreed issue-bearing Review report
agent: Plan
---

This deprecated compatibility entry uses the same Review-origin intake as `/plan`; it is not an Implement entry or a second approval route.

Source Review report: ${input:reviewReportDocument:Actual agreed issue-bearing Review report supplied by attachment, accessible HTTPS URL, pasted content or contained local path}

Inspect and bind the actual report's content, kind, subject, version and direct reviewed-implementation-report, previous-plan and original-Research lineage via [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md). If inaccessible, wrong-kind, conflicting, solely blocked or lacking actionable evidence, clarify instead of claiming sign-off or creating a fix. For mixed findings, take only the engineer-chosen independently supported subset and carry unresolved blockers.

Treat this invocation like explicit `/plan` with that agreed report: create and iterate a distinct issue-scoped plan with new unchecked units, not a reused old plan or direct implementation pass. It does not re-close Research, mint plan approval for edits, authorize commands, allocate an implementation report, or auto-submit Implement. The engineer later invokes `/implement` with the inspected new plan to approve its bounded pass. Prefer `/plan` for future issue cycles; retain this contributed prompt solely for compatibility.
