'use strict';

const assert = require('node:assert/strict');
const { verifyArchiveContents } = require('../scripts/verify-vsix-boundary.cjs');
if (process.env.TOOLKIT_TEST_RUN_CHILD !== '1') {
  const { runSuite } = require('../scripts/test-run-lifecycle.cjs');
  process.exitCode = runSuite('vsix-boundary', __filename);
} else {
const { markTestStarted, registerTestCompletion } = require('../scripts/test-run-lifecycle.cjs');
registerTestCompletion();

const manifest = { name: 'ukho-copilot-toolkit', publisher: 'ukho', version: '1.0.0' };
const changelog = [
  '# Changelog',
  '',
  '### 1.0.0 review candidate',
  '',
  'Local review candidate; not released or approved for distribution.',
  'The version-derived package is ukho-copilot-toolkit-1.0.0.vsix.'
].join('\n');
const readme = '[`CHANGELOG.md`](https://github.com/UKHO/UKHO.Copilot.Toolkit/blob/main/CHANGELOG.md)';
const identity = '<PackageManifest><Metadata><Identity Language="en-US" Id="ukho-copilot-toolkit" Version="1.0.0" Publisher="ukho"/></Metadata></PackageManifest>';
const boundary = new Set(['package.json', 'README.md', 'CHANGELOG.md']);
markTestStarted();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const [name, value] of Object.entries(entries)) {
    const filename = Buffer.from(name, 'utf8');
    const content = Buffer.from(value, 'utf8');
    const crc = crc32(content);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(content.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(filename.length, 26);
    localParts.push(local, filename, content);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(content.length, 20);
    central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(filename.length, 28);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, filename);
    offset += local.length + filename.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function validEntries() {
  return {
    '[Content_Types].xml': '<Types/>',
    'extension.vsixmanifest': identity,
    'extension/package.json': JSON.stringify(manifest),
    'extension/readme.md': readme,
    'extension/changelog.md': changelog
  };
}

function verify(entries = validEntries(), sourceChangelog = changelog) {
  verifyArchiveContents(zip(entries), boundary, manifest, sourceChangelog);
}

assert.doesNotThrow(() => verify(), 'valid archive must pass');

const negatives = [
  ['mismatched packaged name', (entries) => { entries['extension/package.json'] = JSON.stringify({ ...manifest, name: 'other' }); }],
  ['mismatched packaged publisher', (entries) => { entries['extension/package.json'] = JSON.stringify({ ...manifest, publisher: 'other' }); }],
  ['mismatched packaged version', (entries) => { entries['extension/package.json'] = JSON.stringify({ ...manifest, version: '1.1.0' }); }],
  ['invalid packaged package JSON', (entries) => { entries['extension/package.json'] = '{invalid'; }],
  ['mismatched VSIX identity name', (entries) => { entries['extension.vsixmanifest'] = identity.replace('Id="ukho-copilot-toolkit"', 'Id="other"'); }],
  ['mismatched VSIX identity version', (entries) => { entries['extension.vsixmanifest'] = identity.replace('Version="1.0.0"', 'Version="1.1.0"'); }],
  ['mismatched VSIX identity publisher', (entries) => { entries['extension.vsixmanifest'] = identity.replace('Publisher="ukho"', 'Publisher="other"'); }],
  ['invalid VSIX identity attributes', (entries) => { entries['extension.vsixmanifest'] = '<Identity Id=ukho Version="1.0.0" Publisher="ukho"/>'; }],
  ['missing VSIX identity member', (entries) => { delete entries['extension.vsixmanifest']; }],
  ['missing packaged identity member', (entries) => { delete entries['extension/package.json']; }],
  ['missing packaged changelog member', (entries) => { delete entries['extension/changelog.md']; }],
  ['maintained test source in archive', (entries) => { entries['extension/tests/test-vsix-boundary.cjs'] = 'test source'; }],
  ['generated test results in archive', (entries) => { entries['extension/.test-staging/runs/latest/summary.json'] = '{}'; }],
  ['mismatched packaged changelog', (entries) => { entries['extension/changelog.md'] = changelog.replace('Local review candidate', 'Changed narrative'); }],
  ['invalid source candidate narrative', (entries, source) => { return [entries, source.replace('1.0.0 review candidate', '1.1.0 review candidate')]; }],
  ['invalid packaged README changelog link', (entries) => { entries['extension/readme.md'] = '[`CHANGELOG.md`](CHANGELOG.md)'; }]
];

for (const [label, mutate] of negatives) {
  let entries = validEntries();
  let source = changelog;
  const result = mutate(entries, source);
  if (Array.isArray(result)) [entries, source] = result;
  assert.throws(() => verify(entries, source), undefined, `${label} must fail`);
}

console.log(`Passed ${negatives.length + 1} VSIX boundary cases (one positive, ${negatives.length} negative).`);
}
