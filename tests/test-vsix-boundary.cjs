'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  captureBuildEvidence, expectedPackagedReadme, expectedVsixPath, verifyArchive,
  verifyArchiveContents, verifyCandidate, verifySelectedCandidate
} = require('../scripts/verify-vsix-boundary.cjs');
const { expectedTarget: expectedPackageTarget, packageVsix, validateArguments } = require('../scripts/package-vsix.cjs');
const {
  applyConfirmedReleaseInputs, candidateLayout, inspectCandidate, prepareCandidate,
  confirmReleaseInputsInteractively, main: prepareCliMain, prepareAfterReleaseInputUpdate, safePath,
  validateArguments: validatePreparationArguments
} = require('../scripts/prepare-vsix.cjs');

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

function preparedFixture(version) {
  const preparedManifest = { ...manifest, version };
  const preparedChangelog = changelog.replaceAll('1.0.0', version);
  const preparedFiles = new Map([...sourceFiles].map(([name, bytes]) => [name, Buffer.from(bytes)]));
  preparedFiles.set('package.json', Buffer.from(`${JSON.stringify(preparedManifest, null, 2)}\n`));
  preparedFiles.set('CHANGELOG.md', Buffer.from(preparedChangelog));
  const entries = validEntries();
  entries['extension/package.json'] = preparedFiles.get('package.json');
  entries['extension/changelog.md'] = preparedChangelog;
  entries['extension.vsixmanifest'] = identity.replace('Version="1.0.0"', `Version="${version}"`);
  const archiveBytes = zip(entries);
  return {
    archiveBytes,
    entries,
    buildInputs: { manifest: preparedManifest, boundary: new Set(boundary), sourceChangelog: preparedChangelog, sourceFiles: preparedFiles }
  };
}

assert.doesNotThrow(() => verify(), 'valid archive must pass');
cases += 1;

const prepared = preparedFixture('2.4.7');
const evidence = captureBuildEvidence({ archiveBytes: prepared.archiveBytes, buildInputs: prepared.buildInputs });
assert.equal(evidence.captured.identity.version, '2.4.7');
assert.ok(evidence.captured.expectedMembers.some((member) => member.name === 'extension/resources/ukho-icon.png' && member.length === 5));
assert.equal(verifyCandidate({ archiveBytes: prepared.archiveBytes, evidence, mode: 'fresh', buildInputs: prepared.buildInputs }).claim,
  'source-fidelity-and-evidence-consistency');
assert.equal(verifyCandidate({ archiveBytes: prepared.archiveBytes, evidence, mode: 'historical' }).claim,
  'historical-artifact-evidence-consistency-only');
cases += 3;

const changedCheckout = {
  ...prepared.buildInputs,
  sourceFiles: new Map(prepared.buildInputs.sourceFiles)
};
changedCheckout.sourceFiles.set(skillFiles[1], Buffer.from('# changed checkout\n'));
assertRejected('fresh verification detects changed checkout inputs', () => verifyCandidate({
  archiveBytes: prepared.archiveBytes, evidence, mode: 'fresh', buildInputs: changedCheckout
}), /Fresh build inputs differ/);
assert.doesNotThrow(() => verifyCandidate({ archiveBytes: prepared.archiveBytes, evidence, mode: 'historical' }),
  'historical verification must not require current checkout bytes');
cases += 1;

const tamperedEvidence = JSON.parse(JSON.stringify(evidence));
tamperedEvidence.captured.expectedMembers.find((member) => member.name === `extension/${skillFiles[1]}`).sha256 = '0'.repeat(64);
assertRejected('tampered evidence digest fails closed', () => verifyCandidate({
  archiveBytes: prepared.archiveBytes, evidence: tamperedEvidence, mode: 'historical'
}), /integrity digest mismatch/);
assertRejected('missing historical evidence fails closed', () => verifyCandidate({
  archiveBytes: prepared.archiveBytes, mode: 'historical'
}), /evidence schema/);
const missingEvidenceData = JSON.parse(JSON.stringify(evidence));
delete missingEvidenceData.captured.sourceMembers;
assertRejected('missing evidence inventory fails closed', () => verifyCandidate({
  archiveBytes: prepared.archiveBytes, evidence: missingEvidenceData, mode: 'historical'
}), /integrity digest mismatch/);
assertRejected('tampered archive member fails historical consistency', () => {
  const entries = { ...prepared.entries };
  entries[`extension/${skillFiles[1]}`] = '# altered retained member\n';
  verifyCandidate({ archiveBytes: zip(entries), evidence, mode: 'historical' });
}, new RegExp(`Historical VSIX member does not match retained evidence: extension/${skillFiles[1].replaceAll('.', '\\.').replaceAll('/', '\\/')}`));
assertRejected('unpinned verification tool identity rejected', () => captureBuildEvidence({
  archiveBytes: prepared.archiveBytes,
  buildInputs: prepared.buildInputs,
  toolIdentity: { name: '@vscode/vsce', version: '3.9.3' }
}), /pinned @vscode\/vsce 3\.9\.2/);
cases += 4;

assertRejected('non-numeric prepared version rejected', () => expectedVsixPath({ ...manifest, version: '1.2.3-rc.1' }), /numeric prepared version/);
assertRejected('wrong captured package identity rejected', () => captureBuildEvidence({
  archiveBytes: prepared.archiveBytes,
  buildInputs: { ...prepared.buildInputs, manifest: { ...prepared.buildInputs.manifest, publisher: 'other' } }
}), /numeric prepared version/);
const wrongVersion = preparedFixture('2.4.8');
assertRejected('candidate version differs from evidence identity', () => verifyCandidate({
  archiveBytes: wrongVersion.archiveBytes, evidence, mode: 'historical'
}), /Historical VSIX member does not match retained evidence: extension\.vsixmanifest/);
cases += 3;

const unsafeEntries = validEntries();
unsafeEntries['extension/../outside.txt'] = 'unsafe';
assertRejected('unsafe ZIP traversal path rejected', () => verifyArchiveContents(zip(unsafeEntries), boundary, manifest, changelog, sourceFiles),
  /Invalid or aliased path/);
