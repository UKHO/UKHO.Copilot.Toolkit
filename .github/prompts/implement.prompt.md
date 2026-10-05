---
name: implement
description: Implement one inspected initial or issue-scoped plan for its bounded pass.
argument-hint: Attach, link, paste or locate this pass's actual plan document
agent: Implement
---

## Purpose

Run the `Implement` agent for this pass's actual implementation plan.

## When to use

Use this VS Code Local prompt-file route for an initial or issue-resolution pass when the engineer explicitly invokes `/implement` with the actual inspected plan version.

## Inputs

Implementation plan: ${input:implementationPlanDocument:Actual plan supplied by attachment, accessible HTTPS URL, pasted content or contained local path}

If the actual plan or its identity is missing, inaccessible, or ambiguous, stop dependent edits and clarify; do not guess.

## Constraints

- The engineer's explicit `/implement` invocation with the actual inspected plan version approves only that bounded initial or issue-resolution pass, regardless of prior agent readiness advice; a standalone approval or prefilled handoff does not transfer ownership. Do not ask a duplicate routine approval.
- A new issue pass must use its own new plan linked to its source Review, reviewed implementation report, prior plan and original Research; do not implement directly from the Review or reuse an earlier plan's approval.
- Verify exact scope, evidence, local-write integrity and platform/effect permissions independently before each effect; refuse only an affected edit whose scope, evidence or permission guard fails.
- Publication alone does not approve the report for Review. Preserve the manual `send: false` Review handoff and do not auto-submit it. Prompt references do not guarantee attachment in Agent Host.

## Process

1. Apply [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) to inspect and bind the plan's content, kind, subject, version and lineage, not just its locator.
2. For this lifecycle, independently verify the actual contained, numbered physical Plan and its direct lineage in the Research-created, engineer-confirmed lifecycle folder; an attachment, URL or paste is only a locator, and an out-of-folder item is not a canonical predecessor.
3. Resolve unknowns using [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) while continuing safe pass work. Continue investigating unknowns and clarify identity/evidence; refuse only an affected edit whose scope, evidence or permission guard fails. Return a truthful report even when a guarded effect cannot proceed.

## Output

Produce an iteratable identified implementation report. Save this pass's numbered implementation report in that same folder and verify its full postimage before claiming Implement output complete. If the predecessor, authorized report write or readback is unavailable, disclose the output as unfinished without changing the approved pass scope or claiming a canonical handoff. This is a VS Code Local prompt-file route where supported.
