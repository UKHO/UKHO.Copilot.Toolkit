'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { classes, discover, normalize, root } = require('./discover-copilot-artifacts.cjs');

const manifestPath = path.join(root, 'package.json');
const controlledRoots = classes.map((definition) => definition.directory);

function fail(message) {
  throw new Error(message);
}

function manifestPathValue(relative) {
  return normalize(relative);
}

function isControlled(relative) {
  return controlledRoots.some((directory) => relative === directory || relative.startsWith(`${directory}/`));
}

function readManifest() {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`Cannot parse package.json: ${error.message}`);
  }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) fail('package.json must contain an object');
  if (!Array.isArray(manifest.files)) fail('package.json files must be an array');
  const filePaths = new Set();
  for (const entry of manifest.files) {
    if (typeof entry !== 'string') fail('package.json files contains an invalid entry');
    const relative = normalize(entry);
    if (filePaths.has(relative)) fail(`Duplicate manifest file path: ${relative}`);
    filePaths.add(relative);
  }
  if (!manifest.contributes || typeof manifest.contributes !== 'object' || Array.isArray(manifest.contributes)) {
    fail('package.json contributes must be an object');
  }
  for (const definition of classes) {
    const values = manifest.contributes[definition.name];
    if (!Array.isArray(values)) fail(`package.json contributes.${definition.name} must be an array`);
    const seen = new Set();
    for (const entry of values) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.path !== 'string') {
        fail(`package.json contributes.${definition.name} contains an invalid path entry`);
      }
      const relative = normalize(entry.path);
      if (seen.has(relative)) fail(`Duplicate manifest path in ${definition.name}: ${relative}`);
      seen.add(relative);
    }
  }
  return manifest;
}

function desiredManifest(manifest, inventory) {
  const next = { ...manifest, contributes: { ...manifest.contributes } };
  for (const definition of classes) {
    next.contributes[definition.name] = inventory[definition.name].map((relative) => ({ path: manifestPathValue(relative) }));
  }
  const unrelatedFiles = manifest.files.filter((entry) => !isControlled(normalize(entry)));
  const discoveredFiles = classes.flatMap((definition) => inventory[definition.name]).map(manifestPathValue);
  next.files = [...unrelatedFiles, ...discoveredFiles];
  return next;
}

function differences(current, inventory) {
  const changes = [];
  for (const definition of classes) {
    const actual = current.contributes[definition.name].map((entry) => entry.path);
    const expected = inventory[definition.name];
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      changes.push(`${definition.name}: ${formatDelta(actual, expected)}`);
    }
  }
  const actualFiles = current.files.filter((entry) => isControlled(normalize(entry)));
  const expectedFiles = classes.flatMap((definition) => inventory[definition.name]);
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    changes.push(`files: ${formatDelta(actualFiles, expectedFiles)}`);
  }
  return changes;
}

function formatDelta(actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const added = expected.filter((value) => !actualSet.has(value));
  const removed = actual.filter((value) => !expectedSet.has(value));
  return `added [${added.join(', ') || 'none'}]; removed [${removed.join(', ') || 'none'}]`;
}

function writeAtomically(manifest) {
  const temporary = path.join(root, `.package.json.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`);
  if (temporary !== root && !temporary.startsWith(`${root}${path.sep}`)) fail('Atomic temporary path escapes extension root');
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporary, manifestPath);
  } catch (error) {
    try { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); } catch { /* preserve original failure */ }
    fail(`Cannot atomically update package.json: ${error.message}`);
  }
}

function main() {
  const mode = process.argv[2] || 'check';
  if (mode !== 'check' && mode !== 'sync') fail('Usage: node scripts/sync-copilot-manifest.cjs [check|sync]');
  const inventory = discover();
  const current = readManifest();
  const changes = differences(current, inventory);
  if (!changes.length) {
    console.log('Copilot manifest is in sync.');
    return;
  }
  console.log(`Copilot manifest drift detected:\n- ${changes.join('\n- ')}`);
  if (mode === 'check') {
    process.exitCode = 1;
    return;
  }
  writeAtomically(desiredManifest(current, inventory));
  console.log('Copilot manifest synchronized.');
}

try {
  main();
} catch (error) {
  console.error(`Copilot manifest synchronization failed: ${error.message}`);
  process.exitCode = 1;
}

module.exports = { desiredManifest, differences, discover, readManifest };
