# Changelog

All notable releases of the UKHO Copilot Toolkit are documented here. Versions follow [Semantic Versioning](https://semver.org/).

## Unreleased

### Breaking changes

- Script Runner catalogue entries now use the ten-field schema. When adopting `1.0.0`, remove `Owner and immutable review evidence` from every existing entry; no replacement attestation is required.
- The immutable-review-evidence and Runner-authored fresh-confirmation gates have been removed. VS Code and managed organization policy continue to control execution permissions and approvals.
- Script Runner now accepts one or more explicitly ordered stable IDs supplied directly or from a developer-named compliant Run Book; malformed selection input, duplicate IDs, failed objective revalidation, prompts or denials, failures, mismatches, and undeclared effects stop the remaining sequence.
- Repository Run Books now live under `docs/run-books/`; the VSIX packaging guide moved to `docs/run-books/vsix-packaging.md` and is the first Run Book selection source. Its narrative remains human guidance, not Runner input or execution authority.
- The canonical package identity is now `ukho-copilot-toolkit`, and the VSIX filename changed from the publisher-prefixed legacy form to `ukho-copilot-toolkit-<version>.vsix` (`${name}-${version}.vsix`).

### Added

- Script Runner and its repository script catalogue Skill for safety-valid consumer `read-only` and `build/test` operations.
- Consumer guidance for catalogue ownership, Workspace Trust, operation exclusions, and native-Windows limitations.
- A packaging-only `packaging-controlled-write` catalogue class for the bounded manifest synchronizer write set, retaining packaging identity, post-run diff inspection, and fail-closed refusal of all other writes or effects.
- Discovery-authoritative package-inventory wording to avoid manually maintained count drift.

### Safety controls retained

- Fixed single-root catalogue selection, static safety validation, declared write limits, secret-free context, prohibited-effect checks, and post-run artifact inspection remain required. Native Windows is not sandbox containment.

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
