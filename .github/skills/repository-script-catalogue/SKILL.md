---
name: repository-script-catalogue
description: Define and validate a consumer Script Runner catalogue entry for a stable operation ID, literal command, fixed working directory, and bounded read-only, build/test, or packaging-controlled-write execution. Use when creating, reviewing, or selecting `.github/copilot-script-catalogue.md` operations.
user-invocable: false
---

# Repository script catalogue

Use this Skill only to inspect or define the consumer-owned `.github/copilot-script-catalogue.md` convention. Consumers own, version, review, and maintain the catalogue and its referenced scripts. An approved implementation scope may create or update a complete catalogue entry, but that scope, a plan, or an unfinished entry is not Script Runner execution authorization. The catalogue is valid only at the fixed path `<root>/.github/copilot-script-catalogue.md`, where `<root>` is exactly one current, opened workspace folder. Refuse no-workspace and multi-root contexts; never infer `<root>` from the active editor, an ID, script, command, directory, or heading. The catalogue is never inferred from a `scripts/` directory, discovered by path, searched recursively, loaded from a parent, sibling, other workspace, or arbitrary filesystem location, or created or edited by Script Runner.

## Fixed Markdown convention

The catalogue contains one or more entries. Every entry must use this exact heading and field order; replace only placeholder values. A missing, repeated, reordered, or unrecognised field is malformed.

```md
## Operation: `<stable-operation-id>`

- Stable operation ID: `<stable-operation-id>`
- Classification: `<read-only|build/test|packaging-controlled-write>`
- Packaging identity: `<exact reviewed package identity, or none>`
- Exact literal command: `<literal command without shell composition>`
- Fixed workspace-relative cwd: `<. or contained relative path>`
- Enumerated arguments:
  - `<exact permitted argument sequence, or none>`
- Expected outputs/writes:
  - `<workspace-relative output/write path, or none>`
- Prohibited effects:
  - `<effect that this operation must not perform>`
- Prerequisites:
  - `<required local condition, or none>`
- Failure disposition: `<stop condition and operator action>`
```

Apply the fixed convention only to selected entries. Scan the complete fixed-root catalogue only to establish stable-operation-ID uniqueness; do not semantically validate, recertify, or require fresh operator confirmation for unrelated entries.

- The heading ID and **Stable operation ID** must match exactly, be lowercase kebab-case, and be unique in this root catalogue. Select operations only by this ID; refuse duplicate IDs rather than choosing by heading order or another fallback.
- **Classification** is exactly `read-only`, `build/test`, or the reviewed packaging-only `packaging-controlled-write` class. `mutation`, installation, and every other classification are prohibited. `packaging-controlled-write` is not generic mutation and is unavailable to non-packaging operations.
- **Packaging identity** is `none` for `read-only` and `build/test`. A `packaging-controlled-write` entry must declare the exact package identity; it must match the inspected package manifest.
- **Exact literal command** is complete and unchanged. Do not compose, normalize, substitute, append a script target, or infer a command from a path.
- **Fixed workspace-relative cwd** is `.` or a fixed relative path contained within `<root>`. It must not be absolute, escape `<root>`, cross into another workspace root, or contain traversal, wildcards, aliases, or substitution.
- **Enumerated arguments** lists every permitted sequence explicitly. `none` permits no arguments. Do not accept a value outside the list, construct arguments dynamically, or treat a placeholder as a wildcard.
- **Expected outputs/writes** lists every declared workspace-contained output or write. Every output/write must remain contained within `<root>` and must not cross into another workspace root. `none` is required for a read-only operation with no writes. Declared workspace-contained outputs/writes of a `build/test` operation are permitted; it may write only those declared paths.
- A `packaging-controlled-write` entry may declare only the exact `package.json.files` controlled-root entries; `package.json.contributes.chatInstructions`; `package.json.contributes.chatAgents`; `package.json.contributes.chatPromptFiles`; `package.json.contributes.chatSkills`; and one contained, transient, randomly named atomic temporary path. The temporary path is not a static filename, wildcard, or persistent output: it must remain within the workspace root, be removed after atomic replacement or failure handling, and be inspected after the run.
- **Prohibited effects** explicitly excludes a `mutation` operation classification and any undeclared workspace mutation, dependency installation, secrets or credentials, authentication, publishing, deployment, releases/tags, remote mutation, global configuration, external-path writes, shell composition, redirection, substitution, aliases, wildcards, traversal, `npx`, arbitrary interpreter or script targets, recursive deletion, and safety-control bypass. These exclusions also apply to `packaging-controlled-write`.
- **Prerequisites** states all required local conditions without exposing secrets. Missing, unverified, or unsafe prerequisites stop the operation.
- **Failure disposition** requires stopping on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, or undeclared write; it must name the operator's next safe action without suggesting a substitute command.