assertRejected('unapproved README transformation is rejected', () => {
  const entries = validEntries();
  entries['extension/readme.md'] = Buffer.from(expectedPackagedReadme(readme, baseContentUrl).replace('Skill](https:', 'Skill](https:') + 'tampered');
  verifyArchiveContents(zip(entries), boundary, manifest, changelog, sourceFiles);
}, /differs beyond the pinned vsce relative-link transformation/);
cases += 2;

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
  const selected = path.join(fixtureRoot, 'selected candidate.vsix');
  fs.writeFileSync(selected, prepared.archiveBytes, { flag: 'wx' });
  assert.equal(verifySelectedCandidate({ candidatePath: selected, evidence, mode: 'historical' }).verified, true);
  const generalizedExpected = expectedVsixPath(prepared.buildInputs.manifest, fixtureRoot);
  fs.writeFileSync(generalizedExpected, prepared.archiveBytes, { flag: 'wx' });
  assert.doesNotThrow(() => verifyArchive(prepared.buildInputs.boundary, generalizedExpected,
    prepared.buildInputs.manifest, prepared.buildInputs.sourceChangelog, prepared.buildInputs.sourceFiles, fixtureRoot));
  assertRejected('selected candidate does not fall back to another file', () => verifySelectedCandidate({
    candidatePath: path.join(fixtureRoot, 'missing candidate.vsix'), evidence, mode: 'historical'
  }), /Explicit selected candidate is unavailable/);
  cases += 5;
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

