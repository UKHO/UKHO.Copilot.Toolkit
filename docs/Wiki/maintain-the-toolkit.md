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

For custom agents, grant only justified, supported tools required for the role; an empty or missing list can mean all tools on the inspected Copilot conversion path. When delegation is genuinely useful, put exact permitted workers in the coordinator's loaded body, resolve discovered role identity and keep workers non-user-invocable and nondelegating. Load essential role-appropriate named skills explicitly. These are behavioral controls, not a native per-parent filter or proof of isolation; unexpected tools do not grant authority.

Use the [model selection capability](../../.github/skills/agent-model-selection/SKILL.md) and its [single role profile](../../.github/skills/agent-model-selection/references/role-profiles.md) when adding or maintaining a role: justify its capability/consequence classification and update the profile. The current agent source projects one Copilot runtime ID and each role's own `reasoning-effort` from that profile as preferred configuration, not a fallback array or universal effort. Configuration is not observed dispatch. Report an unobservable effective model as "not observable" and an observed fallback with unavailable reason as "cause not exposed"; missing telemetry is not evidence of fallback, and a known wrong default is not a pass. Do not assume root effort reaches children. Preserve supported overrides and authority boundaries; model choice and effort grant no authority. Runtime routing and effort consumption remain unverified.

### Make metadata and transitions explicit

Make identity, applicability, activation, inputs, outputs, exclusions, side effects, and validation visible in the artifact metadata and body. Follow the linked authoring Skills for artifact-specific metadata and resource guidance. For lifecycle transitions and manual handoffs, use [RPIR](rpir.md), [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md), and the [repository policy](../../.github/copilot-instructions.md) rather than duplicating their controls here.

### Prefer composition and canonical links

Apply the lifecycle core's [shared reader-facing output rule](../../.github/skills/rpir-lifecycle-core/SKILL.md#reader-facing-outputs) when maintaining RPIR guidance: plain-English phase-owned reports/chat, inspected predecessor links instead of retelling analysis, proportionate questions and no Q&A/change diary or compulsory empty categories. Required evidence and authority remain explicit. Use the [four synthetic output pairs](../../.github/skills/rpir-stage-assurance/concise-output-scenarios.md) for manual semantic comparison alongside mechanical checks, not as measured runtime improvement or permission to launch sessions.

Link to canonical policy and authoring guidance instead of copying procedures. Keep repository links relative and descriptive. This page provides orientation only; the linked sources remain authoritative, and customization files guide a probabilistic model rather than providing deterministic security enforcement.

When adding a resource-backed Skill, include only resources that materially improve repeatability, place detailed material in the appropriate resource directory, and link it from `SKILL.md`. Review links, metadata, tool boundaries, discovery, and representative behavior when platform support or dependencies change.

### Diagnose and validate without packaging

Every prospective Plan requires one explicit bounded strategy; every detailed Work Item needs a strategy reference, normal post-validation boundary and coherent content/purpose, or a specific justified exception. Assess actual constraint/reason, affected IDs, validation/dependency consequence, later boundary if one exists and why normal is unsuitable—not just headings. Reconcile planned versus actual dispositions at every expected boundary before unrelated work; runtime obstacles are fresh evidence, never retrospective substantive Plan exceptions. Respect historical prohibitions and conditional execution; commit count is not technical acceptance. Static checks cannot establish semantic completeness or runtime adherence. Alongside both contract entries, manually inspect useful per-item exceptions, boundary evidence, helper/permission/drift safeguards and distinct supported skips versus unavailable/failed/uncertain outcomes. These checks do not authorize Git, packaging or activation.

Within the approved outcome, Implement can investigate failures, correct attributable edits without overwriting user work and recheck original acceptance. Use actually permitted direct local commands or the optional [Script Runner](../../.github/agents/script-runner.agent.md) for a bounded goal; the Runner is not a mandatory gateway or a Run Book command selector. Test and Validation Workers remain read-only; an assigned Implementation Worker may run relevant checks when actually permitted. Respect real denial and reconcile uncertain destructive or external completion before repeating. A failing local check is a reason to diagnose, not a completed validation result.

The [structural check](../../scripts/verify-copilot-contracts.cjs) (`npm run verify-copilot-contracts`) performs a read-only mechanical discovery/manifest parity and customization-structure pass. It checks supported frontmatter, structured role/tool/Skill/invocation fields, model/profile projections, manifest/lockfile support agreement, lifecycle `applyTo` patterns, ADR Skill identity and required resource references, inert agent-template metadata, and repository-local inline Markdown links including nested Skill resources. It rejects unsupported Local delegation/handoff metadata; it does not judge authored-English obligations, ownership, contradictions or semantic policy coverage.

The [contract fixture suite](../../tests/test-copilot-contracts.cjs) (`npm run test-copilot-contracts`) exercises retained mechanical checks and real aggregate/entry-point wiring with controlled in-memory mutations and VM fixtures, without writing fixture trees. Neutral narrative bodies pass while paired metadata, resource and applicability defects still fail; this demonstrates independence from narrative meaning, not wording equivalence or policy correctness. Controlled fixture success does not make the actual checkout valid.

These are bounded source checks, not a full YAML/Markdown parser, and do not establish conversation compliance, installed loading, platform permissions or runtime safety. Manually reconcile each identified architectural choice to meaningful coverage as well as running both contract entries. Human review still assesses the underlying behavioral obligations; subsequent engineer-led user testing assesses artifact effectiveness through actual use and observation, not an automated semantic judge. Any installed conversation evaluation requires separate authorization.

The retained [archive-boundary fixture suite](../../tests/test-vsix-boundary.cjs) (`npm run test-vsix-boundary`) is an optional standalone check for archive/candidate changes. It exercises payload-byte fidelity, evidence, confirmation/preimage protocols, collisions, drift, containment and failure handling. It creates, writes and removes temporary filesystem fixture trees and synthetic archives, using injected builders and fake tools rather than real vsce builds or repository VSIX candidates. Permission-dependent junction branches may be skipped; report those separately from exercised coverage. It has no result-retention wrapper.

The authored [workflow](../../.github/workflows/package.yml) runs only the mechanical structural check; both fixture suites remain separate optional interfaces outside routine authoring CI. It retains the disabled packaging job under the release hold. Discovery and explicit manifest `check`/`sync` remain separate maintenance operations; `verify-package` remains a separate packaging operation against an existing VSIX. Reenabling packaging needs owner confirmation and a distinct authorized output strategy. Do not infer that hosted CI has run or that installed agents behave as authored from local static checks or workflow text. No package, dependency installation, manifest sync or activation is authorized by this page. The [Run Book](../run-books/vsix-packaging.md) describes human packaging interfaces, not execution authority.

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
