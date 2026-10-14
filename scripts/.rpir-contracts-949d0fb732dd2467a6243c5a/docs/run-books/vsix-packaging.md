# VSIX packaging Run Book

## Purpose

This Run Book gives **repository maintainers** the human process for reviewing the Toolkit's static VSIX packaging inputs. It is not Script Runner command-selection input or consumer installation guidance; consumers should continue to use the root [`README.md`](../../README.md).

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

`scripts/verify-copilot-contracts.cjs` reuses the fixed-root discovery inventory to check authored recovery invariants, malformed frontmatter, duplicate customization names, unresolved repository-local links, prompt targets, manual coordinator handoffs, role tool contracts, prospective record-instruction `applyTo` coverage, and manifest/discovery parity. Its authored, structural and parity diagnostics remain distinct. It is read-only and does not validate runtime discovery or installed-VSIX behavior. The separate `scripts/test-copilot-contract-scenarios.cjs` exercises positive and negative static fixtures; a run can retain its own `scripts/.rpir-contracts-<24 lowercase hex>/` staging tree. The packaging-guide validator independently checks the six metadata interfaces below.

## Human process

Repository maintainers use every interface from the repository root: `c:\Repos\UKHO.Copilot.Toolkit`. The command examples in this section are human guidance only, not Script Runner selection or execution authority.

### Toolkit packaging operation metadata

