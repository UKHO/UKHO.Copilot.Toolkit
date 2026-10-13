---
name: create-copilot-agent
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

## Least-privilege capabilities and delegation

- **The author**, before granting a capability, must tie each requested tool to the agent's stated role and task. Grant only the smallest viable tool list supported by that need; if the need or permission is unknown, do not grant the capability until it is resolved.
- **Observational research, planning, review, assurance, and validation workers** receive no `edit` or terminal access by default. They do not gain lifecycle-record, status, approval, acceptance, or handoff authority from their role description.
- **Bounded Research, Plan, and Review coordinators** may need `edit` solely for their assigned local lifecycle drafts/reports and explicitly guarded status writes. That record-specific exception does not authorize source edits or grant authority to workers.
- **Implement** receives only the scope of its separately approved pass; a role description or tool declaration does not expand that scope.
- **Delegating coordinators** receive `agent` only when delegation is needed and use an explicit `agents` allow-list naming the intended agents. Never use `agents: '*'`. Workers are not granted nested delegation by default.
- **Internal workers** use `user-invocable: false`. This visibility setting is not a substitute for least-privilege tools or an authority boundary.

## Handoffs and approval stops

- Define a handoff only when the phases are logically sequenced; identify an existing target by its exact agent name and verify the target and its role before configuring it.
- Where a developer must inspect or approve the next step—especially before edits or commands—configure a manual handoff with `send: false`. Do not configure an automatic send for such a transition.
- If the target, sequencing, or required approval is unknown, do not configure the handoff or imply that it is approved. Stop that configuration and resolve the uncertainty first.
- A handoff declaration is not itself approval, permission, or authority for the receiving agent's effects.

## Expected output

Report the created path, role and exclusions, required inputs, tools and delegation allow-list, output contract, any handoffs and their approval behavior, validation performed, and unresolved assumptions. Distinguish verified facts from assumptions; do not claim runtime behavior that was not checked.

## Starter resource

Use the [agent starter template](templates/agent.md) as an inert structure, adapting it to the specific role. It is not a contributed agent and grants no capability by itself.

## Validation checklist

- File is under `.github/agents/` with valid YAML frontmatter and a distinct lowercase kebab-case filename ending in `.agent.md`.
- Description states the role, task, expected outcome, and useful discovery vocabulary.
- Responsibilities and exclusions do not duplicate another agent.
- Tools are minimal: observational workers have no `edit` or terminal capability by default, while any coordinator write grant is limited to its explicit record/status role and does not grant source edits.
- Delegating agents include `agent` and an explicit `agents` allow-list.
- Workers are non-user-invocable and do not delegate further unless explicitly justified.
- Every handoff names an existing agent, is logically sequenced, and requires manual send where approval matters.
- A representative request produces the declared output without unauthorized edits or commands.
- Check VS Code Chat References and Diagnostics if loading or delegation is uncertain.

## Boundaries

Do not create workers, tools, handoffs, hooks, or terminal permissions speculatively. Do not invent repository commands, agent names, frameworks, or approval policy. Treat agent Markdown as executable policy and review capability grants as carefully as application code.
