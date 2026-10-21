'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  expectedPackagedReadme, expectedVsixPath, verifyArchive, verifyArchiveContents
} = require('../scripts/verify-vsix-boundary.cjs');
const { expectedTarget: expectedPackageTarget, packageVsix, validateArguments } = require('../scripts/package-vsix.cjs');

const baseContentUrl = 'https://github.com/UKHO/UKHO.Copilot.Toolkit/blob/main/';
const changelog = [
  '# Changelog',
  '',
  '### 1.0.0 review candidate',
  '',
  'Local review candidate; not released or approved for distribution.',
  'The version-derived package is ukho-copilot-toolkit-1.0.0.vsix.'
].join('\n');
const readme = '# Fixture\n\n[`CHANGELOG.md`](CHANGELOG.md)\n\n[Skill](.github/skills/sample-skill/SKILL.md)\n';
const identity = '<PackageManifest><Metadata><Identity Language="en-US" Id="ukho-copilot-toolkit" Version="1.0.0" Publisher="ukho"/></Metadata></PackageManifest>';
const skillFiles = [
  '.github/skills/sample-skill/SKILL.md',
  '.github/skills/sample-skill/references/usage.md',
  '.github/skills/sample-skill/assets/sample.bin'
];
const manifest = {
  name: 'ukho-copilot-toolkit', publisher: 'ukho', version: '1.0.0',
  engines: { vscode: '^1.130.0' },
  vsce: { baseContentUrl },
  files: ['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE', 'resources/ukho-icon.png', '.github/skills/sample-skill'],
  contributes: { chatInstructions: [], chatAgents: [], chatPromptFiles: [], chatSkills: [{ path: skillFiles[0] }] }
};
const sourceFiles = new Map([
  ['package.json', Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)],
  ['README.md', Buffer.from(readme)],
  ['CHANGELOG.md', Buffer.from(changelog)],
  ['LICENSE', Buffer.from('License fixture\n')],
  ['resources/ukho-icon.png', Buffer.from([0, 255, 17, 128, 42])],
  [skillFiles[0], Buffer.from('---\nname: sample-skill\ndescription: Fixture skill\n---\nUse the linked resource.\n')],
  [skillFiles[1], Buffer.from('# Usage reference\n')],
  [skillFiles[2], Buffer.from([0, 1, 2, 127, 128, 254, 255])]
]);
const boundary = new Set(sourceFiles.keys());
let cases = 0;

function assertRejected(label, operation, diagnostic) {
  assert.throws(operation, diagnostic, `${label} must fail with its intended diagnostic`);
  cases += 1;
}

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
    const content = Buffer.isBuffer(value) ? value : Buffer.from(value, 'utf8');
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
  const entries = { '[Content_Types].xml': '<Types/>', 'extension.vsixmanifest': identity };
  for (const [relative, content] of sourceFiles) {
    const packagedPath = relative === 'README.md' ? 'readme.md'
      : relative === 'CHANGELOG.md' ? 'changelog.md'
        : relative === 'LICENSE' ? 'LICENSE.txt' : relative;
    entries[`extension/${packagedPath}`] = relative === 'README.md'
      ? Buffer.from(expectedPackagedReadme(readme, baseContentUrl))
      : content;
  }
  return entries;
}

function verify(entries = validEntries(), sourceChangelog = changelog, files = sourceFiles) {
  verifyArchiveContents(zip(entries), boundary, manifest, sourceChangelog, files);
}

assert.doesNotThrow(() => verify(), 'valid archive must pass');
cases += 1;

