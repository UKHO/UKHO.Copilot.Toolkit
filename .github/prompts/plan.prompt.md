---
name: plan
description: Launch the existing Plan agent with an approved research brief to produce a reviewable implementation plan.
argument-hint: Provide one lifecycle-core-eligible research-brief alias or one inline Markdown link with that alias as its destination
agent: Plan
---

Use the existing `Plan` agent to plan from this approved research brief:

${input:researchBriefPath:One lifecycle-core-eligible alias to the approved research brief, or one inline Markdown link whose destination is that alias}

Pass the supplied `researchBriefPath` value verbatim. Accept only one bounded alias or one inline Markdown destination exactly as defined by [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md); first derive and validate its one canonical identity, then let `Plan` apply its expected-type, lifecycle-folder, approval, and provenance checks. If it is invalid or materially uncertain, stop and apply [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) rather than guessing.

This valid phase request starts the Plan stage; do not ask a duplicate phase-authorization question. It does not authorize implementation or auto-send a handoff to Implement; the developer must explicitly approve the saved plan before any Implement handoff.
