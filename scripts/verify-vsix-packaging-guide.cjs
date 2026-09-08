'use strict';

const fs = require('fs');
const path = require('path');
const { classes } = require('./discover-copilot-artifacts.cjs');

const root = path.resolve(__dirname, '..');
const guidePath = path.join(root, 'docs', 'vsix-packaging.md');
const cataloguePath = path.join(root, '.github', 'copilot-script-catalogue.md');
const manifestPath = path.join(root, 'package.json');
const synchronizerPath = path.join(root, 'scripts', 'sync-copilot-manifest.cjs');
const metadataStart = '<!-- vsix-packaging-operation-metadata:start -->';
const metadataEnd = '<!-- vsix-packaging-operation-metadata:end -->';
const catalogueFieldOrder = [
  'Stable operation ID',
  'Classification',
  'Packaging identity',
  'Exact literal command',
  'Fixed workspace-relative cwd',
  'Enumerated arguments',
  'Expected outputs/writes',
  'Prohibited effects',
  'Prerequisites',
  'Failure disposition'
];
const expectedPackageScripts = {
  'verify-copilot-contracts': 'node scripts/verify-copilot-contracts.cjs',
  'verify-vsix-packaging-guide': 'node scripts/verify-vsix-packaging-guide.cjs',
  package: "node -e \"const fs=require('fs');const cp=require('child_process');const p=JSON.parse(fs.readFileSync('package.json','utf8'));const bin=process.platform==='win32'?'node_modules/@vscode/vsce/vsce':'node_modules/.bin/vsce';const r=cp.spawnSync(process.execPath,[bin,'package','--allow-missing-repository','--out',`ukho.${p.name}-${p.version}.vsix`],{stdio:'inherit'});process.exit(r.status===null?1:r.status)\"",
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
    packagingIdentity: 'ukho.copilot-toolkit',
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
    effects: ['Synchronizes only the declared packaging manifest locations after the non-mutating check has been reviewed.'],
    prerequisites: ['Workspace Trust.', 'Repository root is the fixed working directory.', 'A successful reviewed manifest check and understood drift.'],
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
    outputsOrWrites: ['ukho.copilot-toolkit-<package.json version>.vsix'],
    effects: ['Creates the version-derived VSIX from reviewed packaging inputs.'],
    prerequisites: ['Workspace Trust.', 'Repository root is the fixed working directory.', 'Reviewed package.json and packaging inputs.', 'Existing local package dependencies required by the package script.'],
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
  if (typeof manifest.publisher !== 'string' || !manifest.publisher || typeof manifest.name !== 'string' || !manifest.name || typeof manifest.version !== 'string' || !manifest.version) {
    fail('package.json must contain non-empty publisher, name, and version values');
  }
  return manifest;
}

function synchronizerWriteBoundary() {
  const roots = classes.map((definition) => definition.directory);
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
    `package.json.files entries under ${roots.join(', ')} collectively`,
    ...classes.map((definition) => `package.json.contributes.${definition.name}`),
    'One contained, transient, randomly named atomic temporary path that is removed after replacement or failure handling'
  ];
}

