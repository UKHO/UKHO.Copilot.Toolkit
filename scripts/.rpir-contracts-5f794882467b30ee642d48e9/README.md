# UKHO Copilot Toolkit

A VS Code extension containing UKHO Copilot customizations.

## Requirements

- VS Code `>=1.130.0 <2.0.0`
- An approved private VSIX obtained through the authorized UKHO distribution process

## Install

1. In VS Code, open **Extensions** and select **Views and More Actions** (`...`) → **Install from VSIX...**.
2. Choose the approved VSIX, review its publisher and version, and confirm installation.
3. Reload VS Code if prompted.

Installation does not create workspace lifecycle records or begin RPIR. Start work by explicitly requesting Research when you are ready.

## Follow the RPIR workflow

Each phase produces a saved record for you to inspect. Manually invoke the next phase with that physical record; suggestions and reports do not advance phases or accept work automatically.

1. **Research:** Ask Research to investigate the work. Research normally explores the underlying problem through adaptive questions and reads back its understanding for explicit confirmation or correction—even when your initial request is detailed. It uses the shared question-resolution method for every question. You may explicitly direct Research to defer acknowledgment and proceed against a disclosed provisional understanding; that direction is not confirmation and does not waive safety or permission limits. Continuing the same objective reuses its intent trace. Read the saved brief, then manually invoke `/plan` with that brief; neither confirmation nor deferral invokes Plan.
2. **Plan:** Review the proposed outcome, scope, and acceptance criteria. If they are right, manually invoke `/implement` with the approved saved Plan.
3. **Implement:** Inspect the changes and saved implementation report, then manually invoke `/review` with that report.
4. **Review:** Follow the independent Review disposition. Unresolved findings mean the work is not accepted.

For supported corrections to the original criteria, manually resume Implement with the original approved Plan and linked Review context; then obtain a fresh independent Review. Material scope changes need an engineer decision and return to Plan. Prompt availability varies by Copilot surface; see the [RPIR guide](docs/Wiki/rpir.md) for workflow details.

## Support and further information

- General support: [UKHO Copilot Toolkit repository](https://github.com/UKHO/UKHO.Copilot.Toolkit)
- Security reports: [martyn.fewtrell@ukho.gov.uk](mailto:martyn.fewtrell@ukho.gov.uk). Do not include credentials or sensitive information in public issues.
- Consumers: [RPIR guide](docs/Wiki/rpir.md)
- Maintainers: [Maintain the Toolkit](docs/Wiki/maintain-the-toolkit.md)
- Release notes: [`CHANGELOG.md`](CHANGELOG.md)
- License: [`LICENSE`](LICENSE)