const negatives = [
  ['mismatched packaged name', (entries) => { entries['extension/package.json'] = JSON.stringify({ ...manifest, name: 'other' }); }, /package\.json name does not match/],
  ['mismatched packaged publisher', (entries) => { entries['extension/package.json'] = JSON.stringify({ ...manifest, publisher: 'other' }); }, /package\.json publisher does not match/],
  ['mismatched packaged version', (entries) => { entries['extension/package.json'] = JSON.stringify({ ...manifest, version: '1.1.0' }); }, /package\.json version does not match/],
  ['mismatched engine constraint', (entries) => { entries['extension/package.json'] = JSON.stringify({ ...manifest, engines: { vscode: '^1.129.0' } }); }, /package\.json engines does not match/],
  ['stale same-version contribution metadata', (entries) => {
    entries['extension/package.json'] = JSON.stringify({ ...manifest, contributes: { ...manifest.contributes,
      chatSkills: [{ path: '.github/skills/old-skill/SKILL.md' }] } });
  }, /contribution metadata does not match/],
  ['invalid packaged package JSON', (entries) => { entries['extension/package.json'] = '{invalid'; }, /not valid JSON/],
  ['mismatched VSIX identity name', (entries) => { entries['extension.vsixmanifest'] = identity.replace('Id="ukho-copilot-toolkit"', 'Id="other"'); }, /Identity Id does not match/],
  ['mismatched VSIX identity version', (entries) => { entries['extension.vsixmanifest'] = identity.replace('Version="1.0.0"', 'Version="1.1.0"'); }, /Identity Version does not match/],
  ['mismatched VSIX identity publisher', (entries) => { entries['extension.vsixmanifest'] = identity.replace('Publisher="ukho"', 'Publisher="other"'); }, /Identity Publisher does not match/],
  ['invalid VSIX identity attributes', (entries) => { entries['extension.vsixmanifest'] = '<PackageManifest><Metadata><Identity Id=ukho Version="1.0.0" Publisher="ukho"/></Metadata></PackageManifest>'; }, /Invalid XML attributes/],
  ['identity-looking comment without real identity', (entries) => { entries['extension.vsixmanifest'] = '<PackageManifest><Metadata><!-- <Identity Id="ukho-copilot-toolkit" Version="1.0.0" Publisher="ukho"/> --></Metadata></PackageManifest>'; }, /Expected one VSIX Identity element, found 0/],
  ['identity-looking CDATA without real identity', (entries) => { entries['extension.vsixmanifest'] = '<PackageManifest><Metadata><![CDATA[<Identity Id="ukho-copilot-toolkit" Version="1.0.0" Publisher="ukho"/>]]></Metadata></PackageManifest>'; }, /Expected one VSIX Identity element, found 0/],
  ['duplicate genuine Identity elements', (entries) => { entries['extension.vsixmanifest'] = identity.replace('</Metadata>', '<Identity Id="ukho-copilot-toolkit" Version="1.0.0" Publisher="ukho"/></Metadata>'); }, /Expected one VSIX Identity element, found 2/],
  ['Identity outside expected XML structure', (entries) => { entries['extension.vsixmanifest'] = '<PackageManifest><Identity Id="ukho-copilot-toolkit" Version="1.0.0" Publisher="ukho"/><Metadata/></PackageManifest>'; }, /Identity must be a child of Metadata/],
  ['malformed XML nesting', (entries) => { entries['extension.vsixmanifest'] = '<PackageManifest><Metadata><Identity/></PackageManifest>'; }, /Mismatched XML closing element/],
  ['missing VSIX identity member', (entries) => { delete entries['extension.vsixmanifest']; }, /VSIX boundary mismatch/],
  ['missing packaged identity member', (entries) => { delete entries['extension/package.json']; }, /VSIX boundary mismatch/],
  ['missing packaged changelog member', (entries) => { delete entries['extension/changelog.md']; }, /VSIX boundary mismatch/],
  ['missing Skill reference resource', (entries) => { delete entries[`extension/${skillFiles[1]}`]; }, /VSIX boundary mismatch/],
  ['maintained test source in archive', (entries) => { entries['extension/tests/test-vsix-boundary.cjs'] = 'test source'; }, /Prohibited package content/],
  ['generated test results in archive', (entries) => { entries['extension/.test-staging/runs/latest/summary.json'] = '{}'; }, /Prohibited package content/],
  ['real lifecycle document in archive', (entries) => { entries['extension/docs/planning/001-review-report.md'] = '# Review'; }, /Prohibited package content/],
  ['temporary ADR proposal in archive', (entries) => { entries['extension/docs/temp/adr.agent.md'] = '# Temporary proposal'; }, /Prohibited package content/],
  ['mismatched packaged changelog', (entries) => { entries['extension/changelog.md'] = changelog.replace('Local review candidate', 'Changed narrative'); }, /Packaged extension\/changelog.md does not match source/],
  ['invalid source candidate narrative', (entries, source) => [entries, source.replace('1.0.0 review candidate', '1.1.0 review candidate')], /Source CHANGELOG.md is missing/],
  ['invalid packaged README changelog link', (entries) => { entries['extension/readme.md'] = '[`CHANGELOG.md`](CHANGELOG.md)'; }, /invalid CHANGELOG.md link/],
  ['changed Skill entry bytes', (entries) => { entries[`extension/${skillFiles[0]}`] = '---\nname: stale-skill\n---\n'; }, /does not match source bytes/],
  ['changed Skill reference bytes', (entries) => { entries[`extension/${skillFiles[1]}`] = '# altered resource\n'; }, /does not match source bytes/],
  ['changed binary Skill resource bytes', (entries) => { entries[`extension/${skillFiles[2]}`] = Buffer.from([0, 1, 2, 3]); }, /does not match source bytes/],
  ['changed unrelated binary asset bytes', (entries) => { entries['extension/resources/ukho-icon.png'] = Buffer.from([0, 0, 0]); }, /does not match source bytes/]
];

