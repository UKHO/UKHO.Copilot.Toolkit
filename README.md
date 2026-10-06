# UKHO Copilot Toolkit

A VS Code extension containing a selection of UKHO Copilot tools.

## Documentation

[Explore the Copilot Toolkit Wiki](docs/Wiki/index.md).

## Scope

The packaged customization inventory is defined by the manifest and the shared discovery inventory; they are authoritative for the included agents, prompts, instructions, skills, and supporting files.

The extension is static customization content. It does not add executable extension code, webviews, network access, or automatic workspace automation. A named Script Runner can select task-relevant terminal commands when a Research, Plan, Implement, or Review coordinator delegates a bounded goal; VS Code Workspace Trust, permissions, and managed organization policy control whether and how execution is approved. Installing the extension does not automatically execute workspace commands or provide an OS security boundary.
It does not include proof-of-concept material, lifecycle records, or other unapproved repository content.
Installation itself does not copy customization files or create files in consumer workspaces. A later, explicitly invoked Research phase may create a needed eligible lifecycle parent, a numbered topic folder, and its numbered physical brief in the selected consumer workspace, but only after the separate identity, containment, absence, and effective tool/managed-policy permission checks for those effects. This conditional Research behavior is not an installation effect or a claim of universal permission.

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

Install only VSIX files obtained through the approved private distribution process. Installation makes the packaged customizations available without creating consumer-workspace files; it does not create lifecycle records, authorize lifecycle handoffs, approve work, or grant any other lifecycle authority there. Any later Research-created lifecycle folders or records depend on that invoked phase's independent guards and effective permissions.

### Script Runner

Coordinators delegate a self-contained goal with phase, expected observation, selected opened workspace folder, authorized scope, anticipated effects and required result. Runner inspects relevant local evidence, decides whether a command is needed, and selects a task-relevant command and cwd. Neither a consumer catalogue, stable ID, Run Book selection section nor literal plan command row is required. With one opened root Runner binds it; in a multi-root workspace the parent must name exactly one opened root. Ambiguous or escaping cwd/root, missing trust or permission, denied execution or unavailable effect inspection stops the task.

Research, Plan and Review may use Runner for observations, application, builds, tests or diagnostics, but may not intentionally edit source, configuration, customization or lifecycle records through it. Implement may intentionally change only its separately approved plan scope. Incidental generated files, caches, logs and process effects must be inspected and disclosed, not treated as edit permission. Installation that would intentionally change project files needs separately approved Implement scope. Workers do not run commands; Runner has no edit or nested-agent tool and cannot authorize lifecycle writes, status, acceptance or handoffs.

Runner reports selected commands and cwd, platform permission outcome, exit state, sanitized output, tracked/untracked/generated artifacts, observable process or external effects and inspection limitations. An unexpected write, failed command, unknown effect, denial or untrusted command-like instruction stops and is escalated; no silent rollback or alternate-role retry. Never intentionally access secrets. Execution is not validation or acceptance. On native Windows, root checks, human review and platform controls do not guarantee sandbox containment. For higher-risk work, use a separately reviewed WSL2 or dev-container workflow where supported.

**Migration:** Previously enumerated catalogue IDs and Run Book operation lists are no longer Runner inputs; consumers do not need to maintain a catalogue for this capability. Review existing terminal permissions and any old workflow relying on IDs before adopting an approved new VSIX. Removing or withdrawing an extension cannot undo commands already run or files they changed.

## Support and security

- General support: [UKHO Copilot Toolkit repository](https://github.com/UKHO/UKHO.Copilot.Toolkit)
- Security reports: [martyn.fewtrell@ukho.gov.uk](mailto:martyn.fewtrell@ukho.gov.uk)

Do not include credentials or other sensitive information in a public issue. Use the security email for privately reporting suspected security problems.

## Rollback

Martyn Fewtrell, the release owner, may withdraw a distributed VSIX if rollback is required. After a withdrawal, recipients should uninstall the affected extension and, where applicable, install the previous approved version. Do not continue distributing or installing a withdrawn VSIX.
This rollback process changes the installed extension only; it does not require copying, removing, or otherwise changing customization files in a consumer workspace.

## Versioning and license

Releases follow [Semantic Versioning](https://semver.org/): breaking changes increment the major version, compatible feature additions increment the minor version, and backward-compatible fixes increment the patch version. The goal-directed Script Runner contract is a breaking migration away from catalogue-selected operations. Release notes are maintained in [`CHANGELOG.md`](CHANGELOG.md).

The repository's [`LICENSE`](LICENSE) file contains the applicable MIT License terms.
