# Choose an artifact

## Purpose and audience

**Purpose:** Help readers choose the smallest GitHub Copilot customization artifact that matches their need.

**Audience:** Toolkit consumers deciding whether they need repository context, a reusable capability, a shortcut, a role, delegated work, or a visible workflow transition.

## Prerequisites

- Know the task or repository problem you want to address.
- Read the [RPIR reference](rpir.md) before making a consequential customization change.

## Content

Choose by the job the artifact performs:

| Need | Choose | Activation and repository form |
| --- | --- | --- |
| Stable repository facts or conventions applied automatically | **Instruction** | Always-on, matched, or manually attached; for example `.github/copilot-instructions.md` or `.github/instructions/*.instructions.md`. |
| A repeatable, portable capability with references or templates | **Skill** | Model-selected when relevant or user-invoked; `.github/skills/<skill-name>/SKILL.md` plus optional resources. |
| A deliberate saved shortcut for one local task | **Prompt file** | User-invoked; `.github/prompts/<name>.prompt.md`. |
| A sustained role with explicit tools, model preferences, or orchestration | **Custom agent** | User-selected or delegated; `.github/agents/<name>.agent.md`. |
| Isolated research, review, or parallel work launched by a parent | **Subagent invocation** | Runtime delegation, not a separate file type; it may use a custom agent as its configuration. |
| A visible, user-controlled transition between stages | **Handoff** | A user-selected transition declared by an agent; it is not background delegation. |

Start with instructions for repeated repository context. Add a skill for a resource-backed workflow, a prompt for a deliberate local shortcut, and an agent only when a durable role or meaningful capability boundary is needed. Use subagents when isolation or independent work provides a concrete benefit.

These artifacts guide Copilot; they do not provide deterministic security or approval. Keep tools, worker allow-lists, scope, inputs, outputs, exclusions, and side effects explicit. Preserve human confirmation before consequential effects, and link to canonical policy instead of copying it.

## Canonical references

- [GitHub Copilot artifact best-practices research brief](planning/copilot-artifact-best-practices/001-research-brief.md) — Research-backed selection model, activation distinctions, composition guidance, and compatibility cautions.
- [Repository Copilot instructions](../.github/copilot-instructions.md) — Canonical repository governance, least-privilege, approval, and scope boundaries.
- [Custom agent guidance](../.github/agents/implement.agent.md) — Example of explicit role, tool, delegation, and manual-handoff boundaries.
- [Wiki-maintenance Skill](../.github/skills/wiki-maintenance/SKILL.md) — Boundaries for repository-managed Markdown and canonical-source linking.

## Related links

- [RPIR](rpir.md) — Understand the lifecycle before changing a customization.
- [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md) — Interpret plans, reports, and other lifecycle evidence correctly.

## Next steps

- Select the smallest suitable artifact, then inspect its canonical authoring guidance before editing.
- For a substantive change, follow the [RPIR lifecycle](rpir.md) and wait for the required manual approval or acceptance decision.
