---
name: create-copilot-skill
description: Create and validate a focused repository-scoped Agent Skill with optional linked resources. Use when a repeatable, task-specific capability needs a SKILL.md, checklist, template, reference, asset, or deterministic script; do not use for ordinary instructions, custom agents, or prompt shortcuts.
user-invocable: true
---

# Create a Copilot Skill

Create the smallest complete, portable Agent Skill for a repeatable task that benefits from a procedure or bundled resources.

## Trigger and primitive selection

- The request describes a reusable, multi-step capability.
- A checklist, template, reference, asset, or deterministic script would improve repeatability.
- The capability should be portable and discoverable as an Agent Skill.

Do not use this Skill when the request is better represented by an automatically applied instruction, a role with a distinct tool boundary, or a focused manually invoked prompt. Explain the better primitive and stop; proceed with a different primitive only after the user explicitly agrees to switch.

## Inputs and design constraints

Before drafting, capture the requested capability's purpose, trigger vocabulary, consumers, inputs, outputs, boundaries, required resources, safety constraints, and validation method. Inspect existing `.github/` customizations, `AGENTS.md`, `CLAUDE.md`, and relevant project documentation; reuse evidenced local conventions. Ask about material unknowns instead of inventing repository details, behavior, or requirements.

Default to repository scope under `.github/skills/`. Use personal scope only when the user explicitly requests a cross-repository preference. For a new Skill, use a lowercase kebab-case directory whose name exactly matches the `name` in its `SKILL.md`. Keep `SKILL.md` concise and include only resources the workflow needs.

## Procedure

1. Classify the request and confirm that a Skill is the appropriate primitive.
2. Inspect relevant local customizations and documentation, then capture the artifact contract described above.
3. Draft the concise `SKILL.md` and add only resources required by the workflow.
4. Link each required bundled resource from `SKILL.md` using a relative Markdown link. Use `references/` for detailed guidance, `templates/` for starter files Copilot will modify, `assets/` for unchanged consumed files, and `scripts/` only for tested, deterministic automation with relative paths and clear errors.
5. Validate the artifact structurally and with one representative request before reporting completion.

## Resource layout

Keep optional resources in the Skill directory and link each required resource directly from `SKILL.md` with a relative Markdown link. Include no resource merely speculatively: every file must support the requested workflow. Use `references/` for detailed guidance, `templates/` for starter files Copilot will modify, `assets/` for unchanged consumed files, and `scripts/` only for tested, deterministic automation that uses relative paths and reports clear errors.

## Limits and safety

- MUST choose the primitive that matches the request. If an instruction, agent, or prompt is the better fit, explain why and stop until the user explicitly agrees to switch; do not silently create a Skill instead.
- MUST NOT invent repository facts, requirements, commands, or behavior to fill gaps. Ask about material unknowns.
- MUST use relative links for bundled resources; MUST NOT use absolute workspace paths or embed secrets.
- MUST NOT add or recommend edit, terminal, web, MCP, hook, or agent-delegation capability speculatively. Include such capability only when the requested workflow genuinely requires it and the user has approved that scope; do not infer approval from the Skill request itself.
- MUST NOT use experimental forked context or treat a Skill's instructions as granting platform tools or permissions.

## Starter template

Use the original [Skill starter template](templates/skill.md) when it fits; adapt or omit optional sections and linked resources to the actual request.

## Expected output

Report the created or updated paths, the selected scope and primitive, bundled resources and their purpose, validation performed, representative behavior, and any unresolved assumptions or checks that could not be run.

## Validation checklist

- `name` contains only lowercase letters, numbers, and hyphens, is at most 64 characters, and exactly matches the parent directory.
- YAML frontmatter is valid, and `description` states what the Skill does, when it applies, and relevant user vocabulary.
- Every required resource is linked with a relative path; no empty directories, unused files, absolute workspace paths, credentials, or invented commands remain.
- Instructions are imperative and specific, with reasons only for non-obvious edge cases.
- The Skill has the minimum viable capability and does not duplicate repository-wide instructions.
- A representative request selects this Skill instead of an instruction, agent, or prompt and produces the stated output.
- Check VS Code Chat References and Diagnostics when discovery or loading is uncertain.

## Safety boundaries

Prefer read-only discovery and validation. Do not add edit, terminal, web, MCP, hook, or agent-delegation capability unless the requested Skill genuinely requires it and the user has approved that scope. Do not use experimental forked context or embed secrets.
