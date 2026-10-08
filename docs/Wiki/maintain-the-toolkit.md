# Maintain the Toolkit

## Purpose and audience

**Purpose:** Orient maintainers who create, review, or update GitHub Copilot customization artifacts in this repository.

**Audience:** Toolkit maintainers who understand basic Markdown and VS Code customization concepts. This page is an orientation, not a replacement for repository policy or authoring Skills.

## Prerequisites

- Start with the repository [contribution and governance policy](../../.github/copilot-instructions.md).
- Confirm the approved outcome, material boundary and handoff before editing. For consequential work, use the repository's Research → Plan → Implement → Review lifecycle rather than treating this page as authorization; an anticipated file list need not predict every in-boundary correction.

## Content

### Keep customizations focused and least-privileged

Choose the smallest artifact that fits the need: an instruction for stable context or conventions, a prompt for a deliberate local shortcut, a Skill for a reusable resource-backed capability, and an agent for a durable role or meaningful tool boundary. Use the narrowest applicable scope and avoid broad personas, duplicated guidance, unnecessary tools, and speculative artifacts.

For custom agents, grant only the tools required for the role. Use an explicit worker allow-list when delegation is genuinely useful; keep workers non-user-invocable and do not enable nested delegation without a justified need. Treat subagents as bounded, isolated work rather than as an additional policy authority.

### Make metadata and transitions explicit

Make identity, applicability, activation, inputs, outputs, exclusions, side effects, and validation visible in the artifact metadata and body. Follow the linked authoring Skills for artifact-specific metadata and resource guidance. For lifecycle transitions and manual handoffs, use [RPIR](rpir.md), [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md), and the [repository policy](../../.github/copilot-instructions.md) rather than duplicating their controls here.

### Prefer composition and canonical links

Link to canonical policy and authoring guidance instead of copying procedures. Keep repository links relative and descriptive. This page provides orientation only; the linked sources remain authoritative, and customization files guide a probabilistic model rather than providing deterministic security enforcement.

When adding a resource-backed Skill, include only resources that materially improve repeatability, place detailed material in the appropriate resource directory, and link it from `SKILL.md`. Review links, metadata, tool boundaries, discovery, and representative behavior when platform support or dependencies change.

### Diagnose and validate without packaging

Within the approved outcome, Implement can investigate failures, correct attributable edits without overwriting user work and recheck original acceptance. Use actually permitted direct local commands or the optional [Script Runner](../../.github/agents/script-runner.agent.md) for a bounded goal; the Runner is not a mandatory gateway or a Run Book command selector. Test and Validation Workers remain read-only; an assigned Implementation Worker may run relevant checks when actually permitted. Respect real denial and reconcile uncertain destructive or external completion before repeating. A failing local check is a reason to diagnose, not a completed validation result.

The manifest/contract check, [scenario suite](../../scripts/test-copilot-contract-scenarios.cjs) and [packaging-guide check](../../scripts/verify-vsix-packaging-guide.cjs) are separate static validation surfaces. A scenario invocation may retain one suite-owned `scripts/.rpir-contracts-<24 lowercase hex>/` staging tree; inspect its reported path and size rather than silently cleaning it. P1 calls for a checks-only CI workflow with independent contract, scenario and guide checks and a visibly disabled packaging job under the hold; until that workflow change is applied, the current workflow is not checks-only. Reenabling packaging needs owner confirmation and a distinct authorized output strategy. Do not infer that hosted CI has run or that installed agents behave as authored from local static checks or workflow text. No package, dependency installation, manifest sync or activation is authorized by this page. The [Run Book](../run-books/vsix-packaging.md) describes human packaging interfaces, not execution authority.

## Canonical references

- [Repository guidance](../../.github/copilot-instructions.md) — authoritative repository scope, least-privilege, approval, lifecycle, and link-boundary rules.
- [Create a custom agent](../../.github/skills/create-copilot-agent/SKILL.md) — role, tools, explicit workers, and manual handoff authoring guidance.
- [Create a custom instruction](../../.github/skills/create-copilot-instruction/SKILL.md) — narrow applicability and metadata guidance.
- [Create a prompt file](../../.github/skills/create-copilot-prompt/SKILL.md) — explicit inputs, selected agent, side-effect boundaries, and stop conditions.
- [Create an Agent Skill](../../.github/skills/create-copilot-skill/SKILL.md) — resource-backed Skill structure, relative resource links, and validation guidance.

## Related links

- [Artifact catalogue](artifact-catalogue.md) — current maintainer inventory of artifact purposes, activation models, and canonical paths.
- [Keeping the Wiki current](keeping-the-wiki-current.md) — current guidance for bounded Wiki maintenance and manual validation.
- [Wiki home](index.md) — current entry point and audience routes.

## Next steps

- Use the [artifact catalogue](artifact-catalogue.md) to locate the relevant canonical customization.
- Read the matching authoring Skill above before proposing a change.
- Follow the approved lifecycle handoff and have the result reviewed against the canonical sources and exact target scope.
- Record performed, failed, unavailable and not-run checks honestly, and seek fresh independent Review after supported original-Plan corrections. A partial report is not the promised deliverable.
