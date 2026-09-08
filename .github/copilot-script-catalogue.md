# Toolkit Script Runner catalogue

## Operation: `toolkit-discover-copilot-artifacts`

- Stable operation ID: `toolkit-discover-copilot-artifacts`
- Classification: `read-only`
- Packaging identity: `none`
- Exact literal command: `node scripts/discover-copilot-artifacts.cjs`
- Fixed workspace-relative cwd: `.`
- Enumerated arguments:
  - `none`
- Expected outputs/writes:
  - `none`
- Prohibited effects:
  - `No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass.`
- Prerequisites:
  - `Workspace Trust.`
  - `Repository root is the fixed working directory.`
- Failure disposition: `Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.`

## Operation: `toolkit-check-copilot-manifest`

- Stable operation ID: `toolkit-check-copilot-manifest`
- Classification: `read-only`
- Packaging identity: `none`
- Exact literal command: `node scripts/sync-copilot-manifest.cjs check`
- Fixed workspace-relative cwd: `.`
- Enumerated arguments:
  - `none`
- Expected outputs/writes:
  - `none`
- Prohibited effects:
  - `No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass.`
- Prerequisites:
  - `Workspace Trust.`
  - `Repository root is the fixed working directory.`
- Failure disposition: `Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.`

## Operation: `toolkit-sync-copilot-manifest`

- Stable operation ID: `toolkit-sync-copilot-manifest`
- Classification: `packaging-controlled-write`
- Packaging identity: `ukho.copilot-toolkit`
- Exact literal command: `node scripts/sync-copilot-manifest.cjs sync`
- Fixed workspace-relative cwd: `.`
- Enumerated arguments:
  - `none`
- Expected outputs/writes:
  - `package.json.files entries under .github/instructions, .github/agents, .github/prompts, and .github/skills collectively`
  - `package.json.contributes.chatInstructions`
  - `package.json.contributes.chatAgents`
  - `package.json.contributes.chatPromptFiles`
  - `package.json.contributes.chatSkills`
  - `One contained, transient, randomly named atomic temporary path that is removed after replacement or failure handling`
- Prohibited effects:
  - `No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass.`
- Prerequisites:
  - `Workspace Trust.`
  - `Repository root is the fixed working directory.`
  - `A successful reviewed manifest check and understood drift.`
- Failure disposition: `Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.`

## Operation: `toolkit-package-vsix`

- Stable operation ID: `toolkit-package-vsix`
- Classification: `build/test`
- Packaging identity: `none`
- Exact literal command: `npm run package`
- Fixed workspace-relative cwd: `.`
- Enumerated arguments:
  - `none`
- Expected outputs/writes:
  - `ukho.copilot-toolkit-1.0.0.vsix`
- Prohibited effects:
  - `No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass.`
- Prerequisites:
  - `Workspace Trust.`
  - `Repository root is the fixed working directory.`
  - `Reviewed package.json and packaging inputs.`
  - `Existing local package dependencies required by the package script.`
- Failure disposition: `Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.`

## Operation: `toolkit-verify-vsix-boundary`

- Stable operation ID: `toolkit-verify-vsix-boundary`
- Classification: `read-only`
- Packaging identity: `none`
- Exact literal command: `npm run verify-package`
- Fixed workspace-relative cwd: `.`
- Enumerated arguments:
  - `none`
- Expected outputs/writes:
  - `none`
- Prohibited effects:
  - `No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass.`
- Prerequisites:
  - `Workspace Trust.`
  - `Repository root is the fixed working directory.`
  - `The expected version-derived VSIX exists.`
- Failure disposition: `Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.`

## Operation: `toolkit-verify-copilot-contracts`

- Stable operation ID: `toolkit-verify-copilot-contracts`
- Classification: `read-only`
- Packaging identity: `none`
- Exact literal command: `npm run verify-copilot-contracts`
- Fixed workspace-relative cwd: `.`
- Enumerated arguments:
  - `none`
- Expected outputs/writes:
  - `none`
- Prohibited effects:
  - `No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass.`
- Prerequisites:
  - `Repository root is the fixed working directory.`
- Failure disposition: `Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.`