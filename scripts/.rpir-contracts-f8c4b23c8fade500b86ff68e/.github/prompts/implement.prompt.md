---
name: implement
description: Deliver an inspected approved Plan or resume original-Plan Review corrections.
argument-hint: Actual approved Plan and, for correction, linked Review report
agent: Implement
---

## Purpose

Run the `Implement` agent for the inspected approved outcome, including supported original-criteria correction when linked Review context is supplied.

## When to use

Use this VS Code Local prompt-file route for initial delivery or manual resumption of the original approved Plan with an inspected Review report identifying supported in-boundary corrections. Material new scope instead requires an engineer decision and Plan-owned amendment/new Plan.

## Inputs

Implementation plan: ${input:implementationPlanDocument:Actual plan supplied by attachment, accessible HTTPS URL, pasted content or contained local path}

For a Review correction: ${input:reviewReportDocument:Actual linked Review report and inspected version; omit for initial delivery}

If the actual plan or its identity is missing, inaccessible, or ambiguous, stop dependent edits and clarify; do not guess.

## Constraints

- The engineer's explicit `/implement` invocation with the actual inspected plan version approves only that bounded initial or issue-resolution pass, regardless of prior agent readiness advice; a standalone approval or prefilled handoff does not transfer ownership. Do not ask a duplicate routine approval.
- For original-criteria corrections inspect the physical Review, its reviewed implementation report, original approved Plan and Research lineage; the Review is evidence, not edit authority. Preserve original acceptance, produce fresh implementation evidence and seek fresh independent Review. New material scope requires a newly inspected, explicitly approved Plan version; do not expand work from Review findings alone.
- Verify the approved outcome, evidence, local-write integrity and platform/effect permissions independently before each effect. Diagnose ordinary failures, repair attributable in-boundary mistakes without overwriting user changes and rerun relevant checks; a failed check leaves dependent acceptance unmet. Refuse material expansion or a real denial, not useful safe diagnosis.
- Publication alone does not approve the report for Review. Preserve the manual `send: false` Review handoff and do not auto-submit it. Prompt references do not guarantee attachment in Agent Host.

## Process

1. Apply [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) to inspect and bind the plan's content, kind, subject, version and lineage, not just its locator.
2. Independently verify the actual contained, numbered physical Plan and direct lineage in the verified Research folder, plus the linked physical Review/report chain for a correction; an attachment, URL or paste is only a locator.
3. Resolve unknowns using [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) while continuing safe pass work. Continue investigating unknowns and clarify identity/evidence; refuse only an affected edit whose scope, evidence or permission guard fails. Return a truthful report even when a guarded effect cannot proceed.

## Output

Produce fresh implementation evidence with passed, failed, unavailable and not-run checks. A partial report is a checkpoint, not completion. Save this pass's numbered implementation report in that same folder and verify its postimage before claiming persistence. If the predecessor, authorized write or readback is unavailable, disclose the output as unfinished without changing scope or claiming a canonical handoff. This is a VS Code Local prompt-file route where supported.