for (const [label, mutate, diagnostic] of negatives) {
  let entries = validEntries();
  let source = changelog;
  const result = mutate(entries, source);
  if (Array.isArray(result)) [entries, source] = result;
  assertRejected(label, () => verify(entries, source), diagnostic);
}

function corruptLocalMember(buffer, target, payload) {
  const result = Buffer.from(buffer);
  let cursor = 0;
  while (cursor + 30 <= result.length && result.readUInt32LE(cursor) === 0x04034b50) {
    const nameLength = result.readUInt16LE(cursor + 26);
    const extraLength = result.readUInt16LE(cursor + 28);
    const name = result.toString('utf8', cursor + 30, cursor + 30 + nameLength);
    const dataStart = cursor + 30 + nameLength + extraLength;
    if (name === target) {
      const offset = payload ? dataStart : cursor + 30;
      result[offset] ^= 1;
      return result;
    }
    cursor = dataStart + result.readUInt32LE(cursor + 18);
  }
  throw new Error(`Fixture member not found: ${target}`);
}

assertRejected('non-metadata local/central name mismatch', () => {
  const archive = corruptLocalMember(zip(validEntries()), `extension/${skillFiles[1]}`, false);
  verifyArchiveContents(archive, boundary, manifest, changelog, sourceFiles);
}, /ZIP local and central member names differ/);
assertRejected('payload CRC corruption', () => {
  const archive = corruptLocalMember(zip(validEntries()), `extension/${skillFiles[1]}`, true);
  verifyArchiveContents(archive, boundary, manifest, changelog, sourceFiles);
}, /Invalid extracted content/);
assertRejected('truncated ZIP', () => {
  verifyArchiveContents(zip(validEntries()).subarray(0, -10), boundary, manifest, changelog, sourceFiles);
}, /end-of-central-directory/);

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ukho verifier path with spaces '));
try {
  const expected = expectedVsixPath(manifest, fixtureRoot);
  assertRejected('missing exact verifier input does not fall back', () => {
    verifyArchive(boundary, expected, manifest, changelog, sourceFiles, fixtureRoot);
  }, /Expected Toolkit VSIX is unavailable/);
  assertRejected('alternate archive path rejected', () => {
    verifyArchive(boundary, path.join(fixtureRoot, 'Releases', path.basename(expected)), manifest,
      changelog, sourceFiles, fixtureRoot);
  }, /must be the version-derived repository-root VSIX/);
  cases += 2;
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

function packagingFixture() {
  const repositoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ukho package path with spaces '));
  const packageDirectory = path.join(repositoryRoot, 'node_modules', '@vscode', 'vsce');
  fs.mkdirSync(packageDirectory, { recursive: true });
  fs.writeFileSync(path.join(packageDirectory, 'package.json'), JSON.stringify({ version: '3.9.2' }));
  fs.writeFileSync(path.join(packageDirectory, 'vsce'), 'fixture executable');
  return repositoryRoot;
}

const packageManifest = {
  name: 'ukho-copilot-toolkit', version: '1.0.0',
  engines: { vscode: '^1.130.0' },
  devDependencies: { '@vscode/vsce': '3.9.2' }
};
assert.doesNotThrow(() => validateArguments([]));
assert.equal(require('../package.json').scripts.package, 'node scripts/package-vsix.cjs');
assertRejected('ambiguous package arguments rejected', () => validateArguments(['--out', 'other.vsix']), /no arguments/);
assertRejected('unsafe package target alias rejected', () => expectedPackageTarget(os.tmpdir(), {
  name: '../ukho-copilot-toolkit', version: '1.0.0'
}), /identity must remain/);
cases += 3;

const packageRoot = packagingFixture();
try {
  const output = Buffer.from('owned candidate bytes');
  let invocation;
  const result = packageVsix({ repositoryRoot: packageRoot, manifest: packageManifest, runPackage: (request) => {
    invocation = request;
    fs.writeFileSync(request.outputPath, output, { flag: 'wx' });
    return { status: 0 };
  } });
  assert.ok(invocation.outputPath.startsWith(packageRoot));
  assert.ok(invocation.outputPath.includes(path.sep));
  assert.ok(fs.readFileSync(result.target).equals(output));
  assert.deepEqual(fs.readdirSync(packageRoot).filter((name) => name.startsWith('.ukho-vsix-build-')), []);
  cases += 1;
} finally {
  fs.rmSync(packageRoot, { recursive: true, force: true });
}

const collisionRoot = packagingFixture();
try {
  const target = path.join(collisionRoot, 'ukho-copilot-toolkit-1.0.0.vsix');
  const protectedBytes = Buffer.from('protected existing candidate');
  fs.writeFileSync(target, protectedBytes);
  let packageCalled = false;
  assertRejected('existing output is preserved', () => packageVsix({
    repositoryRoot: collisionRoot, manifest: packageManifest,
    runPackage: () => { packageCalled = true; return { status: 0 }; }
  }), /already exists; refusing to overwrite/);
  assert.equal(packageCalled, false);
  assert.ok(fs.readFileSync(target).equals(protectedBytes));
  cases += 1;
} finally {
  fs.rmSync(collisionRoot, { recursive: true, force: true });
}

const lateCollisionRoot = packagingFixture();
try {
  const target = path.join(lateCollisionRoot, 'ukho-copilot-toolkit-1.0.0.vsix');
  const collisionBytes = Buffer.from('late collision remains untouched');
  assertRejected('late output collision is preserved', () => packageVsix({
    repositoryRoot: lateCollisionRoot, manifest: packageManifest,
    runPackage: ({ outputPath }) => {
      fs.writeFileSync(outputPath, Buffer.from('temporary package'), { flag: 'wx' });
      fs.writeFileSync(target, collisionBytes, { flag: 'wx' });
      return { status: 0 };
    }
  }), /already exists; refusing to overwrite/);
  assert.ok(fs.readFileSync(target).equals(collisionBytes));
  assert.deepEqual(fs.readdirSync(lateCollisionRoot).filter((name) => name.startsWith('.ukho-vsix-build-')), []);
  cases += 1;
} finally {
  fs.rmSync(lateCollisionRoot, { recursive: true, force: true });
}

const absentOutputRoot = packagingFixture();
try {
  assertRejected('successful vsce status without output is rejected', () => packageVsix({
    repositoryRoot: absentOutputRoot, manifest: packageManifest,
    runPackage: () => ({ status: 0 })
  }), /Pinned @vscode\/vsce output is unavailable/);
  cases += 1;
} finally {
  fs.rmSync(absentOutputRoot, { recursive: true, force: true });
}

console.log(`Passed ${cases} VSIX verification and packaging cases, including diagnostic-specific archive and collision controls.`);
