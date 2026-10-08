# UKHO Copilot Toolkit

A VS Code extension containing a selection of UKHO Copilot tools.

## Documentation

[Explore the Copilot Toolkit Wiki](docs/Wiki/index.md).

## Scope

The packaged customization inventory is defined by the manifest and the shared discovery inventory; they are authoritative for the included agents, prompts, instructions, skills, and supporting files.

The extension is static customization content. It does not add executable extension code, webviews, network access, or automatic workspace automation. Implement may use actually permitted direct command capability to diagnose, repair and recheck work within an approved Plan; the named Script Runner is an optional goal-directed execution specialist for phase-scoped tasks. VS Code Workspace Trust, permissions, and managed organization policy control whether and how execution is approved. Installing the extension does not automatically execute workspace commands or provide an OS security boundary.
It does not include proof-of-concept material, lifecycle records, or other unapproved repository content.
Installation itself does not copy customization files or create files in consumer workspaces. In one explicitly selected opened consumer root, a later, explicitly invoked Research phase prefers a suitable existing `docs/`, otherwise one evidently established documentation directory of any name or depth; it may conditionally create `docs/` only when no existing documentation root exists. Research separately verifies/reuses or conditionally creates that root's direct `copilot/` lifecycle parent, then its numbered subject topic and numbered physical brief. Reuse verified safe directories without setup writes; each applicable creation needs independent exact-identity, actual-containment, absence/file/case-collision, effective tool/managed-policy permission and post-create checks. Ambiguous roots require clarification, not guessed selection or fallback after denial. This is Research behavior, not an installation effect or a claim of universal permission. Existing lifecycles, including historical `docs/planning/` and `docs/delivery/` topics, remain in their verified folders; successor phases inherit that folder and physical same-folder predecessor without migration.

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
5. Use the supplied agents, prompts, instructions, and skills through VS Code Copilot customization features where supported. The lifecycle instruction declares candidate paths for numbered records under historical `docs/planning/` and `docs/delivery/` topics and a verified documentation root's `copilot/` numbered topics; a path match alone does not establish lifecycle identity. Verify discovery and actual instruction attachment in the target Local or Agent Host environment rather than inferring them from the declaration or installation.

Install only VSIX files obtained through the approved private distribution process. Installation makes the packaged customizations available without creating consumer-workspace files; it does not create lifecycle directories or records, authorize lifecycle handoffs, approve work, or grant any other lifecycle authority there. Any later Research-created documentation root (only if none exists), `copilot/` parent (only if absent), topic or brief depends on that invoked phase's separate guards and effective permissions. Manually invoke the supported next RPIR phase with its inspected physical predecessor version; installation and a handoff suggestion do not advance phases.

### Script Runner

Coordinators delegate a self-contained goal with phase, expected observation, selected opened workspace folder, authorized scope, anticipated effects and required result. Runner inspects relevant local evidence, decides whether a command is needed, and selects a task-relevant command and cwd. Neither a consumer catalogue, stable ID, Run Book selection section nor literal plan command row is required. With one opened root Runner binds it; in a multi-root workspace the parent must name exactly one opened root. Ambiguous or escaping cwd/root, an observed untrusted or Restricted Mode state, unavailable permission, denied execution or unavailable required effect inspection stops the affected task. Missing separately exposed trust telemetry alone is neither a trust grant nor a denial.

Research, Plan and Review may use Runner for observations, application, builds, tests or diagnostics, but may not intentionally edit source, configuration, customization or lifecycle records through it. Implement may use Runner for approved scoped goals or its actually permitted direct tools; an assigned Implementation Worker may run relevant local checks when its active permissions allow. Read-only Test and Validation Workers remain read-only. Incidental generated files, caches, logs and process effects must be inspected and disclosed, not treated as edit permission. Installation that would intentionally change project files needs separately approved Implement scope. Runner has no edit or nested-agent tool and cannot authorize lifecycle writes, status, acceptance or handoffs.

Runner reports selected commands and cwd, platform permission outcome, exit state, sanitized output, tracked/untracked/generated artifacts, observable process or external effects and inspection limitations. Diagnose ordinary local command failures, correct in-boundary problems and rerun relevant checks; a failed check leaves dependent acceptance unmet. Reconcile uncertain destructive or external effects before repeating them, and never bypass a real denial, silently discard user work or intentionally access secrets. Execution is not validation or acceptance. On native Windows, root checks, human review and platform controls do not guarantee sandbox containment. For higher-risk work, use a separately reviewed WSL2 or dev-container workflow where supported.

### RPIR correction and validation

An approved Plan defines the outcome, acceptance criteria and material boundary. Implement can investigate, repair and recheck ordinary in-boundary issues without a new Plan for every defect. Independent Review may identify an unmet original criterion: manually resume `/implement` with the original approved physical Plan and linked Review context, produce fresh implementation evidence and seek fresh independent Review. Materially new requirements, public behavior, dependencies, security or compatibility commitments, or external effects require an engineer decision and Plan-owned change. The contributed `/remediate-review` shortcut now enters **Implement** for supported original-criteria corrections; it formerly aliased Plan and is not backward-compatible with that old route. A report or handoff suggestion is not edit authority or automatic acceptance. See [RPIR](docs/Wiki/rpir.md) and the [lifecycle core](.github/skills/rpir-lifecycle-core/SKILL.md).

Maintainers use the static contract, scenario and packaging-guide checks as separate validation surfaces; a scenario run can retain a suite-owned `scripts/.rpir-contracts-<24 lowercase hex>/` staging tree. P1 calls for checks-only CI while packaging remains on hold. Neither authored/static checks nor a workflow definition demonstrate hosted CI execution, installed-agent behavior or runtime effectiveness; those need separately authorized validation. See [Maintain the Toolkit](docs/Wiki/maintain-the-toolkit.md) for the maintainer route.

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
