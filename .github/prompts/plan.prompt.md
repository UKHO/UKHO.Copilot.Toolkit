---
name: plan
description: Launch the existing Plan agent with an approved research brief to produce a reviewable implementation plan.
argument-hint: Provide one lifecycle-core-eligible research-brief alias or one inline Markdown link with that alias as its destination
agent: Plan
---

Use the existing `Plan` agent to plan from this approved research brief and to process the sole explicit `/plan` admission event:

${input:researchBriefPath:One lifecycle-core-eligible alias to the approved research brief, or one inline Markdown link whose destination is that alias}

Pass the supplied `researchBriefPath` value verbatim. Let `Plan` apply [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) to the one bounded alias or inline Markdown destination, including expected type, lifecycle folder, approval, provenance, exact `Status: In progress`, and procedural preimage/write/postimage checks. Only this explicit `/plan` invocation may admit and close that exact Research brief by changing its one status field to `Completed`; a generic Plan handoff or inferred invocation does not qualify. Do not allocate or persist a Plan on rejection or integrity failure.

This explicit `/plan` invocation and one validated predecessor—the exact canonical in-progress Research-brief evidence—are the handoff confirmation; do not ask a duplicate phase-entry question. The invocation does not authorize implementation, commands, remediation, source or customization edits, Plan scope or hierarchy changes, acceptance, Plan allocation/persistence, or auto-send a handoff to Implement. The separate bounded closure is limited to the one validated Research `Status` field and its procedural integrity checks; the developer must separately approve the saved plan before any Implement handoff.