function preparationFixture(version = '2.4.7') {
  const repositoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ukho preparation path with spaces '));
  const preparedManifest = {
    ...manifest,
    version,
    devDependencies: { '@vscode/vsce': '3.9.2' }
  };
  const preparedChangelog = changelog.replaceAll('1.0.0', version);
  const preparedFiles = new Map([...sourceFiles].map(([name, bytes]) => [name, Buffer.from(bytes)]));
  preparedFiles.set('package.json', Buffer.from(`${JSON.stringify(preparedManifest, null, 2)}\n`));
  preparedFiles.set('CHANGELOG.md', Buffer.from(preparedChangelog));
  const inputs = {
    manifest: preparedManifest,
    boundary: new Set(preparedFiles.keys()),
    contributions: Object.entries(preparedManifest.contributes).flatMap(([name, entries]) => entries.map((entry) => ({ name, relative: entry.path }))),
    sourceChangelog: preparedChangelog,
    sourceFiles: preparedFiles
  };

  for (const directory of ['Releases', '.github/instructions', '.github/agents', '.github/prompts', '.github/skills']) {
    fs.mkdirSync(path.join(repositoryRoot, directory), { recursive: true });
  }
  for (const [relative, bytes] of preparedFiles) {
    const file = path.join(repositoryRoot, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
  const lock = {
    name: preparedManifest.name,
    version,
    lockfileVersion: 3,
    requires: true,
    packages: {
      '': { name: preparedManifest.name, version, devDependencies: { '@vscode/vsce': '3.9.2' } },
      'node_modules/@vscode/vsce': { version: '3.9.2' }
    }
  };
  fs.writeFileSync(path.join(repositoryRoot, 'package-lock.json'), `${JSON.stringify(lock, null, 2)}\n`);
  const vsceDirectory = path.join(repositoryRoot, 'node_modules', '@vscode', 'vsce');
  fs.mkdirSync(vsceDirectory, { recursive: true });
  fs.writeFileSync(path.join(vsceDirectory, 'package.json'), JSON.stringify({ version: '3.9.2' }));
  fs.writeFileSync(path.join(vsceDirectory, 'vsce'), 'injected fixture executable');
  fs.writeFileSync(path.join(repositoryRoot, 'Releases', 'legacy-preserve.txt'), 'keep this pre-existing file');
  return { repositoryRoot, inputs, preparedManifest, preparedChangelog };
}

function archiveForBuildInputs(inputs) {
  const entries = { '[Content_Types].xml': '<Types/>', 'extension.vsixmanifest': identity.replace('Version="1.0.0"', `Version="${inputs.manifest.version}"`) };
  for (const [relative, content] of inputs.sourceFiles) {
    const packagedPath = relative === 'README.md' ? 'readme.md'
      : relative === 'CHANGELOG.md' ? 'changelog.md'
        : relative === 'LICENSE' ? 'LICENSE.txt' : relative;
    entries[`extension/${packagedPath}`] = relative === 'README.md'
      ? Buffer.from(expectedPackagedReadme(content.toString('utf8'), baseContentUrl))
      : content;
  }
  return zip(entries);
}

function fakeBuilder(request) {
  fs.writeFileSync(request.outputPath, archiveForBuildInputs(request.buildInputs), { flag: 'wx' });
  return { status: 0 };
}

const preparationRoot = preparationFixture();
try {
  const beforeLegacy = fs.readFileSync(path.join(preparationRoot.repositoryRoot, 'Releases', 'legacy-preserve.txt'));
  let clockCalls = 0;
  const preparedCandidate = prepareCandidate({
    repositoryRoot: preparationRoot.repositoryRoot,
    loadBuildInputs: () => preparationRoot.inputs,
    runBuilder: fakeBuilder,
    clock: () => { clockCalls += 1; return new Date('2026-10-22T23:59:59.999Z'); },
    idFactory: () => 'happy-path',
    temporaryRoot: preparationRoot.repositoryRoot
  });
  assert.equal(preparedCandidate.outcome, 'prepared-verified');
  assert.equal(preparedCandidate.verified, true);
  assert.equal(preparedCandidate.candidateId, '2026-10-22/235959Z-happy-path');
  assert.equal(clockCalls, 1, 'one captured instant determines both UTC date and time');
  assert.equal(preparedCandidate.packagedIdentity.version, preparationRoot.preparedManifest.version);
  assert.equal(preparedCandidate.sha256, require('node:crypto').createHash('sha256').update(fs.readFileSync(preparedCandidate.vsixPath)).digest('hex'));
  assert.equal(preparedCandidate.sizeBytes, fs.statSync(preparedCandidate.vsixPath).size);
  assert.equal(fs.readFileSync(path.join(preparationRoot.repositoryRoot, 'Releases', 'legacy-preserve.txt')).toString(), beforeLegacy.toString());
  assert.deepEqual(fs.readdirSync(preparationRoot.repositoryRoot).filter((name) => name.startsWith('.ukho-vsix-prepare-')), []);
  const candidateStatusPath = path.join(preparedCandidate.candidateDirectory, 'status.json');
  const statusBeforeInspection = fs.readFileSync(candidateStatusPath);
  const inspected = inspectCandidate({ candidateDirectory: preparedCandidate.candidateDirectory, mode: 'historical' });
  assert.equal(inspected.verified, true);
  assert.equal(inspected.humanStatus.manualTest.outcome, 'not tested');
  assert.equal(inspected.humanStatus.publication.outcome, 'not published');
  assert.equal(inspected.humanStatus.humanReported, true);
  assert.ok(fs.readFileSync(candidateStatusPath).equals(statusBeforeInspection), 'inspection is read-only');
  assert.equal(fs.existsSync(path.join(preparationRoot.repositoryRoot, '.ukho-vsix-operation.lock')), false,
    'successful candidate preparation releases its operation lock');
  cases += 12;

  const humanStatus = JSON.parse(statusBeforeInspection.toString('utf8'));
  humanStatus.publication.outcome = 'pending/unknown';
  humanStatus.publication.date = '2026-10-22';
  humanStatus.publication.notes = 'The publication response was not confirmed.';
  fs.writeFileSync(candidateStatusPath, `${JSON.stringify(humanStatus, null, 2)}\n`);
  const pending = inspectCandidate({ candidateDirectory: preparedCandidate.candidateDirectory, mode: 'historical' });
  assert.equal(pending.humanStatus.publicationDisposition, 'pending/unknown; reconcile before any retry or claim');
  humanStatus.artifact.sha256 = '0'.repeat(64);
  fs.writeFileSync(candidateStatusPath, `${JSON.stringify(humanStatus, null, 2)}\n`);
  assert.equal(inspectCandidate({ candidateDirectory: preparedCandidate.candidateDirectory, mode: 'historical' }).humanStatus.state,
    'malformed-or-mismatched');
  fs.writeFileSync(candidateStatusPath, '{malformed');
  assert.equal(inspectCandidate({ candidateDirectory: preparedCandidate.candidateDirectory, mode: 'historical' }).humanStatus.state,
    'malformed-or-unavailable');
  cases += 3;

  const validStatus = JSON.parse(statusBeforeInspection.toString('utf8'));
  for (const [label, mutate] of [
    ['missing manual-test date', (status) => { status.manualTest = { outcome: 'passed' }; }],
    ['invalid manual-test date', (status) => { status.manualTest.outcome = 'failed'; status.manualTest.date = '2026-02-30'; status.manualTest.notes = 'Fixture failure'; }],
    ['non-string publication notes', (status) => { status.publication.notes = null; }]
  ]) {
    const malformed = structuredClone(validStatus);
    mutate(malformed);
    fs.writeFileSync(candidateStatusPath, `${JSON.stringify(malformed, null, 2)}\n`);
    assert.equal(inspectCandidate({ candidateDirectory: preparedCandidate.candidateDirectory }).humanStatus.state,
      'malformed-or-mismatched', label);
    cases += 1;
  }
  fs.writeFileSync(candidateStatusPath, JSON.stringify({
    ...validStatus, artifact: null, manualTest: { outcome: 'passed', date: '2026-10-22', notes: 'Tested' }
  }));
  assert.equal(inspectCandidate({ candidateDirectory: preparedCandidate.candidateDirectory }).humanStatus.state,
    'malformed-or-mismatched', 'incomplete candidate status cannot claim later human outcomes');
  cases += 1;

  const incompleteStatusFixture = preparationFixture();
  try {
    const incomplete = prepareCandidate({
      repositoryRoot: incompleteStatusFixture.repositoryRoot,
      loadBuildInputs: () => incompleteStatusFixture.inputs,
      runBuilder: () => ({ status: 7 }),
      clock: () => new Date('2026-10-22T11:30:00Z'),
      idFactory: () => 'incomplete-status-shape',
      temporaryRoot: incompleteStatusFixture.repositoryRoot
    });
    assert.equal(incomplete.outcome, 'failed-retained-attempt');
    const incompleteStatusPath = path.join(incomplete.candidateDirectory, 'status.json');
    const incompleteInitialStatus = JSON.parse(fs.readFileSync(incompleteStatusPath, 'utf8'));
    for (const [label, mutate] of [
      ['incomplete candidate missing outcome date and notes', (status) => { status.manualTest = { outcome: 'passed' }; }],
      ['incomplete candidate invalid pending date', (status) => {
        status.publication = { outcome: 'pending/unknown', date: '2026-02-30', notes: 'Outcome is unconfirmed.' };
      }],
      ['incomplete candidate non-string notes', (status) => { status.manualTest.notes = null; }]
    ]) {
      const malformed = structuredClone(incompleteInitialStatus);
      mutate(malformed);
      fs.writeFileSync(incompleteStatusPath, `${JSON.stringify(malformed, null, 2)}\n`);
      assert.equal(inspectCandidate({ candidateDirectory: incomplete.candidateDirectory }).humanStatus.state,
        'malformed-or-mismatched', label);
      cases += 1;
    }
  } finally {
    fs.rmSync(incompleteStatusFixture.repositoryRoot, { recursive: true, force: true });
  }

  const candidateMetadataPath = path.join(preparedCandidate.candidateDirectory, 'candidate.json');
  const originalMetadataBytes = fs.readFileSync(candidateMetadataPath);
  const candidateMetadata = JSON.parse(originalMetadataBytes.toString('utf8'));
  candidateMetadata.packagedIdentity.version = '9.9.9';
  fs.writeFileSync(candidateMetadataPath, `${JSON.stringify(candidateMetadata, null, 2)}\n`);
  const wrongIdentity = inspectCandidate({ candidateDirectory: preparedCandidate.candidateDirectory });
  assert.equal(wrongIdentity.verified, false);
  assert.match(wrongIdentity.error, /identity or version-derived artifact filename/);
  cases += 2;
  candidateMetadata.packagedIdentity.version = preparationRoot.preparedManifest.version;
  const alternateName = 'ukho-copilot-toolkit-9.9.9.vsix';
  fs.copyFileSync(preparedCandidate.vsixPath, path.join(preparedCandidate.candidateDirectory, alternateName));
  candidateMetadata.artifact.fileName = alternateName;
  fs.writeFileSync(candidateMetadataPath, `${JSON.stringify(candidateMetadata, null, 2)}\n`);
  const wrongFilename = inspectCandidate({ candidateDirectory: preparedCandidate.candidateDirectory });
  assert.equal(wrongFilename.verified, false);
  assert.match(wrongFilename.error, /identity or version-derived artifact filename/);
  fs.unlinkSync(path.join(preparedCandidate.candidateDirectory, alternateName));
  fs.writeFileSync(candidateMetadataPath, originalMetadataBytes);
  cases += 2;
} finally {
  fs.rmSync(preparationRoot.repositoryRoot, { recursive: true, force: true });
}

const operationLockFixture = preparationFixture();
try {
  let nestedResult;
  let nestedBuilderCalled = false;
  let outerBuilderCalls = 0;
  const outer = prepareCandidate({
    repositoryRoot: operationLockFixture.repositoryRoot,
    loadBuildInputs: () => operationLockFixture.inputs,
    runBuilder: (request) => { outerBuilderCalls += 1; return fakeBuilder(request); },
    clock: () => new Date('2026-10-22T12:10:00Z'),
    idFactory: () => 'lock-owner',
    temporaryRoot: operationLockFixture.repositoryRoot,
    hooks: { beforeBuild: () => {
      nestedResult = prepareCandidate({
        repositoryRoot: operationLockFixture.repositoryRoot,
        loadBuildInputs: () => operationLockFixture.inputs,
        runBuilder: () => { nestedBuilderCalled = true; return { status: 0 }; },
        temporaryRoot: operationLockFixture.repositoryRoot
      });
    } }
  });
  assert.equal(outer.outcome, 'prepared-verified');
  assert.equal(nestedResult.outcome, 'failed-preflight');
  assert.match(nestedResult.error, /holds the repository lock/);
  assert.equal(nestedBuilderCalled, false);
  assert.equal(outerBuilderCalls, 1);
  assert.equal(fs.existsSync(path.join(operationLockFixture.repositoryRoot, '.ukho-vsix-operation.lock')), false,
    'the owning helper removes its lock after successful completion');
  cases += 5;
} finally { fs.rmSync(operationLockFixture.repositoryRoot, { recursive: true, force: true }); }

const collisionFixture = preparationFixture();
try {
  const releases = path.join(collisionFixture.repositoryRoot, 'Releases');
  const instant = new Date('2026-10-22T23:59:59.999Z');
  const racing = candidateLayout(releases, instant, 'race');
  const collision = candidateLayout(releases, instant, 'reused');
  fs.mkdirSync(collision.directory, { recursive: true });
  fs.writeFileSync(path.join(collision.directory, 'protected.txt'), 'do not alter');
  const ids = ['race', 'reused', 'unique-a'];
  const result = prepareCandidate({
    repositoryRoot: collisionFixture.repositoryRoot,
    loadBuildInputs: () => collisionFixture.inputs,
    runBuilder: fakeBuilder,
    clock: () => instant,
    idFactory: () => {
      const id = ids.shift();
      if (id === 'race') {
        const contender = candidateLayout(releases, instant, id);
        fs.mkdirSync(contender.directory);
        fs.writeFileSync(path.join(contender.directory, 'racing-owner.txt'), 'concurrent contender owns this path');
      }
      return id;
    },
    temporaryRoot: collisionFixture.repositoryRoot
  });
  assert.equal(result.outcome, 'prepared-verified');
  assert.equal(result.candidateId, '2026-10-22/235959Z-unique-a');
  assert.equal(fs.readFileSync(path.join(racing.directory, 'racing-owner.txt')).toString(), 'concurrent contender owns this path');
  assert.equal(fs.readFileSync(path.join(collision.directory, 'protected.txt')).toString(), 'do not alter');
  const second = prepareCandidate({
    repositoryRoot: collisionFixture.repositoryRoot,
    loadBuildInputs: () => collisionFixture.inputs,
    runBuilder: fakeBuilder,
    clock: () => instant,
    idFactory: () => 'unique-b',
    temporaryRoot: collisionFixture.repositoryRoot
  });
  assert.equal(second.packagedIdentity.version, result.packagedIdentity.version, 'same-release retry does not bump the manifest');
  assert.notEqual(second.candidateDirectory, result.candidateDirectory);
  assert.equal(fs.readdirSync(path.join(releases, '2026-10-22')).length, 4);
  cases += 6;
} finally {
  fs.rmSync(collisionFixture.repositoryRoot, { recursive: true, force: true });
}

const utcBoundaryFixture = preparationFixture();
try {
  const boundaryResult = prepareCandidate({
    repositoryRoot: utcBoundaryFixture.repositoryRoot,
    loadBuildInputs: () => utcBoundaryFixture.inputs,
    runBuilder: fakeBuilder,
    clock: () => new Date('2026-10-22T00:30:00+02:00'),
    idFactory: () => 'utc-boundary',
    temporaryRoot: utcBoundaryFixture.repositoryRoot
  });
  assert.equal(boundaryResult.candidateId, '2026-10-21/223000Z-utc-boundary');
  assert.equal(boundaryResult.outcome, 'prepared-verified');
  cases += 2;
} finally {
  fs.rmSync(utcBoundaryFixture.repositoryRoot, { recursive: true, force: true });
}

for (const failure of [
  { name: 'builder failure', runBuilder: () => ({ status: 7 }), message: /build failed/, expected: 'failed-retained-attempt' },
  { name: 'missing builder output', runBuilder: () => ({ status: 0 }), message: /Pinned @vscode\/vsce output/, expected: 'failed-retained-attempt' }
]) {
  const fixture = preparationFixture();
  try {
    const failed = prepareCandidate({
      repositoryRoot: fixture.repositoryRoot,
      loadBuildInputs: () => fixture.inputs,
      runBuilder: failure.runBuilder,
      clock: () => new Date('2026-10-22T00:00:00Z'),
      idFactory: () => failure.name.replaceAll(' ', '-'),
      temporaryRoot: fixture.repositoryRoot
    });
    assert.equal(failed.outcome, failure.expected, failure.name);
    assert.match(failed.error, failure.message);
    const metadata = JSON.parse(fs.readFileSync(path.join(failed.candidateDirectory, 'candidate.json'), 'utf8'));
    assert.equal(metadata.preparation.verified, false);
    assert.equal(JSON.parse(fs.readFileSync(path.join(failed.candidateDirectory, 'status.json'), 'utf8')).manualTest.outcome, 'not tested');
    assert.equal(inspectCandidate({ candidateDirectory: failed.candidateDirectory }).verified, false);
    cases += 4;
  } finally {
    fs.rmSync(fixture.repositoryRoot, { recursive: true, force: true });
  }
}

const driftFixture = preparationFixture();
try {
  const changedInputs = { ...driftFixture.inputs, sourceFiles: new Map(driftFixture.inputs.sourceFiles) };
  driftFixture.activeInputs = driftFixture.inputs;
  const drift = prepareCandidate({
    repositoryRoot: driftFixture.repositoryRoot,
    loadBuildInputs: () => driftFixture.activeInputs,
    runBuilder: fakeBuilder,
    clock: () => new Date('2026-10-22T12:00:00Z'),
    idFactory: () => 'drift',
    temporaryRoot: driftFixture.repositoryRoot,
    hooks: { afterBuild: () => {
      changedInputs.sourceFiles.set('README.md', Buffer.from('# changed after capture\n'));
      driftFixture.activeInputs = changedInputs;
    } }
  });
  assert.equal(drift.outcome, 'failed-retained-attempt');
  assert.match(drift.error, /changed between capture and build/);
  assert.equal(fs.existsSync(drift.vsixPath), false, 'input drift prevents candidate copy');
  assert.equal(JSON.parse(fs.readFileSync(path.join(drift.candidateDirectory, 'candidate.json'), 'utf8')).preparation.verified, false);
  cases += 4;
} finally {
  fs.rmSync(driftFixture.repositoryRoot, { recursive: true, force: true });
}

for (const drift of [
  { id: 'lockfile-drift', file: 'package-lock.json' },
  { id: 'tool-drift', file: path.join('node_modules', '@vscode', 'vsce', 'vsce') }
]) {
  const fixture = preparationFixture();
  try {
    const changed = prepareCandidate({
      repositoryRoot: fixture.repositoryRoot,
      loadBuildInputs: () => fixture.inputs,
      runBuilder: fakeBuilder,
      clock: () => new Date('2026-10-22T12:30:00Z'),
      idFactory: () => drift.id,
      temporaryRoot: fixture.repositoryRoot,
      hooks: { afterBuild: () => fs.appendFileSync(path.join(fixture.repositoryRoot, drift.file), '\n') }
    });
    assert.equal(changed.outcome, 'failed-retained-attempt');
    assert.match(changed.error, /lockfile, or pinned tool inputs changed/);
    assert.equal(fs.existsSync(changed.vsixPath), false);
    cases += 3;
  } finally {
    fs.rmSync(fixture.repositoryRoot, { recursive: true, force: true });
  }
}

const invalidArchiveFixture = preparationFixture();
try {
  const invalid = prepareCandidate({
    repositoryRoot: invalidArchiveFixture.repositoryRoot,
    loadBuildInputs: () => invalidArchiveFixture.inputs,
    runBuilder: ({ outputPath }) => { fs.writeFileSync(outputPath, Buffer.from('not a VSIX'), { flag: 'wx' }); return { status: 0 }; },
    clock: () => new Date('2026-10-22T13:00:00Z'),
    idFactory: () => 'verification-failure',
    temporaryRoot: invalidArchiveFixture.repositoryRoot
  });
  assert.equal(invalid.outcome, 'partial-unverified');
  assert.equal(fs.existsSync(invalid.vsixPath), true, 'verification failure retains exact candidate bytes');
  assert.equal(invalid.verified, false);
  const metadata = JSON.parse(fs.readFileSync(path.join(invalid.candidateDirectory, 'candidate.json'), 'utf8'));
  assert.equal(metadata.preparation.verified, false);
  assert.equal(metadata.artifact.sha256, invalid.sha256);
  const inspection = inspectCandidate({ candidateDirectory: invalid.candidateDirectory, mode: 'historical' });
  assert.equal(inspection.verified, false);
  assert.equal(inspection.candidateId, invalid.candidateId);
  assert.equal(inspection.humanStatus.state, 'reported', 'verification failure does not hide separate human status');
  cases += 8;
} finally {
  fs.rmSync(invalidArchiveFixture.repositoryRoot, { recursive: true, force: true });
}

const missingToolFixture = preparationFixture();
try {
  fs.rmSync(path.join(missingToolFixture.repositoryRoot, 'node_modules', '@vscode', 'vsce'), { recursive: true, force: true });
  const missingTool = prepareCandidate({
    repositoryRoot: missingToolFixture.repositoryRoot,
    loadBuildInputs: () => missingToolFixture.inputs,
    runBuilder: fakeBuilder,
    clock: () => new Date('2026-10-22T13:30:00Z'),
    idFactory: () => 'missing-tool',
    temporaryRoot: missingToolFixture.repositoryRoot
  });
  assert.equal(missingTool.outcome, 'failed-preflight');
  assert.match(missingTool.error, /Pinned @vscode\/vsce package metadata/);
  assert.equal(missingTool.candidateId, null, 'missing tool fails before allocating an archive attempt');
  cases += 3;
} finally {
  fs.rmSync(missingToolFixture.repositoryRoot, { recursive: true, force: true });
}

const copyFailureFixture = preparationFixture();
try {
  const partialCopy = prepareCandidate({
    repositoryRoot: copyFailureFixture.repositoryRoot,
    loadBuildInputs: () => copyFailureFixture.inputs,
    runBuilder: fakeBuilder,
    copyCandidate: (source, target) => {
      const bytes = fs.readFileSync(source);
      fs.writeFileSync(target, bytes.subarray(0, 10), { flag: 'wx' });
      throw new Error('injected partial copy failure');
    },
    clock: () => new Date('2026-10-22T14:00:00Z'),
    idFactory: () => 'copy-failure',
    temporaryRoot: copyFailureFixture.repositoryRoot
  });
  assert.equal(partialCopy.outcome, 'failed-retained-attempt');
  assert.equal(fs.statSync(partialCopy.vsixPath).size, 10);
  assert.equal(JSON.parse(fs.readFileSync(path.join(partialCopy.candidateDirectory, 'candidate.json'), 'utf8')).preparation.verified, false);
  cases += 3;
} finally {
  fs.rmSync(copyFailureFixture.repositoryRoot, { recursive: true, force: true });
}

const metadataFailureFixture = preparationFixture();
try {
  const metadataFailure = prepareCandidate({
    repositoryRoot: metadataFailureFixture.repositoryRoot,
    loadBuildInputs: () => metadataFailureFixture.inputs,
    runBuilder: fakeBuilder,
    clock: () => new Date('2026-10-22T15:00:00Z'),
    idFactory: () => 'metadata-failure',
    temporaryRoot: metadataFailureFixture.repositoryRoot,
    hooks: { beforePersist: () => { throw new Error('injected metadata persistence failure'); } }
  });
  assert.equal(metadataFailure.outcome, 'partial-unverified');
  assert.equal(metadataFailure.verified, false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(metadataFailure.candidateDirectory, 'candidate.json'), 'utf8')).preparation.verified, false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(metadataFailure.candidateDirectory, 'status.json'), 'utf8')).publication.outcome, 'not published');
  const inspectedPartial = inspectCandidate({ candidateDirectory: metadataFailure.candidateDirectory, mode: 'historical' });
  assert.equal(inspectedPartial.artifactVerified, true);
  assert.equal(inspectedPartial.verified, false, 'complete preparation metadata is required for candidate verified state');
  cases += 6;
} finally {
  fs.rmSync(metadataFailureFixture.repositoryRoot, { recursive: true, force: true });
}

