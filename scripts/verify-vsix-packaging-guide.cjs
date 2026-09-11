'use strict';

const fs = require('fs');
const path = require('path');
const { classes } = require('./discover-copilot-artifacts.cjs');

const root = path.resolve(__dirname, '..');
const guidePath = path.join(root, 'docs', 'run-books', 'vsix-packaging.md');
const manifestPath = path.join(root, 'package.json');
const synchronizerPath = path.join(root, 'scripts', 'sync-copilot-manifest.cjs');
const metadataStart = '<!-- vsix-packaging-operation-metadata:start -->';
const metadataEnd = '<!-- vsix-packaging-operation-metadata:end -->';
const expectedPackageScripts = {
  'verify-copilot-contracts': 'node scripts/verify-copilot-contracts.cjs',
  'verify-vsix-packaging-guide': 'node scripts/verify-vsix-packaging-guide.cjs',
  package: "node -e \"const fs=require('fs');const cp=require('child_process');const p=JSON.parse(fs.readFileSync('package.json','utf8'));const bin=process.platform==='win32'?'node_modules/@vscode/vsce/vsce':'node_modules/.bin/vsce';const r=cp.spawnSync(process.execPath,[bin,'package','--allow-missing-repository','--out',`${p.name}-${p.version}.vsix`],{stdio:'inherit'});process.exit(r.status===null?1:r.status)\"",
  'verify-package': 'node scripts/verify-vsix-boundary.cjs'
};
const prohibitedEffects = [
  'No dependency installation, secrets, authentication, publishing, deployment, release/tag, remote mutation, global configuration, external-path write, shell composition, redirection, substitution, aliases, wildcards, traversal, npx, arbitrary interpreter or script target, recursive deletion, or safety-control bypass.'
];
const stopBehavior = 'Stop on an error, prompt, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared write, or missing prerequisite; investigate the underlying issue without substituting a command.';
const expectedOperations = [
  {
    id: 'toolkit-verify-copilot-contracts',
    classification: 'read-only',
    packagingIdentity: 'none',
    command: 'npm run verify-copilot-contracts',
    cwd: '.',
    arguments: [],
    outputsOrWrites: [],
    effects: ['Verifies fixed-root customization contracts and manifest parity without workspace mutation.'],
    prerequisites: ['Repository root is the fixed working directory.'],
    stopBehavior,
    prohibitedEffects
  },
  {
    id: 'toolkit-discover-copilot-artifacts',
    classification: 'read-only',
    packagingIdentity: 'none',
    command: 'node scripts/discover-copilot-artifacts.cjs',
    cwd: '.',
    arguments: [],
    outputsOrWrites: [],
    effects: ['Reports the sorted customization inventory as JSON without workspace mutation.'],
    prerequisites: ['Workspace Trust.', 'Repository root is the fixed working directory.'],
    stopBehavior,
    prohibitedEffects
  },
  {
    id: 'toolkit-check-copilot-manifest',
    classification: 'read-only',
    packagingIdentity: 'none',
    command: 'node scripts/sync-copilot-manifest.cjs check',
    cwd: '.',
    arguments: [],
    outputsOrWrites: [],
    effects: ['Checks the discovered inventory against controlled manifest values without writing package.json.'],
    prerequisites: ['Workspace Trust.', 'Repository root is the fixed working directory.'],
    stopBehavior,
    prohibitedEffects
  },
  {
    id: 'toolkit-sync-copilot-manifest',
    classification: 'packaging-controlled-write',
    packagingIdentity: 'ukho-copilot-toolkit',
    command: 'node scripts/sync-copilot-manifest.cjs sync',
    cwd: '.',
    arguments: [],
    outputsOrWrites: [
      'package.json.files entries under .github/instructions, .github/agents, .github/prompts, and .github/skills collectively',
      'package.json.contributes.chatInstructions',
      'package.json.contributes.chatAgents',
      'package.json.contributes.chatPromptFiles',
      'package.json.contributes.chatSkills',
      'One contained, transient, randomly named atomic temporary path that is removed after replacement or failure handling'
    ],
    effects: ['Synchronizes only the declared packaging manifest locations after the declared prerequisite probe comparison succeeds.'],
    prerequisites: ['Workspace Trust.', 'Fixed root cwd.', 'Readable, parseable package.json whose name is exactly ukho-copilot-toolkit.', 'Declared fixed toolkit-discover-copilot-artifacts probe captures complete sorted JSON inventory.', "Immediately before sync, rerun that exact probe and require byte-for-byte equality; the synchronizer's existing immediate discover() comparison/write remains a second check."],
    stopBehavior,
    prohibitedEffects
  },
  {
    id: 'toolkit-package-vsix',
    classification: 'build/test',
    packagingIdentity: 'none',
    command: 'npm run package',
    cwd: '.',
    arguments: [],
    outputsOrWrites: ['ukho-copilot-toolkit-<package.json version>.vsix, derived as ${name}-${version}.vsix.'],
    effects: ['Creates the version-derived VSIX after the declared current-state prerequisite checks succeed.'],
    prerequisites: ['Workspace Trust.', 'Fixed root cwd.', 'Readable, parseable package.json whose name is ukho-copilot-toolkit.', 'Declared package script and fixed local @vscode/vsce executable exist.', 'Local package dependencies exist.', 'Immediately preceding successful requested toolkit-check-copilot-manifest operation with no requested intervening operation; at that check capture complete package.json bytes and declared fixed discovery-probe sorted JSON.', 'Immediately before packaging, reread/reprobe and require byte-for-byte equality.'],
    stopBehavior,
    prohibitedEffects
  },
  {
    id: 'toolkit-verify-vsix-boundary',
    classification: 'read-only',
    packagingIdentity: 'none',
    command: 'npm run verify-package',
    cwd: '.',
    arguments: [],
    outputsOrWrites: [],
    effects: ['Verifies the generated VSIX boundary, manifest contributions, and packaged README changelog link without workspace mutation.'],
    prerequisites: ['Workspace Trust.', 'Repository root is the fixed working directory.', 'The expected version-derived VSIX exists.'],
    stopBehavior,
    prohibitedEffects
  }
];

