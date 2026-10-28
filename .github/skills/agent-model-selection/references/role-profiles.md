# Authoritative role profiles

This is the single active recommendation allocation for Toolkit agents. Each row identifies one agent definition by its filename under `.github/agents/`; the model is also configured as a single display-name preference in that agent's frontmatter. `xhigh` means Extra High; the target effort is declared as `reasoning-effort` intent, not an observed effective setting. VS Code 1.137.0's inspected matcher accepts an exact display name for its built-in Copilot vendor; other providers may require a qualified name. This source inspection does not establish that the models are available or actually selected on every path or version, and provider IDs and tool arguments are not interchangeable with display names.

| Agent definition | Recommended model | Target effort |
| --- | --- | --- |
| `architecture-analyst.agent.md` | GPT-6.1 Sol | `high` |
| `codebase-investigator.agent.md` | GPT-6.1 Terra | `high` |
| `correctness-reviewer.agent.md` | GPT-6.1 Sol | `high` |
| `domain-investigator.agent.md` | GPT-6.1 Terra | `high` |
| `feasibility-investigator.agent.md` | GPT-6.1 Terra | `xhigh` |
| `implement.agent.md` | GPT-6.1 Sol | `high` |
| `implementation-worker.agent.md` | GPT-6.1 Terra | `xhigh` |
| `maintainability-reviewer.agent.md` | GPT-6.1 Terra | `high` |
| `plan.agent.md` | GPT-6.1 Sol | `high` |
| `requirements-analyst.agent.md` | GPT-6.1 Terra | `high` |
| `research.agent.md` | GPT-6.1 Sol | `high` |
| `review.agent.md` | GPT-6.1 Sol | `high` |
| `script-runner.agent.md` | GPT-6.1 Sol | `high` |
| `security-reviewer.agent.md` | GPT-6.1 Sol | `high` |
| `stage-assurance.agent.md` | GPT-6.1 Sol | `high` |
| `test-strategist.agent.md` | GPT-6.1 Terra | `xhigh` |
| `test-worker.agent.md` | GPT-6.1 Terra | `high` |
| `validation-worker.agent.md` | GPT-6 Luna | `high` |

## Capability and consequence rubric

For a new or materially changed role, inspect its actual responsibilities, evidence and output, breadth and ambiguity, consequence of missed constraints, tool/effect boundary, and independent reconciliation. Record the reasoning and choose a single model/effort pair; the current allocation illustrates the following starting points, not an automatic classification by job title:

- **Broad coordination or high-consequence judgment:** Sol/high for lifecycle integration, architecture, correctness/security review, advisory assurance, and command-effect reasoning. Read-only or short work can still have high consequence.
- **Bounded analysis:** Terra/high for focused evidence gathering, requirements, maintainability and test assessment with deliberate reconciliation.
- **Demanding but explicitly scoped work:** Terra/xhigh for bounded feasibility, implementation and test strategy, with coordinator ownership and clear inputs and criteria.
- **Narrow independently reconciled structural validation:** Luna/high where the role is limited and read-only; escalate when semantic authority or difficult boundary analysis is needed.

These are quality-first recommendations informed by role contracts and engineering judgment, not benchmark-proven equivalence or measured savings. Do not automatically lower a delegated role's capability. Add one deliberate profile row for each new suite role and assess supported automatic Local configuration and evidence before calling it profile-compliant. Reconcile the profile with the actual contributed inventory; do not treat 18 as a permanent limit.

## Selection, escalation and failure

- The selected design requires an assigned model to be selected automatically on each supported Local root and child path. Each current agent has a single native display-name preference; this reference is not configuration inheritance. Apply any additional same-profile projection only when separately evidenced as necessary. Effective routing on each path, floor/current compatibility and actual settings remain unverified until observations establish them.
- Apply an explicit engineer override only through an evidenced, supported path and subject to availability, cost-tier restrictions and actual permission. Do not promise universal picker precedence or remove an approved default when an override is unsupported. Report the override as an exception rather than proof of default routing.
- For a demonstrated reasoning shortfall, consider higher supported effort on the same model; for persistent Terra/xhigh difficulty, Sol/high may be appropriate. Escalate directly to the appropriate coordinator or stronger profile when extra effort is unlikely to resolve a capability or scope gap. Max is not a routine default. Astra is outside routine defaults and automatic fallback; use it only with engineer direction and a supported, permitted route.
- Do not silently downgrade Sol roles or introduce automatic downgrade, Auto, Astra, or ordered fallback. If an assigned model is unavailable, unmatched, or its effective selection is unverified, disclose it and do not call the run profile-compliant. A native no-match failure may leave the previous model selected; it is not fail-closed enforcement. Resolve the affected selection through supported routes or return it for engineer direction, never bypass a denial.
- `high` and `xhigh` are recommended target efforts, declared as each role's `reasoning-effort` intent without requiring runtime support proof before declaration. The declaration does not establish runtime consumption, compatibility, harmless ignoring or effective effort; report separately observed effective effort and disclose unobservable or unsupported behavior honestly. Local child effort is not assumed to follow the parent. No other unsupported effort control, per-agent context size, token limit or temperature is prescribed. Use model/harness-native context and compaction without claiming a particular capacity.

The profile is Local-only for this delivery; Copilot behavior is not established. A recommendation, configuration, effort declaration or escalation never expands authority, changes tool or delegation boundaries, waives independent Review, turns advisory assurance into acceptance, or authorizes a phase transition or effect.