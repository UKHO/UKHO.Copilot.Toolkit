# VSIX packaging Run Book

## Purpose

This Run Book gives **repository maintainers** the human process for reviewing the Toolkit's static VSIX packaging inputs and provides the ordered stable-ID selection source for the bounded autonomous VSIX flow. It is not consumer installation guidance; consumers should continue to use the root [`README.md`](../../README.md).

## Scope

The Run Book is repository-local and does not become part of the installed extension. The package manifest includes selected `.github/` customization content, the root `package.json`, `README.md`, `CHANGELOG.md`, and `LICENSE`; `docs/` and `scripts/` are intentionally excluded from the VSIX boundary. Lifecycle records and other prohibited repository content are also excluded. This Run Book explains how to manage packaging; it does not change the package boundary.

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

The synchronizer retains unrelated `files` entries and unrelated manifest fields. In particular, it does not select versions, alter release notes, publish or distribute an extension, install anything, or change consumer workspaces. Any resulting `package.json` change must be inspected before packaging.

### Verify the packaged boundary

`scripts/verify-vsix-boundary.cjs` reuses shared discovery and checks that the manifest contributions match it, that contribution files and complete skills remain inside the manifest `files` boundary, and that prohibited content is absent. After packaging, it examines the expected VSIX archive for missing or unexpected members and validates the packaged `README.md` changelog link. Verification is a post-package boundary check; it is not an inventory-update or repair operation.

### Verify contributed customization contracts

`scripts/verify-copilot-contracts.cjs` reuses the fixed-root discovery inventory to fail closed on malformed frontmatter, duplicate customization names, unresolved repository-local links, invalid prompt targets, non-manual coordinator handoffs, worker tool-contract drift, prospective report-instruction `applyTo` drift, and manifest/discovery mismatch. It is read-only and does not validate runtime discovery or installed-VSIX behavior.

## Human process

Repository maintainers use every interface from the repository root: `c:\Repos\UKHO.Copilot.Toolkit`. The command examples in this section are human guidance only; Script Runner treats only the dedicated stable-ID list at the end of this Run Book as selection input.

### Toolkit packaging operation metadata

The following constrained metadata records the six Toolkit-specific packaging interfaces maintained by this repository. These records are packaging documentation and verification inputs, not a global consumer operation-ID allow-list, the root consumer catalogue, or execution authorization. The root `.github/copilot-script-catalogue.md` is consumer-owned and remains separate from this metadata and from VSIX packaging; its complete, safety-valid entries use the ten ordered fields in the [repository script catalogue Skill](../../.github/skills/repository-script-catalogue/SKILL.md). VS Code Workspace Trust, permissions, and managed organization policy control approval behavior.

<!-- vsix-packaging-operation-metadata:start -->
```json
[
	{
		"id": "toolkit-verify-copilot-contracts",
		"classification": "read-only",
		"packagingIdentity": "none",
		"command": "npm run verify-copilot-contracts",
		"cwd": ".",
		"arguments": [],
		"outputsOrWrites": [],
		"effects": ["Verifies fixed-root customization contracts and manifest parity without workspace mutation."],
		"prerequisites": ["Repository root is the fixed working directory."],
		"stopBehavior": "Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.",
		"prohibitedEffects": ["No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass."]
	},
	{
		"id": "toolkit-discover-copilot-artifacts",
		"classification": "read-only",
		"packagingIdentity": "none",
		"command": "node scripts/discover-copilot-artifacts.cjs",
		"cwd": ".",
		"arguments": [],
		"outputsOrWrites": [],
		"effects": ["Reports the sorted customization inventory as JSON without workspace mutation."],
		"prerequisites": ["Workspace Trust.", "Repository root is the fixed working directory."],
		"stopBehavior": "Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.",
		"prohibitedEffects": ["No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass."]
	},
	{
		"id": "toolkit-check-copilot-manifest",
		"classification": "read-only",
		"packagingIdentity": "none",
		"command": "node scripts/sync-copilot-manifest.cjs check",
		"cwd": ".",
		"arguments": [],
		"outputsOrWrites": [],
		"effects": ["Checks the discovered inventory against controlled manifest values without writing package.json."],
		"prerequisites": ["Workspace Trust.", "Repository root is the fixed working directory."],
		"stopBehavior": "Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.",
		"prohibitedEffects": ["No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass."]
	},
	{
		"id": "toolkit-sync-copilot-manifest",
		"classification": "packaging-controlled-write",
		"packagingIdentity": "ukho-copilot-toolkit",
		"command": "node scripts/sync-copilot-manifest.cjs sync",
		"cwd": ".",
		"arguments": [],
		"outputsOrWrites": ["package.json.files entries under .github/instructions, .github/agents, .github/prompts, and .github/skills collectively", "package.json.contributes.chatInstructions", "package.json.contributes.chatAgents", "package.json.contributes.chatPromptFiles", "package.json.contributes.chatSkills", "One contained, transient, randomly named atomic temporary path that is removed after replacement or failure handling"],
		"effects": ["Synchronizes only the declared packaging manifest locations after the declared prerequisite probe comparison succeeds."],
		"prerequisites": ["Workspace Trust.", "Fixed root cwd.", "Readable, parseable package.json whose name is exactly ukho-copilot-toolkit.", "Declared fixed toolkit-discover-copilot-artifacts probe captures complete sorted JSON inventory.", "Immediately before sync, rerun that exact probe and require byte-for-byte equality; the synchronizer's existing immediate discover() comparison/write remains a second check."],
		"stopBehavior": "Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.",
		"prohibitedEffects": ["No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass."]
	},
	{
		"id": "toolkit-package-vsix",
		"classification": "build/test",
		"packagingIdentity": "none",
		"command": "npm run package",
		"cwd": ".",
		"arguments": [],
		"outputsOrWrites": ["ukho-copilot-toolkit-<package.json version>.vsix, derived as ${name}-${version}.vsix."],
		"effects": ["Creates the version-derived VSIX after the declared current-state prerequisite checks succeed."],
		"prerequisites": ["Workspace Trust.", "Fixed root cwd.", "Readable, parseable package.json whose name is ukho-copilot-toolkit.", "Declared package script and fixed local @vscode/vsce executable exist.", "Local package dependencies exist.", "Immediately preceding successful requested toolkit-check-copilot-manifest operation with no requested intervening operation; at that check capture complete package.json bytes and declared fixed discovery-probe sorted JSON.", "Immediately before packaging, reread/reprobe and require byte-for-byte equality."],
		"stopBehavior": "Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.",
		"prohibitedEffects": ["No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass."]
	},
	{
		"id": "toolkit-verify-vsix-boundary",
		"classification": "read-only",
		"packagingIdentity": "none",
		"command": "npm run verify-package",
		"cwd": ".",
		"arguments": [],
		"outputsOrWrites": [],
		"effects": ["Verifies the generated VSIX boundary, manifest contributions, and packaged README changelog link without workspace mutation."],
		"prerequisites": ["Workspace Trust.", "Repository root is the fixed working directory.", "The expected version-derived VSIX exists."],
		"stopBehavior": "Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.",
		"prohibitedEffects": ["No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass."]
	}
]
```
<!-- vsix-packaging-operation-metadata:end -->

