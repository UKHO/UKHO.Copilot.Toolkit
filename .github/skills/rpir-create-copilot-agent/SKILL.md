---
name: rpir-create-copilot-agent
description: Create and validate a focused VS Code custom agent with a clear role, output contract, least-privilege tools, and explicit delegation or handoff boundaries. Use when sustained role ownership, context isolation, or phase-specific permissions materially improve a workflow; do not use for ordinary conventions or single-task shortcuts.
user-invocable: true
---

# Create a Copilot Agent

Create a narrowly scoped custom agent whose role and capability boundary are explicit and reviewable.

## Choose the artifact

Choose an agent only when role ownership, context isolation, distinct tools, delegation, or a phase handoff is needed. Recommend an instruction, Skill, or prompt otherwise.

## Scope, role, and inputs

- Default to repository scope under `.github/agents/`. Inspect existing customizations, `AGENTS.md`, `CLAUDE.md`, workflow documentation, and repository validation conventions before drafting.
- State the role, phase objective, responsibilities, explicit exclusions, required inputs, expected output, any justified handoff target, approval requirements, and required tools. Ask for unknown validation commands before considering terminal access; do not invent a command.
- Keep coordinator instructions focused on orchestration rather than copying repository standards owned elsewhere.
- For Toolkit suite roles, apply [agent model selection](../rpir-agent-model-selection/SKILL.md): justify a capability/consequence classification and one supported model/reasoning-policy recommendation, and add the role to the authoritative profile. The approved Copilot-native target uses one supported runtime ID as a preferred model per role. Establish the exact reference and path evidence before configuring it, and disclose unresolved evidence instead of silently inheriting or inventing a literal. The current candidate assigns `gpt-6.1-sol`/high/required to four coordinators and `hydrafusion` to 14 specialists; do not assume either applies to future roles without deliberate assessment. Do not use a fallback array or routine task-call override.
- For the current 18-role profile, coordinators author `reasoning-effort: high` and `model-policy: required`; the 14 `hydrafusion` specialists omit `reasoning-effort` and `model-policy` for Fusion-managed reasoning, not an effective setting. Omission does not clear inherited or external configuration or establish observed effective effort. Do not add an effort value without a separately supported and approved policy.
- Distinguish the assigned model and reasoning policy from observed effective model and effort. Report an unobservable effective model as "not observable" and an observed fallback with unavailable reason as "cause not exposed"; do not infer fallback from missing telemetry or call a known wrong default a pass. Runtime behavior and compatibility remain unverified. Do not assume parent configuration or promise picker precedence. Overrides require an evidenced supported route, and escalation grants no authority.

## Least-privilege capabilities and delegation

- **The author**, before granting a capability, must tie each requested tool to the agent's stated role and task. Grant only the smallest viable tool list supported by that need; if the need or permission is unknown, do not grant the capability until it is resolved.
- **Observational research, planning, review, assurance, and validation workers** receive no `edit` or terminal access by default. They do not gain lifecycle-record, status, approval, acceptance, or handoff authority from their role description.
- **Bounded Research, Plan, and Review coordinators** may need `edit` for their assigned local lifecycle drafts/reports and explicitly guarded status writes. Research and Review remain source-read-only; Plan remains source/configuration-read-only except for its narrow directly associated Proposed ADR exception. Only the Plan coordinator during active planning may create or revise such an ADR, subject to the identity, containment, collision, permission and readback guards in the [lifecycle core](../rpir-lifecycle-core/SKILL.md#planning-stage-adr-authorship-exception). This is not general ADR authorship and grants no authority to workers or other phases.
- **Implement** receives only the scope of its separately approved pass; a role description or tool declaration does not expand that scope.
- **Delegating coordinators** receive a supported delegation tool only when needed and state their exact permitted workers in the loaded body. Resolve the intended role against discovered agents; do not hardcode opaque IDs or substitute a generic worker. Workers must not delegate further. These are behavioral controls, not a native per-parent filter or proof of isolation; unexpected exposed tools grant no authority.
- Use a justified nonempty supported tool list for each live role: on the inspected Copilot conversion path an empty or missing list can mean all tools. Explicitly load essential role-appropriate named skills; a link or presumed parent inheritance is not proof of loading.
- **Internal workers** use `user-invocable: false`. This visibility setting is not a substitute for least-privilege tools or an authority boundary.

## Handoffs and approval stops

- Define a next action only when phases are logically sequenced; identify and verify the existing receiving role and required physical input. The prospective native route is a deliberate engineer-sent request to that role, without fixed wording or slash dependency. Policy effective at invocation governs bootstrap; no policy edit self-upgrades a session or makes an earlier invocation retroactive.
- Where inspection or approval is needed, keep the transition manual. Selection, a suggestion or unsent prefill is not approval, permission or authority. If target, sequencing or approval is unknown, stop the affected transition and resolve it.

## Expected output

Report the created path, role and exclusions, required inputs, tools and delegation allow-list, output contract, any handoffs and their approval behavior, validation performed, and unresolved assumptions. Distinguish verified facts from assumptions; do not claim runtime behavior that was not checked.

## Starter resource

Use the [agent starter template](templates/agent.md) as an inert structure, adapting it to the specific role. It is not a contributed agent and grants no capability by itself.

## Validation checklist

- File is under `.github/agents/` with valid YAML frontmatter and a distinct lowercase kebab-case filename ending in `.agent.md`.
- Description states the role, task, expected outcome, and useful discovery vocabulary.
- Responsibilities and exclusions do not duplicate another agent.
- Tools are minimal: observational workers have no `edit` or terminal capability by default; coordinator writes stay within their explicit phase scope, including only the guarded Plan-only Proposed ADR exception described above.
- Delegating coordinators have a justified supported tool and exact permitted-worker rules in their loaded bodies; no wildcard route is authorized.
- Workers are non-user-invocable and do not delegate further.
- Each next action identifies an existing receiving role and required input and remains manual where approval matters.
- A representative request produces the declared output without unauthorized edits or commands.
- Check VS Code Chat References and Diagnostics if loading or delegation is uncertain.

## Boundaries

Do not create workers, tools, handoffs, hooks, or terminal permissions speculatively. Do not invent repository commands, agent names, frameworks, or approval policy. Treat agent Markdown as executable policy and review capability grants as carefully as application code.
