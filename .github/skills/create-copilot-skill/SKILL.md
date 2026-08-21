---
name: create-copilot-skill
description: Create and validate a focused repository-scoped Agent Skill with optional linked resources. Use when a repeatable, task-specific capability needs a SKILL.md, checklist, template, reference, asset, or deterministic script; do not use for ordinary instructions, custom agents, or prompt shortcuts.
user-invocable: true
---

# Create a Copilot Skill

Create the smallest complete, portable Agent Skill for a repeatable task that benefits from a procedure or bundled resources.

## Use this Skill when

- The request describes a reusable, multi-step capability.
- A checklist, template, reference, asset, or deterministic script would improve repeatability.
- The capability should be portable and discoverable as an Agent Skill.

Do not use this Skill when the request is better represented by an automatically applied instruction, a role with a distinct tool boundary, or a focused manually invoked prompt. Explain the better primitive and stop unless the user explicitly agrees to switch.

## Workflow

1. Classify the request and confirm that a Skill is the appropriate primitive.
2. Default to repository scope under `.github/skills/`; use personal scope only when the user explicitly requests a cross-repository preference.
3. Inspect existing `.github/` customizations, `AGENTS.md`, `CLAUDE.md`, and relevant project documentation. Reuse local conventions and do not invent repository details.
4. Capture the artifact contract: purpose, trigger vocabulary, consumers, inputs, outputs, boundaries, required resources, safety constraints, and validation method. Ask about unknowns rather than guessing.
5. Create a lowercase kebab-case directory whose name exactly matches the `name` in `SKILL.md`. Keep `SKILL.md` concise and create only resources that the workflow needs.
6. Link every required bundled resource from `SKILL.md` with a relative Markdown link. Use `references/` for detailed guidance, `templates/` for starter files Copilot will modify, `assets/` for unchanged consumed files, and `scripts/` only for tested, deterministic automation with relative paths and clear errors.
7. Validate the artifact structurally and with one representative request before reporting completion.

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
