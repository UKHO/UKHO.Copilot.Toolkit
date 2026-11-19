---
name: "<lowercase-kebab-case-name>"
description: "<role, task, outcome, and useful discovery terms>"
# Add only when justified for this specific role:
# user-invocable: false
# tools: ["<minimum-required-tool>"]
# skills: ["<role-appropriate-existing-skill>"]
---

# <Agent role>

## Role and objective

State the sustained responsibility this agent owns and the outcome it is expected to produce. Use an agent only when role ownership, context isolation, distinct tools, delegation, or a phase handoff is needed.

## Inputs

- Required: <specific inputs and evidence the agent must inspect>
- Optional: <optional context, if applicable>
- Missing or conflicting input: <what the agent must clarify or stop rather than assume>

## Responsibilities and exclusions

### Responsibilities

- <observable responsibility within the agent's role>
- <expected evidence or result>

### Exclusions

- <actions or decisions this agent must not take>
- <authority retained by the user, coordinator, or another role>

## Model profile (authoring guidance)

For a Toolkit suite role, use [agent model selection](../../agent-model-selection/SKILL.md) to record the capability/consequence classification and one profile recommendation. Add the role to the authoritative profile and verify the supported Copilot runtime ID and preference path. If evidence is unresolved, disclose the gap; do not activate an invented `model` field or claim observed routing.

For a current Toolkit role, use the approved profile's model, reasoning and selection policy. The current 18-role profile assigns `gpt-6.1-sol`/high/required to four coordinators; the 14 `hydrafusion` specialists omit `reasoning-effort` and `model-policy` for Fusion-managed reasoning, not an effective setting. Omission does not clear inherited or external configuration or establish observed effective effort. This starter has no active model, selection policy or effort placeholder; only add model fields and any separately approved supported effort policy when adapting it to a classified role. Do not invent a fallback.

Distinguish assigned model and reasoning policy from separately observed effective settings. An unobservable effective model is "not observable"; an observed fallback with an unavailable reason is "cause not exposed". Do not infer fallback from missing telemetry or report a known wrong default as a pass. Runtime behavior and compatibility are unverified; do not assume parent configuration reaches a child. Supported overrides require evidence; neither escalation nor model choice grants authority.

## Least-privilege tools and delegation

List only tools required for the stated role, and omit unnecessary capabilities. A live Copilot-targeted role needs a justified nonempty supported list: empty or missing can mean all tools on the inspected conversion path. Keep capability-bearing frontmatter inactive in this starter until its need and effective permission have been checked. Observational workers receive no edit or terminal access by default. Research and Review coordinators remain source-read-only; Plan remains source/configuration-read-only except that only its coordinator, during active planning, may create or revise a directly associated Proposed ADR under the identity, containment, collision, permission and readback guards in the [lifecycle core](../../rpir-lifecycle-core/SKILL.md#planning-stage-adr-authorship-exception). This is not general ADR authorship and grants no authority to workers or other phases. Coordinator lifecycle-record and guarded status writes remain limited to their explicit phase scope. Load essential role-appropriate named skills explicitly; links or parent inheritance do not prove loading.

If delegation is necessary, enable it only for the appropriate coordinator and state each permitted existing worker in its loaded body. Resolve actual discovered role identity; do not hardcode opaque IDs or substitute a generic worker. Do not use a wildcard route or enable nested worker delegation. These behavioral rules are not a native per-parent filter; unexpected exposed tools and worker roles do not confer authority.

## Handoff (conditional)

Omit this section when no handoff is needed. For a justified transition, identify the receiving role and physical input and require a deliberate engineer-sent request when inspection or approval is needed. The prospective native route has no fixed wording or slash dependency; policy effective at invocation governs bootstrap. Policy edits do not self-upgrade a session or make an earlier invocation retroactive. A selection or unsent suggestion is not approval. If target, sequencing or approval is unknown, stop and resolve it.

## Output

Describe the expected deliverable, its required structure, and how to distinguish verified evidence from assumptions or unresolved issues. Do not claim effects or validation that were not observed.

## Verification

- [ ] Frontmatter is valid and the name is unique and appropriate for the agent.
- [ ] Role, inputs, responsibilities, exclusions, and output contract are specific and consistent.
- [ ] Every tool is justified by the role; any coordinator's body names only intended permitted workers.
- [ ] Any handoff is logically sequenced, targets an existing agent, and remains manual where approval matters.
- [ ] A representative request fits the role and produces the declared output without unauthorized effects.
- [ ] Check VS Code Chat References and Diagnostics if loading or delegation is uncertain; report runtime checks not performed as unverified.