const pathFixture = preparationFixture();
try {
  assert.throws(() => safePath(path.join(pathFixture.repositoryRoot, '..', 'outside'), { directory: true }), /cannot be safely inspected|does not exist|Path/);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ukho outside releases '));
  try {
    const escaped = prepareCandidate({
      repositoryRoot: pathFixture.repositoryRoot,
      archiveRoot: outside,
      loadBuildInputs: () => pathFixture.inputs,
      runBuilder: fakeBuilder,
      temporaryRoot: pathFixture.repositoryRoot
    });
    assert.equal(escaped.outcome, 'failed-preflight');
    assert.match(escaped.error, /inside the repository root/);
    assert.equal(escaped.candidateId, null);
    cases += 1;
  } finally { fs.rmSync(outside, { recursive: true, force: true }); }
  const linkedReleases = path.join(pathFixture.repositoryRoot, 'LinkedReleases');
  let symlinkAvailable = true;
  try { fs.symlinkSync(path.join(pathFixture.repositoryRoot, 'Releases'), linkedReleases, 'junction'); }
  catch (error) { symlinkAvailable = false; if (!['EPERM', 'EACCES', 'ERROR_PRIVILEGE_NOT_HELD'].includes(error.code)) throw error; }
  if (symlinkAvailable) {
    const linked = prepareCandidate({
      repositoryRoot: pathFixture.repositoryRoot,
      archiveRoot: linkedReleases,
      loadBuildInputs: () => pathFixture.inputs,
      runBuilder: fakeBuilder,
      temporaryRoot: pathFixture.repositoryRoot
    });
    assert.equal(linked.outcome, 'failed-preflight');
    assert.match(linked.error, /symbolic links|inside the repository root/);
    cases += 1;

    const raceOutside = fs.mkdtempSync(path.join(os.tmpdir(), 'ukho path replacement target '));
    const releases = path.join(pathFixture.repositoryRoot, 'Releases');
    const heldReleases = path.join(pathFixture.repositoryRoot, 'Releases-held-for-race-fixture');
    let builderCalled = false;
    try {
      const raced = prepareCandidate({
        repositoryRoot: pathFixture.repositoryRoot,
        loadBuildInputs: () => pathFixture.inputs,
        runBuilder: (request) => { builderCalled = true; return fakeBuilder(request); },
        clock: () => new Date('2026-10-22T16:00:00Z'),
        idFactory: () => 'reparse-race',
        temporaryRoot: pathFixture.repositoryRoot,
        hooks: { beforeBuild: () => {
          fs.renameSync(releases, heldReleases);
          fs.symlinkSync(raceOutside, releases, 'junction');
        } }
      });
      assert.equal(builderCalled, false, 'identity change is detected before invoking the builder');
      assert.notEqual(raced.outcome, 'prepared-verified');
      assert.deepEqual(fs.readdirSync(raceOutside), [], 'replacement path receives no candidate writes');
      cases += 3;
    } finally {
      if (fs.existsSync(releases) && fs.lstatSync(releases).isSymbolicLink()) fs.unlinkSync(releases);
      if (fs.existsSync(heldReleases)) fs.renameSync(heldReleases, releases);
      fs.rmSync(raceOutside, { recursive: true, force: true });
    }
  }
} finally {
  fs.rmSync(pathFixture.repositoryRoot, { recursive: true, force: true });
}

