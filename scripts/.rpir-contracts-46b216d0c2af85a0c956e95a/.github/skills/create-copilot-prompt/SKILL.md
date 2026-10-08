---
name: create-copilot-prompt
description: Create and validate a focused VS Code prompt file with explicit inputs, output format, agent selection, and safe side-effect boundaries. Use when a developer wants a deliberate, repeatable local shortcut for one job; do not use for portable resource-backed workflows, automatic repository conventions, or sustained agent roles.
user-invocable: true
---

# Create a Copilot Prompt

Create a manually invoked prompt for one focused local request with predictable inputs and outcomes.

## Workflow

1. Classify the request. Use a prompt for a deliberate, single focused job; recommend a Skill for portability or bundled resources, an instruction for automatic conventions, or an agent for sustained role ownership and tool boundaries.
2. Default to repository scope under `.github/prompts/`. Inspect existing prompts, agents, instructions, `AGENTS.md`, `CLAUDE.md`, and relevant project documentation.
3. Define the single job, variable inputs, missing-input behavior, selected agent, output format and destination, success conditions, side effects, and confirmation requirements.
4. Create a lowercase kebab-case filename ending in `.prompt.md`. Use explanatory `${input:name:placeholder}` variables for values that vary per run. Do not hide required context in prose.
5. Reference an existing suitable agent instead of copying its role instructions. Omit the prompt `tools` field unless an override is required; when present, keep it minimal and never broaden access accidentally.
6. State a stop condition for missing information, unsafe side effects, unavailable agents, or failed validation. Prefer inspection and proposed changes before edits or commands.
7. Validate frontmatter, variables, named-agent existence, tool compatibility, shared-instruction references, and one representative prompt invocation.

## Prompt-specific constraints

- A prompt MUST remain a deliberate shortcut for one focused job; it MUST NOT take ownership of a sustained role or phase workflow that belongs to an agent.
- A prompt MUST omit the `tools` field by default. It MUST NOT use prompt-level tool overrides to broaden an agent's intended boundary; add an override only when independently justified, minimal, and compatible with the selected agent's boundary.
- If a required input is missing, the selected agent is missing or unavailable, or a proposed side effect is unsafe or unclear, the prompt MUST stop and request the missing information or a safe, explicit decision. It MUST NOT guess or proceed with the affected action.
- A prompt created here is a VS Code Local convenience. Authors MUST NOT claim Agent Host portability or equivalent prompt-selection and tool behavior without separate evidence.

## Expected output

Report the created path, job, inputs and defaults, selected agent, tools and side effects, output contract, stop conditions, and validation performed.

## Starter resource

Use the original one-job starter at [templates/prompt.md](./templates/prompt.md). Adapt its sections to the request; the starter is a resource document, not a contributed prompt.

## Validation checklist

- File is under `.github/prompts/` with a descriptive lowercase kebab-case name ending in `.prompt.md`.
- Description states the specific action, trigger, and expected result.
- Every required input has an explanatory `${input:...}` placeholder and defined missing-input behavior.
- The named `agent` exists when one is specified and is suitable for the task.
- Prompt-level tools are omitted unless needed and never broaden the referenced agent's intended boundary.
- Output format, destination, success criteria, and failure/stop conditions are explicit.
- Shared instructions are linked or referenced rather than duplicated.
- A representative invocation runs successfully from the prompt editor.
- Check VS Code Chat References and Diagnostics if discovery or execution is uncertain.

## Boundaries

Do not create Skills, instructions, agents, hooks, scripts, or unrelated prompts as follow-up work. Prompts are VS Code local conveniences and are not a substitute for portable Agent Skills or Agent Host workflows. Do not embed credentials or unsafe commands.
