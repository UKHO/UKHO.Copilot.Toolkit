# VSIX candidate preparation Run Book

## Purpose

This Run Book describes the bounded, repository-local process for proposing release inputs, preparing and inspecting a retained VSIX candidate, and handing a tested artifact to its human owner. It is written so built-in VS Code Agent mode can follow the documented routine only when the applicable repository policy and the engineer's request authorize that exact task. The Run Book itself is not permission, a policy exception, Script Runner input, or a way around Workspace Trust, tool permissions, or managed policy.

## Scope

The preparation workflow is limited to a confirmed release-input change (only when a supported interface exists), then one locally retained candidate and its verification/status sidecars. It stops before installation, manual testing, publication, distribution, credentials, Git operations, RPIR records, dependency installation, manifest synchronization, source repair, cleanup of retained attempts, or backup operations. Human testing, publication decisions, and backup are separate responsibilities; this page does not select a publication method or authorize those effects.

The `confirm-release-inputs` operation below is separate from candidate preparation. It changes only the listed release inputs after an interactive exact-proposal confirmation; it never starts packaging. Preparation can proceed only when intended inputs already exist and are consistent, and all applicable authorization and runtime prerequisites are satisfied.

## Operating mode and authority

This is a specifically Agent-followable procedure only when a separate applicable policy or explicit authorization covers the exact routine preparation task and its local effects. Current repository policy still holds packaging; this Run Book and implementation of its interfaces do not lift that hold or authorize a present operation. The approved [implementation Plan](../copilot/021-local-vsix-archive-and-marketplace-release/001-implementation-plan.md) describes the intended future boundary, not current runtime permission. This page is never Script Runner command-selection input and does not change its tools or authority.

## Audience

Repository maintainers and, when separately authorized, built-in VS Code Agent mode operating from the repository root. The engineer remains responsible for confirming any proposed release-input edits, conducting later manual testing, deciding whether to publish, and maintaining backups.

## Prerequisites

- The exact repository root is `c:\Repos\UKHO.Copilot.Toolkit`; use it as the current working directory (cwd) for every command below. Do not run these commands from a subdirectory or substitute another checkout.
- Current repository policy and the engineer's request authorize the specific bounded routine. This document does not confer that authorization. Actual tool permissions, Workspace Trust, and managed policy still apply; stop on denial.
- A credible release baseline and change summary are available. If the public/release baseline, compatibility classification, or intended version is uncertain, ask the engineer for evidence or a decision; do not infer Marketplace history or select a version by guesswork.
- Do not install dependencies. `npm run prepare-vsix` requires the existing local dependency and the pinned `@vscode/vsce` version **3.9.2**; a missing or mismatched tool is a stop condition, not permission to install or upgrade it.
- The chosen release inputs are already present and consistent, or the separate confirmed-input operation below is available and its exact edits are explicitly authorized by the engineer.
- No real build, retained real candidate, extension installation/activation, or Agent-mode runtime trial was performed to author this Run Book. Its commands and described outcomes are source-inspected, not runtime-demonstrated here.

## Preparation

1. Inspect the existing `CHANGELOG.md`, `package.json`, and `package-lock.json` as evidence. Reuse the existing Semantic Versioning convention: breaking changes propose a major increment, compatible features a minor increment, and compatible fixes a patch increment. Do not assume that the current version is publicly released or available; resolve an uncertain baseline with the engineer.
2. Prepare a written proposal showing the current and proposed numeric version, the evidence-based change classification/rationale, the exact proposed release-note text, and the exact fields that would change:
   - `package.json.version`;
   - `package-lock.json.version`;
   - `package-lock.json.packages[""].version`; and
   - only the selected pending release notes in the `CHANGELOG.md` `## Unreleased` section. The helper contract requires the current pending text to match exactly once inside that section; the replacement must begin with `### <version> review candidate`, include `ukho-copilot-toolkit-<version>.vsix`, and must not introduce another `##` section.
3. Require the engineer's explicit confirmation of that exact proposal before any such write. Preserve package identity, publisher, engine, dependencies, all other manifest/lockfile entries, unrelated changelog text, historical notes, and user edits. A changed preimage invalidates the confirmation; rejection/cancellation means no writes. Do not silently bump again for another attempt at the same intended release.
4. If release inputs need to change and the exact proposal has an evidence-based classification and baseline, use the separate confirmation command below. It displays the proposed version, summary, exact before/after values and affected fields, then requires the engineer to type the displayed confirmation phrase. A non-interactive invocation or any response other than the exact phrase makes no release-input edits. This command does not build or package.
5. Do not continue if prerequisites fail or if any required write has partial, uncertain, or mismatched results. Reconcile actual state; never overwrite user changes or blindly retry a consequential operation.