function releaseInputFixture() {
  const repositoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ukho release inputs with spaces '));
  const currentManifest = { ...manifest, version: '1.0.0', devDependencies: { '@vscode/vsce': '3.9.2' } };
  const currentLock = {
    name: currentManifest.name, version: currentManifest.version, lockfileVersion: 3, requires: true,
    packages: { '': { name: currentManifest.name, version: currentManifest.version, devDependencies: { '@vscode/vsce': '3.9.2' } }, 'node_modules/@vscode/vsce': { version: '3.9.2', integrity: 'fixture' } }
  };
  fs.writeFileSync(path.join(repositoryRoot, 'package.json'), `${JSON.stringify(currentManifest, null, 2)}\n`);
  fs.writeFileSync(path.join(repositoryRoot, 'package-lock.json'), `${JSON.stringify(currentLock, null, 2)}\n`);
  fs.writeFileSync(path.join(repositoryRoot, 'CHANGELOG.md'), fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md')));
  const changelogText = fs.readFileSync(path.join(repositoryRoot, 'CHANGELOG.md'), 'utf8');
  const start = changelogText.indexOf('### 1.0.0 review candidate');
  const end = changelogText.indexOf('\n### ', start + 1);
  const expectedPendingNotes = changelogText.slice(start, end);
  const version = '2.4.8';
  const proposedNotes = `### ${version} review candidate\n\n- Fixture release notes.\n- The version-derived package is ${currentManifest.name}-${version}.vsix.\n`;
  return {
    repositoryRoot, currentManifest, currentLock, changelogText, expectedPendingNotes, proposedNotes,
    version, changeSummary: 'Fixture evidence supports a compatible feature release.'
  };
}

function releaseSnapshot(fixture) {
  return ['package.json', 'package-lock.json', 'CHANGELOG.md'].map((name) => fs.readFileSync(path.join(fixture.repositoryRoot, name)));
}

for (const confirm of [undefined, () => false, () => null]) {
  const fixture = releaseInputFixture();
  try {
    const before = releaseSnapshot(fixture);
    const update = applyConfirmedReleaseInputs({ ...fixture, confirm });
    assert.equal(update.packagingAllowed, false);
    assert.ok(releaseSnapshot(fixture).every((bytes, index) => bytes.equals(before[index])));
    cases += 2;
  } finally { fs.rmSync(fixture.repositoryRoot, { recursive: true, force: true }); }
}

const driftReleaseFixture = releaseInputFixture();
try {
  const update = applyConfirmedReleaseInputs({
    ...driftReleaseFixture,
    confirm: () => {
      fs.appendFileSync(path.join(driftReleaseFixture.repositoryRoot, 'CHANGELOG.md'), '\nEngineer edit during confirmation.\n');
      return true;
    }
  });
  assert.equal(update.outcome, 'preimage-drift');
  assert.equal(update.packagingAllowed, false);
  assert.match(fs.readFileSync(path.join(driftReleaseFixture.repositoryRoot, 'CHANGELOG.md'), 'utf8'), /Engineer edit during confirmation/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(driftReleaseFixture.repositoryRoot, 'package.json'), 'utf8')).version, '1.0.0');
  cases += 3;
} finally { fs.rmSync(driftReleaseFixture.repositoryRoot, { recursive: true, force: true }); }