## Preparation

1. Inspect the relevant customization roots, current `package.json`, source scripts, workflow, and proposed change.
2. Establish the current-state prerequisites declared by each selected operation. For synchronization, capture the complete sorted discovery inventory, then rerun the declared probe immediately before synchronization and require byte-for-byte equality. For packaging, require the immediately preceding requested manifest check and confirm the captured `package.json` bytes and discovery inventory remain byte-for-byte equal immediately before packaging.
3. Confirm the fixed repository root, Workspace Trust, local package dependencies, and expected output prerequisites where the selected operation declares them.

## Ordered process

For a human-maintained execution, run these commands in order:

1. `npm run verify-copilot-contracts` — verifies fixed-root contributed-customization contracts and manifest parity without workspace mutation.
2. `node scripts/discover-copilot-artifacts.cjs` — reports the sorted customization inventory as JSON without repository mutation.
3. `node scripts/sync-copilot-manifest.cjs check` — performs the default non-mutating manifest check.
4. `node scripts/sync-copilot-manifest.cjs sync` — synchronizes only the bounded manifest locations after the declared probe comparison succeeds.
5. `npm run package` — creates the VSIX after the declared current-state prerequisite checks succeed.
6. `npm run verify-package` — checks the generated VSIX against the manifest boundary and packaged README link.

Inspect with discovery, check before sync, inspect any resulting manifest change, then package before verification. Stop for unexpected drift, a failure, an unexpected output or write, or a missing expected artifact. Do not bypass a failed step, alter an example, or substitute another command; investigate and correct the underlying issue before continuing.

## Expected results

The process verifies static contracts and the manifest boundary, synchronizes only the declared locations when needed, creates the version-derived VSIX, and checks its archive boundary. Script Runner validates and inspects each selected operation independently and stops the sequence at its first stop condition; the stable-ID list is an ordered selection source, not execution authority.

## Diagnostics and failure disposition

A failure in discovery, manifest parsing, checking, synchronization, packaging, or verification is a stop condition. Stop as well when a current-state prerequisite is missing or unequal, drift is unexpected, the package output is not the expected artifact, the archive differs from the manifest boundary, a required input is missing, or an external prompt or denial occurs. Investigate the underlying issue rather than retrying with altered inputs.

## Safety limits

- Do not bypass a failed check, synchronization step, package step, or verification step.
- Do not edit the VSIX archive directly or treat archive contents as a substitute for correcting source inputs.
- Do not distribute, publish, install, or release a VSIX as part of this process.
- Do not treat synchronization as broad manifest rewriting: its mutation surface is limited to the five locations listed above.
- Do not change `README.md` consumer guidance as part of this Run Book. The maintainer documentation remains separate from installation, support, and rollback instructions.
- The Run Book and catalogue do not override Workspace Trust, VS Code permissions, or managed organization policy. Native Windows is not sandbox containment.

## Validation and limitations

This Run Book records intended behavior from the current scripts, manifest, README, and workflow. It does not claim that the interfaces have been executed. Runtime discovery, synchronization, Windows replacement behavior, packaging, archive verification, installed-extension checks, and cross-platform equivalence remain unvalidated here.

The workflow validates this constrained metadata before packaging on Ubuntu. It also makes no cross-platform validation or release-readiness claim.

## Sources

- [`scripts/discover-copilot-artifacts.cjs`](../../scripts/discover-copilot-artifacts.cjs) — fixed-root inventory.
- [`scripts/sync-copilot-manifest.cjs`](../../scripts/sync-copilot-manifest.cjs) — controlled synchronization boundary.
- [`scripts/verify-copilot-contracts.cjs`](../../scripts/verify-copilot-contracts.cjs) — customization-contract validation.
- [`scripts/verify-vsix-boundary.cjs`](../../scripts/verify-vsix-boundary.cjs) — post-package boundary validation.
- [`package.json`](../../package.json) — package identity and scripts.
- [`README.md`](../../README.md) and [workflow](../../.github/workflows/package.yml) — consumer guidance and automation context.

## Script Runner operations
1. toolkit-verify-copilot-contracts
2. toolkit-discover-copilot-artifacts
3. toolkit-sync-copilot-manifest
4. toolkit-check-copilot-manifest
5. toolkit-package-vsix
6. toolkit-verify-vsix-boundary
