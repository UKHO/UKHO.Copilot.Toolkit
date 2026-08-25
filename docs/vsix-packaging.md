# VSIX packaging guide

## Audience and boundary

This guide is for **repository maintainers** who are reviewing the Toolkit's static VSIX packaging inputs. It is not consumer installation guidance; consumers should continue to use the root [`README.md`](../README.md).

The guide is repository-local and does not become part of the installed extension. The package manifest includes selected `.github/` customization content, the root `package.json`, `README.md`, `CHANGELOG.md`, and `LICENSE`; `docs/` and `scripts/` are intentionally excluded from the VSIX boundary. Lifecycle records and other prohibited repository content are also excluded. This document explains how to manage packaging; it does not change the package boundary.

## Script responsibilities

### Discover the customization inventory

`scripts/discover-copilot-artifacts.cjs` discovers from the fixed repository root (the parent of `scripts/`) and only the configured customization roots:

- `.github/instructions`, for files ending in `.instructions.md`;
- `.github/agents`, for files ending in `.agent.md`;
- `.github/prompts`, for files ending in `.prompt.md`; and
- `.github/skills`, for directories containing a regular `SKILL.md`.

It rejects unsafe or ambiguous paths such as symbolic links, traversal, unsupported entries, and duplicate normalized contribution paths. Its direct interface reports the sorted inventory as JSON. The same discovery implementation is used by synchronization and boundary verification, so it is an inspection aid for the supported roots, not a broad repository scanner.

### Check or deliberately synchronize the manifest

`scripts/sync-copilot-manifest.cjs` discovers the inventory, reads `package.json`, and compares the current controlled values with that inventory. Its default mode is a non-mutating `check`: drift is reported and the check fails without writing the manifest. Synchronization is a separate, deliberate explicit `sync` mode and writes `package.json` only after the inventory and manifest have been read successfully.

Synchronization controls exactly these five manifest locations:

1. `package.json.files` entries under the four discovered customization roots, collectively;
2. `package.json.contributes.chatInstructions`;
3. `package.json.contributes.chatAgents`;
4. `package.json.contributes.chatPromptFiles`; and
5. `package.json.contributes.chatSkills`.

The synchronizer retains unrelated `files` entries and unrelated manifest fields. In particular, it does not select versions, alter release notes, publish or distribute an extension, install anything, or change consumer workspaces. Any resulting `package.json` change must be inspected and reviewed before packaging.

### Verify the packaged boundary

`scripts/verify-vsix-boundary.cjs` reuses shared discovery and checks that the manifest contributions match it, that contribution files and complete skills remain inside the manifest `files` boundary, and that prohibited content is absent. After packaging, it examines the expected VSIX archive for missing or unexpected members and validates the packaged `README.md` changelog link. Verification is a post-package boundary check; it is not an inventory-update or repair operation.

## How to run

Repository maintainers must run every interface from the repository root: `c:\Repos\UKHO.Copilot.Toolkit`.

Run the following commands in order:

1. `node scripts/discover-copilot-artifacts.cjs` — reports the sorted customization inventory as JSON and is intended to make the discovered inputs visible without repository mutation.
2. `node scripts/sync-copilot-manifest.cjs check` — performs the default non-mutating manifest check. An in-sync manifest is reported as such; drift is reported as a failure without writing the manifest.
3. `node scripts/sync-copilot-manifest.cjs sync` — deliberately synchronizes the bounded manifest locations after the check has been reviewed and any drift is understood. A successful synchronization reports completion and may replace `package.json` atomically.
4. `npm run package` — creates the VSIX from the reviewed packaging inputs.
5. `npm run verify-package` — checks the generated VSIX against the manifest boundary and packaged README link, reporting verification success or identifying a mismatch.

Inspect with discovery, check before sync, review any resulting manifest change, then package before verification. Stop for unexpected drift, a failure, an unexpected output or write, or a missing expected artifact. Do not bypass a failed step, alter an example, or substitute another command; investigate and correct the underlying issue before continuing.

## Intended maintainer sequence

1. **Inspect** the relevant customization roots, current `package.json`, source scripts, workflow, and any proposed change. Confirm that the observed drift is understood.
2. **Check** the manifest with the synchronizer's default non-mutating interface. Treat any reported drift as a review item.
3. **Synchronize deliberately**, only through the explicit synchronization interface and only for expected, understood drift. Do not sync merely to make a check pass when the inventory or change is unexplained.
4. **Review** the resulting manifest change. Confirm that only the five controlled locations changed and that unrelated fields and intended package entries were preserved.
5. **Package** the VSIX through the repository's package interface after the manifest review succeeds.
6. **Verify** the generated archive through the repository's package-boundary verification interface. Packaging comes before verification.

A failure in discovery, manifest parsing, checking, synchronization, manifest review, packaging, or verification is a stop condition. Stop as well when drift is unexpected, the package output is not the expected artifact, the archive differs from the manifest boundary, or a required input is missing. Investigate the issue rather than retrying with altered inputs.

## Safety limits and non-goals

- Do not bypass a failed check, synchronization step, package step, or verification step.
- Do not edit the VSIX archive directly or treat archive contents as a substitute for correcting reviewed source inputs.
- Do not distribute, publish, install, or release a VSIX as part of this process.
- Do not treat synchronization as broad manifest rewriting: its mutation surface is limited to the five locations listed above.
- Do not change `README.md` consumer guidance as part of this guide. The maintainer documentation remains separate from installation, support, and rollback instructions.

## Validation status and limitations

This guide records intended behavior from the current scripts, manifest, README, and workflow. It does not claim that the interfaces have been executed. Runtime discovery, synchronization, Windows replacement behavior, packaging, archive verification, installed-extension checks, and cross-platform equivalence remain unvalidated here.

The workflow currently runs package before verification on Ubuntu, but its path filters do not include changes to `scripts/discover-copilot-artifacts.cjs`; therefore this guide makes no complete-CI-coverage claim. It also makes no cross-platform validation or release-readiness claim.

**Sources:** `scripts/discover-copilot-artifacts.cjs`, `scripts/sync-copilot-manifest.cjs`, `scripts/verify-vsix-boundary.cjs`, `package.json`, `README.md`, and `.github/workflows/package.yml`.
