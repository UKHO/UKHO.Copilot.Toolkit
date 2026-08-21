---
name: create-copilot-instruction
description: Create and validate a focused VS Code custom instruction for repository conventions, with the narrowest applicable applyTo scope. Use when guidance should apply automatically to matching files or universally across a repository; do not use for reusable task workflows, role boundaries, or manually invoked shortcuts.
user-invocable: true
---

# Create a Copilot Instruction

Create concise, durable guidance that is automatically applied to the right repository files or tasks.

## Workflow

1. Classify the request. Use an instruction only for a convention or rule that should apply automatically; recommend a Skill, agent, or prompt when that is the better fit.
2. Default to repository scope. Inspect `.github/`, `AGENTS.md`, `CLAUDE.md`, project documentation, and related instructions before writing.
3. Define the rule, rationale, intended files or tasks, preferred and avoided examples, and an observable validation method. Ask about unknown languages, frameworks, paths, or commands instead of guessing.
4. Prefer `.github/instructions/<topic>.instructions.md` with the narrowest workspace-relative `applyTo` glob. Use `.github/copilot-instructions.md` only for genuinely universal repository facts and rules, and keep it short.
5. Write one topic per file using imperative, specific guidance. Link to shared repository standards rather than copying them.
6. Check for conflicts or duplication with every matching instruction and the project-wide instruction.
7. Validate the frontmatter, path coverage, examples, and one representative generation request.

## Required frontmatter

Use valid YAML between `---` markers. Scoped instructions require meaningful `name`, `description`, and `applyTo` values. Omit `applyTo` only for the single universal `.github/copilot-instructions.md` file.

## Expected output

Report the created path, selected scope and `applyTo` pattern, rule and rationale, examples, related instructions checked, validation performed, and unresolved assumptions.

## Validation checklist

- File is under `.github/instructions/`, except the one universal `.github/copilot-instructions.md`.
- Filename is lowercase kebab-case and ends in `.instructions.md` for scoped guidance.
- `applyTo` matches intended files and excludes unrelated files; never use `**` for language- or directory-specific guidance.
- Description states the rule, when it applies, and relevant repository vocabulary.
- Examples reflect observed repository languages, frameworks, and dependency versions.
- Guidance does not conflict with another matching instruction or duplicate generic style advice.
- A representative request follows the rule without the user repeating it.
- Check VS Code Chat References and Diagnostics if activation is uncertain.

## Boundaries

Do not create agents, Skills, prompts, hooks, scripts, or broad instructions as speculative follow-up work. Prefer advisory guidance and do not grant tools or embed credentials.
