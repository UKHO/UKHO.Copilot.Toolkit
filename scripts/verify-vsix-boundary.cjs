'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'package.json');
const expectedVsix = path.join(root, 'ukho.copilot-toolkit-0.1.0.vsix');
const classes = [
  ['chatInstructions', 2],
  ['chatAgents', 16],
  ['chatPromptFiles', 4],
  ['chatSkills', 10]
];
const prohibited = [
  '.github/copilot-instructions.md',
  '.git/',
  '.gitignore',
  '.gitattributes',
  '.gitmodules',
  'docs/',
  'node_modules/',
  'package-lock.json',
  'scripts/',
  '.vsix',
  'ukho.engineering.copilot',
  'copilot-team-rules',
  'proof-of-concept',
  '/poc/',
  '\\poc\\'
];

function fail(message) {
  throw new Error(message);
}

function normalize(value) {
  if (typeof value !== 'string' || value.includes('\\')) fail(`Invalid path: ${value}`);
  const normalized = path.posix.normalize(value.replace(/^\.\//, ''));
  if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized.startsWith('/') || normalized.includes('/../')) {
    fail(`Path is not extension-root-relative: ${value}`);
  }
  return normalized;
}

function sourcePath(relative) {
  const full = path.resolve(root, relative);
  if (full !== root && !full.startsWith(`${root}${path.sep}`)) fail(`Path escapes extension root: ${relative}`);
  return full;
}

function inventory(relative) {
  const full = sourcePath(relative);
  if (!fs.existsSync(full)) fail(`Missing source path: ${relative}`);
  const stat = fs.lstatSync(full);
  if (stat.isSymbolicLink()) fail(`Symbolic links are not allowed: ${relative}`);
  if (stat.isFile()) return [relative];
  if (!stat.isDirectory()) fail(`Unsupported source path: ${relative}`);
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const child = `${relative}/${entry.name}`;
    if (entry.isSymbolicLink()) fail(`Symbolic links are not allowed: ${child}`);
    return inventory(child);
  });
}

function assertAllowed(relative) {
  const lower = relative.toLowerCase();
  const basename = path.posix.basename(lower);
  const isLifecycleRecord = /^(?:\d{3}-)?(?:research-brief|implementation-plan|implementation-report|review-report)\.md$/.test(basename);
  if (isLifecycleRecord || prohibited.some((item) => lower.includes(item))) fail(`Prohibited package content: ${relative}`);
}

function archiveName(relative) {
  const packagedNames = {
    'README.md': 'readme.md',
    'CHANGELOG.md': 'changelog.md',
    LICENSE: 'LICENSE.txt'
  };
  return `extension/${packagedNames[relative] || relative}`;
}

function readManifest() {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`Cannot parse package.json: ${error.message}`);
  }
  const contributions = [];
  for (const [name, count] of classes) {
    if (!Array.isArray(manifest.contributes?.[name]) || manifest.contributes[name].length !== count) {
      fail(`${name} must contain exactly ${count} entries`);
    }
    for (const entry of manifest.contributes[name]) {
      if (!entry || typeof entry.path !== 'string') fail(`${name} contains an invalid path entry`);
      const relative = normalize(entry.path);
      assertAllowed(relative);
      contributions.push({ name, relative });
    }
  }
  if (!Array.isArray(manifest.files)) fail('package.json files must be an array');
  const boundary = new Set(['package.json']);
  for (const entry of manifest.files) {
    const relative = normalize(entry);
    assertAllowed(relative);
    for (const file of inventory(relative)) boundary.add(file);
  }
  for (const { name, relative } of contributions) {
    if (name === 'chatSkills') {
      const skill = sourcePath(relative);
      if (!fs.statSync(skill).isDirectory()) fail(`Skill path is not a directory: ${relative}`);
      const skillManifest = `${relative}/SKILL.md`;
      if (!boundary.has(skillManifest) || !fs.existsSync(sourcePath(skillManifest))) {
        fail(`Skill is missing SKILL.md: ${relative}`);
      }
      for (const file of inventory(relative)) {
        if (!boundary.has(file)) fail(`Skill file is outside the package files boundary: ${file}`);
      }
    } else {
      if (!fs.statSync(sourcePath(relative)).isFile()) fail(`${name} path is not a file: ${relative}`);
      if (!boundary.has(relative)) fail(`${name} path is outside the package files boundary: ${relative}`);
    }
  }
  return { manifest, boundary, contributions };
}

