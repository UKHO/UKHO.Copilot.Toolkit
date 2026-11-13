# Authoritative role profiles

This is the single active recommendation allocation for Toolkit agents. Each row identifies one agent definition by its filename under `.github/agents/`; its Copilot runtime ID is projected as a single scalar preference in that agent's frontmatter. `xhigh` means Extra High; the target effort is declared as `reasoning-effort` intent, not an observed effective setting. Released VS Code 1.146.0 supports the native preference mechanism, but source inspection does not establish availability, effective selection, effort application or the active client.

| Agent definition | Recommended model | Target effort |
| --- | --- | --- |
| `architecture-analyst.agent.md` | `gpt-6.1-sol` | `high` |
| `codebase-investigator.agent.md` | `gpt-6.1-terra` | `high` |
| `correctness-reviewer.agent.md` | `gpt-6.1-sol` | `high` |
| `domain-investigator.agent.md` | `gpt-6.1-terra` | `high` |
| `feasibility-investigator.agent.md` | `gpt-6.1-terra` | `xhigh` |
| `implement.agent.md` | `gpt-6.1-sol` | `high` |
| `implementation-worker.agent.md` | `gpt-6.1-terra` | `xhigh` |
| `maintainability-reviewer.agent.md` | `gpt-6.1-terra` | `high` |
| `plan.agent.md` | `gpt-6.1-sol` | `high` |
| `requirements-analyst.agent.md` | `gpt-6.1-terra` | `high` |
| `research.agent.md` | `gpt-6.1-sol` | `high` |
| `review.agent.md` | `gpt-6.1-sol` | `high` |
| `script-runner.agent.md` | `gpt-6.1-sol` | `high` |
| `security-reviewer.agent.md` | `gpt-6.1-sol` | `high` |
| `stage-assurance.agent.md` | `gpt-6.1-sol` | `high` |
| `test-strategist.agent.md` | `gpt-6.1-terra` | `xhigh` |
| `test-worker.agent.md` | `gpt-6.1-terra` | `high` |
| `validation-worker.agent.md` | `gpt-6-luna` | `high` |

## Capability and consequence rubric

For a new or materially changed role, inspect its actual responsibilities, evidence and output, breadth and ambiguity, consequence of missed constraints, tool/effect boundary, and independent reconciliation. Record the reasoning and choose a single model/effort pair; the current allocation illustrates the following starting points, not an automatic classification by job title:

- **Broad coordination or high-consequence judgment:** Sol/high for lifecycle integration, architecture, correctness/security review, advisory assurance, and command-effect reasoning. Read-only or short work can still have high consequence.
- **Bounded analysis:** Terra/high for focused evidence gathering, requirements, maintainability and test assessment with deliberate reconciliation.
- **Demanding but explicitly scoped work:** Terra/xhigh for bounded feasibility, implementation and test strategy, with coordinator ownership and clear inputs and criteria.
- **Narrow independently reconciled structural validation:** Luna/high where the role is limited and read-only; escalate when semantic authority or difficult boundary analysis is needed.

These are quality-first recommendations informed by role contracts and engineering judgment, not benchmark-proven equivalence or measured savings. Do not automatically lower a delegated role's capability. Add one deliberate profile row for each new suite role and assess supported Copilot configuration and evidence before calling it profile-compliant. Reconcile the profile with the actual contributed inventory; do not treat 18 as a permanent limit.

## Selection, escalation and failure

- Each current agent has its own single native Copilot runtime-ID preference and effort intent. Prefer native defaults, without routine task-call model or effort overrides or parent inheritance. Effective routing on each root and child path, actual compatibility and settings remain unverified until observations establish them.
- Apply an explicit engineer override only through an evidenced, supported path and subject to availability, cost-tier restrictions and actual permission. Do not promise universal picker precedence or remove an approved default when an override is unsupported. Report the override as an exception rather than proof of default routing.
- For a demonstrated reasoning shortfall, consider higher supported effort on the same model; for persistent Terra/xhigh difficulty, Sol/high may be appropriate. Escalate directly to the appropriate coordinator or stronger profile when extra effort is unlikely to resolve a capability or scope gap. Max is not a routine default. Astra is outside routine defaults and automatic fallback; use it only with engineer direction and a supported, permitted route.
- Do not silently downgrade Sol roles or introduce automatic downgrade, Auto, Astra, or ordered fallback. Distinguish the assigned model from the observed effective model and actual override or fallback evidence. If effective selection is unavailable, say “effective model not observable”; if a fallback is observed but its reason is unavailable, say “fallback cause not exposed”. Missing telemetry alone neither proves fallback nor stops independent safe work. A known wrong default is not a successful default-routing observation; diagnose or disclose it. Supported overrides are exceptions, not default-routing proof; never bypass a denial.
- `high` and `xhigh` are recommended target efforts, declared as each role's `reasoning-effort` intent without requiring runtime support proof before declaration. The declaration does not establish runtime consumption, compatibility, harmless ignoring or effective effort; report separately observed effective effort and disclose unobservable or unsupported behavior honestly. Child effort is not assumed to follow the parent. No other unsupported effort control, per-agent context size, token limit or temperature is prescribed. Use model/harness-native context and compaction without claiming a particular capacity.

The forward target is Copilot on VS Code 1.146.0+ within 1.x; actual runtime behavior remains to be observed under separate authorization. A recommendation, configuration, effort declaration or escalation never expands authority, changes tool or delegation boundaries, waives independent Review, turns advisory assurance into acceptance, or authorizes a phase transition or effect.