## Ordered process

All commands in this section are exact implemented package interfaces, run from `c:\Repos\UKHO.Copilot.Toolkit`. Command examples are documentation, not authorization to execute them.

### 0. Propose and confirm release-input edits, only if needed

If the intended release inputs are already correct and consistent, do not bump them merely to create another attempt; continue to step 1. Otherwise determine a supported numeric version from the inspected release baseline and change evidence. Do not guess public availability or rewrite historical entries. Supply the exact current pending notes and intended replacement notes, with the evidence-based change summary, to this implemented interface:

- Command shape: `npm run confirm-release-inputs -- --version <numeric-version> --change-summary <evidence-based-summary> --expected-pending-notes <exact-current-text> --proposed-notes <exact-replacement-text>`
- cwd: `c:\Repos\UKHO.Copilot.Toolkit`
- Implemented mapping: `npm run confirm-release-inputs` invokes `node scripts/prepare-vsix.cjs release-inputs`.

Quote argument values for the active shell so their complete text is passed unchanged. The proposed notes must start with `### <version> review candidate`, identify `ukho-copilot-toolkit-<version>.vsix`, and remain within the existing `## Unreleased` section. The operation independently reads the current manifest, lockfile, and changelog; its displayed proposal includes the current/proposed version, supplied change summary, exact old/new notes, and all four allowed field locations. Review that complete proposal. Only the engineer's interactive `CONFIRM <version>` response applies those bounded changes. A non-interactive invocation or any other response makes no changes. The operation checks current preimages, saves and reads back each selected input, validates the three version fields, and reports partial state without rollback if an update fails. It never invokes packaging. On rejection, drift, partial save, mismatch, or denial, do not run step 1; inspect actual state and resolve it without overwriting user changes.

After a successful update, inspect the three version values and selected changelog notes, then run `node scripts/sync-copilot-manifest.cjs check` as a non-mutating contribution-parity check. This check does not validate release-version consistency; inspect those fields separately. Do not run `sync`.

### 1. Prepare one candidate

When release inputs already match the intended release, applicable policy and the engineer's request authorize preparation, and all helper preconditions are satisfied, run:

- Command: `npm run prepare-vsix`
- cwd: `c:\Repos\UKHO.Copilot.Toolkit`
- Implemented mapping: `npm run prepare-vsix` invokes `node scripts/prepare-vsix.cjs prepare`.

This operation performs its own preflight of the repository, package/lock identity and version, shared-discovery/manifest parity, local `@vscode/vsce` 3.9.2, selected repository-local `Releases/` root, and relevant build inputs. It allocates a fresh exclusive candidate directory, builds with the pinned local tool, checks for input drift, retains the exact output bytes, performs fresh verification against captured build inputs, and emits a JSON result. It does not synchronize the manifest, install dependencies, update release inputs, fall back to the repository-root VSIX, or select a “latest” candidate.

The preparation and release-input helpers serialize their own operations with an exclusive repository-local lock and check directory/file identities around writes. This coordinates cooperating helper invocations and detects observed path replacement; it is not an OS-level sandbox or a guarantee against a non-cooperating process racing filesystem operations. If the lock already exists, stop and have the maintainer inspect/reconcile whether a prior operation is still active or was interrupted; never remove it blindly. If the helper reports changed path identity or unsafe containment, stop and preserve the actual state.

New candidates use `Releases/YYYY-MM-DD/HHmmssZ-<unique-id>/`, for example `Releases/2026-10-22/143000Z-<id>/`. The date and time derive from one captured UTC instant; allocation is exclusive. Existing folders and legacy root archives are preserved. Each attempt is independent, including another attempt at the same version; never reuse or overwrite a prior attempt.

A successfully prepared candidate contains `candidate.json`, `verification-evidence.json`, and `status.json`, plus its VSIX. A failed or partial attempt may contain only the files successfully retained before failure. The VSIX filename is version-derived (for example, `ukho-copilot-toolkit-1.0.0.vsix`). The JSON result reports candidate ID/directory, VSIX path, packaged identity, SHA-256, byte length, checks, outcome, verification state, and any error. Inspect the actual result; do not infer success from a folder's existence. A failure or partial retained attempt remains evidence and must not be described as a verified candidate or deleted as “cleanup.”

