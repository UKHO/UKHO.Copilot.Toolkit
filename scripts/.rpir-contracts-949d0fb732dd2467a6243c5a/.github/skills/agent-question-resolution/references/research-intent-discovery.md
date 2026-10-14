# Research intent discovery

Use this resource with [Agent question resolution](../SKILL.md) and its [clarification message template](../templates/clarification-message.md). The Research coordinator owns sequencing and dialogue; the shared Skill and template own question framing. Apply this method to every engineer-facing Research question, not only the first one.

## Discover the objective adaptively

Treat the initial prompt as evidence and a hypothesis, not a complete specification. Start with relevant request, conversation, policy and workspace context. Separate what the engineer stated from inference; do not ask again for information already supplied. Explore the underlying problem before a named solution: motivation, affected people, a concrete current example, desired outcome, exclusions, priorities and consequential constraints. Respect genuine solution constraints without manufacturing disagreement.

After each answer, identify what it changed and choose the highest-value unresolved follow-up that depends on that answer. Early questions should avoid anchoring on a proposed solution; later decision questions may include supported, neutral trade-offs. Default to one primary open question per turn; ask a small independent set only when genuinely useful. There is no fixed question or round quota, and no canned questionnaire.

## Read back, correct and stop

For every new Research objective, including a detailed prompt, normally provide a meaningful confirm/correct readback before broad intent-dependent investigation. Separate engineer statements from inference and cover the problem, desired outcome, exclusions, precise supplied constraints and material unknowns. Include a concrete expected example and a boundary/counterexample when relevant. Invite explicit confirmation or correction in the engineer's own words. A correction changes the interpretation and affected follow-up before a revised readback; silence and passive non-response are not confirmation.

Stop discovery when intent supports a relevant investigation, material assumptions are resolved or explicitly carried, and the readback is acknowledged and reconciled. A clear or detailed prompt can reduce follow-up, not remove acknowledgment. Do not continue questioning merely to exhaust a topic list.

## Honor explicit engineer-directed deferral

If the engineer explicitly directs Research to defer acknowledgment or proceed without it, acknowledge the direction and proceed with the requested intent-dependent investigation using a briefly disclosed provisional objective and consequential assumptions. Do not resist, demand a second confirmation, repeatedly re-present the deferred checkpoint, call deferral confirmation, or infer it from silence, uncertainty, passive non-response, or prompt clarity. Record the actual direction, provisional understanding, scope/timing, remaining assumptions and dependent limits, and pass them to investigators. Honor any requested timing for returning to discovery; otherwise revisit only when the engineer requests it or new material evidence warrants a focused question, not as an automatic prerequisite to reporting or continuing.

Deferral changes intake sequence only. It does not resolve missing material authority, waive actual safety or permission limits, authorize source edits, or invoke another phase. “I don't know” is valid and is not itself deferral; investigate facts, carry preferences truthfully, and do not force certainty or prototype in Research.

## Continue or change objective

When the same objective resumes or the engineer answers/corrects pending dialogue, reuse the existing intent trace, including any actual deferral. A newly introduced material objective gets focused discovery of what changed unless the engineer explicitly defers it. Later contradictory evidence reopens only the affected issue; preserve prior answers and update interpretation rather than silently drifting or restarting the whole interview. Necessary context reads and independent factual checks continue during Q&A; only intent-dependent work normally awaits acknowledgment.

## Illustrative prompts

These are contextual examples, not a script; deliver each through the shared template and select based on supplied information:

- “What happened that made this worth changing?”
- “Could you walk me through a real example today and what you would want to happen instead?”
- “What would be a technically successful result that still failed to solve the underlying problem?”
- “I understand the desired outcome as X; I inferred Y, while Z remains unknown. Is that right, or what should I correct?”
