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

1. Inspect the user request, conversation, applicable repository guidance, and relevant workspace evidence within the active phase's boundary. In Research, orient → discover → acknowledged readback → investigate; detailed, apparently factual and solution-led requests do not bypass substantive discovery. Before acknowledgment, absent explicit deferral, operating/context reads and supplied examples are allowed. For each additional factual lookup, state the specific uncertainty and next-question purpose before execution, bound the source/search, and stop to return to dialogue when answered or the bound is reached. No broad factual/solution search, delegated investigation, implementation comparison or substantive solution recommendation is permitted at this point.
2. Distinguish observed facts, supported inferences, assumptions, and remaining unknowns. Do not ask merely because evidence eligible under the active boundary has not yet been inspected; this is not permission to investigate broadly before Research acknowledgment.
3. Classify the unknown as factual or engineer-owned. Diagnose factual failures and, in Implement, make ordinary related repairs and relevant rechecks within the approved outcome and effective permissions; neither requires a new decision merely because a check failed or the Plan did not predict the debugging step. Reconcile unexpected effects and preserve original criteria and user changes. New requirements, material behavior, dependencies, security or compatibility commitments, external effects, approval and acceptance remain engineer-owned. An actual denial is not permission to try another route; uncertain destructive or external completion must be reconciled before repetition.
4. Investigate factual gaps directly when permitted; use a suitable available specialist when helpful, not as a prerequisite. Research intake is limited by step 1: neither factual-gap investigation nor delegation bypasses it. A specialist supplies evidence and advice, not authority. If evidence is inaccessible or the material choice remains open, identify the affected effect and ask promptly. Other phases may continue independent safe work. In Research, end the turn and wait for a pending material answer or readback acknowledgment rather than solving around it; eligible truthful Research-note persistence remains allowed, not a reason to broaden investigation.
5. Ask when a material choice cannot be supported by evidence or a disclosed reversible, low-impact default. In Research, elicit, challenge and broaden answer-dependently using the linked discovery method, then obtain actual confirm/correct acknowledgment of a substantive readback for every new objective. Emitting it is insufficient. The engineer may explicitly direct Research to defer discovery or that checkpoint and proceed against disclosed provisional understanding; honor the actual scope/timing without duplicate confirmation or a repeated checkpoint. Silence, uncertainty, prompt clarity and generic “keep going” pressure are not such a direction. State a low-impact default when used; agent-selected defaults do not establish engineer intent or replace Research acknowledgment.
6. Use **Known → Uncertain → Recommendation (if supported) → Question** framing. In every Research question, including later clarification, show those labels explicitly and concisely; omit only an unsupported Recommendation. At genuine choices, offer meaningful lettered alternatives with relevant trade-offs and a supported recommendation without waiting for a reminder; alternatives may precede the recommendation. Do not require exactly three choices, letter-only answers, invented alternatives or unsupported advice. Invite the engineer's own words or qualifications. For a fact/example request with no meaningful alternatives, explain the information needed and invite free text; this is not a blanket open-question-only exception. Before acknowledgment, absent explicit deferral, recommendations may guide discovery direction, not prescribe substantive solutions. Other phases retain proportional contextual framing and optional genuine alternatives. Avoid bundling dependent decisions into a forced ballot. For a Research readback, distinguish engineer statements from inference and invite confirmation or correction of the problem, outcome, exclusions, supplied constraints, relevant examples and unknowns.
7. After an answer, acknowledge the direction and update the relevant understanding, assumption, or constraint before resuming the current stage. In Research, use the answer to choose the useful next question; retain the intent trace on same-objective continuation. Accept natural-language acknowledgment, corrections and “I don't know” without forced letters, invented certainty or restarting the interview. Reconcile affected understanding before deeper investigation; a plausible alternative framing requires a labelled hypothesis, brief focused probe and engineer direction choice before deeper exploration. Do not automatically select the recommended letter. Clarification, acknowledgment and deferral do not invoke or approve a phase transition or create a `/plan` gate.

## Outputs

- A concise, contextual question and its impact. Research always uses explicit Known/Uncertain/Question labels and Recommendation when supported, with meaningful lettered choices/trade-offs at genuine decisions and free-text fact/example requests when alternatives do not help. Other phases retain optional alternatives and proportional framing.
- Adaptive Research discovery followed by a substantive readback and actual waiting for acknowledgment; explicitly engineer-directed deferral is recorded as provisional, not confirmed. After an answer, update understanding and continue dialogue or eligible investigation under the current state. Retain actual deferral scope/timing and dependent unknowns when applicable.

## Limits

- MUST inspect eligible available evidence before asking and distinguish facts, inferences, assumptions, and unknowns. During Research intake, the purpose/source/stop boundary in step 1 governs all additional lookups; generic inspect-first guidance grants no broader investigation.
- MUST ask promptly for material engineer-owned decisions. Other phases may continue independent safe work; Research must end the turn for a pending material answer or readback acknowledgment, absent explicit deferral. Generic completion pressure does not override waiting. Eligible truthful Research-note persistence remains allowed under existing lifecycle guards.
- MUST NOT delegate an operator-owned decision or treat a specialist's facts or recommendation as authorization.
- MUST NOT treat a clarification answer as approval of a Plan, Implement, or Review handoff.
- MUST NOT use tools, sources, or delegation beyond those already available and declared for the active coordinator.
- This Skill grants no tools and does not create files, change phase ownership, or authorize commands, hooks, credentials, trackers, browser access, arbitrary MCP services, integrations, or subagent delegation. The active coordinator may use only its already-declared suitable specialists under its existing delegation boundary.

## Validation

- Before asking, verify that evidence inspection stayed within the active boundary and identify the material decision and affected effect. In Research, check each additional lookup's declared uncertainty, next-question purpose, source/search bound and return to dialogue.
- Check every Research question for explicit framing, useful lettered alternatives/trade-offs and supported advice without reminders, or a justified free-text fact/example exception. Low-impact defaults do not replace discovery or engineer acknowledgment; other phases retain contextual clarification.
- After an answer, verify the answer-dependent update, any alternative-framing probe and engineer direction choice, and current-state-eligible work. Confirm actual acknowledgment or explicit deferral before broad Research work; do not mistake a sent readback for an answered one, or an answer for handoff approval.

## Linked resource

Use the [clarification message template](./templates/clarification-message.md) for engineer-facing questions in any phase. Research MUST also apply [Research intent discovery](./references/research-intent-discovery.md) to every engineer-facing question; it owns adaptive depth, bounded lookups, direction control and waiting. Other phases retain proportional context and optional alternatives. Explicit deferral changes the Research intake sequence only; it does not settle authority, permission, or phase transition.