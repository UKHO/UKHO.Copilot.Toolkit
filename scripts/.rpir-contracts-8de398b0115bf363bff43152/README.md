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

1. **Research:** Ask Research to investigate the work. The [Research coordinator](.github/agents/research.agent.md) follows orient → discover → acknowledged readback → investigate, including for detailed, apparently factual or solution-led requests. Its [question method](.github/skills/agent-question-resolution/SKILL.md) uses explicit Known/Uncertain/Recommendation (when supported)/Question framing, useful lettered choices and trade-offs at genuine decisions, and free text when facts/examples are needed; letter replies are never required. Before acknowledgment, only operating/context reads, supplied examples and bounded next-question-supporting lookups are allowed—not broad investigation or solution advice. Research ends the turn and waits for a material answer or readback acknowledgment. You may explicitly defer discovery or acknowledgment and direct investigation under disclosed provisional understanding and actual scope/timing; generic “keep going” pressure is not deferral. Natural-language acknowledgment works, and continuing the same objective reuses its intent trace. Read the saved brief, then manually invoke `/plan` with it; acknowledgment or deferral neither invokes Plan nor waives safety/permission limits.
2. **Plan:** Review the proposed outcome, scope, and acceptance criteria. If they are right, manually invoke `/implement` with the approved saved Plan.
3. **Implement:** Inspect the changes and saved implementation report, then manually invoke `/review` with that report.
4. **Review:** Follow the independent Review disposition. Unresolved findings mean the work is not accepted.

Plan, Implement and Review retain contextual material clarification, not Research's initial interview. These are authored workflow expectations, not evidence of installed loading or reliable runtime behavior. For supported corrections to the original criteria, manually resume Implement with the original approved Plan and linked Review context; then obtain a fresh independent Review. Material scope changes need an engineer decision and return to Plan. Prompt availability varies by Copilot surface; see the [RPIR guide](docs/Wiki/rpir.md) for workflow details.

## Support and further information

- General support: [UKHO Copilot Toolkit repository](https://github.com/UKHO/UKHO.Copilot.Toolkit)
- Security reports: [martyn.fewtrell@ukho.gov.uk](mailto:martyn.fewtrell@ukho.gov.uk). Do not include credentials or sensitive information in public issues.
- Consumers: [RPIR guide](docs/Wiki/rpir.md)
- Maintainers: [Maintain the Toolkit](docs/Wiki/maintain-the-toolkit.md)
- Release notes: [`CHANGELOG.md`](CHANGELOG.md)
- License: [`LICENSE`](LICENSE)