function readMetadata() {
  const guide = fs.readFileSync(guidePath, 'utf8');
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

function catalogueExpectedOperations(manifest, synchronizerOutputsOrWrites) {
  return expectedOperations.map((operation) => ({
    ...operation,
    ...(operation.id === 'toolkit-sync-copilot-manifest' ? { outputsOrWrites: synchronizerOutputsOrWrites } : {}),
    ...(operation.id === 'toolkit-package-vsix' ? { outputsOrWrites: [`${manifest.publisher}.${manifest.name}-${manifest.version}.vsix`] } : {})
  }));
}

function parseCatalogue() {
  let catalogue;
  try {
    catalogue = fs.readFileSync(cataloguePath, 'utf8');
  } catch (error) {
    fail(`Cannot read root script catalogue: ${error.message}`);
  }
  const lines = catalogue.replace(/\r\n/g, '\n').split('\n');
  if (lines[0] !== '# Toolkit Script Runner catalogue' || lines[1] !== '') fail('Root script catalogue must begin with its exact title');
  const entries = [];
  let index = 2;
  while (index < lines.length - 1) {
    const heading = lines[index].match(/^## Operation: `([a-z0-9]+(?:-[a-z0-9]+)*)`$/);
    if (!heading || lines[index + 1] !== '') fail(`Catalogue entry ${entries.length + 1} must begin with an exact operation heading`);
    const entry = { headingId: heading[1] };
    index += 2;
    for (const field of catalogueFieldOrder) {
      const listField = ['Enumerated arguments', 'Expected outputs/writes', 'Prohibited effects', 'Prerequisites'].includes(field);
      if (listField) {
        if (lines[index] !== `- ${field}:`) fail(`Catalogue entry ${entry.headingId} has invalid field order or ${field}`);
        index += 1;
        const values = [];
        while (index < lines.length && lines[index].startsWith('  - `') && lines[index].endsWith('`')) {
          values.push(lines[index].slice(4, -1));
          index += 1;
        }
        if (values.length === 0) fail(`Catalogue entry ${entry.headingId} must enumerate ${field}`);
        entry[field] = values;
      } else {
        const prefix = `- ${field}: \``;
        if (!lines[index] || !lines[index].startsWith(prefix) || !lines[index].endsWith('`')) fail(`Catalogue entry ${entry.headingId} has invalid field order or ${field}`);
        entry[field] = lines[index].slice(prefix.length, -1);
        index += 1;
      }
    }
    entries.push(entry);
    if (index < lines.length - 1 && lines[index++] !== '') fail(`Catalogue entry ${entry.headingId} contains an unrecognised field or content`);
  }
  return entries;
}

function verifyCatalogue(entries, expected) {
  if (entries.length !== expected.length) fail('Root script catalogue must contain exactly six operations');
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.headingId)) fail(`Root script catalogue has duplicate stable operation ID ${entry.headingId}`);
    seen.add(entry.headingId);
  }
  for (const operation of expected) {
    const entry = entries.find((candidate) => candidate.headingId === operation.id);
    if (!entry) fail(`Root script catalogue is missing expected stable operation ID ${operation.id}`);
    const actual = {
      id: entry['Stable operation ID'],
      classification: entry.Classification,
      packagingIdentity: entry['Packaging identity'],
      command: entry['Exact literal command'],
      cwd: entry['Fixed workspace-relative cwd'],
      arguments: equal(entry['Enumerated arguments'], ['none']) ? [] : entry['Enumerated arguments'],
      outputsOrWrites: equal(entry['Expected outputs/writes'], ['none']) ? [] : entry['Expected outputs/writes'],
      prohibitedEffects: entry['Prohibited effects'],
      prerequisites: entry.Prerequisites,
      stopBehavior: entry['Failure disposition']
    };
    if (entry.headingId !== actual.id) fail(`Catalogue heading and Stable operation ID differ for ${entry.headingId}`);
    for (const key of ['id', 'classification', 'packagingIdentity', 'command', 'cwd', 'arguments', 'outputsOrWrites', 'prohibitedEffects', 'prerequisites', 'stopBehavior']) {
      if (!equal(actual[key], operation[key])) fail(`Root script catalogue operation ${operation.id} has unexpected ${key}`);
    }
  }
}

try {
  const manifest = readPackageManifest();
  const synchronizerOutputsOrWrites = synchronizerWriteBoundary();
  verifyMetadata(readMetadata(), synchronizerOutputsOrWrites);
  verifyCatalogue(parseCatalogue(), catalogueExpectedOperations(manifest, synchronizerOutputsOrWrites));
  console.log('VSIX packaging guide metadata matches the six Toolkit-specific packaging interfaces; it is not a global consumer operation-ID allow-list.');
} catch (error) {
  console.error(`VSIX packaging guide Toolkit-interface verification failed: ${error.message}`);
  process.exitCode = 1;
}
