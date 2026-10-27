# ADR 006: Public security reporting policy and distribution boundary

## Record metadata

- **Status:** Accepted.
- **Substantive version or snapshot:** v0.2, 2026-10-27; this active Proposed draft supersedes its earlier working v0.1 text-only-source description.
- **Authored:** 2026-10-27.
- **Decision date:** 2026-10-27.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The engineer supplied the reporting policy and selected its content/commitments as authoritative and repository-only publication, as recorded in Research. The record does not infer a separate enterprise approval authority or matrix.
- **Agreement evidence:** The engineer's explicit `/implement` invocation on 2026-10-27 with the inspected approved Plan v1.1 (`docs/copilot/023-security-policy/001-implementation-plan.md`) signs off the exact Proposed ADR 006 v0.2 preimage for D1 and D2. The invocation records agreement to the engineer-selected policy content/commitments and repository-only distribution; it does not independently verify mailbox operations, response staffing, Snyk use, recurring audits, or other operational claims.
- **Affected systems:** Root repository `SECURITY.md` and the README security-report entry. No scanner, mailbox, VSIX, workflow, dependency, or external service configuration is changed by the associated delivery.
- **Related decisions:** ADRs 001–005 concern RPIR governance or VSIX release workflows; none provides substantive coverage for this reporting policy. No existing ADR is amended.
- **Source revisions:** Research brief v1.0 and associated implementation Plan v1.1 in `docs/copilot/023-security-policy/`. The Research brief summarizes the complete user-supplied policy; Plan v1.1 now preserves that policy body verbatim for delivery.

## Context and problem

The existing README directs security reports to an individual address and warns readers not to include credentials or sensitive information in public issues. Research identifies the engineer-supplied responsible-vulnerability-reporting policy as the authoritative content baseline, including a private `UKHO-ITSO@gov.uk` route, response and update commitments, resolution/credit information, secure-development statements, and UKHO/OWASP links. The repository has no root security policy. The physical Research brief summarizes but does not reproduce the complete policy text; after the engineer supplied it in the Plan conversation, Plan v1.1 stored the complete text verbatim for implementation. Implement should use that physical Plan payload rather than reconstructing text from the Research summary or depending on access to earlier chat history.

The repository's inspected workflow and scripts do not establish whether the named mailbox is monitored, whether the stated response commitment is operationally supported, or whether Snyk and recurring dependency audits are performed outside checked-in configuration. The engineer directed that the supplied commitments be treated as authoritative; this record does not verify them or infer that documentation configures scanning.

## Decision and conditions

### D1 — Publish the supplied private vulnerability-reporting contract

- **Choice and rationale:** Use the engineer-supplied policy as the public repository's security-reporting contract, with the supplied private reporting address and stated acknowledgement, update, resolution, and credit commitments. A public README entry should direct readers to that single policy source and retain the existing warning against placing credentials or sensitive information in public issues.
- **Realistic alternatives and reasoning:** Relying only on the current individual email is inconsistent with the supplied policy and leaves no standalone GitHub-recognized policy. GitHub private vulnerability reporting, either instead of or alongside the supplied route, is a possible alternative, but no enabled repository configuration or engineer selection for it was evidenced. The engineer selected the supplied policy and route; no additional reporting channel is inferred.
- **Actual selection or pending state:** The engineer selected the supplied policy text and operational commitments as authoritative, allowing only necessary repository-fit edits. This ADR remains Proposed; no acceptance of this ADR or independent operational verification is claimed.
- **Conditions and affected Work Items:** Plan WI1 creates root `SECURITY.md` from the exact policy payload stored in Plan v1.1 and updates the README contact/link. The stored policy is the source for implementation; do not reconstruct it from Research's summary. Do not silently change commitments or the noted “confidentially” wording. Preserve the existing public-issue warning. Do not install/configure Snyk, add dependencies, create scans or claim those controls were validated. Mailbox operation and external audit practice remain unverified and are not implementation prerequisites because the engineer authorized the text as the content baseline.

### D2 — Keep publication repository-only, outside the VSIX

