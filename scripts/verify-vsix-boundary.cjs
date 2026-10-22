'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { isDeepStrictEqual } = require('node:util');
const { discover, inspectPath, skillPayloadRoots } = require('./discover-copilot-artifacts.cjs');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'package.json');
const contributionNames = [
  'chatInstructions',
  'chatAgents',
  'chatPromptFiles',
  'chatSkills'
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
  'tests/',
  '.test-staging/',
  'architecture/decisions/',
  '.vsix',
  'ukho.engineering.copilot',
  'copilot-team-rules',
  'proof-of-concept',
  '/poc/',
  '\\poc\\'
];
const EVIDENCE_SCHEMA = 'ukho.vsix-verification-evidence';
const EVIDENCE_SCHEMA_VERSION = 1;
const VERIFICATION_POLICY = 'ukho-vsix-package-boundary';
const VERIFICATION_POLICY_VERSION = 1;
const README_TRANSFORMATION = 'vsce-relative-markdown-links-v1';
const PINNED_TOOL_IDENTITY = Object.freeze({ name: '@vscode/vsce', version: '3.9.2' });

function fail(message) {
  throw new Error(message);
}

function assertPackageIdentity(manifest, context = 'package.json') {
  if (!manifest || manifest.name !== 'ukho-copilot-toolkit' || manifest.publisher !== 'ukho' ||
      !isSupportedVersion(manifest.version) || manifest.engines?.vscode !== '^1.130.0') {
    fail(`${context} identity must remain ukho.ukho-copilot-toolkit with a numeric prepared version and VS Code engine ^1.130.0`);
  }
}

function isSupportedVersion(version) {
  return typeof version === 'string' && /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version);
}

function normalize(value) {
  if (typeof value !== 'string' || value.includes('\\') || value.startsWith('/') ||
      value.split('/').some((part) => !part || part === '.' || part === '..')) {
    fail(`Invalid or aliased path: ${value}`);
  }
  const normalized = path.posix.normalize(value);
  if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized.startsWith('/') || normalized !== value) {
    fail(`Path is not extension-root-relative: ${value}`);
  }
  return normalized;
}

function sourcePath(relative) {
  try { return inspectPath(relative).full; }
  catch (error) { fail(`Cannot safely inspect source path ${relative}: ${error.message}`); }
}

function inventory(relative) {
  const { full, stat } = inspectPath(relative);
  if (stat.isFile()) return [relative];
  if (!stat.isDirectory()) fail(`Unsupported source path: ${relative}`);
  return fs.readdirSync(full).sort().flatMap((name) => inventory(`${relative}/${name}`));
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
  if (typeof manifest.name !== 'string' || !manifest.name || typeof manifest.publisher !== 'string' || !manifest.publisher || typeof manifest.version !== 'string' || !manifest.version) {
    fail('package.json name, publisher and version are required');
  }
  assertPackageIdentity(manifest);
  const discovered = discover();
  const contributions = [];
  for (const name of contributionNames) {
    if (!Array.isArray(manifest.contributes?.[name])) {
      fail(`${name} must be an array`);
    }
    const manifestPaths = manifest.contributes[name].map((entry) => {
      if (!entry || typeof entry.path !== 'string') fail(`${name} contains an invalid path entry`);
      const relative = normalize(entry.path);
      assertAllowed(relative);
      return relative;
    });
    const discoveredPaths = discovered[name];
    if (!Array.isArray(discoveredPaths) || manifestPaths.length !== discoveredPaths.length || manifestPaths.some((value, index) => value !== discoveredPaths[index])) {
      fail(`${name} does not match shared discovery inventory`);
    }
    contributions.push(...manifestPaths.map((relative) => ({ name, relative })));
  }
  if (!Array.isArray(manifest.files)) fail('package.json files must be an array');
  const boundary = new Set();
  for (const entry of manifest.files) {
    if (typeof entry !== 'string') fail('package.json files contains an invalid entry');
    const relative = normalize(entry);
    assertAllowed(relative);
    for (const file of inventory(relative)) {
      if (boundary.has(file)) fail(`Duplicate package files member: ${file}`);
      boundary.add(file);
    }
  }
  if (!boundary.has('package.json')) fail('package.json must be inside the package files boundary');
  for (const { name, relative } of contributions) {
    if (!inspectPath(relative).stat.isFile()) fail(`${name} contribution path is not a regular file: ${relative}`);
    if (!boundary.has(relative)) fail(`${name} contribution is outside the package files boundary: ${relative}`);
  }
  for (const skillRoot of skillPayloadRoots(discovered.chatSkills)) {
    if (!inspectPath(skillRoot).stat.isDirectory()) fail(`Skill payload root is not a directory: ${skillRoot}`);
    for (const file of inventory(skillRoot)) {
      if (!boundary.has(file)) fail(`Skill file is outside the package files boundary: ${file}`);
    }
  }
  const sourceFiles = new Map([...boundary].map((relative) => [relative, fs.readFileSync(sourcePath(relative))]));
  const changelog = sourceFiles.get('CHANGELOG.md').toString('utf8');
  return { manifest, boundary, contributions, changelog, sourceFiles };
}

