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

## Agent model recommendations

The [shared role profiles](.github/skills/agent-model-selection/references/role-profiles.md) give each agent a model recommendation and target effort. Agent frontmatter declares a single model preference and one profile-matched `reasoning-effort` beside it. The effort declaration expresses intended effort, not observed effective effort; runtime consumption, compatibility and harmless ignoring are unverified. Actual automatic model selection has not yet been verified on every Local path. Select the intended coordinator and check the effective model and effort where exposed through supported controls. Do not assume root effort reaches delegated workers or that their declared effort is enforced. Later effort-support testing remains engineer-owned; static declarations do not establish its result.

If the recommended model is unavailable or the effective selection cannot be verified, disclose the mismatch rather than silently downgrade. An override or escalation is appropriate only through an evidenced, supported route; Astra requires engineer direction. Picker precedence, Local child effort, compatibility across the declared version range and installed routing remain unverified. Copilot-harness parity is a separate follow-on; static metadata and links do not establish runtime behavior.

## Follow the RPIR workflow

Each phase produces a saved record for you to inspect. Manually invoke the next phase with that physical record; suggestions and reports do not advance phases or accept work automatically.

1. **Research:** Ask Research to investigate the work. The [Research coordinator](.github/agents/research.agent.md) follows orient → discover → acknowledged readback → investigate, including for detailed, apparently factual or solution-led requests. Before proposing readback, it develops relevant motivation/affected people, outcome, example/boundary, constraints/priorities, assumptions and foreseeable decisions; dimensions are supported, answered, reasonedly inapplicable or carried with consequence and next step—not satisfied by headings or a question quota. After investigation it resolves practicable engineer-owned choices or carries affected downstream work and a resolution route. Across **all four phases**, every engineer-facing question uses the [shared question method](.github/skills/agent-question-resolution/SKILL.md): explicit Known/Uncertain/Recommendation/Question framing and meaningful lettered paths. Advice is evidence-supported; when a factual conclusion is unknown, recommend how to supply or obtain evidence rather than guessing. Natural-language, qualified and nonrecommended answers remain valid; letters are never required, and ordinary updates without questions need no format. Plan, Implement and Review share this presentation but retain contextual clarification, not Research's initial interview. Before Research acknowledgment, only operating/context reads, supplied examples and bounded next-question-supporting lookups are allowed—not broad investigation or solution advice. Research ends the turn and waits for a material answer or readback acknowledgment. You may explicitly defer discovery or acknowledgment and direct investigation under disclosed provisional understanding and actual scope/timing; generic “keep going” pressure is not deferral. Natural-language acknowledgment works, and continuing the same objective reuses its intent trace. Read the saved brief, then manually invoke `/plan` with it; acknowledgment or deferral neither invokes Plan nor waives safety/permission limits.
2. **Plan:** Review the proposed outcome, scope, and acceptance criteria. If they are right, manually invoke `/implement` with the approved saved Plan.
3. **Implement:** Inspect the changes and saved implementation report, then manually invoke `/review` with that report.
4. **Review:** Follow the independent Review disposition. Unresolved findings mean the work is not accepted.

During implementation, the coordinator saves and reads back supported existing Plan progress markers at completion boundaries before moving to unrelated work. A required check must pass before its marker is eligible; if tracking persistence fails, affected IDs are disclosed as unsaved while independent permitted work continues. A final checked state is not proof of when it was saved. Parent-only failure does not erase supported child progress.

### Expected checkpoint planning; conditional execution

Every prospective Plan requires one explicit bounded strategy; every detailed Work Item needs a strategy reference, normal post-validation boundary and coherent content/purpose, or a specific justified exception. Each exception identifies the actual constraint/reason, affected IDs, validation/dependency consequence, later boundary if one exists and why the normal boundary is unsuitable. Empty fields, generic exemptions and unexplained blanket prohibitions fail planning assessment, but actual prohibitions, including historical Plans, still supply no Git authority. Implement compares planned versus actual dispositions at every expected boundary before unrelated work; Review and assurance assess omissions and justification, not commit count as technical acceptance. Runtime obstacles are fresh implementation evidence, never retrospective substantive Plan exceptions. Static checks do not establish semantic completeness, actual Git execution or installed runtime behavior.