## Selection and execution boundary

1. Require exactly one current, opened workspace folder and bind it as `<root>` before considering a selection. Refuse no-workspace and multi-root contexts without selecting an active folder. Workspace Trust is a prerequisite; VS Code and managed organization policy control terminal permissions and approval behavior.
2. Require one or more stable IDs enumerated directly by the developer in order, or one developer-named repository-contained Run Book. Parse a Run Book only when it has one unique literal `## Script Runner operations` H2 heading immediately followed by one contiguous top-level ordered Markdown list. Each list item must be exactly one lowercase-kebab-case stable ID as plain text; the section ends at the next H2 heading or end of file. Refuse blank lines, nested items, Markdown decoration or links, comments, commands, arguments, or all other section content. Content outside the section is non-executable human guidance. Refuse duplicate requested IDs; do not discover, infer, substitute, skip, retry, or dynamically add an ID, command, argument, dependency, or follow-on operation.
3. Read only the fixed catalogue at `<root>/.github/copilot-script-catalogue.md`; do not discover, search, or fall back to another catalogue or path. Scan the complete catalogue only for duplicate stable IDs. For each selected ID in its stated order, read and semantically validate the complete selected entry and its referenced artifacts. Refuse instead of guessing when the catalogue, Run Book, ID, classification, packaging identity, command, cwd, arguments, outputs/writes, effects, declared probe, or prerequisites is absent, malformed, or ambiguous. Do not require fresh repository-authored confirmation, attestation, or semantic recertification of unrelated entries.
4. For each selected entry, confirm that its exact literal command, fixed cwd, enumerated arguments, expected outputs/writes, prohibited effects, prerequisites, catalogue, Run Book, referenced scripts, declared probes, and post-run inspection targets remain within `<root>` and match the selected entry. Reject absolute, traversal, escape, and cross-root references. A `build/test` operation may produce only its explicitly declared workspace-contained outputs/writes. A `packaging-controlled-write` operation may change only its exact five declared `package.json` locations and contained transient random atomic path. A declared fixed prerequisite probe may run only when the entry specifies its exact stable ID, permitted purpose, captured evidence, immediate-before-operation timing, comparison predicate, and stop condition; it is fully validated and inspected as its own entry but is not a requested operation and does not consume or duplicate a requested ID. Do not use path discovery, inferred dependencies, or a fallback command.
5. Use a secret-free context. Refuse any secret-bearing environment, configuration, command, argument, script, output, or prerequisite.
6. Validate, execute, and inspect selected entries only in their stated order. After each operation, inspect the root working directory and compare changed, untracked, generated, and declared output artifacts with that entry. Inspection targets and observed artifacts must remain contained within `<root>`. For `packaging-controlled-write`, inspect the transient path and review the `package.json` diff to confirm that only the five declared locations changed. Stop the remaining sequence and report any refusal, failed prerequisite, prompt or denial, error, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared artifact, or other unexpected effect.

## Refuse conditions

Refuse without execution for no workspace or a multi-root workspace; a missing or invalid fixed root catalogue; discovery or fallback; an invalid direct selection or Run Book section; an ID collision or duplicate catalogue or requested ID; a malformed selected entry or referenced artifact; a non-enumerated argument; a classification other than `read-only`, `build/test`, or `packaging-controlled-write`; a packaging-controlled-write entry without exact packaging identity, exact five-location write declaration, or contained transient random atomic-path invariant; a `mutation` operation classification, undeclared workspace mutation, or installation; an undeclared output/write or effect; any catalogue, Run Book, cwd, script, probe, output/write, or inspection reference that is absolute, out-of-root, or cross-root; any prohibited effect; a prerequisite failure; a command mismatch; or a prompt or denial. Stop the remaining requested sequence after any refusal or stop condition.

This Skill grants no edit, installation, generic `mutation` operation classification, lifecycle, report, delegation, or general terminal authority. `packaging-controlled-write` is the sole packaging exception and does not authorize lifecycle execution. Native Windows provides no sandbox-containment guarantee: fixed workspace paths, Workspace Trust, VS Code and managed organization policy, secret-free execution, and post-run inspection are workflow controls, not OS enforcement. Use a reviewed WSL2 or dev-container workflow for higher-risk work where supported.