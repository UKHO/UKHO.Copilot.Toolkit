---
title: Copilot Toolkit artifact catalogue
description: Inventory and activation boundaries for the Toolkit's Copilot customizations
---

## Purpose and audience

**Purpose:** Locate the current GitHub Copilot customization artifacts, understand what each is for and how it activates, and follow the canonical source when maintenance is needed.

**Audience:** Toolkit maintainers and reviewers who need an inventory of the repository's `.github` artifacts. Readers should understand repository-relative paths and the distinction between source artifacts and their manifest registration.

## Prerequisites

- Read [Maintain the Toolkit](maintain-the-toolkit.md) for maintainer orientation before proposing an artifact change.
- Treat `.github/copilot-instructions.md`, the artifact-specific skills, and the lifecycle policy as canonical operational sources; this catalogue is descriptive and does not authorize changes.

## Content

### Activation and packaging model

The manifest registers the discovered lifecycle instruction under `contributes.chatInstructions`, all listed agents under `contributes.chatAgents`, all four prompt files under `contributes.chatPromptFiles`, and its declared skills under `contributes.chatSkills`. The corresponding entries are also included by `package.json.files` (skills are included by directory). These are manifest and source-inventory facts, not proof of installed packaging or runtime activation. Activation remains governed by each artifact's metadata and Copilot surface:

- **Instructions** are authored to provide repository context when their scope applies. The repository-only root instruction is designated always-on here, not contributed to consumers; the contributed lifecycle-record instruction declares numbered-record `applyTo` patterns. A path match is only a candidate, not verified physical lifecycle identity or write authority. Runtime matching, discovery and attachment are not established here.
- **Agents** are selected by a user or delegated by an explicitly allowed coordinator. Coordinator agents are user-invocable unless metadata says otherwise; worker agents in this catalogue declare `user-invocable: false` and are intended for delegation.
- **Prompt files** are deliberate, user-invoked Local shortcuts where prompt files are supported; Agent Host does not load them. A built-in `/plan` is not the Toolkit's RPIR Plan route. Verify an equivalent supported route before relying on these sign-offs in another harness.
- **Skills** are model-selected when relevant or user-invoked when their metadata permits it. Skills marked `user-invocable: false` are internal workflow capabilities.
- **Subagents and handoffs** are runtime mechanisms, not additional file categories. Their configuration is held by the relevant agent.

### Instructions

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Repository-wide policy and artifact governance | Repository-only; always-on guidance for this repository, not packaged or applied to installed consumer workspaces | `.github/copilot-instructions.md` | Review when repository policy, packaging boundaries, lifecycle controls, or customization inventory changes. This source is not listed in the current `package.json` contribution or file arrays. |
| Numbered RPIR lifecycle-record guidance | Twelve declared `applyTo` candidate patterns: eight for historical `docs/planning/` and `docs/delivery/` records and four broad-prefix suffix shapes for numbered topics under a documentation root's direct `copilot/` child (including evidenced nested roots). An unrelated RPIR-shaped `copilot/` path may match; independent physical lifecycle identity, containment and direct lineage still govern action. Actual matching and attachment are not verified. | `.github/instructions/lifecycle-records.instructions.md` | Review when Research root/parent/topic allocation, shared numbered-record lineage, or phase-output evidence changes. This is the one discovered lifecycle instruction listed in `contributes.chatInstructions` and `package.json.files`; declaration does not prove runtime attachment. |

### Custom agents

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Architecture and design trade-off analysis | Delegated worker; `user-invocable: false` | `.github/agents/architecture-analyst.agent.md` | Review when planning evidence, architecture scope, or delegated tools change. |
| Repository structure and pattern investigation | Delegated worker; `user-invocable: false` | `.github/agents/codebase-investigator.agent.md` | Review when repository research boundaries or source-discovery needs change. |
| Functional and acceptance review | Delegated worker; `user-invocable: false` | `.github/agents/correctness-reviewer.agent.md` | Review when implementation acceptance or correctness criteria change. |
| Domain terminology and trusted-source investigation | Delegated worker; `user-invocable: false` | `.github/agents/domain-investigator.agent.md` | Review when domain evidence or source-trust requirements change. |
| Feasibility, dependency, and compatibility investigation | Delegated worker; `user-invocable: false` | `.github/agents/feasibility-investigator.agent.md` | Review when feasibility evidence or compatibility constraints change. |
| Approved scoped implementation coordinator | User-selected coordinator; delegates only its explicit worker allow-list; may use actually permitted direct edit–test–repair tools or optional Script Runner | `.github/agents/implement.agent.md` | Review when implementation approval, edit, command, report, or handoff boundaries change. |
| One assigned implementation work package | Delegated worker; `user-invocable: false`; may edit and run relevant local checks within its assigned scope when actually permitted; no lifecycle or delegation authority | `.github/agents/implementation-worker.agent.md` | Review when worker scope, edit boundaries, or implementation reporting changes. |
| Maintainability and long-term risk review | Delegated worker; `user-invocable: false` | `.github/agents/maintainability-reviewer.agent.md` | Review when documentation, duplication, discoverability, or maintenance criteria change. |
| Research- or material Review-origin Plan coordinator | User-selected coordinator; inspects Research for an initial Plan or material Review context for Plan-owned scope; delegates only its explicit allow-list, including `Domain Investigator` and `Feasibility Investigator` for bounded read-only evidence work | `.github/agents/plan.agent.md` | Review when Plan intake, scope, allocation, investigator routing, or handoff boundaries change. |
| Requirements and acceptance analysis | Delegated worker; `user-invocable: false` | `.github/agents/requirements-analyst.agent.md` | Review when requirements extraction or unresolved-decision handling changes. |
| Evidence-based research coordinator | User-selected coordinator; delegates only its explicit worker allow-list | `.github/agents/research.agent.md` | Review when research evidence, source validation, or research handoff boundaries change. |
| Independent correctness, security, and maintainability review coordinator | User-selected coordinator; source-read-only independent Review; offers manual original-Plan Implement correction or material-scope Plan handoff, never delegates fixes | `.github/agents/review.agent.md` | Review when review evidence, remediation, acceptance, or handoff boundaries change. |
| Goal-directed Script Runner | Optional named coordinator delegate; `user-invocable: false`; chooses task-relevant commands/cwd for bounded phase-scoped goals, with no edit or nested agent tool. Real permissions and managed policy govern execution. Diagnose a local invocation failure and productively correct it when actually permitted; reconcile uncertain destructive/external effects before repetition and never evade denial. | `.github/agents/script-runner.agent.md` | Review when delegated goal scope, phase boundaries, effects inspection or platform permission controls change. |
| Security and policy-boundary review | Delegated worker; `user-invocable: false` | `.github/agents/security-reviewer.agent.md` | Review when tool, delegation, data-exposure, or approval-boundary risks change. |
| Draft completeness and authority-boundary assurance | Delegated worker; `user-invocable: false`; read/search only | `.github/agents/stage-assurance.agent.md` | Review when pre-persistence assurance, draft readiness, or worker boundaries change. |
| Verification and validation strategy | Delegated worker; `user-invocable: false` | `.github/agents/test-strategist.agent.md` | Review when test scenarios or unavailable-check requirements change. |
| Test and verification assessment | Delegated worker; `user-invocable: false` | `.github/agents/test-worker.agent.md` | Review when test-worker scope or no-command boundaries change. |
| Read-only structural implementation validation | Delegated worker; `user-invocable: false` | `.github/agents/validation-worker.agent.md` | Review when structural checks, evidence reporting, or validation boundaries change. |