const successfulReleaseFixture = releaseInputFixture();
try {
  const beforeManifest = JSON.parse(fs.readFileSync(path.join(successfulReleaseFixture.repositoryRoot, 'package.json'), 'utf8'));
  const beforeLock = JSON.parse(fs.readFileSync(path.join(successfulReleaseFixture.repositoryRoot, 'package-lock.json'), 'utf8'));
  const update = applyConfirmedReleaseInputs({
    ...successfulReleaseFixture,
    confirm: (proposal) => {
      assert.equal(proposal.version, successfulReleaseFixture.version);
      assert.equal(proposal.changeSummary, successfulReleaseFixture.changeSummary);
      assert.equal(proposal.changes[3].before, successfulReleaseFixture.expectedPendingNotes);
      assert.equal(proposal.changes[3].after, successfulReleaseFixture.proposedNotes);
      assert.deepEqual(proposal.changes.map((change) => change.field), [
        'version', 'version', 'packages[""].version', 'selected pending Unreleased notes'
      ]);
      return true;
    }
  });
  const afterManifest = JSON.parse(fs.readFileSync(path.join(successfulReleaseFixture.repositoryRoot, 'package.json'), 'utf8'));
  const afterLock = JSON.parse(fs.readFileSync(path.join(successfulReleaseFixture.repositoryRoot, 'package-lock.json'), 'utf8'));
  const afterChangelog = fs.readFileSync(path.join(successfulReleaseFixture.repositoryRoot, 'CHANGELOG.md'), 'utf8');
  assert.equal(update.outcome, 'updated-and-validated');
  assert.equal(update.packagingAllowed, true);
  assert.equal(fs.existsSync(path.join(successfulReleaseFixture.repositoryRoot, '.ukho-vsix-operation.lock')), false);
  assert.equal(fs.existsSync(path.join(successfulReleaseFixture.repositoryRoot, '.ukho-vsix-release-inputs.incomplete.json')), false,
    'fully validated release-input updates clear their fail-closed marker');
  assert.equal(afterManifest.version, successfulReleaseFixture.version);
  assert.equal(afterLock.version, successfulReleaseFixture.version);
  assert.equal(afterLock.packages[''].version, successfulReleaseFixture.version);
  const expectedManifest = { ...beforeManifest, version: successfulReleaseFixture.version };
  const expectedLock = { ...beforeLock, version: successfulReleaseFixture.version, packages: { ...beforeLock.packages, '': { ...beforeLock.packages[''], version: successfulReleaseFixture.version } } };
  assert.deepEqual(afterManifest, expectedManifest);
  assert.deepEqual(afterLock, expectedLock);
  assert.equal(afterChangelog, successfulReleaseFixture.changelogText.replace(successfulReleaseFixture.expectedPendingNotes, successfulReleaseFixture.proposedNotes));
  cases += 7;
} finally { fs.rmSync(successfulReleaseFixture.repositoryRoot, { recursive: true, force: true }); }