### 2. Inspect an explicit candidate

To inspect a candidate, supply its exact candidate-directory path—never a wildcard, “latest” alias, or guessed fallback:

- Command: `npm run inspect-vsix-candidate -- --candidate <explicit-candidate-directory>`
- cwd: `c:\Repos\UKHO.Copilot.Toolkit`
- Implemented mapping: `npm run inspect-vsix-candidate -- --candidate <explicit-candidate-directory>` invokes `node scripts/prepare-vsix.cjs inspect --candidate <explicit-candidate-directory>`.

Inspection uses **historical** verification against that candidate's retained evidence; it does not verify against today's checkout or search another location. Read the JSON output and confirm the explicit directory, candidate ID, VSIX filename, retained metadata, hash/size, verification result, and human-reported status. Historical verification establishes consistency with retained evidence, not independent provenance or proof against coordinated alteration of both artifact and evidence. It is not a manual-test result.

The legacy `npm run package` and `npm run verify-package` interfaces remain root-only. They do not prepare or inspect archived candidates, do not fall back to `Releases/`, and are held outside this archive workflow. Do not substitute them for either candidate command.

### 3. Return the preparation handoff and stop

For a verified candidate, report the JSON-observed candidate ID, exact absolute VSIX path, packaged name/publisher/version, SHA-256, byte length, checks, and actual outcome. State that manual testing is **not tested** and publication is **not published** unless a later human has recorded otherwise. If preparation is failed, partial, unverified, or output is unavailable, report that state and stop; do not initiate source repair, installation, manual testing, or publication.

### 4. Human status updates after separate activity

Preparation initializes `status.json` beside the candidate. It is a human-reported status record, not build evidence. After a human separately conducts a test or resolves a publication outcome, the human may edit only this candidate's `status.json`, preserving its schema, candidate ID, and `artifact` identity. Keep `artifact.fileName`, `artifact.sha256`, and `artifact.sizeBytes` exactly bound to `candidate.json` and the retained VSIX. Record actual dates and concise notes; do not change the VSIX, `candidate.json`, or `verification-evidence.json` to accommodate a status entry. The inspector reports status as human-reported and reports malformed or mismatched status as unavailable/invalid rather than success.

For example, retain the other existing JSON fields and use these field values only when factually true:

- **Manual test passed:** `"manualTest": { "outcome": "passed", "date": "YYYY-MM-DD", "notes": "Human test summary; candidate ID and hash checked." }`
- **Manual test failed:** `"manualTest": { "outcome": "failed", "date": "YYYY-MM-DD", "notes": "Observed failure; candidate retained." }`
- **Publication not performed:** `"publication": { "outcome": "not published", "date": null, "notes": "No publication occurred." }`
- **Publication completion uncertain:** `"publication": { "outcome": "pending/unknown", "date": "YYYY-MM-DD", "notes": "Reconcile actual external completion before retry or claim." }`
- **Publication confirmed by the responsible human:** `"publication": { "outcome": "published", "date": "YYYY-MM-DD", "notes": "Human-reported outcome; identify the exact candidate/hash." }`

Do not convert a failure to pass, or pending/unknown to published, without truthful human evidence. Reconcile uncertain external completion before retrying a publication activity. No publication command, credential route, or publication method is supplied here.

## Expected results

A successful preparation returns a verified, uniquely retained candidate and exact-artifact handoff while leaving manual-test status `not tested` and publication status `not published`. A later candidate inspection requires its explicit directory and reports historical evidence consistency plus any human-reported status. The workflow does not prove an actual build or runtime behavior merely because commands and helper code are documented.

## Diagnostics and failure disposition

- A missing pinned tool, unreadable/unsafe path, inconsistent version/lock metadata, manifest/discovery mismatch, input drift, build failure, verification failure, or metadata/status persistence failure blocks the dependent operation. Inspect actual JSON/error and retained candidate state; do not install, synchronize, repair source, remove an attempt, or repeat an uncertain write.
- A confirmed-input refusal, preimage drift, partial update, or version mismatch blocks preparation. Preserve the actual saved state and user edits; return the exact discrepancy for engineer resolution. The `confirm-release-inputs` CLI reports the actual changed files and does not start preparation when the update is incomplete.
- Before changing any release input, the helper creates `.ukho-vsix-release-inputs.incomplete.json`; it removes this gate only after all confirmed files are read back and cross-file consistency passes. A later direct `prepare-vsix` call fails closed while the gate exists, including after a partial update or interrupted process. The responsible maintainer must inspect and reconcile all affected files, then remove this internal gate only after confirming the release inputs are consistent; do not remove it to bypass an unresolved discrepancy.
- An invalid or missing explicit candidate path, malformed evidence, artifact hash/size mismatch, or failed historical verification is not a successful handoff. Do not choose another candidate automatically.
- If publication may have completed but the result is uncertain, keep status `pending/unknown` and reconcile with the responsible human before any retry or success claim.
- Stop the affected task on permission denial or unresolved material identity. Do not evade the denial through Script Runner, an improvised Node script, alternate path, generic version command, or another write route.