All 18 agent paths are registered under `package.json` → `contributes.chatAgents` and included by `package.json.files`.

For a new lifecycle Research selects an evidenced documentation root and its direct `copilot/` parent, then a contained numbered topic and Research brief; historical verified `docs/planning/` and `docs/delivery/` topics remain compatible without migration. Each effect needs actual containment and effective permission. Inspect the relevant inventory, select an absent non-overwriting number in the verified topic, save and read back the physical record and direct same-folder predecessor. A collision can be re-inspected and safely reallocated in the same topic; duplicate canonical fields, fingerprints, mandatory double inventories, status rituals and routine terminal probes are not required. An attachment or instruction `applyTo` match is not canonical identity or write authority. Static manifest/source inspection does not prove Local or Agent Host discovery or permission; verify in a separately supported runtime exercise.

An explicit `/implement` with the inspected original approved Plan authorizes its bounded outcome. Supported original-criteria Review findings are evidence for manual resumption of Implement under that Plan, followed by fresh implementation evidence and independent re-review. Material new scope needs an engineer decision and Plan-owned amendment or new Plan; unresolved findings prevent acceptance. An explicit `/review` admits independent Review, not automatic acceptance; a verified clean Review records acceptance independently of optional status mirrors. The agents, skills, instructions and repository policy remain the operational sources.

### Prompt files

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Deliver the inspected approved Plan or resume supported original-criteria Review corrections under that original Plan | Manual Local prompt invocation; `agent: Implement` | `.github/prompts/implement.prompt.md` | Review when Plan intake, correction or effect boundaries change. |
| Plan from inspected Research or engineer-chosen material Review scope | Manual Local prompt invocation; `agent: Plan` | `.github/prompts/plan.prompt.md` | Review when either predecessor kind, material-scope decision or handoff boundary changes. |
| Resume original-Plan Review correction; **changed semantics** from the former deprecated Plan alias, not backward-compatible with it | Manual Local prompt invocation; `agent: Implement`; supported in-boundary corrections only, never material expansion | `.github/prompts/remediate-review.prompt.md` | Retained as the same contributed prompt path; use `/plan` for material new scope. |
| Admit the inspected implementation report to independent Review | Manual Local prompt invocation; `agent: Review` | `.github/prompts/review.prompt.md` | Review when report intake, disposition or report-first terminal boundaries change. |

All four prompt paths remain registered under `package.json` → `contributes.chatPromptFiles` and included by `package.json.files`. A `send: false` handoff pre-fills a prompt; it is not a sign-off or automatic submission. Confirm actual prompt discovery and RPIR semantics in the supported Local harness; Agent Host needs a separately validated supported entry route.

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
| Create or update a human-readable repository Run Book | User-invocable capability; creates guidance only and cannot authorize Runner execution or commands | `.github/skills/create-runbook/SKILL.md` | Review when Run Book anatomy or non-authority boundaries change. |
| Apply lifecycle input, provenance, and phase boundaries | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/rpir-lifecycle-core/SKILL.md` | Review when lifecycle authority, provenance, or confirmation boundaries change. |
| Assess RPIR draft-stage assurance readiness | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/rpir-stage-assurance/SKILL.md` | Review when completeness, traceability, authority, or handoff-readiness checks change. |
| Apply narrow, approved implementation safely | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/safe-implementation/SKILL.md` | Review when implementation scope, validation, or command controls change. |
| Design focused test and validation matrices | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/test-design/SKILL.md` | Review when test scenarios or unavailable-check requirements change. |
| Maintain repository-managed Wiki Markdown | User-invocable capability | `.github/skills/wiki-maintenance/SKILL.md` | Review when page anatomy, source validation, navigation, or RPIR maintenance guidance changes. |

All 14 listed skill directories are discovered from `.github/skills`; the manifest synchronizer derives their `package.json` → `contributes.chatSkills` and `package.json.files` registration. This descriptive inventory is not execution, packaging, or policy authority.

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