function expectedVsixPath(manifest, repositoryRoot = root) {
  assertPackageIdentity(manifest);
  return path.join(repositoryRoot, `${manifest.name}-${manifest.version}.vsix`);
}

function parseCentralDirectory(buffer) {
  const signature = Buffer.from('PK\x05\x06', 'binary');
  const eocd = buffer.lastIndexOf(signature);
  if (eocd < 0 || eocd + 22 > buffer.length) fail('VSIX has no valid ZIP end-of-central-directory record');
  const disk = buffer.readUInt16LE(eocd + 4);
  const centralDisk = buffer.readUInt16LE(eocd + 6);
  const diskCount = buffer.readUInt16LE(eocd + 8);
  const count = buffer.readUInt16LE(eocd + 10);
  const centralSize = buffer.readUInt32LE(eocd + 12);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  const commentLength = buffer.readUInt16LE(eocd + 20);
  if (disk || centralDisk || diskCount !== count) fail('Unsupported multi-disk ZIP archive');
  if (count === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) fail('Unsupported ZIP64 archive');
  if (eocd + 22 + commentLength !== buffer.length || centralOffset + centralSize !== eocd) {
    fail('Invalid ZIP central directory or trailing data');
  }
  const entries = [];
  let cursor = centralOffset;
  for (let index = 0; index < count; index += 1) {
    if (cursor + 46 > eocd || buffer.readUInt32LE(cursor) !== 0x02014b50) fail('Invalid ZIP central-directory entry');
    const flags = buffer.readUInt16LE(cursor + 8);
    const method = buffer.readUInt16LE(cursor + 10);
    const crc = buffer.readUInt32LE(cursor + 16);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const memberCommentLength = buffer.readUInt16LE(cursor + 32);
    const end = cursor + 46 + nameLength + extraLength + memberCommentLength;
    if (end > eocd) fail('Invalid ZIP central-directory entry bounds');
    let rawName;
    try { rawName = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(cursor + 46, cursor + 46 + nameLength)); }
    catch { fail('ZIP member name is not valid UTF-8'); }
    const name = normalize(rawName);
    if (rawName.endsWith('/') || name !== rawName) fail(`Non-canonical or directory ZIP member is not allowed: ${rawName}`);
    entries.push({ flags, method, crc, compressedSize, uncompressedSize, localOffset: buffer.readUInt32LE(cursor + 42), rawName, name });
    cursor = end;
  }
  if (cursor !== centralOffset + centralSize) fail('ZIP central-directory size does not match its entries');
  return { entries, centralOffset };
}

