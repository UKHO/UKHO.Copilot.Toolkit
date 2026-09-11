# Copilot Toolkit artifact catalogue

## Purpose and audience

**Purpose:** Locate the current GitHub Copilot customization artifacts, understand what each is for and how it activates, and follow the canonical source when maintenance is needed.

**Audience:** Toolkit maintainers and reviewers who need an inventory of the repository's `.github` artifacts. Readers should understand repository-relative paths and the distinction between source artifacts and their manifest registration.

## Prerequisites

- Read [Maintain the Toolkit](maintain-the-toolkit.md) for maintainer orientation before proposing an artifact change.
- Treat `.github/copilot-instructions.md`, the artifact-specific skills, and the lifecycle policy as canonical operational sources; this catalogue is descriptive and does not authorize changes.

## Content

### Activation and packaging model

The manifest registers the four lifecycle instruction files under `contributes.chatInstructions`, all listed agents under `contributes.chatAgents`, all four prompt files under `contributes.chatPromptFiles`, and its declared skills under `contributes.chatSkills`. The corresponding entries are also included by `package.json.files` (skills are included by directory). Activation remains governed by each artifact's metadata and Copilot surface:

- **Instructions** provide repository context automatically when their scope applies. The root instruction is always-on; the four lifecycle instructions use their declared `applyTo` patterns.
- **Agents** are selected by a user or delegated by an explicitly allowed coordinator. Coordinator agents are user-invocable unless metadata says otherwise; worker agents in this catalogue declare `user-invocable: false` and are intended for delegation.
- **Prompt files** are deliberate, user-invoked shortcuts and route to the agent named in their frontmatter.
- **Skills** are model-selected when relevant or user-invoked when their metadata permits it. Skills marked `user-invocable: false` are internal workflow capabilities.
- **Subagents and handoffs** are runtime mechanisms, not additional file categories. Their configuration is held by the relevant agent.

### Instructions

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Repository-wide policy and artifact governance | Repository-only; always-on guidance for this repository, not packaged or applied to installed consumer workspaces | `.github/copilot-instructions.md` | Review when repository policy, packaging boundaries, lifecycle controls, or customization inventory changes. This source is not listed in the current `package.json` contribution or file arrays. |
| Lifecycle implementation-plan authoring rules | Conditional; `applyTo: docs/{planning,delivery}/**/[0-9][0-9][0-9]-implementation-plan.md` | `.github/instructions/lifecycle-implementation-plans.instructions.md` | Review when lifecycle plan schema, allocation, or authoring controls change. Manifest: `contributes.chatInstructions` and `files`. |
| Lifecycle implementation-report authoring rules | Conditional; `applyTo: docs/{planning,delivery}/**/[0-9][0-9][0-9]-implementation-report.md` | `.github/instructions/lifecycle-implementation-reports.instructions.md` | Review when prospective implementation-report schema or evidence controls change. Manifest: `contributes.chatInstructions` and `files`. |
| Lifecycle research-brief authoring rules | Conditional; `applyTo: docs/{planning,delivery}/**/[0-9][0-9][0-9]-research-brief.md` | `.github/instructions/lifecycle-research-briefs.instructions.md` | Review when lifecycle research schema, allocation, or authoring controls change. Manifest: `contributes.chatInstructions` and `files`. |
| Lifecycle Review-report authoring rules | Conditional; `applyTo: docs/{planning,delivery}/**/[0-9][0-9][0-9]-review-report.md` | `.github/instructions/lifecycle-review-reports.instructions.md` | Review when prospective Review-report schema, disposition, or evidence controls change. Manifest: `contributes.chatInstructions` and `files`. |

