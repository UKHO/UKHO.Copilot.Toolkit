---
name: plan
description: Launch the existing Plan agent with an exact approved research brief to produce a reviewable implementation plan.
argument-hint: Provide the exact numbered repository-relative research-brief path
agent: Plan
---

Use the existing `Plan` agent to plan from this exact approved research brief:

${input:researchBriefPath:Exact numbered repository-relative path to the approved research brief, for example docs/delivery/001-initial-prompts/001-research-brief.md}

Pass the supplied `researchBriefPath` value verbatim. Do not infer, normalize, repair, substitute, or select a research brief by prefix, suffix, recency, or “latest”. If the path is missing, malformed, inaccessible, ambiguous, not an exact approved numbered repository-relative research-brief path, or otherwise materially uncertain, stop and apply [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) rather than guessing.

Invocation only starts the Plan stage. It does not authorize implementation or auto-send a handoff to Implement; the developer must explicitly approve the saved plan before any Implement handoff.
