# Copilot Toolkit artifacts

## Purpose and audience

**Purpose:** Provide a concise starting point for understanding and using the repository's GitHub Copilot customization artifacts.

**Audience:** Toolkit consumers choosing an artifact and maintainers authoring or updating repository-managed customizations.

## Prerequisites

- Familiarity with VS Code and GitHub Copilot.
- Read the relevant canonical source before relying on operational rules; this page is navigation, not policy authority.

## Scope and exclusions

This Wiki covers the repository's `.github` instructions, skills, prompts, agents, and related RPIR concepts. It excludes extension implementation, VSIX packaging, publishing, hosted-Wiki integration, authentication, commands, and external automation.

## Use the Toolkit

- [Choose the right artifact](choose-an-artifact.md) — Select instructions, skills, prompts, agents, or runtime workflow mechanisms for a specific need.
- [How RPIR works](rpir.md) — Review the shared Research → Plan → Implement → Review workflow and its boundaries.
- [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md) — Distinguish authoritative plans from non-authorizing lifecycle evidence.

## Maintain the Toolkit

- [Maintain the Toolkit](maintain-the-toolkit.md) — Follow the maintainer route for safe, focused customization changes.
- [Artifact catalogue](artifact-catalogue.md) — Locate the current customization artifacts and their canonical paths.
- [Keeping the Wiki current](keeping-the-wiki-current.md) — Maintain Wiki pages using bounded targets, canonical sources, and navigation checks.

## Canonical references

- [Repository guidance](../../.github/copilot-instructions.md) — Authoritative repository policy, scope boundaries, and approval controls.
- [RPIR lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) — Lifecycle provenance, authority, and phase-boundary rules.
- [Wiki maintenance skill](../../.github/skills/wiki-maintenance/SKILL.md) — Bounded Markdown Wiki authoring and source-validation procedure.
- [Wiki page template](../../.github/skills/wiki-maintenance/templates/wiki-page.md) — Required page anatomy for future Wiki pages.

## Related links

- [VSIX packaging guide](../vsix-packaging.md) — Packaging-specific documentation kept separate from the Wiki scope.
- [Changelog](../../CHANGELOG.md) — Release history for the Toolkit.

## Next steps

- Consumers should begin with [Choose the right artifact](choose-an-artifact.md).
- Maintainers should begin with [Maintain the Toolkit](maintain-the-toolkit.md), then consult the canonical references before making changes.
