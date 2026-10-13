---
description: "[Describe the single action, when to use this prompt, and expected result.]"
# Optional: replace with an existing suitable agent, or remove this field if none is needed.
agent: "<existing-agent-name>"
---

# [One-job prompt title]

## Purpose

[State the one focused job this prompt performs and the expected result.]

## When to use

[State the specific request or condition that makes this prompt useful. For sustained role ownership or a multi-step workflow, use a suitable agent or Skill instead.]

## Inputs

- **Required:** `${input:required_context:Describe the required input}`
- **Optional:** `${input:optional_context:Describe optional context, or leave blank}`

If required input is missing or ambiguous, MUST stop and ask for it; MUST NOT guess or perform the affected action.

## Constraints

- **MUST:** Keep this prompt focused on the single stated job and preserve the selected agent's intended role and boundaries.
- **MUST NOT:** Declare a `tools` field by default or use a prompt-level tool override to broaden the selected agent's intended capabilities.
- **MUST:** If an override is independently justified, keep it minimal and verify it is compatible with the selected agent's boundary.
- **MUST NOT:** Proceed when the required agent is missing or unavailable, or a proposed side effect is unsafe or unclear; stop and request clarification or a safe, explicit decision.
- **SHOULD:** Prefer inspection and a proposed outcome before edits or commands, when relevant to the job.
- **MUST NOT:** Claim Agent Host portability or equivalent selection/tool behavior without separate evidence; this is a VS Code Local convenience.

## Process

1. Check that required inputs and the selected agent are available.
2. Perform only the stated one-job request within the constraints above.
3. Stop if required information is missing, the agent is missing or unavailable, or an unsafe or unclear side effect is necessary.

## Output

[Specify the expected result, format and destination, success conditions, and any limits or unresolved issues.]