function archiveMembers(buffer) {
  const { entries } = parseCentralDirectory(buffer);
  const members = new Set();
  for (const { name } of entries) {
    if (members.has(name)) fail(`Duplicate archive member: ${name}`);
    if (name !== '[Content_Types].xml' && name !== 'extension.vsixmanifest') assertAllowed(name);
    members.add(name);
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

function readArchiveMemberBuffer(buffer, target, maxOutputLength = 16 * 1024 * 1024) {
  target = normalize(target);
  const { entries, centralOffset } = parseCentralDirectory(buffer);
  const matches = entries.filter((candidate) => candidate.name === target);
  if (matches.length > 1) fail(`Duplicate archive member: ${target}`);
  const entry = matches[0];
  if (!entry) fail(`Missing archive member: ${target}`);
  if ((entry.flags & 1) !== 0 || entry.compressedSize === 0xffffffff || entry.uncompressedSize === 0xffffffff || entry.localOffset === 0xffffffff) fail(`Unsupported ZIP entry for ${target}`);
  if (entry.uncompressedSize > maxOutputLength) fail(`Packaged ${target} is too large: ${entry.uncompressedSize} bytes`);
  if (entry.localOffset + 30 > centralOffset || buffer.readUInt32LE(entry.localOffset) !== 0x04034b50) fail(`Invalid ZIP local-file header for ${target}`);
  const localNameLength = buffer.readUInt16LE(entry.localOffset + 26);
  const localExtraLength = buffer.readUInt16LE(entry.localOffset + 28);
  if (entry.localOffset + 30 + localNameLength + localExtraLength > centralOffset) fail(`Invalid ZIP local-file header bounds for ${target}`);
  let localName;
  try { localName = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(entry.localOffset + 30, entry.localOffset + 30 + localNameLength)); }
  catch { fail(`ZIP local member name is not valid UTF-8 for ${target}`); }
  if (localName !== entry.rawName) fail(`ZIP local and central member names differ for ${target}`);
  const dataStart = entry.localOffset + 30 + localNameLength + localExtraLength;
  const dataEnd = dataStart + entry.compressedSize;
  if (dataStart < entry.localOffset || dataEnd > centralOffset || dataEnd > buffer.length) fail(`Invalid ZIP data bounds for ${target}`);
  const localFlags = buffer.readUInt16LE(entry.localOffset + 6);
  const localMethod = buffer.readUInt16LE(entry.localOffset + 8);
  if (localFlags !== entry.flags || localMethod !== entry.method) fail(`ZIP local and central metadata differ for ${target}`);
  if ((entry.flags & 8) === 0 && (buffer.readUInt32LE(entry.localOffset + 14) !== entry.crc ||
      buffer.readUInt32LE(entry.localOffset + 18) !== entry.compressedSize ||
      buffer.readUInt32LE(entry.localOffset + 22) !== entry.uncompressedSize)) {
    fail(`ZIP local and central sizes or CRC differ for ${target}`);
  }
  const compressed = buffer.subarray(dataStart, dataEnd);
  let content;
  try {
    if (entry.method === 0) content = compressed;
    else if (entry.method === 8) content = zlib.inflateRawSync(compressed, { maxOutputLength });
    else fail(`Unsupported ZIP compression method ${entry.method} for ${target}`);
  } catch (error) {
    fail(`Cannot extract ${target}: ${error.message}`);
  }
  if (content.length !== entry.uncompressedSize || crc32(content) !== entry.crc) fail(`Invalid extracted content for ${target}`);
  return content;
}

function readArchiveMember(buffer, target, maxOutputLength) {
  const content = readArchiveMemberBuffer(buffer, target, maxOutputLength);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(content);
  } catch (error) {
    fail(`Packaged ${target} is not valid UTF-8: ${error.message}`);
  }
}

function expectedPackagedReadme(sourceReadme, baseContentUrl) {
  if (typeof sourceReadme !== 'string' || typeof baseContentUrl !== 'string' || !baseContentUrl.endsWith('/')) {
    fail('Source README and the configured baseContentUrl are required for fidelity verification');
  }
  const markdownPathRegex = /(!?)\[([^\]\[]*|!\[[^\]\[]*]\([^)]+\))\]\(([^)]+)\)/g;
  return sourceReadme.replace(markdownPathRegex, (whole, image, title, link) => {
    if (/^mailto:/i.test(link)) return whole;
    const relative = !/^\w+:\/\//.test(link) && link[0] !== '#';
    if (!relative) return whole;
    const resolved = path.posix.normalize(link);
    return `${image}[${title}](${baseContentUrl}${resolved})`;
  });
}

function verifyPackagedReadme(buffer, sourceReadme, baseContentUrl) {
  const readme = readArchiveMember(buffer, 'extension/readme.md');
  const expectedLink = '[`CHANGELOG.md`](https://github.com/UKHO/UKHO.Copilot.Toolkit/blob/main/CHANGELOG.md)';
  const relativeLink = '[`CHANGELOG.md`](CHANGELOG.md)';
  if (readme.split(expectedLink).length !== 2 || readme.includes(relativeLink)) fail('Packaged extension/readme.md has an invalid CHANGELOG.md link');
  if (readme !== expectedPackagedReadme(sourceReadme, baseContentUrl)) {
    fail('Packaged extension/readme.md differs beyond the pinned vsce relative-link transformation');
  }
}

