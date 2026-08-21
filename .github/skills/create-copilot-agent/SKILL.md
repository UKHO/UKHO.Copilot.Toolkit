---
name: create-copilot-agent
description: Create and validate a focused VS Code custom agent with a clear role, output contract, least-privilege tools, and explicit delegation or handoff boundaries. Use when sustained role ownership, context isolation, or phase-specific permissions materially improve a workflow; do not use for ordinary conventions or single-task shortcuts.
user-invocable: true
---

# Create a Copilot Agent

Create a narrowly scoped custom agent whose role and capability boundary are explicit and reviewable.

## Workflow

1. Classify the request. Choose an agent only when role ownership, context isolation, distinct tools, delegation, or a phase handoff is needed. Recommend an instruction, Skill, or prompt otherwise.
2. Default to repository scope under `.github/agents/`. Inspect existing customizations, `AGENTS.md`, `CLAUDE.md`, workflow documentation, and repository validation conventions.
3. Define the role, phase objective, responsibilities, explicit exclusions, inputs, output contract, handoff target, approval requirements, and required tools. Ask for unknown validation commands before granting terminal access.
4. Grant the smallest viable tool list. Read-only research, planning, and review roles should not receive edit or terminal access. Add `agent` only to coordinators that delegate, and use an explicit `agents` allow-list—never `agents: '*'`.
5. Set internal workers to `user-invocable: false`; do not enable nested worker delegation initially. Keep coordinator instructions focused on orchestration rather than copied repository standards.
6. Define handoffs only when phases are logically sequenced. Target existing agents by exact name and use `send: false` where the developer must approve or inspect the next step, especially before edits or commands.
7. Validate frontmatter, role boundaries, tool permissions, worker visibility, handoff targets, and one representative delegation or handoff.

## Expected output

Report the created path, role and exclusions, tools and delegation allow-list, output contract, handoffs and approval behavior, validation performed, and unresolved assumptions.

## Validation checklist

- File is under `.github/agents/` with valid YAML frontmatter and a distinct lowercase kebab-case filename ending in `.agent.md`.
- Description states the role, task, expected outcome, and useful discovery vocabulary.
- Responsibilities and exclusions do not duplicate another agent.
- Tools are minimal; read-only roles have no `edit` or terminal capability.
- Delegating agents include `agent` and an explicit `agents` allow-list.
- Workers are non-user-invocable and do not delegate further unless explicitly justified.
- Every handoff names an existing agent, is logically sequenced, and requires manual send where approval matters.
- A representative request produces the declared output without unauthorized edits or commands.
- Check VS Code Chat References and Diagnostics if loading or delegation is uncertain.

## Boundaries

Do not create workers, tools, handoffs, hooks, or terminal permissions speculatively. Do not invent repository commands, agent names, frameworks, or approval policy. Treat agent Markdown as executable policy and review capability grants as carefully as application code.