## Safety limits

- This Run Book does not authorize install/activation, manual testing, publication/distribution, credential access, network/account queries, Git operations, RPIR lifecycle work, dependency installation, manifest synchronization, general source repair, archive replacement/pruning, backup execution, or changing the VSIX/evidence to fit a status claim.
- The confirmed-input exception is limited to the three version fields and selected pending `Unreleased` notes listed above, only after the operation displays the exact proposal and receives interactive engineer confirmation, then passes current-preimage checks, readback, and cross-file consistency validation. It is separate from preparation and cannot authorize broader edits.
- A failure does not authorize a repair. A new candidate is a new attempt; a rebuild never inherits verification or testing from an older candidate.
- The pinned packaging tool is `@vscode/vsce` **3.9.2**. Do not upgrade or replace it in this workflow.
- Script Runner's role and tools do not change. A Run Book does not select commands for Script Runner or grant it source-write capability.
- Keep all prior candidate folders and legacy archives unchanged. Never publish a different same-version file or overwrite an existing artifact.

## Human testing, exact-file promotion, and backup responsibility

Manual testing and publication are separate human activities outside the preparation task. Before any separately authorized human publication, select the exact candidate that passed the relevant manual test and compare its candidate ID, explicit absolute VSIX path, packaged identity/version, SHA-256, and byte length with the test record and retained `status.json`. Re-inspect that exact directory using the historical inspection command and stop if identity, hash, size, evidence, or test binding differs. Do not rebuild, edit, substitute a same-version file, or reuse another candidate's test result during promotion. A rebuild creates a new candidate and requires fresh verification and fresh manual testing. This Run Book specifies no upload command or publisher method.

The maintainer owns backup outside this workflow. Preserve each candidate directory as a whole—including its VSIX, `candidate.json`, `verification-evidence.json`, and `status.json`—and retain candidates without automatic pruning. Local `Releases/` storage is not a backup or durability guarantee. No backup service, destination, schedule, copy, or restore is specified or claimed. After a separately managed restore, inspect the restored explicit candidate and check artifact integrity against its retained evidence before relying on it; this does not establish independent provenance.

## Validation and limitations

The package scripts define `confirm-release-inputs`, `prepare-vsix`, and `inspect-vsix-candidate`; source inspection confirms their argument contracts and bounded effects. The confirmation interface requires a TTY and an exact interactive response; its release-input update is non-atomic across files, so any partial result blocks preparation and must be reconciled truthfully. The existing root-only `package` and `verify-package` operations are not archive substitutes.

Static documentation/contract checks can validate authored structure and links, not actual VSIX creation, installed discovery, Agent-mode behavior, permissions, publication, or backup. No real build, installed/runtime trial, manual test, publication, backup, or restore is claimed by this Run Book. Real packaging/runtime validation remains subject to separate authorization and applicable repository policy.

## Sources

- [`scripts/prepare-vsix.cjs`](../../scripts/prepare-vsix.cjs) — implemented confirmed-release-input, prepare, and explicit-inspect CLI operations; candidate allocation and status validation.
- [`scripts/verify-vsix-boundary.cjs`](../../scripts/verify-vsix-boundary.cjs) — fresh and historical candidate verification contracts.
- [`package.json`](../../package.json) — exact npm scripts, package identity, engine, and pinned `@vscode/vsce` 3.9.2.
- [`CHANGELOG.md`](../../CHANGELOG.md) — existing Semantic Versioning convention and release-note history.
- [`tests/test-vsix-boundary.cjs`](../../tests/test-vsix-boundary.cjs) — fixture coverage; it does not demonstrate a real VSIX build.
- [Run Book authoring Skill](../../.github/skills/create-runbook/SKILL.md) and [template](../../.github/skills/create-runbook/templates/runbook.md) — scoped authoring requirements and anatomy.

