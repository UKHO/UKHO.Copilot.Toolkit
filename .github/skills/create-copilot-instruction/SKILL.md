---
name: create-copilot-instruction
description: Create and validate a focused VS Code custom instruction for repository conventions, with the narrowest applicable applyTo scope. Use when guidance should apply automatically to matching files or universally across a repository; do not use for reusable task workflows, role boundaries, or manually invoked shortcuts.
user-invocable: true
---

# Create a Copilot Instruction

Create concise, durable guidance that is automatically applied to the right repository files or tasks.

## Instruction choice and scope

1. Classify the request. Use an instruction only for a convention or rule that should apply automatically; recommend a Skill, agent, or prompt when that is the better fit.
2. Default to repository scope. Inspect `.github/`, `AGENTS.md`, `CLAUDE.md`, project documentation, and related instructions before writing.
3. Define the rule, rationale, intended files or tasks, preferred and avoided examples, and an observable validation method. Ask about unknown languages, frameworks, paths, or commands instead of guessing.
4. For scoped guidance, use `.github/instructions/<topic>.instructions.md` and the narrowest workspace-relative `applyTo` glob that covers the intended files. State representative matching and nonmatching paths or tasks before selecting the glob. MUST NOT use `**` for language- or directory-specific guidance.
5. Use `.github/copilot-instructions.md` without `applyTo` only for genuinely universal repository facts and rules, and keep it short. This is the sole universal-instruction exception; do not omit `applyTo` from a scoped instruction.
6. Write one topic per file using imperative, specific guidance. Link to shared repository standards rather than copying them.
7. Validate the frontmatter, path coverage, examples, and one representative generation request.

## Conflict checks and boundaries

- MUST check for conflicts or duplication with every instruction that matches the proposed scope, including project-wide `.github/copilot-instructions.md` guidance.
- MUST stop drafting the affected rule and investigate or ask for clarification if matching instructions conflict or the effective scope is uncertain. Do not silently combine conflicting rules, broaden `applyTo`, or treat a conflict as permission to change another instruction.
- MUST NOT grant tools, capabilities, permissions, or credentials. Instructions describe conventions; they do not authorize tool use or change an agent's permissions.
- MUST NOT create agents, Skills, prompts, hooks, scripts, or broad instructions as speculative follow-up work. Prefer advisory guidance and never embed credentials.

## Starter

Use the [scoped instruction starter](templates/instruction.md) as a structure, not as a preselected scope. Fill in its `applyTo` only after checking intended and nonmatching paths; the starter deliberately leaves that choice blank.

## Required frontmatter

Use valid YAML between `---` markers. Scoped instructions require meaningful `name`, `description`, and `applyTo` values. Omit `applyTo` only for the single universal `.github/copilot-instructions.md` file.

## Expected output

Report the created path, selected scope and `applyTo` pattern, rule and rationale, examples, related instructions checked, validation performed, and unresolved assumptions.

## Validation checklist

- File is under `.github/instructions/`, except the one universal `.github/copilot-instructions.md`.
- Filename is lowercase kebab-case and ends in `.instructions.md` for scoped guidance.
- `applyTo` matches intended files and excludes unrelated files; never use `**` for language- or directory-specific guidance.
- A representative in-scope path matches and a representative out-of-scope path does not; stop if the selected glob does not demonstrate both boundaries.
- Description states the rule, when it applies, and relevant repository vocabulary.
- Examples reflect observed repository languages, frameworks, and dependency versions.
- Guidance does not conflict with another matching instruction or duplicate generic style advice.
- A conflict among matching instructions is investigated or raised for clarification, not resolved by silently broadening scope or editing another file.
- No tool, capability, permission, or credential grant is introduced.
- A representative request follows the rule without the user repeating it.
- Check VS Code Chat References and Diagnostics if activation is uncertain.

## Boundaries

Do not create agents, Skills, prompts, hooks, scripts, or broad instructions as speculative follow-up work. Prefer advisory guidance and do not grant tools or embed credentials.
