---
name: implement
description: Implement one inspected initial or issue-scoped plan for its bounded pass.
argument-hint: Attach, link, paste or locate this pass's actual plan document
agent: Implement
---

Run the `Implement` agent for this pass's actual implementation plan:

Implementation plan: ${input:implementationPlanDocument:Actual plan supplied by attachment, accessible HTTPS URL, pasted content or contained local path}

Apply [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) to inspect and bind its content, kind, subject, version and lineage, not just its locator. A new issue pass must use its own new plan linked to its source Review, reviewed implementation report, prior plan and original Research; do not implement directly from the Review or reuse an earlier plan's approval. Clarify missing, conflicting or blocked evidence before affected edits.

Invoking `/implement` with the inspected plan version is the engineer's approval for only that bounded initial or issue-resolution pass; do not ask a duplicate routine approval. Verify executable readiness, exact scope, local-write integrity and platform/effect permissions before work. Produce an iteratable identified implementation report; publication alone does not approve it for Review. Preserve the manual `send: false` Review handoff and do not auto-submit it.
