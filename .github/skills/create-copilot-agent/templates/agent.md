---
name: "<lowercase-kebab-case-name>"
description: "<role, task, outcome, and useful discovery terms>"
# Add only when justified for this specific role:
# user-invocable: false
# tools: ["<minimum-required-tool>"]
# agents: ["<explicit-existing-agent-name>"]
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

For a Toolkit suite role, use [agent model selection](../../agent-model-selection/SKILL.md) to record the capability/consequence classification and one profile recommendation. Add the role to the authoritative profile and verify the exact supported automatic Local configuration before calling it profile-compliant. If evidence is unresolved, disclose the gap; do not activate an invented `model` field.

For the classified role, declare its own canonical profile effort as `reasoning-effort` beside its model, without requiring runtime support proof before declaration; do not default all roles to `high` or inherit another role's effort. This starter has no active model or effort placeholder; add actual fields only when adapting it to a classified role.

Distinguish recommended effort, declared intent, supported model configuration and separately observed effective effort. Runtime consumption, compatibility and harmless ignoring are unestablished; disclose unknown support. Do not assume root effort reaches a child. Supported overrides require evidence; neither escalation nor model choice grants authority.

## Least-privilege tools and delegation

List only tools required for the stated role, and omit unnecessary capabilities. Keep any capability-bearing frontmatter inactive in this starter until its need and effective permission have been checked. Observational workers receive no edit or terminal access by default; record-writing exceptions for coordinators remain limited to their explicitly assigned lifecycle records and do not grant source edits.

If delegation is necessary, enable it only for the appropriate coordinator and list each allowed existing agent by exact name. Do not use a wildcard allow-list or enable nested worker delegation by default. A worker role does not inherit coordinator authority.

## Handoff (conditional)

Omit this section when no handoff is needed. If a logically sequenced handoff is justified, identify the existing target by exact name and require a manual handoff using `send: false` whenever the developer must inspect or approve the next step. If the target, sequencing, or approval requirement is unknown, stop and resolve it; do not configure or imply an automatic approval.

## Output

Describe the expected deliverable, its required structure, and how to distinguish verified evidence from assumptions or unresolved issues. Do not claim effects or validation that were not observed.

## Verification

- [ ] Frontmatter is valid and the name is unique and appropriate for the agent.
- [ ] Role, inputs, responsibilities, exclusions, and output contract are specific and consistent.
- [ ] Every tool is justified by the role; any delegation allow-list names only intended existing agents.
- [ ] Any handoff is logically sequenced, targets an existing agent, and remains manual where approval matters.
- [ ] A representative request fits the role and produces the declared output without unauthorized effects.
- [ ] Check VS Code Chat References and Diagnostics if loading or delegation is uncertain; report runtime checks not performed as unverified.