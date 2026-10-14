---
name: agent-question-resolution
description: Resolve clarification, uncertainty, missing-information, and decision questions consistently in RPIR coordinator work without guessing material unknowns.
user-invocable: false
---

# Agent question resolution

## Trigger

Use this Skill whenever a Research, Plan, Implement, or Review coordinator prepares any engineer-facing question. Research MUST load and apply this Skill and its clarification message template before every question, including discovery, follow-ups, intent readback, and later clarification. Other phases use contextual material clarification; they do not inherit Research's initial-discovery process.

## Inputs

- The user request and conversation, applicable repository guidance, and relevant workspace evidence.
- The remaining unknown, its material effect, and the evidence or decision needed to resolve it.
- The active coordinator's available sources, tools, and declared delegation boundary.

## Procedure

1. Inspect the user request, conversation, applicable repository guidance, and relevant workspace evidence before asking. Use only sources and tools actually available to the active agent within its phase boundary.
2. Distinguish observed facts, supported inferences, assumptions, and remaining unknowns. Do not ask merely because evidence has not yet been inspected.
3. Classify the unknown as factual or engineer-owned. Diagnose factual failures and, in Implement, make ordinary related repairs and relevant rechecks within the approved outcome and effective permissions; neither requires a new decision merely because a check failed or the Plan did not predict the debugging step. Reconcile unexpected effects and preserve original criteria and user changes. New requirements, material behavior, dependencies, security or compatibility commitments, external effects, approval and acceptance remain engineer-owned. An actual denial is not permission to try another route; uncertain destructive or external completion must be reconciled before repetition.
4. Investigate factual gaps directly when permitted; use a suitable available specialist when helpful, not as a prerequisite. A specialist supplies evidence and advice, not authority. If evidence is inaccessible or the material choice remains open, identify the affected effect and ask promptly; continue independent safe work.
5. Ask when a material choice cannot be supported by evidence or a disclosed reversible, low-impact default. In Research, every new objective normally receives an explicit confirm/correct readback before broad intent-dependent investigation, including when the initial prompt appears detailed. The engineer may explicitly direct Research to defer that checkpoint and proceed against disclosed provisional understanding; honor that direction without duplicate confirmation or a repeated checkpoint. Silence, uncertainty, or prompt clarity is not such a direction. State a low-impact default when used; agent-selected defaults do not establish engineer intent or replace Research acknowledgment.
6. Before asking, use proportional **Known → Uncertain → Recommendation (if supported) → Question** framing: briefly give relevant evidence, the remaining gap, a recommendation only when supported, and what the answer changes. For a Research readback, distinguish engineer statements from inference and make confirmation or correction explicit. Offer genuine alternatives only when useful, without inventing options or requiring letters. Avoid bundling dependent decisions into a forced ballot.
7. After an answer, acknowledge the direction and update the relevant understanding, assumption, or constraint before resuming the current stage. In Research, retain the existing intent trace on continuation; a correction changes the interpretation and affected follow-up. Clarification or acknowledgment alone does not invoke or approve a phase transition.

## Outputs

- A concise, contextual question with evidence, uncertainty, a recommendation only when supported, optional genuine alternatives, and the impact of the answer. In Research, include adaptive discovery and the default confirm/correct readback for every new objective; an explicitly engineer-directed deferral is recorded as provisional, not confirmed.
- After an answer, the acknowledged direction, updated understanding or constraint, and resumed current-stage work. A Research trace records actual deferral scope/timing and dependent unknowns when applicable.

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

Use the [clarification message template](./templates/clarification-message.md) for engineer-facing questions in any phase. Keep context proportional; optional alternatives may include concise neutral trade-offs. Research MUST also apply [Research intent discovery](./references/research-intent-discovery.md) to every engineer-facing question. Explicit deferral changes the Research intake sequence only; it does not settle authority, permission, or phase transition.