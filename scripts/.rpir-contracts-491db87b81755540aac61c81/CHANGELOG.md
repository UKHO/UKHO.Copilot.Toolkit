# Changelog

All notable releases of the UKHO Copilot Toolkit are documented here. Versions follow [Semantic Versioning](https://semver.org/).

## Unreleased

### 1.1.0 review candidate

- The intended `1.1.0` VSIX is a review candidate only: it is not a released version and is not approved for distribution. This engineer-selected minor version carries breaking changes, contrary to the README's convention that breaking changes increment the major version.

### Breaking changes

- The goal-directed Script Runner migration replaces catalogue IDs, fixed command rows, and Run Book operation selection. Research, Plan, Implement, and Review coordinators delegate bounded goals; Runner inspects relevant local evidence and selects task-relevant command(s) and a working directory under the phase scope and effective VS Code tool permissions and managed policy. Workspace Trust and actual permissions apply; denial or unavailable required trust, permission, or effect inspection stops the affected work.
- Run Books provide human guidance; they are not Runner command-selection input or execution authority. Packaging metadata in the VSIX Run Book documents human packaging interfaces and does not determine Runner eligibility.
- Review existing terminal permissions and workflows that rely on catalogue IDs or fixed command rows before adopting an approved VSIX. Removing or withdrawing an extension cannot undo commands already run or files they changed. Native Windows is not sandbox containment.
- The canonical version-derived package name is `${name}-${version}.vsix`; for this candidate it is `ukho-copilot-toolkit-1.1.0.vsix`.

## [0.1.0] — 2026-08-21

### Added

- Initial private VSIX release for VS Code `>=1.130.0 <2.0.0`.
- The approved customization set included agents, prompts, instructions, and complete skills with supporting files.
- Root release documentation covering private installation, support, security reporting, governance limits, and rollback.

### Distribution

- Distribution is private only. Marketplace publication is out of scope for this release and requires separate approval.
- Installation does not create lifecycle records or authorize lifecycle handoffs.
- The release owner, Martyn Fewtrell, may withdraw the VSIX. Recipients should uninstall a withdrawn version or reinstall the previous approved version.

### Policy

- Future releases use Semantic Versioning: major for breaking changes, minor for compatible features, and patch for backward-compatible fixes.
