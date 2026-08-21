---
name: implement
description: Launch the existing Implement agent for one explicitly approved implementation plan without inferring scope or authorizing lifecycle actions.
argument-hint: Exact saved prefixed canonical implementation-plan path
agent: Implement
---

Run the existing `Implement` agent for the exact saved, prefixed canonical implementation-plan path provided below.

Implementation plan: ${input:implementationPlanPath:Exact saved prefixed canonical implementation-plan path}

Treat the supplied path as a literal repository-relative path. Do not select, normalize, repair, substitute, or infer a plan using a prefix, suffix, recency, “latest”, or any other heuristic. Stop if the path is missing, malformed, inaccessible, ambiguous, not an exact saved prefixed canonical path, or otherwise materially uncertain, and apply [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) before proceeding.

This invocation only starts the selected Implement stage. It does not approve editing, authorize work beyond the named plan, or auto-submit the Review handoff. Preserve the existing Implement agent's approval, scope, validation, report, and manual handoff controls; the developer must provide any required approval separately.