const partialReleaseFixture = releaseInputFixture();
try {
  const update = applyConfirmedReleaseInputs({
    ...partialReleaseFixture,
    confirm: () => true,
    replaceFile: (item, guardedReplace) => {
      if (item.name === 'changelog') throw new Error('injected final-file replacement failure');
      guardedReplace();
    }
  });
  assert.equal(update.outcome, 'partial');
  assert.equal(update.packagingAllowed, false);
  assert.equal(update.changed.includes('manifest'), true);
  assert.equal(update.changed.includes('lock'), true);
  assert.equal(JSON.parse(fs.readFileSync(path.join(partialReleaseFixture.repositoryRoot, 'package.json'), 'utf8')).version, partialReleaseFixture.version);
  assert.equal(JSON.parse(fs.readFileSync(path.join(partialReleaseFixture.repositoryRoot, 'package-lock.json'), 'utf8')).version, partialReleaseFixture.version);
  assert.equal(fs.readFileSync(path.join(partialReleaseFixture.repositoryRoot, 'CHANGELOG.md'), 'utf8'), partialReleaseFixture.changelogText,
    'final changelog failure preserves old notes after both package versions changed');
  assert.equal(fs.existsSync(path.join(partialReleaseFixture.repositoryRoot, '.ukho-vsix-release-inputs.incomplete.json')), true,
    'partial confirmed-input updates leave the preparation gate in place');
  assert.deepEqual(fs.readdirSync(partialReleaseFixture.repositoryRoot).filter((name) => name.endsWith('.release-input.tmp')), []);
  let builderCalled = false;
  const blocked = prepareAfterReleaseInputUpdate({
    releaseInputResult: update,
    runBuilder: () => { builderCalled = true; return { status: 0 }; }
  });
  assert.equal(blocked.outcome, 'failed-preflight');
  assert.equal(blocked.verified, false);
  assert.equal(builderCalled, false, 'partial release-input updates cannot start packaging');
  let cliBuilderCalled = false;
  const cliBlocked = prepareCliMain(['prepare'], {
    prepareOptions: {
      repositoryRoot: partialReleaseFixture.repositoryRoot,
      runBuilder: () => { cliBuilderCalled = true; return { status: 0 }; }
    },
    writeOutput: () => {}, suppressExitCode: true
  });
  assert.equal(cliBlocked.outcome, 'failed-preflight');
  assert.match(cliBlocked.error, /release-input update is incomplete/);
  assert.equal(cliBuilderCalled, false, 'the direct preparation CLI fails closed after a partial release-input update');
  cases += 9;
} finally { fs.rmSync(partialReleaseFixture.repositoryRoot, { recursive: true, force: true }); }

