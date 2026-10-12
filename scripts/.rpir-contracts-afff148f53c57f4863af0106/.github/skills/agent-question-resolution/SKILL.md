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
- The active coordinator's available sources, tools, and declared delegation boundary.

## Procedure

1. Inspect the user request, conversation, applicable repository guidance, and relevant workspace evidence before asking. Use only sources and tools actually available to the active agent within its phase boundary.
2. Distinguish observed facts, supported inferences, assumptions, and remaining unknowns. Do not ask merely because evidence has not yet been inspected.
3. Classify the unknown as factual or engineer-owned. Diagnose factual failures and, in Implement, make ordinary related repairs and relevant rechecks within the approved outcome and effective permissions; neither requires a new decision merely because a check failed or the Plan did not predict the debugging step. Reconcile unexpected effects and preserve original criteria and user changes. New requirements, material behavior, dependencies, security or compatibility commitments, external effects, approval and acceptance remain engineer-owned. An actual denial is not permission to try another route; uncertain destructive or external completion must be reconciled before repetition.
4. Investigate factual gaps directly when permitted; use a suitable available specialist when helpful, not as a prerequisite. A specialist supplies evidence and advice, not authority. If evidence is inaccessible or the material choice remains open, identify the affected effect and ask promptly; continue independent safe work.
5. Ask when a material choice cannot be supported by evidence or a disclosed reversible, low-impact default. A clear Research request proceeds without a synthesized-understanding confirmation. State a low-impact default when used; do not conceal genuine open questions or make full resolution a prerequisite for continuing other eligible work.
6. Before asking, briefly give the relevant evidence and uncertainty, a recommendation when supportable, the material decision needed and its impact. Ask a focused contextual question; offer genuine alternatives only when useful, without inventing options or requiring letters. Avoid bundling dependent decisions into a forced ballot.
7. After an answer, acknowledge the direction, update the relevant assumption or constraint and resume the current stage. Clarification alone does not invoke or approve a phase transition.

## Outputs

- A concise, contextual material question with a recommendation when supported, optional genuine alternatives and the impact of the answer. Clear requests need no confirmation checkpoint; low-impact ambiguity may use a stated reversible default.
- After an answer, the acknowledged direction, updated assumption or constraint, and resumed current-stage work.

## Limits

- MUST inspect available evidence before asking and distinguish facts, inferences, assumptions, and unknowns.
- MUST ask promptly for material engineer-owned decisions, without treating an unanswered question as a veto on independent safe work.
- MUST NOT delegate an operator-owned decision or treat a specialist's facts or recommendation as authorization.
- MUST NOT treat a clarification answer as approval of a Plan, Implement, or Review handoff.
- MUST NOT use tools, sources, or delegation beyond those already available and declared for the active coordinator.
- This Skill grants no tools and does not create files, change phase ownership, or authorize commands, hooks, credentials, trackers, browser access, arbitrary MCP services, integrations, or subagent delegation. The active coordinator may use only its already-declared suitable specialists under its existing delegation boundary.

## Validation

- Before asking, inspect relevant available evidence and identify the material decision and affected effect.
- For low-impact ambiguity, state the bounded default and proceed; do not ask merely because evidence has not yet been inspected.
- After an answer, confirm that the direction is acknowledged and current-stage work resumes without treating the answer as handoff approval.

## Linked resource

Use the [clarification message template](./templates/clarification-message.md) for material questions in any phase. Keep context proportional; optional alternatives may include concise neutral trade-offs. Never require a confirmation or a lettered response to a clear Research request.