### Custom agents

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Architecture and design trade-off analysis | Delegated worker; `user-invocable: false` | `.github/agents/architecture-analyst.agent.md` | Review when planning evidence, architecture scope, or delegated tools change. |
| Repository structure and pattern investigation | Delegated worker; `user-invocable: false` | `.github/agents/codebase-investigator.agent.md` | Review when repository research boundaries or source-discovery needs change. |
| Functional and acceptance review | Delegated worker; `user-invocable: false` | `.github/agents/correctness-reviewer.agent.md` | Review when implementation acceptance or correctness criteria change. |
| Domain terminology and trusted-source investigation | Delegated worker; `user-invocable: false` | `.github/agents/domain-investigator.agent.md` | Review when domain evidence or source-trust requirements change. |
| Feasibility, dependency, and compatibility investigation | Delegated worker; `user-invocable: false` | `.github/agents/feasibility-investigator.agent.md` | Review when feasibility evidence or compatibility constraints change. |
| Approved scoped implementation coordinator | User-selected coordinator; delegates only its explicit worker allow-list | `.github/agents/implement.agent.md` | Review when implementation approval, edit, command, report, or handoff boundaries change. |
| One assigned implementation work package | Delegated worker; `user-invocable: false` | `.github/agents/implementation-worker.agent.md` | Review when worker scope, edit boundaries, or implementation reporting changes. |
| Maintainability and long-term risk review | Delegated worker; `user-invocable: false` | `.github/agents/maintainability-reviewer.agent.md` | Review when documentation, duplication, discoverability, or maintenance criteria change. |
| Approved research-to-plan coordinator | User-selected coordinator; delegates only its explicit allow-list, including `Domain Investigator` and `Feasibility Investigator` for bounded read-only evidence work | `.github/agents/plan.agent.md` | Review when plan authority, scope, allocation, investigator routing, or handoff boundaries change. |
| Requirements and acceptance analysis | Delegated worker; `user-invocable: false` | `.github/agents/requirements-analyst.agent.md` | Review when requirements extraction or unresolved-decision handling changes. |
| Evidence-based research coordinator | User-selected coordinator; delegates only its explicit worker allow-list | `.github/agents/research.agent.md` | Review when research evidence, source validation, or research handoff boundaries change. |
| Independent correctness, security, and maintainability review coordinator | User-selected coordinator; delegates only its explicit worker allow-list | `.github/agents/review.agent.md` | Review when review evidence, remediation, acceptance, or handoff boundaries change. |
| Script Runner catalogue operation executor | User-selected; processes one or more ordered complete, safety-valid root-catalogue entries selected directly or from a compliant Run Book; VS Code Workspace Trust, permissions, and managed organization policy control approval behavior | `.github/agents/script-runner.agent.md` | Review when the Script Runner contract, Run Book selection grammar, allowed classifications, or catalogue controls change. |
| Security and policy-boundary review | Delegated worker; `user-invocable: false` | `.github/agents/security-reviewer.agent.md` | Review when tool, delegation, data-exposure, or approval-boundary risks change. |
| Draft completeness and authority-boundary assurance | Delegated worker; `user-invocable: false`; read/search only | `.github/agents/stage-assurance.agent.md` | Review when pre-persistence assurance, draft readiness, or worker boundaries change. |
| Verification and validation strategy | Delegated worker; `user-invocable: false` | `.github/agents/test-strategist.agent.md` | Review when test scenarios or unavailable-check requirements change. |
| Test and verification assessment | Delegated worker; `user-invocable: false` | `.github/agents/test-worker.agent.md` | Review when test-worker scope or no-command boundaries change. |
| Read-only structural implementation validation | Delegated worker; `user-invocable: false` | `.github/agents/validation-worker.agent.md` | Review when structural checks, evidence reporting, or validation boundaries change. |

All 18 agent paths are registered under `package.json` → `contributes.chatAgents` and included by `package.json.files`.

For lifecycle maintenance, Research briefs remain iterative until valid explicit `/plan` admission closes the exact canonical input. Plan must resolve implementation-relevant evidence before saving an implementation-ready plan; Implement and its workers refuse research, invention, target selection, new commands or dependencies, and unplanned scope or hierarchy changes. These descriptions are consumer guidance only: the packaged agents, skills, instructions, repository policy, and fixed contract verifier remain the operational sources, and manual approvals and handoffs remain required.

### Prompt files

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Launch the approved Implement coordinator | Manual prompt invocation; `agent: Implement` | `.github/prompts/implement.prompt.md` | Review when implementation inputs or approval boundaries change. |
| Launch the Plan coordinator with an approved research brief | Manual prompt invocation; `agent: Plan` | `.github/prompts/plan.prompt.md` | Review when planning inputs or handoff boundaries change. |
| Launch an approved Review remediation pass | Manual prompt invocation; `agent: Implement` | `.github/prompts/remediate-review.prompt.md` | Review when remediation linkage or approval requirements change. |
| Launch the independent Review coordinator | Manual prompt invocation; `agent: Review` | `.github/prompts/review.prompt.md` | Review when review inputs, evidence, or acceptance boundaries change. |