const raceReleaseFixture = releaseInputFixture();
try {
  const manifestPath = path.join(raceReleaseFixture.repositoryRoot, 'package.json');
  const concurrentEdit = '\n/* concurrent maintainer edit */\n';
  const update = applyConfirmedReleaseInputs({
    ...raceReleaseFixture,
    confirm: () => true,
    replaceFile: (item, guardedReplace) => {
      if (item.name === 'manifest') fs.appendFileSync(item.file, concurrentEdit);
      guardedReplace();
    }
  });
  assert.equal(update.packagingAllowed, false);
  assert.equal(update.outcome, 'partial');
  assert.match(update.error, /changed at the replacement boundary/);
  assert.equal(fs.readFileSync(manifestPath, 'utf8').endsWith(concurrentEdit), true,
    'a maintainer edit observed at the replacement boundary is preserved');
  cases += 4;
} finally { fs.rmSync(raceReleaseFixture.repositoryRoot, { recursive: true, force: true }); }

assert.equal(require('../package.json').scripts['prepare-vsix'], 'node scripts/prepare-vsix.cjs prepare');
assert.equal(require('../package.json').scripts['inspect-vsix-candidate'], 'node scripts/prepare-vsix.cjs inspect');
assert.deepEqual(validatePreparationArguments(['prepare']), { command: 'prepare' });
assert.deepEqual(validatePreparationArguments(['inspect', '--candidate', 'Releases/2026-10-22/120000Z-id']), {
  command: 'inspect', candidateDirectory: 'Releases/2026-10-22/120000Z-id'
});
assert.throws(() => validatePreparationArguments(['inspect', '--latest']), /Usage/);
assert.throws(() => validatePreparationArguments(['status', '--write']), /Usage/);
assert.deepEqual(validatePreparationArguments([
  'release-inputs', '--version', '2.4.8', '--change-summary', 'Evidence-based summary',
  '--expected-pending-notes', 'old exact notes', '--proposed-notes', '### 2.4.8 review candidate\n\nNew exact notes.'
]), {
  command: 'release-inputs', version: '2.4.8', changeSummary: 'Evidence-based summary',
  expectedPendingNotes: 'old exact notes',
  proposedNotes: '### 2.4.8 review candidate\n\nNew exact notes.'
});
let nonInteractivePrompt = '';
assert.equal(confirmReleaseInputsInteractively({ version: '2.4.8' }, {
  input: { isTTY: false }, output: { isTTY: false, write: (text) => { nonInteractivePrompt += text; } }
}), false);
assert.equal(nonInteractivePrompt, '', 'non-interactive confirmation neither prompts nor authorizes edits');
assert.equal(require('../package.json').scripts['confirm-release-inputs'], 'node scripts/prepare-vsix.cjs release-inputs');
assert.equal(require('../package.json').scripts.package, 'node scripts/package-vsix.cjs', 'legacy no-argument package interface remains unchanged');
cases += 9;

console.log(`Passed ${cases} VSIX verification, packaging, candidate preparation, and release-input fixture cases.`);