function fail(message) {
  throw new Error(message);
}

function equal(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function readPackageManifest() {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`Cannot parse package.json: ${error.message}`);
  }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || !manifest.scripts || typeof manifest.scripts !== 'object' || Array.isArray(manifest.scripts)) {
    fail('package.json must contain a scripts object');
  }
  for (const [name, expected] of Object.entries(expectedPackageScripts)) {
    if (manifest.scripts[name] !== expected) fail(`package.json scripts.${name} does not match its reviewed executable interface`);
  }
  if (manifest.name !== 'ukho-copilot-toolkit' || typeof manifest.version !== 'string' || !manifest.version) {
    fail('package.json must contain name ukho-copilot-toolkit and a non-empty version');
  }
  return manifest;
}

function synchronizerWriteBoundary() {
  const roots = classes.map((definition) => definition.directory);
  const formattedRoots = `${roots.slice(0, -1).join(', ')}, and ${roots.at(-1)}`;
  const synchronizer = fs.readFileSync(synchronizerPath, 'utf8');
  if (!synchronizer.includes('const controlledRoots = classes.map((definition) => definition.directory);') ||
      !synchronizer.includes('next.contributes[definition.name] = inventory[definition.name].map((relative) => ({ path: manifestPathValue(relative) }));') ||
      !synchronizer.includes('const unrelatedFiles = manifest.files.filter((entry) => !isControlled(normalize(entry)));') ||
      !synchronizer.includes('next.files = [...unrelatedFiles, ...discoveredFiles];') ||
      !synchronizer.includes("fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\\n`, { encoding: 'utf8', flag: 'wx' });") ||
      !synchronizer.includes('fs.renameSync(temporary, manifestPath);')) {
    fail('Synchronizer no longer implements the reviewed controlled-root and atomic-write boundary');
  }
  return [
    `package.json.files entries under ${formattedRoots} collectively`,
    ...classes.map((definition) => `package.json.contributes.${definition.name}`),
    'One contained, transient, randomly named atomic temporary path that is removed after replacement or failure handling'
  ];
}

function readMetadata() {
  const guide = fs.readFileSync(guidePath, 'utf8').replace(/\r\n/g, '\n');
  const start = guide.indexOf(metadataStart);
  const end = guide.indexOf(metadataEnd);
  if (start < 0 || end < 0 || end <= start || guide.indexOf(metadataStart, start + metadataStart.length) >= 0 || guide.indexOf(metadataEnd, end + metadataEnd.length) >= 0) {
    fail('Guide must contain exactly one bounded packaging-operation metadata block');
  }
  const block = guide.slice(start + metadataStart.length, end).trim();
  if (!block.startsWith('```json\n') || !block.endsWith('\n```')) fail('Guide metadata block must be a JSON fenced block');
  try {
    return JSON.parse(block.slice('```json\n'.length, -'\n```'.length));
  } catch (error) {
    fail(`Guide metadata is not valid JSON: ${error.message}`);
  }
}

function verifyMetadata(metadata, synchronizerOutputsOrWrites) {
  if (!Array.isArray(metadata) || metadata.length !== expectedOperations.length) fail('Guide metadata must contain exactly six operations');
  for (let index = 0; index < expectedOperations.length; index += 1) {
    const actual = metadata[index];
    const expected = {
      ...expectedOperations[index],
      ...(expectedOperations[index].id === 'toolkit-sync-copilot-manifest' ? { outputsOrWrites: synchronizerOutputsOrWrites } : {})
    };
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) fail(`Operation ${index + 1} must be an object`);
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    if (!equal(actualKeys, expectedKeys)) fail(`Operation ${index + 1} has an invalid metadata schema or field order`);
    for (const key of expectedKeys) {
      if (!equal(actual[key], expected[key])) fail(`Operation ${expected.id} has unexpected ${key}`);
    }
  }
}

try {
  readPackageManifest();
  const synchronizerOutputsOrWrites = synchronizerWriteBoundary();
  verifyMetadata(readMetadata(), synchronizerOutputsOrWrites);
  console.log('VSIX packaging guide metadata matches the six Toolkit-specific packaging interfaces; it is not a global consumer operation-ID allow-list.');
} catch (error) {
  console.error(`VSIX packaging guide Toolkit-interface verification failed: ${error.message}`);
  process.exitCode = 1;
}