A prospective Plan must explicitly include a bounded local staging/append-only commit strategy; approving that inspected Plan approves its covered commits after `/implement`; no separate grant exchange is needed for unchanged covered effects. The Plan must identify the repository/worktree/branch selection rule, content and exclusions, Script Runner ownership, relevant validation, local-policy limits, validity and revocation. A silent, prohibiting or unapproved-option Plan does not authorize Git. Normally, checkpoint eligible coherent work after each completed Work Item before unrelated work, and proactively consider earlier coherent validated Task boundaries in larger items. Explain justified combinations, deferrals and no-commit outcomes; do not invent a count threshold or artificial splits. Checkpoints remain conditional—not a fifth phase, persistence/validation or acceptance gate, and not a requirement to commit every file or Task. Script Runner is the sole Git-mutation executor and still checks the concrete candidate, repository/worktree/branch state, staged content, helpers, validation and effective permission. If the actual project is outside Git or has no eligible changes (including respected ignored/local-only work), checkpointing skips normally and RPIR continues. Missing or inaccessible Git remains unavailable rather than being reported as a no-repository skip. Preserve consumer ignore and local policies. See the [shared checkpoint capability](.github/skills/local-git-checkpoints/SKILL.md) and [RPIR guide](docs/Wiki/rpir.md); authored guidance does not prove installed agent behavior.

Plan, Implement and Review retain contextual material clarification, not Research's initial interview. These are authored workflow expectations, not evidence of installed loading or reliable runtime behavior. For supported corrections to the original criteria, manually resume Implement with the original approved Plan and linked Review context; then obtain a fresh independent Review. Material scope changes need an engineer decision and return to Plan. Prompt availability varies by Copilot surface; see the [RPIR guide](docs/Wiki/rpir.md) for workflow details.

### Complete upfront architectural coverage

After permitted discovery, Research identifies architectural choices; Plan reconciles every choice, including planning discoveries, to inspected ADR coverage. Proportionality governs detail, not coverage, even for small reversible spikes. Verified existing records may be reused without duplicates; meaningful grouping retains each choice's rationale, realistic alternatives, actual selection/pending state, conditions and affected Work Items. One valid binding or a vague umbrella ADR cannot cover omissions. Topology, frontend technology/toolchain baselines and public numeric contracts are architectural examples; routine naming, helper extraction and architecture-preserving repairs remain Implement-owned without ADR reference. Material classification ambiguity goes to the engineer with evidence.

Only Plan may draft a directly associated Proposed ADR under verified consumer conventions and separate guarded destination/directory/file effects. The Plan remains the sole delivery hierarchy and binds each ADR's actual path/ID, identifiable section, inspected substantive version/state, actual agreement evidence, conditions and dependent work. Implement, Review and assurance assess missing/partial coverage even when a valid ADR is bound. Unexpected uncovered or changed architecture needs engineer-directed Plan resolution before dependent effects; independent approved work continues. Unknown destinations, unavailable records and pending decisions/conditions remain explicit gaps, not guessed coverage, Accepted state or a phase-wide veto. Architectural agreement, `/implement` approval and clean delivery Review are distinct; no enterprise approval matrix is invented. See the [architecture decision records capability](.github/skills/architecture-decision-records/SKILL.md) and [RPIR guide](docs/Wiki/rpir.md). These are authored workflow rules; static checks do not prove semantic completeness or installed runtime behavior.

Under the prospective exact-snapshot rule, an explicit `/implement` invocation signs off only the exact Proposed ADR preimage identified in its inspected approved Plan handoff, and only if the rule was already effective before that invocation. The Implement coordinator may separately record the guarded metadata outcome; invocation alone is not proof of persistence, and failed/denied/unverified writes are not `Accepted`. `/plan`, answers, reports, workers, Script Runner, prefills and `/review` are not ADR sign-off. Review remains source-read-only and records delivery acceptance only; assurance is advisory. This prospective policy does not self-upgrade a loaded session, and authored sources do not establish Local or Agent Host runtime behavior.

## Support and further information

- General support: [UKHO Copilot Toolkit repository](https://github.com/UKHO/UKHO.Copilot.Toolkit)
- Security reports: [Security Policy](SECURITY.md) ([UKHO-ITSO@gov.uk](mailto:UKHO-ITSO@gov.uk)). Do not include credentials or sensitive information in public issues.
- Consumers: [RPIR guide](docs/Wiki/rpir.md)
- Maintainers: [Maintain the Toolkit](docs/Wiki/maintain-the-toolkit.md)
- Release notes: [`CHANGELOG.md`](CHANGELOG.md)
- License: [`LICENSE`](LICENSE)
