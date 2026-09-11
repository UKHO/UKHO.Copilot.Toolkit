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
- Packaging identity: `ukho-copilot-toolkit`
- Exact literal command: `node scripts/sync-copilot-manifest.cjs sync`
- Fixed workspace-relative cwd: `.`
- Enumerated arguments:
  - `none`
- Expected outputs/writes:
  - `package.json.files controlled-root entries`
  - `package.json.contributes.chatInstructions`
  - `package.json.contributes.chatAgents`
  - `package.json.contributes.chatPromptFiles`
  - `package.json.contributes.chatSkills`
  - `One contained, transient, randomly named atomic temporary path that is removed after replacement or failure handling`
- Prohibited effects:
  - `No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass.`
- Prerequisites:
  - `Workspace Trust.`
  - `Fixed root cwd.`
  - `Readable, parseable package.json whose name is exactly ukho-copilot-toolkit.`
  - `Declared fixed toolkit-discover-copilot-artifacts probe captures complete sorted JSON inventory.`
  - `Immediately before sync, rerun that exact probe and require byte-for-byte equality; the synchronizer's existing immediate discover() comparison/write remains a second check.`
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
  - `ukho-copilot-toolkit-<package.json version>.vsix, derived as ${name}-${version}.vsix.`
- Prohibited effects:
  - `No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass.`
- Prerequisites:
  - `Workspace Trust.`
  - `Fixed root cwd.`
  - `Readable, parseable package.json whose name is ukho-copilot-toolkit.`
  - `Declared package script and fixed local @vscode/vsce executable exist.`
  - `Local package dependencies exist.`
  - `Immediately preceding successful requested toolkit-check-copilot-manifest operation with no requested intervening operation; at that check capture complete package.json bytes and declared fixed discovery-probe sorted JSON.`
  - `Immediately before packaging, reread/reprobe and require byte-for-byte equality.`
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