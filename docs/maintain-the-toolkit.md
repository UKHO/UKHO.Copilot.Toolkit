# Maintain the Toolkit

## Purpose and audience

**Purpose:** Orient maintainers who create, review, or update GitHub Copilot customization artifacts in this repository.

**Audience:** Toolkit maintainers who understand basic Markdown and VS Code customization concepts. This page is an orientation, not a replacement for repository policy or authoring Skills.

## Prerequisites

- Start with the repository [contribution and governance policy](../.github/copilot-instructions.md).
- Confirm the exact approved target, scope, and handoff before editing. For consequential work, use the repository's Research → Plan → Implement → Review lifecycle rather than treating this page as authorization.

## Content

### Keep customizations focused and least-privileged

Choose the smallest artifact that fits the need: an instruction for stable context or conventions, a prompt for a deliberate local shortcut, a Skill for a reusable resource-backed capability, and an agent for a durable role or meaningful tool boundary. Use the narrowest applicable scope and avoid broad personas, duplicated guidance, unnecessary tools, and speculative artifacts.

For custom agents, grant only the tools required for the role. Use an explicit worker allow-list when delegation is genuinely useful; keep workers non-user-invocable and do not enable nested delegation without a justified need. Treat subagents as bounded, isolated work rather than as an additional policy authority.

### Make metadata and transitions explicit

Make identity, applicability, activation, inputs, outputs, exclusions, side effects, and validation visible in the artifact metadata and body. Follow the linked authoring Skills for artifact-specific metadata and resource guidance. For lifecycle transitions and manual handoffs, use [RPIR](rpir.md), [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md), and the [repository policy](../.github/copilot-instructions.md) rather than duplicating their controls here.

### Prefer composition and canonical links

Link to canonical policy and authoring guidance instead of copying procedures. Keep repository links relative and descriptive. This page provides orientation only; the linked sources remain authoritative, and customization files guide a probabilistic model rather than providing deterministic security enforcement.

When adding a resource-backed Skill, include only resources that materially improve repeatability, place detailed material in the appropriate resource directory, and link it from `SKILL.md`. Review links, metadata, tool boundaries, discovery, and representative behavior when platform support or dependencies change.

## Canonical references

- [Repository guidance](../.github/copilot-instructions.md) — authoritative repository scope, least-privilege, approval, lifecycle, and link-boundary rules.
- [Artifact best-practices research](planning/copilot-artifact-best-practices/001-research-brief.md) — evidence-based selection model, composition guidance, metadata patterns, and risks.
- [Create a custom agent](../.github/skills/create-copilot-agent/SKILL.md) — role, tools, explicit workers, and manual handoff authoring guidance.
- [Create a custom instruction](../.github/skills/create-copilot-instruction/SKILL.md) — narrow applicability and metadata guidance.
- [Create a prompt file](../.github/skills/create-copilot-prompt/SKILL.md) — explicit inputs, selected agent, side-effect boundaries, and stop conditions.
- [Create an Agent Skill](../.github/skills/create-copilot-skill/SKILL.md) — resource-backed Skill structure, relative resource links, and validation guidance.

## Related links

- [Artifact catalogue](artifact-catalogue.md) — current maintainer inventory of artifact purposes, activation models, and canonical paths.
- [Keeping the Wiki current](keeping-the-wiki-current.md) — current guidance for bounded Wiki maintenance and manual validation.
- [Wiki home](index.md) — current entry point and audience routes.

## Next steps

- Use the [artifact catalogue](artifact-catalogue.md) to locate the relevant canonical customization.
- Read the matching authoring Skill above before proposing a change.
- Follow the approved lifecycle handoff and have the result reviewed against the canonical sources and exact target scope.
