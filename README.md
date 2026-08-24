# UKHO Copilot Toolkit

A private VS Code extension containing the approved UKHO Copilot customization set.

## Scope

Version `0.1.0` includes exactly:

- 16 agents
- 4 prompts
- 2 instructions
- 10 complete skills, including their supporting files

The extension is static customization content. It does not add runtime commands, webviews, network access, or workspace automation. It does not include proof-of-concept material, lifecycle records, or other unapproved repository content.
It does not copy customization files or create other files in consumer workspaces.

## Requirements

- VS Code `>=1.130.0 <2.0.0`
- An approved private VSIX supplied through the UKHO distribution process
- The approved VSIX must contain the manifest-declared inventory of 2 instructions, 16 agents, 4 prompts, and 10 complete skills, including their supporting files.

Marketplace publication is out of scope for this release and requires a separate approval and delivery plan.

## Install and use

1. Obtain the approved VSIX from the authorized UKHO distributor.
2. In VS Code, open **Extensions** and select **Views and More Actions** (`...`) → **Install from VSIX...**.
3. Select the VSIX, review the publisher and version, and confirm installation.
4. Reload VS Code if prompted.
5. Use the supplied agents, prompts, instructions, and skills through VS Code Copilot customization features. Instruction applicability remains dependent on the consumer workspace paths specified by those instructions.

Install only VSIX files obtained through the approved private distribution process. Installation makes the packaged customizations available without copying them into the consumer workspace; it does not create lifecycle records, authorize lifecycle handoffs, approve work, or grant any other lifecycle authority there.

## Support and security

- General support: [UKHO Copilot Toolkit repository](https://github.com/UKHO/UKHO.Copilot.Toolkit)
- Security reports: [martyn.fewtrell@ukho.gov.uk](mailto:martyn.fewtrell@ukho.gov.uk)

Do not include credentials or other sensitive information in a public issue. Use the security email for privately reporting suspected security problems.

## Rollback

Martyn Fewtrell, the release owner, may withdraw a distributed VSIX if rollback is required. After a withdrawal, recipients should uninstall the affected extension and, where applicable, install the previous approved version. Do not continue distributing or installing a withdrawn VSIX.
This rollback process changes the installed extension only; it does not require copying, removing, or otherwise changing customization files in a consumer workspace.

## Versioning and license

Releases follow [Semantic Versioning](https://semver.org/): breaking changes increment the major version, compatible feature additions increment the minor version, and backward-compatible fixes increment the patch version. Release notes are maintained in [`CHANGELOG.md`](CHANGELOG.md).

The repository's [`LICENSE`](LICENSE) file contains the applicable MIT License terms.
