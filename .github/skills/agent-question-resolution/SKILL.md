---
name: agent-question-resolution
description: Resolve clarification, uncertainty, missing-information, and decision questions consistently in RPIR coordinator work without guessing material unknowns.
user-invocable: false
---

# Agent question resolution

Use this Skill when a Research, Plan, Implement, or Review coordinator encounters an unknown that may require a user-facing clarification.

1. Inspect the user request, conversation, applicable repository guidance, and relevant workspace evidence before asking. Use only the read-only sources and tools already available to the active agent.
2. Distinguish observed facts, supported inferences, assumptions, and remaining unknowns. Do not ask merely because evidence has not yet been inspected.
3. Ask only when an unknown materially affects safety, authorization, scope, lifecycle identity, required behavior, acceptance criteria, or another decision that cannot safely use a reversible default. For low-impact ambiguity, state the bounded default and proceed.
4. Before asking, explain what is known, what cannot be established, the single decision that is blocked, and what the answer will change.
5. Ask exactly one decision per user-facing message. Do not append a dependent or second question; wait for the answer before resolving the next decision.
6. When genuine bounded candidates would help, use the [clarification message template](./templates/clarification-message.md). Offer only as many sequential lettered options as fit the decision, give each concise neutral pros and cons, and finish with the next letter as `Other — <free-text direction>`.
7. When options would be artificial or the needed information is unbounded, ask one plain contextualized question instead.
8. After an answer, acknowledge the selected direction, update the relevant assumption or constraint, and resume the current RPIR stage. An answer does not approve a Plan, Implement, or Review handoff.
9. This Skill grants no tools and does not create files, change phase ownership, or authorize commands, hooks, credentials, trackers, browser access, arbitrary MCP services, integrations, or subagent delegation.