All four prompt paths are registered under `package.json` → `contributes.chatPromptFiles` and included by `package.json.files`.

### Skills

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Resolve material clarification and decision questions | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/agent-question-resolution/SKILL.md` | Review when unknown-resolution or fail-closed rules change. |
| Convert requirements and evidence into an implementation plan | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/architecture-planning/SKILL.md` | Review when planning method or acceptance design changes. |
| Review customization and policy-boundary defects | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/code-review/SKILL.md` | Review when review criteria, severity reporting, or policy-boundary checks change. |
| Research repository structure and constraints | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/codebase-research/SKILL.md` | Review when research procedure, evidence, or source-boundary expectations change. |
| Create and validate a focused custom agent | User-invocable capability | `.github/skills/create-copilot-agent/SKILL.md` | Review when agent metadata, tool-boundary, or validation guidance changes. |
| Create and validate a focused custom instruction | User-invocable capability | `.github/skills/create-copilot-instruction/SKILL.md` | Review when instruction scope or discovery guidance changes. |
| Create and validate a focused prompt file | User-invocable capability | `.github/skills/create-copilot-prompt/SKILL.md` | Review when prompt inputs, activation, or side-effect boundaries change. |
| Create and validate a resource-backed skill | User-invocable capability | `.github/skills/create-copilot-skill/SKILL.md` | Review when skill structure, resources, or validation guidance changes. |
| Create or update a human-readable repository Run Book | User-invocable capability; creates guidance only and cannot authorize Runner execution, commands, or catalogue mutation | `.github/skills/create-runbook/SKILL.md` | Review when Run Book anatomy, conditional Runner selection grammar, or non-authority boundaries change. |
| Define and validate complete, safety-valid Script Runner catalogue operations | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/repository-script-catalogue/SKILL.md` | Review when the ten-field catalogue-entry contract or execution classifications change. |
| Apply lifecycle input, provenance, and phase boundaries | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/rpir-lifecycle-core/SKILL.md` | Review when lifecycle authority, provenance, or confirmation boundaries change. |
| Assess RPIR draft-stage assurance readiness | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/rpir-stage-assurance/SKILL.md` | Review when completeness, traceability, authority, or handoff-readiness checks change. |
| Apply narrow, approved implementation safely | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/safe-implementation/SKILL.md` | Review when implementation scope, validation, or command controls change. |
| Design focused test and validation matrices | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/test-design/SKILL.md` | Review when test scenarios or unavailable-check requirements change. |
| Maintain repository-managed Wiki Markdown | User-invocable capability | `.github/skills/wiki-maintenance/SKILL.md` | Review when page anatomy, source validation, navigation, or RPIR maintenance guidance changes. |

All 15 listed skill directories are discovered from `.github/skills`; the manifest synchronizer derives their `package.json` → `contributes.chatSkills` and `package.json.files` registration. This descriptive inventory is not execution, packaging, or policy authority.

## Canonical references

- [`package.json`](../../package.json) — manifest contribution arrays and packaged-file inventory.
- [Repository guidance](../../.github/copilot-instructions.md) — canonical policy, lifecycle boundaries, and packaging distinctions.
- [RPIR lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) — lifecycle authority and phase boundaries.

## Related links

- [Keeping the Wiki current](keeping-the-wiki-current.md) — bounded procedure for updating this catalogue and other Wiki pages.
- [Wiki maintenance skill](../../.github/skills/wiki-maintenance/SKILL.md) — canonical Wiki scope and maintenance procedure.
- [Wiki page template](../../.github/skills/wiki-maintenance/templates/wiki-page.md) — required page anatomy.
- [Wiki validation checklist](../../.github/skills/wiki-maintenance/references/wiki-validation-checklist.md) — manual structure, source, and navigation checks.

## Next steps

- Maintainers should consult the canonical source path before changing an artifact.
- Before a substantive catalogue update, follow [Keeping the Wiki current](keeping-the-wiki-current.md) and the repository RPIR controls.
- Reconcile this inventory when `package.json` contribution arrays, packaged paths, or `.github` artifact metadata changes.
