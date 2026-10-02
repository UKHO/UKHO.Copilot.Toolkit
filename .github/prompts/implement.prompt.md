---
name: implement
description: Implement one inspected initial or issue-scoped plan for its bounded pass.
argument-hint: Attach, link, paste or locate this pass's actual plan document
agent: Implement
---

Run the `Implement` agent for this pass's actual implementation plan:

Implementation plan: ${input:implementationPlanDocument:Actual plan supplied by attachment, accessible HTTPS URL, pasted content or contained local path}

Apply [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) to inspect and bind its content, kind, subject, version and lineage, not just its locator. A new issue pass must use its own new plan linked to its source Review, reviewed implementation report, prior plan and original Research; do not implement directly from the Review or reuse an earlier plan's approval. Continue investigating unknowns and clarify identity/evidence; refuse only an affected edit whose scope, evidence or permission guard fails.

Resolve unknowns using [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) while continuing safe pass work. The engineer's explicit `/implement` invocation with the actual inspected plan version approves only that bounded initial or issue-resolution pass, regardless of prior agent readiness advice; a standalone approval or prefilled handoff does not transfer ownership. Do not ask a duplicate routine approval. Verify exact scope, evidence, local-write integrity and platform/effect permissions independently before each effect; refuse only an affected edit whose guard fails. Return a truthful report even when a guarded effect cannot proceed. Produce an iteratable identified implementation report; publication alone does not approve it for Review. Preserve the manual `send: false` Review handoff and do not auto-submit it. This is a VS Code Local prompt-file route where supported; prompt references do not guarantee attachment in Agent Host.