function archiveMembers(buffer) {
  const signature = Buffer.from('PK\x05\x06', 'binary');
  const eocd = buffer.lastIndexOf(signature);
  if (eocd < 0) fail('VSIX is not a ZIP archive');
  const count = buffer.readUInt16LE(eocd + 10);
  const centralSize = buffer.readUInt32LE(eocd + 12);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  if (centralOffset + centralSize > eocd) fail('Invalid ZIP central directory');
  const members = new Set();
  let cursor = centralOffset;
  for (let index = 0; index < count; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) fail('Invalid ZIP central-directory entry');
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const rawName = buffer.toString('utf8', cursor + 46, cursor + 46 + nameLength);
    const name = normalize(rawName);
    if (rawName.endsWith('/') || members.has(name)) fail(`Directories and duplicate archive members are not allowed: ${rawName}`);
    if (name !== '[Content_Types].xml' && name !== 'extension.vsixmanifest') assertAllowed(name);
    members.add(name);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return members;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function readArchiveMember(buffer, target) {
  const signature = Buffer.from('PK\x05\x06', 'binary');
  const eocd = buffer.lastIndexOf(signature);
  if (eocd < 0 || eocd + 22 > buffer.length) fail('VSIX has no valid ZIP end-of-central-directory record');
  const count = buffer.readUInt16LE(eocd + 10);
  const centralSize = buffer.readUInt32LE(eocd + 12);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  if (count === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) fail('Unsupported ZIP64 archive');
  if (centralOffset + centralSize > eocd) fail('Invalid ZIP central directory');

  let cursor = centralOffset;
  let entry;
  for (let index = 0; index < count; index += 1) {
    if (cursor + 46 > eocd || buffer.readUInt32LE(cursor) !== 0x02014b50) fail('Invalid ZIP central-directory entry while reading packaged README.md');
    const flags = buffer.readUInt16LE(cursor + 8);
    const method = buffer.readUInt16LE(cursor + 10);
    const crc = buffer.readUInt32LE(cursor + 16);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const end = cursor + 46 + nameLength + extraLength + commentLength;
    if (end > eocd) fail('Invalid ZIP central-directory entry bounds while reading packaged README.md');
    const rawName = buffer.toString('utf8', cursor + 46, cursor + 46 + nameLength);
    if (normalize(rawName) === target) {
      if (entry) fail(`Duplicate archive member: ${target}`);
      entry = { flags, method, crc, compressedSize, uncompressedSize, localOffset: buffer.readUInt32LE(cursor + 42) };
    }
    cursor = end;
  }
  if (!entry) fail(`Missing archive member: ${target}`);
  if ((entry.flags & 1) !== 0 || entry.compressedSize === 0xffffffff || entry.uncompressedSize === 0xffffffff || entry.localOffset === 0xffffffff) fail(`Unsupported ZIP entry for ${target}`);
  if (entry.uncompressedSize > 16 * 1024 * 1024) fail(`Packaged README.md is too large: ${entry.uncompressedSize} bytes`);
  if (entry.localOffset + 30 > centralOffset || buffer.readUInt32LE(entry.localOffset) !== 0x04034b50) fail(`Invalid ZIP local-file header for ${target}`);
  const localNameLength = buffer.readUInt16LE(entry.localOffset + 26);
  const localExtraLength = buffer.readUInt16LE(entry.localOffset + 28);
  const dataStart = entry.localOffset + 30 + localNameLength + localExtraLength;
  const dataEnd = dataStart + entry.compressedSize;
  if (dataStart < entry.localOffset || dataEnd > centralOffset || dataEnd > buffer.length) fail(`Invalid ZIP data bounds for ${target}`);
  const compressed = buffer.subarray(dataStart, dataEnd);
  let content;
  try {
    if (entry.method === 0) content = compressed;
    else if (entry.method === 8) content = zlib.inflateRawSync(compressed, { maxOutputLength: 16 * 1024 * 1024 });
    else fail(`Unsupported ZIP compression method ${entry.method} for ${target}`);
  } catch (error) {
    fail(`Cannot extract ${target}: ${error.message}`);
  }
  if (content.length !== entry.uncompressedSize || crc32(content) !== entry.crc) fail(`Invalid extracted content for ${target}`);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(content);
  } catch (error) {
    fail(`Packaged ${target} is not valid UTF-8: ${error.message}`);
  }
}

function verifyPackagedReadme(buffer) {
  const readme = readArchiveMember(buffer, 'extension/readme.md');
  const expectedLink = '[`CHANGELOG.md`](https://github.com/UKHO/UKHO.Copilot.Toolkit/blob/main/CHANGELOG.md)';
  const relativeLink = '[`CHANGELOG.md`](CHANGELOG.md)';
  if (readme.split(expectedLink).length !== 2 || readme.includes(relativeLink)) fail('Packaged extension/readme.md has an invalid CHANGELOG.md link');
}

function verifyArchive(boundary) {
  if (!fs.existsSync(expectedVsix)) fail(`Expected Toolkit VSIX is unavailable: ${path.basename(expectedVsix)}`);
  const expected = new Set(['[Content_Types].xml', 'extension.vsixmanifest']);
  for (const file of boundary) expected.add(archiveName(file));
  const archive = fs.readFileSync(expectedVsix);
  const actual = archiveMembers(archive);
  const missing = [...expected].filter((member) => !actual.has(member));
  const unexpected = [...actual].filter((member) => !expected.has(member));
  if (missing.length || unexpected.length) {
    fail(`VSIX boundary mismatch; missing: ${missing.join(', ') || 'none'}; unexpected: ${unexpected.join(', ') || 'none'}`);
  }
  verifyPackagedReadme(archive);
}

try {
  const { boundary, contributions } = readManifest();
  verifyArchive(boundary);
  console.log(`Verified ${contributions.length} contributions and ${boundary.size} source files in ${path.basename(expectedVsix)}.`);
} catch (error) {
  console.error(`VSIX boundary verification failed: ${error.message}`);
  process.exitCode = 1;
}