---
name: agent-question-resolution
description: Resolve clarification, uncertainty, missing-information, and decision questions consistently in RPIR coordinator work without guessing material unknowns.
user-invocable: false
---

# Agent question resolution

## Trigger

Use this Skill when a Research, Plan, Implement, or Review coordinator encounters an unknown that may require a user-facing clarification.

## Inputs

- The user request and conversation, applicable repository guidance, and relevant workspace evidence.
- The remaining unknown, its material effect, and the evidence or decision needed to resolve it.
- The active coordinator's existing read-only sources, available specialists, and declared delegation boundary.

## Procedure

1. Inspect the user request, conversation, applicable repository guidance, and relevant workspace evidence before asking. Use only the read-only sources and tools already available to the active agent.
2. Distinguish observed facts, supported inferences, assumptions, and remaining unknowns. Do not ask merely because evidence has not yet been inspected.
3. Classify the remaining material unknown as factual or operator-owned. Read-only diagnosis of an observation or formulation failure, and carrying out an explicitly Plan-covered repair within its approved scope, are factual/in-scope work; neither itself requires a new engineer decision. Apply the repair only under the Plan's existing evidence, permission, and safety guards. A new scope, authority, or safety choice—and decisions such as approval, acceptance, priority, or a requested policy choice—remain operator-owned; raise the single affected decision to the developer promptly and do not delegate it to a specialist.
4. For a factual unknown, first determine whether a suitable available specialist can inspect the needed evidence within its declared role and tools. If so, delegate one bounded evidence question with the relevant sources, constraints, required report fields, and decision it informs; synthesize the cited result before considering developer clarification. A specialist provides facts and recommendations only: it cannot make an operator-owned decision or authorize edits, commands, remediation, scope, handoff, or acceptance. This does not prevent the active coordinator from carrying out a repair already explicitly covered by the approved Plan. If no suitable specialist is available, relevant evidence is inaccessible, or its report leaves a material factual gap, record that limitation and ask the developer when the gap requires an operator-owned choice or cannot safely use a reversible default.
5. Ask only when an unknown materially affects safety, authorization, scope, lifecycle identity, required behavior, acceptance criteria, or another decision that cannot safely use a reversible default. Do not delay a needed question once it is clear that an unplanned scope, authority, or safety choice is required; continue independent safe diagnosis and other eligible work. For low-impact ambiguity, state the bounded, reversible default and proceed. For Research, every engineer-facing question—including confirmation of a synthesized understanding—must still present its one decision explicitly; a default does not replace a required confirmation.
6. Before asking, explain what is known, what cannot be established, the single affected decision or dependent effect that cannot proceed, and what the answer will change. The unresolved decision does not block the phase or negate an engineer-approved inspected-version transition.
7. Ask exactly one decision per user-facing message. Do not append a dependent or second question; wait for the answer before resolving the next decision.
8. For Research, use the [clarification message template](./templates/clarification-message.md) as a structure for every engineer-facing question, including a synthesized-understanding confirmation; this Research-specific procedure overrides the template's generic plain-question fallback. State what is established, what remains unknown, the single decision, and its impact or what the answer will change; then offer sequential lettered, issue-appropriate choices. Include only candidates that can be honestly supported, with concise neutral pros and cons when genuine alternatives have them. When specific candidates cannot be honestly predicted, include a clearly open-direction or uncertainty response rather than inventing candidate answers. For a summary confirmation, include lettered confirm and correct choices and an uncertain/open response where applicable. Do not ask a bare Research question.
9. For Plan, Implement, and Review, when options would be artificial or the needed information is unbounded, ask one plain contextualized question instead; retain the existing material-unknown threshold. This plain-question route does not apply to Research, which uses the lettered Research format even when the response must be open-ended.
10. After an answer, acknowledge the selected direction, update the relevant assumption or constraint, and resume the current RPIR stage. For Research, revise the synthesis when the answer corrects or leaves it uncertain, and continue within Research after confirmation. An answer does not approve a Plan, Implement, or Review handoff.

## Outputs

- For Research, each engineer-facing clarification—including synthesized-understanding confirmation—states what is established, what remains unknown, the single decision, and its impact or what an answer will change; it uses sequential lettered, issue-appropriate choices and an honest open-direction or uncertainty response when specific candidates cannot be predicted. Never leave a Research question bare. Other phases retain the existing material-unknown-only contextual question route; low-impact ambiguity uses a stated bounded, reversible default.
- After an answer, the acknowledged direction, updated assumption or constraint, and resumed current-stage work.

## Limits

- MUST inspect available evidence before asking and distinguish facts, inferences, assumptions, and unknowns.
- MUST ask exactly one decision per user-facing message and wait for its answer before resolving another decision.
- MUST NOT delegate an operator-owned decision or treat a specialist's facts or recommendation as authorization.
- MUST NOT treat a clarification answer as approval of a Plan, Implement, or Review handoff.
- MUST NOT use tools, sources, or delegation beyond those already available and declared for the active coordinator.
- This Skill grants no tools and does not create files, change phase ownership, or authorize commands, hooks, credentials, trackers, browser access, arbitrary MCP services, integrations, or subagent delegation. The active coordinator may use only its already-declared suitable specialists under its existing delegation boundary.

## Validation

- Before asking, confirm that evidence inspection is complete, the unknown is material, and only one decision or dependent effect is blocked.
- For low-impact ambiguity, state the bounded default and proceed; do not ask merely because evidence has not yet been inspected.
- After an answer, confirm that the direction is acknowledged and current-stage work resumes without treating the answer as handoff approval.

## Linked resource

For Research, use the [clarification message template](./templates/clarification-message.md) as a structure for every engineer-facing question, with established/unknown/decision/impact context and sequential lettered, issue-appropriate choices; this skill's Research-specific rule overrides the template's generic plain-question fallback. Use an honest open-direction or uncertainty choice instead of fabricating candidates, and format synthesized-summary confirmation as a lettered confirm/correct decision. For Plan, Implement, and Review, use the template when genuine bounded candidates help; otherwise retain one material-unknown-only, plain contextualized question. Offer concise neutral pros and cons when genuine alternatives have them.