---
name: "<topic>"
description: "<rule, when it applies, and relevant repository vocabulary>"
applyTo: ""
---

# <Instruction topic>

<!-- Choose a narrow workspace-relative applyTo only after checking the intended and excluded paths. -->

## Applies to

- **Intended files or tasks:** <name the specific files, paths, or tasks this rule covers>
- **Does not apply to:** <name representative nearby or unrelated files or tasks that must not match>

## Rule

- **MUST:** <state the required convention as an observable action>
- **SHOULD:** <state the preferred approach and any justified exceptions>
- **MUST NOT:** <state prohibited behavior and the safe stop when the rule cannot be followed>

## Rationale

<Explain why this convention is needed. Keep the rationale consistent with the defined scope.>

## Validation

- Check one representative intended path and confirm it matches `applyTo`.
- Check one representative excluded path and confirm it does not match `applyTo`.
- Check applicable instructions for conflicts; stop and investigate or ask for clarification if matching rules conflict.
- Check the frontmatter, examples, relative links, and one representative request that should follow this rule.
- Use VS Code Chat References and Diagnostics when instruction attachment is uncertain; do not claim runtime attachment from static inspection alone.

## References

- <Add relative links to inspected repository standards or source documents; remove this placeholder when none are needed.>