function decodeXmlAttribute(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, reference) => {
    if (reference === 'amp') return '&';
    if (reference === 'lt') return '<';
    if (reference === 'gt') return '>';
    if (reference === 'quot') return '"';
    if (reference === 'apos') return "'";
    const codePoint = reference[1].toLowerCase() === 'x'
      ? Number.parseInt(reference.slice(2), 16)
      : Number.parseInt(reference.slice(1), 10);
    if (!Number.isInteger(codePoint) || codePoint <= 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
      fail('Invalid numeric XML entity in VSIX Identity');
    }
    return String.fromCodePoint(codePoint);
  });
}

function parseXmlAttributes(text) {
  const attributes = Object.create(null);
  let cursor = 0;
  while (cursor < text.length) {
    while (/\s/.test(text[cursor] || '')) cursor += 1;
    if (cursor === text.length) break;
    const match = text.slice(cursor).match(/^([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*("([^"<]*)"|'([^'<]*)')/);
    if (!match) fail('Invalid XML attributes in VSIX Identity');
    if (Object.hasOwn(attributes, match[1])) fail(`Duplicate VSIX Identity attribute: ${match[1]}`);
    const raw = match[3] ?? match[4];
    if (/&(?!(?:#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);)/i.test(raw)) fail('Unsupported XML entity in VSIX Identity');
    const decoded = decodeXmlAttribute(raw);
    attributes[match[1]] = decoded;
    cursor += match[0].length;
  }
  return attributes;
}

function parseVsixIdentity(xml) {
  const stack = [];
  let cursor = 0;
  let rootCount = 0;
  let metadataCount = 0;
  const identities = [];
  const attributeElements = [];
  while (cursor < xml.length) {
    if (xml.startsWith('<!--', cursor)) {
      const end = xml.indexOf('-->', cursor + 4);
      if (end < 0) fail('Malformed XML comment in VSIX manifest');
      cursor = end + 3;
      continue;
    }
    if (xml.startsWith('<![CDATA[', cursor)) {
      const end = xml.indexOf(']]>', cursor + 9);
      if (end < 0) fail('Malformed XML CDATA in VSIX manifest');
      if (!stack.length && xml.slice(cursor + 9, end).trim()) fail('Text is outside the VSIX XML root');
      cursor = end + 3;
      continue;
    }
    if (xml.startsWith('<?', cursor)) {
      const end = xml.indexOf('?>', cursor + 2);
      if (end < 0) fail('Malformed XML processing instruction in VSIX manifest');
      cursor = end + 2;
      continue;
    }
    if (xml.startsWith('<!', cursor)) fail('Unsupported XML declaration in VSIX manifest');
    if (xml[cursor] !== '<') {
      const next = xml.indexOf('<', cursor);
      const end = next < 0 ? xml.length : next;
      if (!stack.length && xml.slice(cursor, end).trim()) fail('Text is outside the VSIX XML root');
      cursor = end;
      continue;
    }

    let end = cursor + 1;
    let quote;
    for (; end < xml.length; end += 1) {
      const character = xml[end];
      if (quote) {
        if (character === quote) quote = undefined;
      } else if (character === '"' || character === "'") quote = character;
      else if (character === '>') break;
    }
    if (end >= xml.length || quote) fail('Malformed XML tag in VSIX manifest');
    const rawTag = xml.slice(cursor, end + 1);
    cursor = end + 1;
    const closing = rawTag.match(/^<\/([A-Za-z_:][A-Za-z0-9_.:-]*)\s*>$/);
    if (closing) {
      if (stack.pop() !== closing[1]) fail(`Mismatched XML closing element: ${closing[1]}`);
      continue;
    }
    const opening = rawTag.match(/^<([A-Za-z_:][A-Za-z0-9_.:-]*)([\s\S]*?)\s*(\/?)>$/);
    if (!opening) fail('Malformed XML element in VSIX manifest');
    const [, name, attributeText, selfClosing] = opening;
    if (!stack.length) {
      rootCount += 1;
      if (rootCount !== 1 || name !== 'PackageManifest') fail('VSIX manifest must have one PackageManifest root element');
    }
    if (name === 'Metadata') {
      if (stack.length !== 1 || stack[0] !== 'PackageManifest') fail('VSIX Metadata must be a direct child of PackageManifest');
      metadataCount += 1;
    }
    if (name === 'Identity') {
      if (stack.length !== 2 || stack[0] !== 'PackageManifest' || stack[1] !== 'Metadata' || metadataCount !== 1) {
        fail('VSIX Identity must be a child of Metadata under PackageManifest');
      }
      identities.push(parseXmlAttributes(attributeText));
      attributeElements.push({ name, selfClosing: Boolean(selfClosing) });
    }
    if (!selfClosing) stack.push(name);
  }
  if (stack.length || rootCount !== 1 || metadataCount !== 1) fail('VSIX manifest has an incomplete or malformed XML structure');
  if (identities.length !== 1 || attributeElements.length !== 1) fail(`Expected one VSIX Identity element, found ${identities.length}`);
  return identities[0];
}

function verifyPackagedIdentity(buffer, manifest) {
  let packagedManifest;
  try {
    packagedManifest = JSON.parse(readArchiveMember(buffer, 'extension/package.json'));
  } catch (error) {
    if (error instanceof SyntaxError) fail(`Packaged extension/package.json is not valid JSON: ${error.message}`);
    throw error;
  }
  for (const property of ['name', 'publisher', 'version', 'engines']) {
    if (!isDeepStrictEqual(packagedManifest[property], manifest[property])) {
      fail(`Packaged extension/package.json ${property} does not match package.json`);
    }
  }
  if (!isDeepStrictEqual(packagedManifest.contributes, manifest.contributes)) {
    fail('Packaged extension/package.json contribution metadata does not match package.json');
  }
  if (!isDeepStrictEqual(packagedManifest, manifest)) {
    fail('Packaged extension/package.json metadata does not match package.json');
  }

  const identity = parseVsixIdentity(readArchiveMember(buffer, 'extension.vsixmanifest'));
  const expectedIdentity = { Id: manifest.name, Publisher: manifest.publisher, Version: manifest.version };
  for (const [property, expected] of Object.entries(expectedIdentity)) {
    if (identity[property] !== expected) fail(`Packaged extension.vsixmanifest Identity ${property} does not match package.json`);
  }
}

function verifyPackagedChangelog(buffer, manifest, sourceChangelog) {
  const packagedChangelog = readArchiveMember(buffer, 'extension/changelog.md');
  const candidateHeading = `### ${manifest.version} review candidate`;
  const candidateFilename = `${manifest.name}-${manifest.version}.vsix`;
  if (!sourceChangelog.includes(candidateHeading) || !sourceChangelog.includes(candidateFilename)) {
    fail(`Source CHANGELOG.md is missing the ${manifest.version} candidate narrative`);
  }
  if (packagedChangelog !== sourceChangelog) fail('Packaged extension/changelog.md does not match source CHANGELOG.md');
}

function verifyPayloadBytes(buffer, boundary, sourceFiles, manifest) {
  if (!(sourceFiles instanceof Map)) fail('Source payload bytes are required for archive fidelity verification');
  for (const relative of boundary) {
    const expected = sourceFiles.get(relative);
    if (!Buffer.isBuffer(expected)) fail(`Source payload bytes are unavailable for ${relative}`);
    const target = archiveName(relative);
    const actual = readArchiveMemberBuffer(buffer, target);
    if (relative === 'README.md') {
      const transformed = Buffer.from(expectedPackagedReadme(expected.toString('utf8'), manifest.vsce?.baseContentUrl), 'utf8');
      if (!actual.equals(transformed)) fail(`Packaged ${target} differs beyond the pinned vsce relative-link transformation`);
    } else if (!actual.equals(expected)) {
      fail(`Packaged ${target} does not match source bytes`);
    }
  }
}

function verifyArchiveContents(buffer, boundary, manifest, sourceChangelog, sourceFiles) {
  assertPackageIdentity(manifest);
  const expected = new Set(['[Content_Types].xml', 'extension.vsixmanifest']);
  for (const file of boundary) expected.add(archiveName(file));
  const actual = archiveMembers(buffer);
  const missing = [...expected].filter((member) => !actual.has(member));
  const unexpected = [...actual].filter((member) => !expected.has(member));
  if (missing.length || unexpected.length) {
    fail(`VSIX boundary mismatch; missing: ${missing.join(', ') || 'none'}; unexpected: ${unexpected.join(', ') || 'none'}`);
  }
  readArchiveMemberBuffer(buffer, '[Content_Types].xml');
  const readme = sourceFiles?.get('README.md');
  if (!Buffer.isBuffer(readme)) fail('Source README bytes are unavailable for archive fidelity verification');
  verifyPackagedReadme(buffer, readme.toString('utf8'), manifest.vsce?.baseContentUrl);
  verifyPackagedIdentity(buffer, manifest);
  verifyPackagedChangelog(buffer, manifest, sourceChangelog);
  verifyPayloadBytes(buffer, boundary, sourceFiles, manifest);
}

function verifyArchive(boundary, expectedVsix, manifest, sourceChangelog, sourceFiles, repositoryRoot = root) {
  if (path.resolve(expectedVsix) !== path.resolve(expectedVsixPath(manifest, repositoryRoot))) {
    fail('Verifier input must be the version-derived repository-root VSIX; alternate paths are not searched');
  }
  let stat;
  try { stat = fs.lstatSync(expectedVsix); }
  catch (error) {
    if (error.code === 'ENOENT') fail(`Expected Toolkit VSIX is unavailable: ${path.basename(expectedVsix)}`);
    throw error;
  }
  if (stat.isSymbolicLink() || !stat.isFile()) fail('Expected Toolkit VSIX must be a regular non-symbolic-link file');
  const archive = fs.readFileSync(expectedVsix);
  verifyArchiveContents(archive, boundary, manifest, sourceChangelog, sourceFiles);
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sourceMemberEvidence(boundary, sourceFiles) {
  if (!(boundary instanceof Set) || !(sourceFiles instanceof Map)) {
    fail('Build inputs require a boundary Set and sourceFiles Map');
  }
  const members = [...boundary].sort().map((relative) => {
    normalize(relative);
    const bytes = sourceFiles.get(relative);
    if (!Buffer.isBuffer(bytes)) fail(`Build input bytes are unavailable for ${relative}`);
    return { name: relative, sha256: sha256(bytes), length: bytes.length };
  });
  if (members.length !== sourceFiles.size || [...sourceFiles.keys()].some((name) => !boundary.has(name))) {
    fail('Build input source bytes do not exactly match the package boundary');
  }
  return members;
}

function evidenceCore(evidence) {
  const { integrity, ...core } = evidence;
  return core;
}

function sealEvidence(core) {
  return {
    ...core,
    integrity: { algorithm: 'sha256', digest: sha256(Buffer.from(stableStringify(core), 'utf8')) }
  };
}

function buildEvidenceInputs(buildInputs) {
  if (!buildInputs || typeof buildInputs !== 'object') fail('Fresh verification requires captured buildInputs');
  const { manifest, boundary, sourceChangelog, sourceFiles } = buildInputs;
  assertPackageIdentity(manifest, 'Captured package.json');
  if (typeof sourceChangelog !== 'string') fail('Build inputs require sourceChangelog text');
  const sourceMembers = sourceMemberEvidence(boundary, sourceFiles);
  const changelogBytes = sourceFiles.get('CHANGELOG.md');
  if (!Buffer.isBuffer(changelogBytes) || !changelogBytes.equals(Buffer.from(sourceChangelog, 'utf8'))) {
    fail('Build input sourceChangelog does not match captured CHANGELOG.md bytes');
  }
  return { manifest, boundary, sourceChangelog, sourceFiles, sourceMembers };
}

function captureBuildEvidence({ archiveBytes, buildInputs, toolIdentity = PINNED_TOOL_IDENTITY } = {}) {
  if (!Buffer.isBuffer(archiveBytes)) fail('Evidence capture requires archiveBytes as a Buffer');
  const inputs = buildEvidenceInputs(buildInputs);
  if (!isDeepStrictEqual(toolIdentity, PINNED_TOOL_IDENTITY)) {
    fail('Verification tool identity must be the pinned @vscode/vsce 3.9.2');
  }
  verifyArchiveContents(archiveBytes, inputs.boundary, inputs.manifest, inputs.sourceChangelog, inputs.sourceFiles);
  const members = [...archiveMembers(archiveBytes)].sort().map((name) => {
    const bytes = readArchiveMemberBuffer(archiveBytes, name);
    return { name, sha256: sha256(bytes), length: bytes.length };
  });
  const core = {
    schema: EVIDENCE_SCHEMA,
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    policy: { id: VERIFICATION_POLICY, version: VERIFICATION_POLICY_VERSION },
    tool: { ...PINNED_TOOL_IDENTITY },
    captured: {
      identity: { name: inputs.manifest.name, publisher: inputs.manifest.publisher, version: inputs.manifest.version },
      manifest: JSON.parse(JSON.stringify(inputs.manifest)),
      boundary: [...inputs.boundary].sort(),
      sourceMembers: inputs.sourceMembers,
      readmeTransformation: {
        id: README_TRANSFORMATION,
        baseContentUrl: inputs.manifest.vsce?.baseContentUrl
      },
      expectedMembers: members
    },
    trustLimit: 'The digest detects accidental or partial evidence changes, not an adversary who can alter both evidence and its digest. Historical verification establishes consistency with retained evidence, not independent provenance or source fidelity.'
  };
  return sealEvidence(core);
}

function validateEvidence(evidence) {
  if (!evidence || typeof evidence !== 'object' || evidence.schema !== EVIDENCE_SCHEMA ||
      evidence.schemaVersion !== EVIDENCE_SCHEMA_VERSION) fail('Missing or unsupported VSIX verification evidence schema');
  if (!evidence.integrity || evidence.integrity.algorithm !== 'sha256' ||
      !/^[a-f0-9]{64}$/.test(evidence.integrity.digest || '') ||
      sha256(Buffer.from(stableStringify(evidenceCore(evidence)), 'utf8')) !== evidence.integrity.digest) {
    fail('VSIX verification evidence is missing, inconsistent or tampered (integrity digest mismatch)');
  }
  if (!isDeepStrictEqual(evidence.policy, { id: VERIFICATION_POLICY, version: VERIFICATION_POLICY_VERSION }) ||
      !isDeepStrictEqual(evidence.tool, PINNED_TOOL_IDENTITY)) fail('Unsupported verification policy or pinned tool identity in evidence');
  const captured = evidence.captured;
  if (!captured || !Array.isArray(captured.boundary) || !Array.isArray(captured.sourceMembers) ||
      !Array.isArray(captured.expectedMembers) || !captured.manifest || typeof captured.readmeTransformation !== 'object') {
    fail('VSIX verification evidence is incomplete');
  }
  assertPackageIdentity(captured.manifest, 'Evidence manifest');
  const identity = { name: captured.manifest.name, publisher: captured.manifest.publisher, version: captured.manifest.version };
  if (!isDeepStrictEqual(captured.identity, identity)) fail('Evidence identity does not match its captured manifest');
  if (!isDeepStrictEqual(captured.readmeTransformation, {
    id: README_TRANSFORMATION, baseContentUrl: captured.manifest.vsce?.baseContentUrl
  })) fail('Evidence README transformation policy is missing or inconsistent');
  const boundary = new Set(captured.boundary);
  if (boundary.size !== captured.boundary.length || captured.boundary.some((name) => normalize(name) !== name)) {
    fail('Evidence package boundary is invalid or duplicated');
  }
  const sourceByName = new Map();
  for (const item of captured.sourceMembers) {
    if (!item || typeof item.name !== 'string' || !boundary.has(item.name) || sourceByName.has(item.name) ||
        !/^[a-f0-9]{64}$/.test(item.sha256 || '') || !Number.isSafeInteger(item.length) || item.length < 0) {
      fail('Evidence source-member inventory is invalid');
    }
    sourceByName.set(item.name, item);
  }
  if (sourceByName.size !== boundary.size) fail('Evidence source-member inventory is incomplete');
  const expectedNames = new Set(['[Content_Types].xml', 'extension.vsixmanifest', ...[...boundary].map(archiveName)]);
  const expectedByName = new Map();
  for (const item of captured.expectedMembers) {
    if (!item || typeof item.name !== 'string' || expectedByName.has(item.name) ||
        !/^[a-f0-9]{64}$/.test(item.sha256 || '') || !Number.isSafeInteger(item.length) || item.length < 0) {
      fail('Evidence packaged-member inventory is invalid');
    }
    expectedByName.set(item.name, item);
  }
  if (expectedByName.size !== expectedNames.size || [...expectedNames].some((name) => !expectedByName.has(name))) {
    fail('Evidence packaged-member inventory is inconsistent with its package boundary');
  }
  for (const [relative, source] of sourceByName) {
    const packagedName = archiveName(relative);
    const packaged = expectedByName.get(packagedName);
    if (relative !== 'README.md' && (packaged.sha256 !== source.sha256 || packaged.length !== source.length)) {
      fail(`Evidence packaged payload does not match captured source bytes for ${relative}`);
    }
  }
  return { captured, boundary, expectedByName, sourceByName };
}

function assertArchiveMatchesEvidence(archiveBytes, evidenceData) {
  const actualNames = archiveMembers(archiveBytes);
  const expectedNames = new Set(evidenceData.expectedByName.keys());
  const missing = [...expectedNames].filter((name) => !actualNames.has(name));
  const unexpected = [...actualNames].filter((name) => !expectedNames.has(name));
  if (missing.length || unexpected.length) {
    fail(`Historical VSIX boundary mismatch; missing: ${missing.join(', ') || 'none'}; unexpected: ${unexpected.join(', ') || 'none'}`);
  }
  for (const [name, expected] of evidenceData.expectedByName) {
    const bytes = readArchiveMemberBuffer(archiveBytes, name);
    if (bytes.length !== expected.length || sha256(bytes) !== expected.sha256) {
      fail(`Historical VSIX member does not match retained evidence: ${name}`);
    }
  }
  const manifest = evidenceData.captured.manifest;
  verifyPackagedIdentity(archiveBytes, manifest);
  const changelog = evidenceData.sourceByName.get('CHANGELOG.md');
  const packagedChangelog = readArchiveMemberBuffer(archiveBytes, 'extension/changelog.md');
  if (!changelog || packagedChangelog.length !== changelog.length || sha256(packagedChangelog) !== changelog.sha256) {
    fail('Historical packaged CHANGELOG.md does not match captured source evidence');
  }
  const candidateHeading = `### ${manifest.version} review candidate`;
  const candidateFilename = `${manifest.name}-${manifest.version}.vsix`;
  const changelogText = packagedChangelog.toString('utf8');
  if (!changelogText.includes(candidateHeading) || !changelogText.includes(candidateFilename)) {
    fail('Historical packaged CHANGELOG.md is missing its captured candidate narrative');
  }
}

function verifyCandidate({ archiveBytes, evidence, mode, buildInputs } = {}) {
  if (!Buffer.isBuffer(archiveBytes)) fail('Candidate verification requires archiveBytes as a Buffer');
  if (mode !== 'fresh' && mode !== 'historical') fail('Candidate verification mode must be fresh or historical');
  const evidenceData = validateEvidence(evidence);
  if (mode === 'fresh') {
    const inputs = buildEvidenceInputs(buildInputs);
    if (!isDeepStrictEqual(inputs.manifest, evidenceData.captured.manifest) ||
        !isDeepStrictEqual([...inputs.boundary].sort(), evidenceData.captured.boundary) ||
        !isDeepStrictEqual(inputs.sourceMembers, evidenceData.captured.sourceMembers)) {
      fail('Fresh build inputs differ from the inputs captured in verification evidence');
    }
    verifyArchiveContents(archiveBytes, inputs.boundary, inputs.manifest, inputs.sourceChangelog, inputs.sourceFiles);
    assertArchiveMatchesEvidence(archiveBytes, evidenceData);
    return { verified: true, mode, claim: 'source-fidelity-and-evidence-consistency', trustLimit: evidence.trustLimit };
  }
  assertArchiveMatchesEvidence(archiveBytes, evidenceData);
  return { verified: true, mode, claim: 'historical-artifact-evidence-consistency-only', trustLimit: evidence.trustLimit };
}

function verifySelectedCandidate({ candidatePath, evidence, mode, buildInputs } = {}) {
  if (typeof candidatePath !== 'string' || !candidatePath) fail('An explicit candidatePath is required; no fallback candidate is searched');
  let stat;
  try { stat = fs.lstatSync(candidatePath); }
  catch (error) {
    if (error.code === 'ENOENT') fail(`Explicit selected candidate is unavailable: ${candidatePath}`);
    throw error;
  }
  if (stat.isSymbolicLink() || !stat.isFile()) fail('Explicit selected candidate must be a regular non-symbolic-link file');
  return verifyCandidate({ archiveBytes: fs.readFileSync(candidatePath), evidence, mode, buildInputs });
}

function main() {
  try {
    const { manifest, boundary, contributions, changelog, sourceFiles } = readManifest();
    const expectedVsix = expectedVsixPath(manifest);
    verifyArchive(boundary, expectedVsix, manifest, changelog, sourceFiles);
    console.log(`Verified ${contributions.length} contributions and ${boundary.size} source files in ${path.basename(expectedVsix)}.`);
  } catch (error) {
    console.error(`VSIX boundary verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  archiveMembers, captureBuildEvidence, expectedPackagedReadme, expectedVsixPath, parseVsixIdentity,
  readArchiveMember, readArchiveMemberBuffer, readManifest, verifyArchive, verifyArchiveContents,
  verifyCandidate, verifySelectedCandidate
};