- **Choice and rationale:** Publish the policy in the GitHub repository as root `SECURITY.md`; link to it from the README. Do not add a package allowlist entry or package-boundary fixture. This is the engineer-selected distribution boundary and avoids expanding the distributed extension package.
- **Realistic alternatives and reasoning:** Including a policy copy in the VSIX could serve recipients without repository access, but package inclusion was explicitly excluded and recipient access needs were not established. A documentation-only location would be less direct than GitHub's recognized root policy location and would not match the selected repository-only publication.
- **Actual selection or pending state:** The engineer selected repository-only publication. This does not establish that VSIX recipients can access the repository link, and does not create an offline-policy requirement.
- **Conditions and affected Work Items:** Plan WI1 changes only the root `SECURITY.md` and README reporting entry for the delivery. Keep `package.json`, package verification fixtures, workflows, Wiki/catalogue pages, and historical changelog entries unchanged. The README link is for repository/GitHub readers; package-recipient accessibility is outside this decision and acceptance.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| Keep the existing individual contact and warning only | No file changes; warning already protects public issue readers | Does not provide the engineer-supplied standalone policy or selected reporting address | Not selected; inconsistent with the Research outcome |
| Use the supplied policy and link it from the README | One authoritative repository policy and visible existing entry point | Operational commitments are not independently evidenced in repository configuration | Selected content/distribution direction; claims remain attributed to the engineer-supplied policy |
| Use GitHub private vulnerability reporting instead of or with email | Could provide a repository-native private route | Availability/configuration and engineer selection were not evidenced | Not selected or enabled by this record |
| Include the policy in the VSIX | May help recipients lacking repository access | Expands the package and conflicts with the explicit repository-only choice | Explicitly excluded |
| Add Snyk configuration or scheduled dependency scanning | Could make scanning practices visible in checked-in configuration | New tooling/operational scope; not requested or evidenced | Explicitly outside scope |

## Consequences

- **Benefits:** Repository visitors get a GitHub-recognized policy and the existing README entry points to the supplied private route while preserving the public-issue warning.
- **Risks and technical debt:** Mailbox monitoring, response staffing, Snyk use, and recurring audit cadence are not verified by this documentation change. Package recipients may not be able to follow the repository link; that is outside the selected distribution scope.
- **Operational impact:** Documentation only. No dependency, scanner, workflow, mailbox, or external-service change is introduced.
- **Reversibility and recovery constraints:** The README entry can be restored from its inspected preimage and the new policy can be removed as an attributable documentation change. Preserve unrelated edits; do not rewrite historical changelog entries or alter package boundaries.
- **Dependencies:** Plan v1.1 contains the exact engineer-supplied policy text needed by Implement. The README update depends on the root policy path `SECURITY.md`. No external mailbox or scanner check is required to reproduce the authorized text.

## Standards and practice alignment

Research records GitHub's supported root `SECURITY.md` convention and recommends that location. This record makes no compliance certification, mailbox-operability claim, or claim that repository configuration implements Snyk or recurring audits. The linked UKHO ticketing-tool security page was unavailable (404) in Research; its contents are not inferred.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Exact policy body available to Implement | WI1 requires source-faithful copying | The engineer supplied the text during Plan; Implement uses the saved Plan payload | Plan v1.1 stores the complete policy verbatim; compare `SECURITY.md` against that payload | Resolved in the active Plan; no chat-history lookup is required |
| Mailbox monitoring and external Snyk/audit practice | Operational assurance, not documentation delivery | Relevant operational owner not identified in Research | Obtain owner/process evidence only if a later scope requires verification; do not infer from this record or repository metadata | Unverified and outside WI1 acceptance |
| ADR agreement state | No unconditional Accepted claim | Engineer and any actually applicable authority | Under the prospective rule, only a qualifying explicit `/implement` invocation can sign off this exact Proposed snapshot, if the rule is effective before that invocation; otherwise follow actual applicable governance | Proposed |

## References and implementation binding

- [Research brief v1.0](../copilot/023-security-policy/001-research-brief.md), 2026-10-27; physical local source. It records the supplied content's decisions and evidence limits, but does not contain the full policy body.
- **Associated Plan:** [001-implementation-plan.md](../copilot/023-security-policy/001-implementation-plan.md), substantive v1.1; the Plan owns the single delivery hierarchy, acceptance, bounded checkpoint strategy, and verbatim policy payload.
- **Coverage binding:** Plan WI1 -> D1 and D2 in this ADR, Proposed substantive snapshot v0.2. The Plan binds this exact path/ID, each decision section, the Research-recorded selections, conditions and affected work.
- **Renderer or consumer convention:** Existing `docs/adr/` numbered records and `.github/skills/architecture-decision-records/templates/adr.md`; ordinary repository Markdown. No universal approval matrix is asserted.

This supplementary Proposed ADR is not a canonical RPIR phase record, delivery approval, implementation authorization, or acceptance record. Its persistence/readback and the Plan's separate persistence/readback are distinct effects.
