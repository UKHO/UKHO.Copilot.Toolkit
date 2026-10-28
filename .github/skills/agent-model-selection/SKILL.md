---
name: agent-model-selection
description: Select and maintain role-based model and effort recommendations for Toolkit agents, with capability classification, supported overrides, and Local evidence limits.
user-invocable: false
---

# Agent model selection

## Purpose and inputs

Use this internal capability when selecting, creating, or maintaining a Toolkit agent's role profile. Inspect the role's responsibilities, consequence of failure, authority and invocation paths, the applicable approved scope, and the [authoritative role profiles](references/role-profiles.md). This delivery targets the VS Code Local harness only; Copilot is a separate follow-on, not an implied compatibility claim.

## Procedure

1. For a current role, use its single model and target effort from the profile. For a new or changed role, apply the profile's capability/consequence rubric and justify one recommendation; do not silently default an unknown role or assume a fixed inventory ceiling.
2. Keep the recommendation, a supported configured preference, and the observed effective model and effort distinct. The model names in the profile are identities, not verified editor configuration literals. Do not infer a vendor, ID, entitlement, or tool argument from them.
3. Before any configuration, inspect evidence for the exact reference, supported Local path, compatibility and permission. Native automatic model selection is the required delivery outcome, but a Markdown link does not configure or enforce it. A new suite role is not profile-compliant without a profile entry and supported automatic Local configuration; disclose unresolved evidence rather than claiming success.
4. Treat effort as a target: configure or describe a control only where supported and evidenced. Do not assume a root effort propagates to a child or report unobserved effort as effective. Record actual observed settings separately when an authorized check exposes them.
5. Apply only evidenced, supported engineer overrides and the profile's escalation and unavailable-model rules. If the assigned model or effective selection cannot be verified, report the gap; an override is an exception, not evidence that default routing worked. Hold affected acceptance for engineer direction if required automatic selection cannot be established.

## Output and boundary

Report role and classification rationale, recommended model and target effort, separately evidenced configuration and observed settings, supported override path if any, and unresolved limitations. Do not claim automatic routing, effort enforcement, installed loading, or compatibility from this Skill or static checks alone. Required Local routing observations and activation require separate authorization.

Model choice or escalation never grants tools, edits, commands, delegation, lifecycle ownership, approval, acceptance, or permission to bypass a denial. Preserve the role's existing boundaries and manual transitions. Do not add a router, fallback array, account setting, per-agent context cap, token limit, temperature, or unsupported effort control.