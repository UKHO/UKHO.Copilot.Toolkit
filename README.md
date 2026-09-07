# UKHO Copilot Toolkit

A private VS Code extension containing the approved UKHO Copilot customization set.

## Documentation

[Explore the Copilot Toolkit Wiki](docs/index.md).

## Scope

The packaged customization inventory is defined by the manifest and the shared discovery inventory; they are authoritative for the included agents, prompts, instructions, skills, and supporting files.

The extension is static customization content. It does not add executable extension code, webviews, network access, or automatic workspace automation. The included Script Runner can request execution of one complete, safety-valid consumer operation declared in its catalogue; VS Code Workspace Trust, permissions, and managed organization policy control whether and how that request is approved. It does not automatically execute workspace commands or provide an OS security boundary.
It does not include proof-of-concept material, lifecycle records, or other unapproved repository content.
It does not copy customization files or create other files in consumer workspaces.

## Requirements

- VS Code `>=1.130.0 <2.0.0`
- An approved private VSIX supplied through the UKHO distribution process
- The approved VSIX must contain the manifest-declared inventory produced from the shared discovery inventory, including supporting files.

Marketplace publication is out of scope for this release and requires a separate approval and delivery plan.

## Install and use

1. Obtain the approved VSIX from the authorized UKHO distributor.
2. In VS Code, open **Extensions** and select **Views and More Actions** (`...`) → **Install from VSIX...**.
3. Select the VSIX, review the publisher and version, and confirm installation.
4. Reload VS Code if prompted.
5. Use the supplied agents, prompts, instructions, and skills through VS Code Copilot customization features. Instruction applicability remains dependent on the consumer workspace paths specified by those instructions.

Install only VSIX files obtained through the approved private distribution process. Installation makes the packaged customizations available without copying them into the consumer workspace; it does not create lifecycle records, authorize lifecycle handoffs, approve work, or grant any other lifecycle authority there.

### Script Runner

Script Runner is opt-in guidance for one consumer-owned operation declared in `.github/copilot-script-catalogue.md` at the current workspace root. The current workspace must contain exactly one opened workspace folder; multi-root workspaces are refused, and the runner uses only that folder's fixed root catalogue path rather than discovering catalogues globally, recursively, from a parent or sibling, or from the active editor. Consumers must create, version, review, and maintain that catalogue and the referenced scripts; the runner does not trust or discover a script merely because it is under `scripts/`. Operation IDs must be unique within the selected root catalogue, and the catalogue, cwd, script, evidence, writes, and inspection paths must remain contained within that root; root escape and cross-root references are refused.

An approved implementation scope may create or update a complete catalogue entry in the consumer workspace. A plan or unfinished entry is not Script Runner execution authorization, and Script Runner never creates or edits catalogues or scripts. A complete entry has exactly these ten ordered fields: Stable operation ID, Classification, Packaging identity, Exact literal command, Fixed workspace-relative cwd, Enumerated arguments, Expected outputs/writes, Prohibited effects, Prerequisites, and Failure disposition.

Select an operation by its stable catalogue operation ID. Script Runner checks the complete safety-valid entry, including its exact literal command, fixed workspace-relative working directory, enumerated arguments, classification, outputs/writes, prohibited effects, prerequisites, and failure disposition. VS Code Workspace Trust, permissions, and managed organization policy remain the authority for approval behavior; catalogue content does not override those controls.

Only catalogue entries classified as `read-only` or `build/test` are ordinarily eligible. The sole additional class, `packaging-controlled-write`, is a packaging-only exception—not generic mutation—and requires an exact packaging identity and declaration of only the synchronizer's five `package.json` locations (`files` controlled-root entries and the `chatInstructions`, `chatAgents`, `chatPromptFiles`, and `chatSkills` contribution arrays) plus its contained transient random atomic temporary path. Script Runner requires a post-run `package.json` diff and artifact inspection for that class.

`mutation` operation classifications and any undeclared writes or effects are refused. A `build/test` operation may create only explicitly declared, workspace-contained outputs or writes. The packaging-only exception preserves all other exclusions: no installation, lifecycle execution, secrets or credentials, authentication, publishing, deployment, releases/tags, remote mutation, global configuration, external-path writes, shell composition, redirection, substitution, aliases, wildcards, traversal, `npx`, arbitrary interpreter or script targets, recursive deletion, or safety-control bypass.

On native Windows, Workspace Trust, fixed paths, VS Code or managed-policy permission controls, and post-run inspection are workflow controls, not sandbox containment. For higher-risk work, use a separately reviewed WSL2 or dev-container workflow where supported.

## Support and security

- General support: [UKHO Copilot Toolkit repository](https://github.com/UKHO/UKHO.Copilot.Toolkit)
- Security reports: [martyn.fewtrell@ukho.gov.uk](mailto:martyn.fewtrell@ukho.gov.uk)

Do not include credentials or other sensitive information in a public issue. Use the security email for privately reporting suspected security problems.

## Rollback

Martyn Fewtrell, the release owner, may withdraw a distributed VSIX if rollback is required. After a withdrawal, recipients should uninstall the affected extension and, where applicable, install the previous approved version. Do not continue distributing or installing a withdrawn VSIX.
This rollback process changes the installed extension only; it does not require copying, removing, or otherwise changing customization files in a consumer workspace.

## Versioning and license

Releases follow [Semantic Versioning](https://semver.org/): breaking changes increment the major version, compatible feature additions increment the minor version, and backward-compatible fixes increment the patch version. This Script Runner contract is a breaking migration: when adopting the revised VSIX, consumer owners must remove the legacy `Owner and immutable review evidence` field from every root-catalogue entry; no substitute attestation is required. Release notes are maintained in [`CHANGELOG.md`](CHANGELOG.md).

The repository's [`LICENSE`](LICENSE) file contains the applicable MIT License terms.
