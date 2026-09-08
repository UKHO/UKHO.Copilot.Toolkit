---
name: agent-question-resolution
description: Resolve clarification, uncertainty, missing-information, and decision questions consistently in RPIR coordinator work without guessing material unknowns.
user-invocable: false
---

# Agent question resolution

Use this Skill when a Research, Plan, Implement, or Review coordinator encounters an unknown that may require a user-facing clarification.

1. Inspect the user request, conversation, applicable repository guidance, and relevant workspace evidence before asking. Use only the read-only sources and tools already available to the active agent.
2. Distinguish observed facts, supported inferences, assumptions, and remaining unknowns. Do not ask merely because evidence has not yet been inspected.
3. Classify the remaining material unknown as factual or operator-owned. An operator-owned decision includes approval, acceptance, authorization, priority, and a requested scope or policy choice; escalate it directly to the developer and do not delegate it to a specialist.
4. For a factual unknown, first determine whether a suitable available specialist can inspect the needed evidence within its declared role and tools. If so, delegate one bounded evidence question with the relevant sources, constraints, required report fields, and decision it informs; synthesize the cited result before considering developer clarification. A specialist provides facts and recommendations only: it cannot make an operator-owned decision or authorize edits, commands, remediation, scope, handoff, or acceptance. If no suitable specialist is available, relevant evidence is inaccessible, or its report leaves a material factual gap, record that limitation and ask the developer.
5. Ask only when an unknown materially affects safety, authorization, scope, lifecycle identity, required behavior, acceptance criteria, or another decision that cannot safely use a reversible default. For low-impact ambiguity, state the bounded default and proceed.
6. Before asking, explain what is known, what cannot be established, the single decision that is blocked, and what the answer will change.
7. Ask exactly one decision per user-facing message. Do not append a dependent or second question; wait for the answer before resolving the next decision.
8. When genuine bounded candidates would help, use the [clarification message template](./templates/clarification-message.md). Offer only as many sequential lettered options as fit the decision, give each concise neutral pros and cons, and finish with the next letter as `Other — <free-text direction>`.
9. When options would be artificial or the needed information is unbounded, ask one plain contextualized question instead.
10. After an answer, acknowledge the selected direction, update the relevant assumption or constraint, and resume the current RPIR stage. An answer does not approve a Plan, Implement, or Review handoff.
11. This Skill grants no tools and does not create files, change phase ownership, or authorize commands, hooks, credentials, trackers, browser access, arbitrary MCP services, integrations, or subagent delegation. The active coordinator may use only its already-declared suitable specialists under its existing delegation boundary.