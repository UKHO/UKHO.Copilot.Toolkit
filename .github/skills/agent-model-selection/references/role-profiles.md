# Authoritative role profiles

This is the single active recommendation allocation for Toolkit agents. Each row identifies one agent definition by its filename under `.github/agents/`; its Copilot runtime ID is projected as a single scalar preference in that agent's frontmatter. The current 18-role profile assigns four coordinators `gpt-6.1-sol`, `high` reasoning and `required` model policy; the other 14 use `hydrafusion` with Fusion-managed reasoning and no authored `reasoning-effort` or `model-policy` override. Omission does not clear inherited or external configuration or establish effective reasoning. Released VS Code 1.146.0 supports the native preference mechanism, but source inspection does not establish availability, effective selection or the active client.

| Agent definition | Recommended model | Reasoning policy | Selection policy |
| --- | --- | --- | --- |
| `architecture-analyst.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `codebase-investigator.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `correctness-reviewer.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `domain-investigator.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `feasibility-investigator.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `implement.agent.md` | `gpt-6.1-sol` | High; authored override | Required |
| `implementation-worker.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `maintainability-reviewer.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `plan.agent.md` | `gpt-6.1-sol` | High; authored override | Required |
| `requirements-analyst.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `research.agent.md` | `gpt-6.1-sol` | High; authored override | Required |
| `review.agent.md` | `gpt-6.1-sol` | High; authored override | Required |
| `script-runner.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `security-reviewer.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `stage-assurance.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `test-strategist.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `test-worker.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |
| `validation-worker.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |

## Capability and consequence rubric

The current 18-role candidate distinguishes the four coordinators from the Fusion specialists without asserting that their responsibilities or consequences are interchangeable. For a new or materially changed role, inspect its actual responsibilities, evidence and output, breadth and ambiguity, consequence of missed constraints, tool/effect boundary, and independent reconciliation. Record the reasoning and choose a supported model preference and applicable reasoning policy; the current classifications below inform that judgment, not an automatic assignment by job title:

- **Broad coordination or high-consequence judgment:** Lifecycle integration, architecture, correctness/security review, advisory assurance, and command-effect reasoning require careful capability and boundary assessment. Read-only or short work can still have high consequence.
- **Bounded analysis:** Focused evidence gathering, requirements, maintainability and test assessment need deliberate reconciliation against their evidence scope.
- **Demanding but explicitly scoped work:** Bounded feasibility, implementation and test strategy need clear inputs, criteria and coordinator ownership.
- **Narrow independently reconciled structural validation:** A limited read-only role may use a narrower capability; escalate when semantic authority or difficult boundary analysis is needed.

These distinctions preserve role classification and inform future choices; they do not prove either candidate's adequacy or measured benefit. Do not automatically lower a delegated role's capability. Add one deliberate profile row for each new suite role and assess supported Copilot configuration and evidence before calling it profile-compliant. Reconcile the profile with the actual contributed inventory; do not treat 18 as a permanent limit or automatically extend this candidate to future roles.

## Selection, escalation and failure

- Each current agent projects its profile's single native model and declared reasoning and selection policies: the four coordinators author `reasoning-effort: high` and `model-policy: required`; the 14 specialists omit both fields. Prefer native defaults, without routine task-call model overrides or parent model inheritance. Effective routing on each root and child path, actual compatibility and settings remain unverified until observations establish them.
- Apply an explicit engineer override only through an evidenced, supported path and subject to availability, cost-tier restrictions and actual permission. Do not promise universal picker precedence or remove an approved default when an override is unsupported. Report the override as an exception rather than proof of default routing.
- Escalate directly to the appropriate coordinator or stronger profile when model capability is unlikely to resolve a scope gap. Fusion Max is not a routine default; use it only for explicit, supported task-specific escalation with engineer direction.
- Do not substitute another tier, automatic downgrade or ordered fallback for an unavailable or incorrectly observed preference. Distinguish the assigned model from the observed effective model and actual override or fallback evidence. If effective selection is unavailable, say “effective model not observable”; if a fallback is observed but its reason is unavailable, say “fallback cause not exposed”. Missing telemetry alone neither proves fallback nor stops independent safe work. A known wrong default is not a successful default-routing observation; diagnose or disclose it. Supported overrides are exceptions, not default-routing proof; never bypass a denial.
- The current Fusion specialist profile authors no per-agent reasoning override. This omission does not establish that inherited or external settings are absent or that Fusion's effective reasoning is known; report only separately observed effective effort and say when it is unobservable. Do not prescribe unsupported per-agent effort, context size, token limit or temperature controls. Use model/harness-native context and compaction without claiming a particular capacity.

The forward target is Copilot on VS Code 1.146.0+ within 1.x; actual runtime behavior remains to be observed under separate authorization. A recommendation, configuration or escalation never expands authority, changes tool or delegation boundaries, waives independent Review, turns advisory assurance into acceptance, or authorizes a phase transition or effect.