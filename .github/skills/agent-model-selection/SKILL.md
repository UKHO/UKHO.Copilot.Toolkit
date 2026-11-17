---
name: agent-model-selection
description: Select and maintain role-based Copilot model and effort preferences for Toolkit agents, with capability classification, supported overrides, and observation limits.
user-invocable: false
---

# Agent model selection

## Purpose and inputs

Use this internal capability when selecting, creating, or maintaining a Toolkit agent's role profile. Inspect the role's responsibilities, consequence of failure, authority and invocation paths, the applicable approved scope, and the [authoritative role profiles](references/role-profiles.md). Forward delivery targets the Copilot harness on VS Code 1.146.0+ within 1.x; this is not evidence of the active client or runtime.

## Procedure

1. For the current 18 roles, use the profile's single `hydrafusion` preference and Fusion-managed reasoning policy. For a new or changed role, apply the profile's capability/consequence rubric and justify one recommendation; do not silently default an unknown role or assume a fixed inventory ceiling.
2. Keep the assigned model, configured preference, authored reasoning policy, and separately observed effective model and effort distinct. Each agent projects one profile runtime ID as a scalar native preference. Configuration does not establish entitlement, availability or effective dispatch.
3. Before model configuration, inspect evidence for the exact reference, supported Copilot path, compatibility and permission. A new suite role needs a profile entry and supported native preference; a Markdown link does not configure or enforce selection. Prefer native defaults without routine task-call model or effort overrides or parent inheritance.
4. The current 18-role profile omits `reasoning-effort` so Fusion manages reasoning. Omission does not clear inherited or external configuration or establish effective effort; report only actual observations separately when an authorized check exposes them. Do not add a per-agent effort value without a separately supported and approved policy.
5. Apply only evidenced, supported engineer overrides and the profile's escalation and unavailable-model rules. Report assigned versus observed effective model and actual override or fallback evidence. Say “effective model not observable” when unknown and “fallback cause not exposed” when fallback is observed without its cause; do not infer fallback from missing telemetry. A known wrong default is not a pass; unknown telemetry alone does not stop independent safe work.

## Output and boundary

Report role and classification rationale, assigned model and Fusion-managed reasoning policy, separately evidenced model configuration and observed settings, supported override path if any, and unresolved limitations. Do not claim effective routing, effort enforcement, installed loading, or compatibility from this Skill or static checks alone. Runtime observations and activation require separate authorization.

Model choice or escalation never grants tools, edits, commands, delegation, lifecycle ownership, approval, acceptance, or permission to bypass a denial. Preserve the role's existing boundaries and manual transitions. Do not add a router, fallback array, account setting, per-agent context cap, token limit, temperature, or other unsupported effort control.