The following constrained metadata records the six Toolkit-specific packaging interfaces maintained by this repository. Their IDs, classifications, prohibitions and other fields are **packaging verification data only**, never Script Runner command eligibility, an operation allow-list or execution authorization. VS Code Workspace Trust, permissions, and managed organization policy control approval behavior.

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
		"stopBehavior": "On failure, inspect results and effects, correct a permitted local cause and rerun relevant checks; reconcile uncertain destructive or external completion before repetition, respect denial, and keep dependent work unmet until prerequisites pass.",
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
		"stopBehavior": "On failure, inspect results and effects, correct a permitted local cause and rerun relevant checks; reconcile uncertain destructive or external completion before repetition, respect denial, and keep dependent work unmet until prerequisites pass.",
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
		"stopBehavior": "On failure, inspect results and effects, correct a permitted local cause and rerun relevant checks; reconcile uncertain destructive or external completion before repetition, respect denial, and keep dependent work unmet until prerequisites pass.",
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
		"stopBehavior": "On failure, inspect results and effects, correct a permitted local cause and rerun relevant checks; reconcile uncertain destructive or external completion before repetition, respect denial, and keep dependent work unmet until prerequisites pass.",
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
		"stopBehavior": "On failure, inspect results and effects, correct a permitted local cause and rerun relevant checks; reconcile uncertain destructive or external completion before repetition, respect denial, and keep dependent work unmet until prerequisites pass.",
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
		"stopBehavior": "On failure, inspect results and effects, correct a permitted local cause and rerun relevant checks; reconcile uncertain destructive or external completion before repetition, respect denial, and keep dependent work unmet until prerequisites pass.",
		"prohibitedEffects": ["No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass."]
	}
]
```
<!-- vsix-packaging-operation-metadata:end -->

## Preparation

1. Inspect the relevant customization roots, current `package.json`, source scripts, workflow, and proposed change.
2. Establish the current-state prerequisites for the intended human process. For synchronization, capture the complete sorted discovery inventory, then rerun the probe immediately before synchronization and require byte-for-byte equality. If synchronization is authorized and needed, inspect its manifest changes and obtain a fresh successful manifest check afterward. For packaging, use that fresh check (or a current check if no sync was needed) immediately before the separately authorized package operation and confirm `package.json` and discovery inventory have not changed before packaging.
3. Confirm the repository root, Workspace Trust, local package dependencies, and expected outputs before the applicable step.

## Ordered process

For an authorized future human-maintained packaging execution, these interfaces form an ordered process. **Packaging is currently on hold**: this list is not authorization to run it, and the existing root VSIX archives must not be overwritten. The authored checks-only CI workflow defines independent contract, scenario and guide checks; its packaging job is disabled. Reenabling packaging needs owner confirmation and an authorized distinct output strategy.

1. `npm run verify-copilot-contracts` — verifies fixed-root contributed-customization contracts and manifest parity without workspace mutation.
2. `node scripts/discover-copilot-artifacts.cjs` — reports the sorted customization inventory as JSON without repository mutation.
3. `node scripts/sync-copilot-manifest.cjs check` — performs the non-mutating manifest check; use discovery and this check to decide whether sync is needed.
4. **Only if separately authorized and needed:** `node scripts/sync-copilot-manifest.cjs sync` — synchronizes only the bounded manifest locations after the declared probe comparison succeeds. Inspect its changes, then repeat step 3 successfully before step 5. If no sync was needed, use the successful step 3 check immediately before step 5.
5. **Only if separately authorized:** `npm run package` — creates the VSIX after the fresh successful manifest check and declared immediate current-state comparison, with no requested intervening operation.
6. `npm run verify-package` — checks the generated VSIX against the manifest boundary and packaged README link.

Inspect with discovery and check before any deliberately authorized sync; inspect any resulting controlled manifest change and recheck successfully afterward. Whether or not sync was needed, require a fresh successful check immediately before a separately authorized package and post-package verification. On a local failure, inspect diagnostics and effects, correct a permitted cause and rerun relevant checks before dependent steps. Do not weaken a failing check or assume a failed prerequisite passed. A failed consequential write or uncertain destructive/external completion needs reconciliation before repetition; an actual denial is not a fallback opportunity. This Run Book never selects commands for Runner or grants sync/packaging authority.

## Expected results

Independent checks-only CI is intended to verify static contracts, recovery scenarios and this guide without creating a VSIX. If packaging is later separately authorized, the human process checks the manifest boundary, synchronizes only the declared locations when deliberately needed, creates a distinct authorized VSIX and verifies its archive boundary. The JSON metadata is packaging-interface documentation; it does not prescribe Script Runner commands.

## Diagnostics and failure disposition

A failed check or missing prerequisite blocks its dependent step, not in-boundary diagnosis. Inspect the actual output and effects, correct a supported local problem (including an invocation error) and recheck; preserve the original acceptance criteria. If a consequential sync or package operation failed or its completion is uncertain, reconcile its artifact and external effects before considering further action; do not blindly replay it. A real permission denial, unexpected write or unresolved relevant external effect stops the affected operation. Raise material scope, release-output or permission choices to the owner. Report failed, unavailable and not-run results without relabeling them as success.

## Safety limits

- Do not bypass a failed prerequisite or treat an unperformed recheck as passed; diagnose and revalidate a corrected local failure before dependent work.
- Do not edit the VSIX archive directly or treat archive contents as a substitute for correcting source inputs.
- Do not distribute, publish, install, or release a VSIX as part of this process.
- Do not treat synchronization as broad manifest rewriting: its mutation surface is limited to the five locations listed above.
- Do not change `README.md` consumer guidance as part of this Run Book. The maintainer documentation remains separate from installation, support, and rollback instructions.
- The Run Book does not override Workspace Trust, VS Code permissions, or managed organization policy. Native Windows is not sandbox containment.

## Validation and limitations

This Run Book records the preserved package interfaces, controlled manifest boundary and human recovery sequence. The [authored workflow](../../.github/workflows/package.yml) defines independent contract, scenario and guide check jobs and a disabled package job. The [guide validator](../../scripts/verify-vsix-packaging-guide.cjs) checks the six metadata interfaces, scenario script entry, and bounded checks-only CI/hold structure. Local Node 26.7.0 checks during this implementation passed after corrections; the completion Research brief at `docs/copilot/002-rpir-completion-gaps/001-research-brief.md` records earlier verifier and guide passes but did not run the suite. This Run Book does not claim that sync or package interfaces have been executed. Runtime discovery, synchronization, Windows replacement behavior, packaging, archive verification, installed-extension checks, and cross-platform equivalence remain unvalidated here.

The workflow text implements P1's checks-only job layout and release hold, but no hosted CI execution is established here; this Run Book does not enable a release. Neither local script results nor a workflow definition establish installed-agent effectiveness, cross-platform validation or release readiness. Static guide coverage is bounded to its supported authored syntax; this page alone is not a passing validation result.

## Sources

- [`scripts/discover-copilot-artifacts.cjs`](../../scripts/discover-copilot-artifacts.cjs) — fixed-root inventory.
- [`scripts/sync-copilot-manifest.cjs`](../../scripts/sync-copilot-manifest.cjs) — controlled synchronization boundary.
- [`scripts/verify-copilot-contracts.cjs`](../../scripts/verify-copilot-contracts.cjs) — customization-contract validation.
- [`scripts/test-copilot-contract-scenarios.cjs`](../../scripts/test-copilot-contract-scenarios.cjs) and [`scripts/verify-vsix-packaging-guide.cjs`](../../scripts/verify-vsix-packaging-guide.cjs) — static scenario and guide metadata checks.
- [`scripts/verify-vsix-boundary.cjs`](../../scripts/verify-vsix-boundary.cjs) — post-package boundary validation.
- [`package.json`](../../package.json) — package identity and scripts.
- [`README.md`](../../README.md) and [workflow](../../.github/workflows/package.yml) — consumer guidance and automation context.

