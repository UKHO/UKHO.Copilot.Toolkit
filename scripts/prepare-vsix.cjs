'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { isDeepStrictEqual } = require('node:util');
const {
  captureBuildEvidence, readManifest, verifySelectedCandidate
} = require('./verify-vsix-boundary.cjs');

const EXTENSION_NAME = 'ukho-copilot-toolkit';
const PUBLISHER = 'ukho';
const ENGINE = '^1.130.0';
const VSCE_VERSION = '3.9.2';
const CANDIDATE_SCHEMA = 'ukho.vsix-candidate';
const CANDIDATE_SCHEMA_VERSION = 1;
const STATUS_SCHEMA = 'ukho.vsix-candidate-human-status';
const STATUS_SCHEMA_VERSION = 1;
const EVIDENCE_FILE = 'verification-evidence.json';
const STATUS_FILE = 'status.json';
const METADATA_FILE = 'candidate.json';
const OPERATION_LOCK_FILE = '.ukho-vsix-operation.lock';
const INCOMPLETE_RELEASE_INPUTS_FILE = '.ukho-vsix-release-inputs.incomplete.json';

function fail(message) {
  throw new Error(message);
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function parseJsonFile(file, label) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { fail(`${label} is unavailable or invalid: ${error.message}`); }
}

function safePath(fullPath, { mustExist = true, directory, label = 'Path' } = {}) {
  const absolute = path.resolve(fullPath);
  const parsed = path.parse(absolute);
  const components = absolute.slice(parsed.root.length).split(path.sep).filter(Boolean);
  let current = parsed.root;
  let lastStat;
  for (let index = 0; index <= components.length; index += 1) {
    if (index) current = path.join(current, components[index - 1]);
    try { lastStat = fs.lstatSync(current); }
    catch (error) {
      if (!mustExist && error.code === 'ENOENT') return absolute;
      fail(`${label} cannot be safely inspected at ${current}: ${error.message}`);
    }
    if (lastStat.isSymbolicLink()) fail(`${label} cannot contain symbolic links or junctions: ${current}`);
    if (index < components.length && !lastStat.isDirectory()) fail(`${label} has a non-directory component: ${current}`);
  }
  if (directory === true && !lastStat.isDirectory()) fail(`${label} must be a directory`);
  if (directory === false && !lastStat.isFile()) fail(`${label} must be a regular file`);
  return absolute;
}

function capturePathIdentity(fullPath, { directory, label = 'Path' } = {}) {
  const absolute = safePath(fullPath, { directory, label });
  const stat = fs.lstatSync(absolute);
  return { path: absolute, dev: stat.dev, ino: stat.ino, mode: stat.mode, directory: stat.isDirectory(), label };
}

function assertPathIdentity(identity) {
  const current = capturePathIdentity(identity.path, { directory: identity.directory, label: identity.label });
  if (current.dev !== identity.dev || current.ino !== identity.ino || current.mode !== identity.mode) {
    fail(`${identity.label} identity changed during the operation: ${identity.path}`);
  }
}

function createIdentityGuard(identities) {
  return () => identities.forEach(assertPathIdentity);
}

function acquireOperationLock(repositoryRoot) {
  const rootIdentity = capturePathIdentity(repositoryRoot, { directory: true, label: 'Repository root' });
  const lockPath = path.join(repositoryRoot, OPERATION_LOCK_FILE);
  const token = `${process.pid}:${crypto.randomUUID()}`;
  let descriptor;
  try {
    assertPathIdentity(rootIdentity);
    descriptor = fs.openSync(lockPath, 'wx', 0o600);
    fs.writeFileSync(descriptor, token, 'utf8');
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    const lockIdentity = capturePathIdentity(lockPath, { directory: false, label: 'VSIX operation lock' });
    return {
      assertHeld() {
        assertPathIdentity(rootIdentity);
        assertPathIdentity(lockIdentity);
        if (fs.readFileSync(lockPath, 'utf8') !== token) fail('VSIX operation lock ownership changed');
      },
      release() {
        assertPathIdentity(rootIdentity);
        assertPathIdentity(lockIdentity);
        if (fs.readFileSync(lockPath, 'utf8') !== token) fail('VSIX operation lock ownership changed; refusing to remove it');
        fs.unlinkSync(lockPath);
      }
    };
  } catch (error) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (error.code === 'EEXIST') fail('Another VSIX helper operation holds the repository lock, or a prior interruption left it; inspect and reconcile before retrying');
    throw error;
  }
}

function assertNoIncompleteReleaseInputs(repositoryRoot) {
  const marker = path.join(repositoryRoot, INCOMPLETE_RELEASE_INPUTS_FILE);
  try {
    safePath(marker, { directory: false, label: 'Incomplete release-input marker' });
  } catch (error) {
    if (/ENOENT/.test(error.message)) return;
    throw error;
  }
  fail('A prior confirmed release-input update is incomplete; reconcile its saved files before preparation');
}

function writeIncompleteReleaseInputsMarker(repositoryRoot, operationLock) {
  const marker = path.join(repositoryRoot, INCOMPLETE_RELEASE_INPUTS_FILE);
  const bytes = jsonBytes({ schema: 'ukho.vsix-release-inputs-incomplete', schemaVersion: 1, createdAt: new Date().toISOString() });
  operationLock.assertHeld();
  fs.writeFileSync(marker, bytes, { flag: 'wx', mode: 0o600 });
  const identity = capturePathIdentity(marker, { directory: false, label: 'Incomplete release-input marker' });
  operationLock.assertHeld();
  if (!fs.readFileSync(marker).equals(bytes)) fail('Incomplete release-input marker failed readback');
  return { identity, bytes };
}

function removeIncompleteReleaseInputsMarker(repositoryRoot, marker, operationLock) {
  const markerPath = path.join(repositoryRoot, INCOMPLETE_RELEASE_INPUTS_FILE);
  operationLock.assertHeld();
  assertPathIdentity(marker.identity);
  if (!fs.readFileSync(markerPath).equals(marker.bytes)) fail('Incomplete release-input marker changed; refusing to clear it');
  fs.unlinkSync(markerPath);
}

function isContained(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function assertVersion(version) {
  if (typeof version !== 'string' || !/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version)) {
    fail('Prepared package version must be numeric major.minor.patch');
  }
}

function assertManifest(manifest) {
  if (!manifest || manifest.name !== EXTENSION_NAME || manifest.publisher !== PUBLISHER ||
      manifest.engines?.vscode !== ENGINE || manifest.devDependencies?.['@vscode/vsce'] !== VSCE_VERSION) {
    fail(`Manifest identity, engine, and pinned @vscode/vsce ${VSCE_VERSION} must remain unchanged`);
  }
  assertVersion(manifest.version);
}

function validateBuildInputs(inputs, diskManifest) {
  if (!inputs || !inputs.manifest || !(inputs.boundary instanceof Set) || !(inputs.sourceFiles instanceof Map)) {
    fail('Captured build inputs must include a manifest, boundary Set, and sourceFiles Map');
  }
  const manifest = inputs.manifest;
  assertManifest(manifest);
  if (diskManifest && !isDeepStrictEqual(manifest, diskManifest)) fail('Captured build manifest differs from package.json preflight');
  if (!Array.isArray(inputs.contributions) && !manifest.contributes) fail('Shared discovery/manifest contribution inputs are unavailable');
  if (manifest.name !== EXTENSION_NAME || !manifest.contributes || !Array.isArray(manifest.files)) fail('Manifest boundary metadata is incomplete');
  if (typeof inputs.sourceChangelog !== 'string') fail('Captured CHANGELOG.md text is unavailable');
  if (!Buffer.isBuffer(inputs.sourceFiles.get('CHANGELOG.md')) ||
      !inputs.sourceFiles.get('CHANGELOG.md').equals(Buffer.from(inputs.sourceChangelog, 'utf8'))) {
    fail('Captured changelog text differs from build-bound CHANGELOG.md bytes');
  }
  for (const [relative, bytes] of inputs.sourceFiles) {
    if (typeof relative !== 'string' || relative.includes('\\') || relative.startsWith('/') ||
        relative.split('/').some((part) => !part || part === '.' || part === '..') || !Buffer.isBuffer(bytes) || !inputs.boundary.has(relative)) {
      fail(`Captured source inventory is invalid at ${relative}`);
    }
  }
  if (inputs.boundary.size !== inputs.sourceFiles.size) fail('Captured source inventory does not exactly match package boundary');
  if (Array.isArray(inputs.contributions)) {
    const grouped = new Map(Object.keys(manifest.contributes || {}).map((name) => [name, []]));
    for (const contribution of inputs.contributions) {
      if (!contribution || !grouped.has(contribution.name) || typeof contribution.relative !== 'string') {
        fail('Captured shared-discovery contribution inventory is invalid');
      }
      grouped.get(contribution.name).push(contribution.relative);
      if (!inputs.boundary.has(contribution.relative)) fail(`Discovered contribution is outside the package boundary: ${contribution.relative}`);
    }
    for (const [name, entries] of grouped) {
      const manifestPaths = manifest.contributes[name].map((entry) => entry.path);
      if (entries.length !== manifestPaths.length || entries.some((entry, index) => entry !== manifestPaths[index])) {
        fail(`${name} does not match the captured shared-discovery inventory`);
      }
    }
  }
  return inputs;
}

function loadInputs(repositoryRoot, loadBuildInputs) {
  let loaded;
  if (loadBuildInputs) {
    loaded = loadBuildInputs(repositoryRoot);
  } else {
    if (path.resolve(repositoryRoot) !== path.resolve(__dirname, '..')) {
      fail('Non-checkout preparation requires an explicit fixture build-input provider');
    }
    const current = readManifest();
    loaded = {
      ...current,
      sourceChangelog: current.changelog
    };
  }
  const manifestPath = safePath(path.join(repositoryRoot, 'package.json'), { directory: false, label: 'package.json' });
  const diskManifest = parseJsonFile(manifestPath, 'package.json');
  validateBuildInputs(loaded, diskManifest);
  return loaded;
}

function inspectPinnedVsce(repositoryRoot, manifest) {
  assertManifest(manifest);
  const packagePath = safePath(path.join(repositoryRoot, 'node_modules', '@vscode', 'vsce', 'package.json'), {
    directory: false, label: 'Pinned @vscode/vsce package metadata'
  });
  const packageBytes = fs.readFileSync(packagePath);
  let installed;
  try { installed = JSON.parse(packageBytes.toString('utf8')); }
  catch (error) { fail(`Pinned @vscode/vsce package metadata is invalid: ${error.message}`); }
  if (installed.version !== VSCE_VERSION) fail(`Installed @vscode/vsce must be ${VSCE_VERSION}, found ${installed.version}`);
  const executable = safePath(path.join(repositoryRoot, 'node_modules', '@vscode', 'vsce', 'vsce'), {
    directory: false, label: 'Pinned @vscode/vsce executable'
  });
  const executableBytes = fs.readFileSync(executable);
  return {
    executable,
    version: installed.version,
    packageSha256: sha256(packageBytes),
    executableSha256: sha256(executableBytes)
  };
}

function validateLockfile(repositoryRoot, manifest) {
  const lockPath = safePath(path.join(repositoryRoot, 'package-lock.json'), { directory: false, label: 'package-lock.json' });
  const lock = parseJsonFile(lockPath, 'package-lock.json');
  if (lock.name !== manifest.name || lock.version !== manifest.version ||
      lock.packages?.['']?.name !== manifest.name || lock.packages?.['']?.version !== manifest.version ||
      lock.packages?.['']?.devDependencies?.['@vscode/vsce'] !== VSCE_VERSION) {
    fail('package-lock.json root identity/version or pinned @vscode/vsce metadata differs from package.json');
  }
  return lock;
}

function fingerprintInputs(inputs) {
  return {
    manifest: inputs.manifest,
    boundary: [...inputs.boundary].sort(),
    sourceFiles: [...inputs.sourceFiles].sort(([left], [right]) => left.localeCompare(right))
      .map(([name, bytes]) => ({ name, sha256: sha256(bytes), length: bytes.length }))
  };
}

function formatUtc(instant) {
  const iso = instant.toISOString();
  return {
    date: iso.slice(0, 10),
    time: `${iso.slice(11, 19).replaceAll(':', '')}Z`
  };
}

function candidateLayout(releasesRoot, instant, id) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9-]{1,64}$/.test(id)) fail('Candidate unique ID must be a safe single path component');
  const { date, time } = formatUtc(instant);
  const directory = path.resolve(releasesRoot, date, `${time}-${id}`);
  if (!isContained(releasesRoot, directory) || path.dirname(directory) !== path.join(path.resolve(releasesRoot), date)) {
    fail('Candidate directory escapes the selected Releases root');
  }
  return { date, time, candidateId: `${date}/${time}-${id}`, directory };
}

function ensureDirectory(fullPath, label, { create = false } = {}) {
  const absolute = path.resolve(fullPath);
  try {
    safePath(absolute, { directory: true, label });
    return absolute;
  } catch (error) {
    if (!create || !/ENOENT|cannot be safely inspected/i.test(error.message)) throw error;
    const parent = path.dirname(absolute);
    safePath(parent, { directory: true, label: `${label} parent` });
    try { fs.mkdirSync(absolute); }
    catch (mkdirError) {
      if (mkdirError.code !== 'EEXIST') throw mkdirError;
    }
    return safePath(absolute, { directory: true, label });
  }
}

function allocateCandidate(releasesRoot, instant, idFactory, attempts = 32, operationLock) {
  const when = new Date(instant);
  if (!Number.isFinite(when.getTime())) fail('Allocation clock must return a valid instant');
  const dateLayout = formatUtc(when);
  const dateDirectory = path.join(releasesRoot, dateLayout.date);
  const releasesIdentity = capturePathIdentity(releasesRoot, { directory: true, label: 'Selected Releases root' });
  operationLock?.assertHeld();
  assertPathIdentity(releasesIdentity);
  ensureDirectory(dateDirectory, 'UTC candidate date directory', { create: true });
  operationLock?.assertHeld();
  assertPathIdentity(releasesIdentity);
  const dateIdentity = capturePathIdentity(dateDirectory, { directory: true, label: 'UTC candidate date directory' });
  for (let index = 0; index < attempts; index += 1) {
    const id = idFactory();
    const layout = candidateLayout(releasesRoot, when, id);
    try {
      operationLock?.assertHeld();
      assertPathIdentity(releasesIdentity);
      assertPathIdentity(dateIdentity);
      fs.mkdirSync(layout.directory);
      operationLock?.assertHeld();
      assertPathIdentity(releasesIdentity);
      assertPathIdentity(dateIdentity);
      safePath(layout.directory, { directory: true, label: 'New candidate directory' });
      layout.pathIdentities = [releasesIdentity, dateIdentity,
        capturePathIdentity(layout.directory, { directory: true, label: 'Candidate directory' })];
      return layout;
    } catch (error) {
      if (error.code === 'EEXIST') continue;
      throw error;
    }
  }
  fail(`Could not allocate a unique candidate directory after ${attempts} collisions`);
}

function writeExclusive(file, bytes, label, guard = () => {}) {
  guard();
  safePath(path.dirname(file), { directory: true, label: `${label} parent` });
  guard();
  fs.writeFileSync(file, bytes, { flag: 'wx' });
  guard();
  safePath(file, { directory: false, label });
}

function updateOwnedFile(file, expectedBytes, nextBytes, label, guard = () => {}) {
  guard();
  safePath(file, { directory: false, label });
  const current = fs.readFileSync(file);
  if (!current.equals(expectedBytes)) fail(`${label} changed after preparation began; refusing to overwrite it`);
  guard();
  fs.writeFileSync(file, nextBytes);
  guard();
  safePath(file, { directory: false, label });
  if (!fs.readFileSync(file).equals(nextBytes)) fail(`${label} readback differs from intended content`);
  return nextBytes;
}

function makeStatus(candidateId, artifact = null) {
  return {
    schema: STATUS_SCHEMA,
    schemaVersion: STATUS_SCHEMA_VERSION,
    candidateId,
    artifact,
    reportType: 'human-reported; preparation initializes these values only',
    manualTest: { outcome: 'not tested', date: null, notes: '' },
    publication: { outcome: 'not published', date: null, notes: '' }
  };
}

function makeCandidateMetadata(layout, manifest, createdAt) {
  return {
    schema: CANDIDATE_SCHEMA,
    schemaVersion: CANDIDATE_SCHEMA_VERSION,
    candidateId: layout.candidateId,
    createdAt: createdAt.toISOString(),
    packagedIdentity: { name: manifest.name, publisher: manifest.publisher, version: manifest.version },
    preparation: { outcome: 'in progress', verified: false, checks: [] },
    artifact: null
  };
}

function defaultBuilder({ repositoryRoot, executable, outputPath }) {
  const result = spawnSync(process.execPath,
    [executable, 'package', '--allow-missing-repository', '--out', outputPath],
    { cwd: repositoryRoot, stdio: 'ignore' });
  return result;
}

function readRegularBytes(file, label) {
  safePath(file, { directory: false, label });
  return fs.readFileSync(file);
}

function persistOutcome(candidate, metadata, status, expectedMetadataBytes, expectedStatusBytes, guard) {
  const metadataBytes = jsonBytes(metadata);
  const statusBytes = jsonBytes(status);
  const persistence = [];
  try {
    updateOwnedFile(path.join(candidate.directory, METADATA_FILE), expectedMetadataBytes, metadataBytes, 'Candidate metadata', guard);
    persistence.push('candidate-metadata:written-and-read-back');
  } catch (error) {
    persistence.push(`candidate-metadata:failed:${error.message}`);
  }
  try {
    updateOwnedFile(path.join(candidate.directory, STATUS_FILE), expectedStatusBytes, statusBytes, 'Human status file', guard);
    persistence.push('human-status:written-and-read-back');
  } catch (error) {
    persistence.push(`human-status:failed:${error.message}`);
  }
  return { metadataBytes, statusBytes, persistence };
}

function prepareCandidate({
  repositoryRoot = path.resolve(__dirname, '..'), archiveRoot, loadBuildInputs, runBuilder = defaultBuilder,
  clock = () => new Date(), idFactory = () => crypto.randomUUID(), temporaryRoot = os.tmpdir(),
  verifier = { captureBuildEvidence, verifySelectedCandidate }, hooks = {}, copyCandidate = fs.copyFileSync
} = {}) {
  const result = {
    candidateId: null, candidateDirectory: null, vsixPath: null, packagedIdentity: null,
    sha256: null, sizeBytes: null, checks: [], outcome: 'failed', verified: false, error: null
  };
  let transientDirectory;
  let layout;
  let metadataBytes;
  let statusBytes;
  let metadata;
  let status;
  let buildInputs;
  let copiedBytes;
  let operationLock;
  let candidatePathGuard = () => {};
  try {
    const repo = safePath(repositoryRoot, { directory: true, label: 'Repository root' });
    operationLock = acquireOperationLock(repo);
    assertNoIncompleteReleaseInputs(repo);
    const releases = archiveRoot ? path.resolve(archiveRoot) : path.join(repo, 'Releases');
    if (!isContained(repo, releases)) fail('Selected archive root must remain inside the repository root');
    safePath(releases, { directory: true, label: 'Selected Releases root' });
    const releasesIdentity = capturePathIdentity(releases, { directory: true, label: 'Selected Releases root' });
    fs.accessSync(releases, fs.constants.W_OK);
    const rootManifest = parseJsonFile(safePath(path.join(repo, 'package.json'), { directory: false, label: 'package.json' }), 'package.json');
    assertManifest(rootManifest);
    validateLockfile(repo, rootManifest);
    const lockfilePath = safePath(path.join(repo, 'package-lock.json'), { directory: false, label: 'package-lock.json' });
    const lockfileSha256 = sha256(fs.readFileSync(lockfilePath));
    buildInputs = validateBuildInputs(loadInputs(repo, loadBuildInputs), rootManifest);
    const installed = inspectPinnedVsce(repo, rootManifest);
    result.checks.push({ id: 'repository-and-archive-root', outcome: 'passed' });
    result.checks.push({ id: 'manifest-lock-identity-and-version', outcome: 'passed', version: rootManifest.version });
    result.checks.push({ id: 'shared-discovery-manifest-parity-and-build-inputs', outcome: 'passed', contributions: Object.keys(rootManifest.contributes || {}).length });
    result.checks.push({ id: 'pinned-vsce', outcome: 'passed', version: installed.version });
    result.packagedIdentity = { name: rootManifest.name, publisher: rootManifest.publisher, version: rootManifest.version };
    const temp = safePath(temporaryRoot, { directory: true, label: 'Transient build root' });
    fs.accessSync(temp, fs.constants.W_OK);
    const allocationInstant = new Date(clock());
    layout = allocateCandidate(releases, allocationInstant, idFactory, 32, operationLock);
    candidatePathGuard = createIdentityGuard([
      capturePathIdentity(repo, { directory: true, label: 'Repository root' }),
      releasesIdentity,
      ...layout.pathIdentities
    ]);
    candidatePathGuard();
    result.candidateId = layout.candidateId;
    result.candidateDirectory = layout.directory;
    result.vsixPath = path.join(layout.directory, `${rootManifest.name}-${rootManifest.version}.vsix`);
    safePath(layout.directory, { directory: true, label: 'Candidate output directory' });
    if (!isContained(releases, result.vsixPath) || path.dirname(result.vsixPath) !== layout.directory) fail('Candidate VSIX output path escapes its exclusively allocated directory');
    metadata = makeCandidateMetadata(layout, rootManifest, allocationInstant);
    status = makeStatus(layout.candidateId);
    metadataBytes = jsonBytes(metadata);
    statusBytes = jsonBytes(status);
    writeExclusive(path.join(layout.directory, STATUS_FILE), statusBytes, 'Human status file', candidatePathGuard);
    writeExclusive(path.join(layout.directory, METADATA_FILE), metadataBytes, 'Candidate metadata', candidatePathGuard);
    result.checks.push({ id: 'exclusive-utc-candidate-allocation', outcome: 'passed', createdAt: allocationInstant.toISOString() });

    transientDirectory = fs.mkdtempSync(path.join(temp, '.ukho-vsix-prepare-'));
    safePath(transientDirectory, { directory: true, label: 'Owned transient build directory' });
    if (path.dirname(transientDirectory) !== temp) fail('Transient build directory is not a direct child of its owned temporary root');
    const transientOutput = path.join(transientDirectory, `${rootManifest.name}-${rootManifest.version}.vsix`);
    if (!isContained(transientDirectory, transientOutput)) fail('Transient VSIX output path escapes its owned directory');
    if (hooks.beforeBuild) hooks.beforeBuild({ repositoryRoot: repo, buildInputs, candidate: layout });
    operationLock.assertHeld();
    candidatePathGuard();
    const built = runBuilder({ repositoryRoot: repo, executable: installed.executable, outputPath: transientOutput, manifest: rootManifest, buildInputs });
    if (!built || built.error || built.status !== 0) {
      fail(`Pinned @vscode/vsce build failed (status ${built?.status ?? 'unknown'}${built?.signal ? `, signal ${built.signal}` : ''}${built?.error ? `, ${built.error.message}` : ''})`);
    }
    const transientBytes = readRegularBytes(transientOutput, 'Pinned @vscode/vsce output');
    result.checks.push({ id: 'fake-or-pinned-builder-output', outcome: 'passed', sizeBytes: transientBytes.length });
    if (hooks.afterBuild) hooks.afterBuild({ repositoryRoot: repo, buildInputs, candidate: layout });
    operationLock.assertHeld();
    candidatePathGuard();
    const currentManifest = parseJsonFile(safePath(path.join(repo, 'package.json'), { directory: false, label: 'package.json after build' }), 'package.json after build');
    validateLockfile(repo, currentManifest);
    const currentLockfileSha256 = sha256(fs.readFileSync(lockfilePath));
    const currentInputs = validateBuildInputs(loadInputs(repo, loadBuildInputs), currentManifest);
    const currentVsce = inspectPinnedVsce(repo, currentManifest);
    if (!isDeepStrictEqual(fingerprintInputs(currentInputs), fingerprintInputs(buildInputs)) ||
        currentLockfileSha256 !== lockfileSha256 || currentVsce.packageSha256 !== installed.packageSha256 ||
        currentVsce.executableSha256 !== installed.executableSha256) {
      fail('Relevant package, lockfile, or pinned tool inputs changed between capture and build; candidate was not copied');
    }
    result.checks.push({ id: 'build-input-drift', outcome: 'passed' });
    if (hooks.beforeCopy) hooks.beforeCopy({ transientOutput, candidatePath: result.vsixPath, candidate: layout });
    operationLock.assertHeld();
    candidatePathGuard();
    copyCandidate(transientOutput, result.vsixPath, fs.constants.COPYFILE_EXCL);
    candidatePathGuard();
    copiedBytes = readRegularBytes(result.vsixPath, 'Retained candidate VSIX');
    if (!copiedBytes.equals(transientBytes)) fail('Retained candidate bytes differ from exact transient builder output');
    result.sha256 = sha256(copiedBytes);
    result.sizeBytes = copiedBytes.length;
    result.checks.push({ id: 'exclusive-exact-byte-copy', outcome: 'passed', sha256: result.sha256, sizeBytes: result.sizeBytes });
    const evidence = verifier.captureBuildEvidence({ archiveBytes: copiedBytes, buildInputs });
    writeExclusive(path.join(layout.directory, EVIDENCE_FILE), jsonBytes(evidence), 'Candidate verification evidence', candidatePathGuard);
    const verification = verifier.verifySelectedCandidate({
      candidatePath: result.vsixPath, evidence, mode: 'fresh', buildInputs
    });
    if (!verification?.verified || verification.mode !== 'fresh') fail('Fresh candidate verification did not return a verified result');
    result.checks.push({ id: 'fresh-wi1-candidate-verification', outcome: 'passed', claim: verification.claim });
    metadata.artifact = { fileName: path.basename(result.vsixPath), sha256: result.sha256, sizeBytes: result.sizeBytes };
    metadata.preparation = { outcome: 'prepared and verified', verified: true, checks: result.checks };
    status = makeStatus(layout.candidateId, { fileName: path.basename(result.vsixPath), sha256: result.sha256, sizeBytes: result.sizeBytes });
    if (hooks.beforePersist) hooks.beforePersist({ candidate: layout, metadata, status });
    const persisted = persistOutcome(layout, metadata, status, metadataBytes, statusBytes, candidatePathGuard);
    metadataBytes = persisted.metadataBytes;
    statusBytes = persisted.statusBytes;
    result.checks.push({ id: 'candidate-metadata-and-human-status', outcome: persisted.persistence.every((entry) => entry.includes('written-and-read-back')) ? 'passed' : 'failed', details: persisted.persistence });
    if (persisted.persistence.some((entry) => entry.includes(':failed:'))) fail('Candidate metadata/status persistence did not fully succeed');
    result.outcome = 'prepared-verified';
    result.verified = true;
    return result;
  } catch (error) {
    result.error = error.message;
    result.outcome = result.candidateId ? (copiedBytes ? 'partial-unverified' : 'failed-retained-attempt') : 'failed-preflight';
    result.checks.push({ id: 'preparation-failure', outcome: 'failed', error: error.message });
    if (layout && metadata && status && metadataBytes && statusBytes) {
      metadata.preparation = { outcome: result.outcome, verified: false, error: error.message, checks: result.checks };
      if (copiedBytes) {
        metadata.artifact = { fileName: path.basename(result.vsixPath), sha256: sha256(copiedBytes), sizeBytes: copiedBytes.length };
        status.artifact = metadata.artifact;
        result.sha256 = metadata.artifact.sha256;
        result.sizeBytes = metadata.artifact.sizeBytes;
      }
      const persisted = persistOutcome(layout, metadata, status, metadataBytes, statusBytes, candidatePathGuard);
      result.checks.push({ id: 'failure-metadata-and-status', outcome: persisted.persistence.every((entry) => entry.includes('written-and-read-back')) ? 'passed' : 'failed', details: persisted.persistence });
    }
    return result;
  } finally {
    if (transientDirectory) {
      try {
        const current = fs.lstatSync(transientDirectory);
        if (!current.isSymbolicLink() && current.isDirectory() && path.dirname(transientDirectory) === path.resolve(temporaryRoot)) {
          fs.rmSync(transientDirectory, { recursive: true, force: false });
        }
      } catch (error) {
        result.checks.push({ id: 'owned-transient-cleanup', outcome: 'failed', error: error.message });
        if (!result.error) {
          result.error = `Owned transient build cleanup failed: ${error.message}`;
          result.outcome = result.verified ? 'prepared-verified-cleanup-warning'
            : (result.candidateId ? 'partial-unverified' : 'failed-preflight');
        }
      }
    }
    if (operationLock) {
      try { operationLock.release(); }
      catch (error) {
        result.checks.push({ id: 'operation-lock-release', outcome: 'failed', error: error.message });
        if (!result.error) {
          result.error = `VSIX operation lock release failed: ${error.message}`;
          result.outcome = result.verified ? 'prepared-verified-cleanup-warning'
            : (result.candidateId ? 'partial-unverified' : 'failed-preflight');
        }
      }
    }
  }
}

function validateStatusRecord(record, outcomes, label) {
  if (!record || typeof record !== 'object' || Array.isArray(record) || !outcomes.includes(record.outcome) ||
      !Object.hasOwn(record, 'date') || !Object.hasOwn(record, 'notes') || typeof record.notes !== 'string') {
    return `${label} outcome, date, or notes fields are invalid`;
  }
  const requiresDate = !['not tested', 'not published'].includes(record.outcome);
  if (!requiresDate && record.date !== null) return `${label} date must be null for ${record.outcome}`;
  if (requiresDate) {
    if (typeof record.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) return `${label} requires a YYYY-MM-DD date`;
    const parsed = new Date(`${record.date}T00:00:00.000Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== record.date) return `${label} date is not a valid UTC calendar date`;
    if (!record.notes.trim()) return `${label} requires notes for ${record.outcome}`;
  }
  return null;
}

function validateStatus(status, candidateId, artifact) {
  if (!status || status.schema !== STATUS_SCHEMA || status.schemaVersion !== STATUS_SCHEMA_VERSION) {
    return { state: 'malformed-or-unsupported', humanReported: true, error: 'Status schema is missing or unsupported' };
  }
  if (status.candidateId !== candidateId || status.reportType !== 'human-reported; preparation initializes these values only') {
    return { state: 'malformed-or-mismatched', humanReported: true, error: 'Status identity or outcome fields are invalid' };
  }
  const manualError = validateStatusRecord(status.manualTest, ['not tested', 'passed', 'failed'], 'Manual-test status');
  const publicationError = validateStatusRecord(status.publication, ['not published', 'pending/unknown', 'published'], 'Publication status');
  if (manualError || publicationError) {
    return { state: 'malformed-or-mismatched', humanReported: true, error: manualError || publicationError };
  }
  if (artifact === null) {
    if (status.artifact !== null || status.manualTest.outcome !== 'not tested' || status.publication.outcome !== 'not published') {
      return { state: 'malformed-or-mismatched', humanReported: true, error: 'Incomplete candidate status must retain its initial identity and outcomes' };
    }
    return { state: 'reported', humanReported: true, manualTest: status.manualTest, publication: status.publication };
  }
  if (!artifact || !status.artifact || status.artifact.sha256 !== artifact.sha256 || status.artifact.sizeBytes !== artifact.sizeBytes ||
      status.artifact.fileName !== artifact.fileName || Object.keys(status.artifact).length !== 3) {
    return { state: 'malformed-or-mismatched', humanReported: true, error: 'Human status does not match retained candidate identity/hash/size' };
  }
  return {
    state: 'reported', humanReported: true,
    manualTest: status.manualTest,
    publication: status.publication,
    publicationDisposition: status.publication.outcome === 'pending/unknown' ? 'pending/unknown; reconcile before any retry or claim' : status.publication.outcome
  };
}

function inspectCandidate({ candidateDirectory, mode = 'historical', buildInputs, verifier = { verifySelectedCandidate } } = {}) {
  const result = {
    candidateDirectory: null, candidateId: null, vsixPath: null, verified: false,
    verification: null, metadata: null, humanStatus: null, outcome: 'failed'
  };
  try {
    if (typeof candidateDirectory !== 'string' || !candidateDirectory) fail('An explicit candidate directory is required; no latest/fallback lookup is performed');
    const directory = safePath(candidateDirectory, { directory: true, label: 'Explicit candidate directory' });
    const metadata = parseJsonFile(safePath(path.join(directory, METADATA_FILE), { directory: false, label: 'Candidate metadata' }), 'Candidate metadata');
    const directoryCandidateId = `${path.basename(path.dirname(directory))}/${path.basename(directory)}`;
    if (metadata.schema !== CANDIDATE_SCHEMA || metadata.schemaVersion !== CANDIDATE_SCHEMA_VERSION ||
        metadata.candidateId !== directoryCandidateId || !/^\d{4}-\d{2}-\d{2}\/\d{6}Z-[A-Za-z0-9-]{1,64}$/.test(metadata.candidateId)) {
      fail('Candidate metadata identity/schema does not match its explicit directory');
    }
    const candidateId = metadata.candidateId;
    result.candidateDirectory = directory;
    result.candidateId = candidateId;
    result.metadata = metadata;
    result.outcome = metadata.preparation?.outcome || 'unknown';
    const artifact = metadata.artifact;
    if (artifact === null) {
      let humanStatus;
      try {
        const statusPath = safePath(path.join(directory, STATUS_FILE), { directory: false, label: 'Human status file' });
        const status = parseJsonFile(statusPath, 'Human status file');
        humanStatus = validateStatus(status, candidateId, null);
      } catch (error) {
        humanStatus = { state: 'malformed-or-unavailable', humanReported: true, error: error.message };
      }
      result.humanStatus = humanStatus;
      result.error = 'Candidate attempt has no complete artifact identity and cannot be verified';
      return result;
    }
    if (!artifact || typeof artifact.fileName !== 'string' || path.basename(artifact.fileName) !== artifact.fileName ||
        !/^[a-f0-9]{64}$/.test(artifact.sha256 || '') || !Number.isSafeInteger(artifact.sizeBytes) || artifact.sizeBytes < 0) {
      fail('Candidate metadata has no complete retained artifact identity');
    }
    const vsixPath = safePath(path.join(directory, artifact.fileName), { directory: false, label: 'Explicit candidate VSIX' });
    result.vsixPath = vsixPath;
    try {
      const statusPath = safePath(path.join(directory, STATUS_FILE), { directory: false, label: 'Human status file' });
      result.humanStatus = validateStatus(parseJsonFile(statusPath, 'Human status file'), candidateId, artifact);
    } catch (error) {
      result.humanStatus = { state: 'malformed-or-unavailable', humanReported: true, error: error.message };
    }
    const bytes = fs.readFileSync(vsixPath);
    if (bytes.length !== artifact.sizeBytes || sha256(bytes) !== artifact.sha256) {
      result.error = 'Candidate VSIX hash/size differs from retained candidate metadata';
      return result;
    }
    const evidencePath = safePath(path.join(directory, EVIDENCE_FILE), { directory: false, label: 'Candidate verification evidence' });
    const evidence = parseJsonFile(evidencePath, 'Candidate verification evidence');
    const expectedIdentity = evidence?.captured?.identity;
    const expectedFileName = expectedIdentity && `${expectedIdentity.name}-${expectedIdentity.version}.vsix`;
    if (!expectedIdentity || !isDeepStrictEqual(metadata.packagedIdentity, expectedIdentity) ||
        artifact.fileName !== expectedFileName || path.basename(vsixPath) !== expectedFileName) {
      fail('Candidate metadata identity or version-derived artifact filename disagrees with captured verification identity');
    }
    let verification;
    try {
      verification = verifier.verifySelectedCandidate({ candidatePath: vsixPath, evidence, mode, buildInputs });
    } catch (error) {
      result.error = `Candidate verification failed: ${error.message}`;
      return result;
    }
    result.artifactVerified = verification.verified === true;
    result.verified = result.artifactVerified && metadata.preparation?.verified === true &&
      metadata.preparation?.outcome === 'prepared and verified';
    result.verification = verification;
    return result;
  } catch (error) {
    result.error = error.message;
    return result;
  }
}

function updateJsonVersion(document, version, label) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) fail(`${label} must be a JSON object`);
  return { ...document, version };
}

function changelogReplacement(currentText, expectedPendingNotes, proposedNotes, version) {
  if (typeof expectedPendingNotes !== 'string' || !expectedPendingNotes || typeof proposedNotes !== 'string' || !proposedNotes) {
    fail('Exact current pending notes and exact proposed release notes are required');
  }
  const unreleased = currentText.indexOf('## Unreleased');
  if (unreleased < 0) fail('CHANGELOG.md has no Unreleased section');
  const nextSection = currentText.indexOf('\n## ', unreleased + 1);
  const sectionEnd = nextSection < 0 ? currentText.length : nextSection;
  const expectedStart = currentText.indexOf(expectedPendingNotes, unreleased);
  if (expectedStart < 0 || expectedStart + expectedPendingNotes.length > sectionEnd ||
      currentText.indexOf(expectedPendingNotes, expectedStart + 1) >= 0) {
    fail('Selected pending changelog preimage is missing, duplicated, or outside Unreleased');
  }
  const expectedHeading = `### ${version} review candidate`;
  const expectedFilename = `${EXTENSION_NAME}-${version}.vsix`;
  if (!proposedNotes.startsWith(expectedHeading) || !proposedNotes.includes(expectedFilename) || proposedNotes.includes('\n## ')) {
    fail('Proposed pending notes must identify the exact numeric review candidate and its version-derived VSIX');
  }
  return currentText.slice(0, expectedStart) + proposedNotes + currentText.slice(expectedStart + expectedPendingNotes.length);
}

function inspectReleasePreimages(repositoryRoot) {
  const paths = {
    manifest: path.join(repositoryRoot, 'package.json'),
    lock: path.join(repositoryRoot, 'package-lock.json'),
    changelog: path.join(repositoryRoot, 'CHANGELOG.md')
  };
  for (const [name, file] of Object.entries(paths)) safePath(file, { directory: false, label: name });
  const bytes = Object.fromEntries(Object.entries(paths).map(([name, file]) => [name, fs.readFileSync(file)]));
  const identities = Object.fromEntries(Object.entries(paths).map(([name, file]) =>
    [name, capturePathIdentity(file, { directory: false, label: name })]));
  const manifest = JSON.parse(bytes.manifest.toString('utf8'));
  const lock = JSON.parse(bytes.lock.toString('utf8'));
  assertManifest(manifest);
  if (lock.packages?.['']?.name !== manifest.name || lock.name !== manifest.name ||
      lock.version !== manifest.version || lock.packages[''].version !== manifest.version) {
    fail('Release-input preimages have inconsistent manifest/lockfile identity or version');
  }
  return { paths, bytes, identities, manifest, lock, changelog: bytes.changelog.toString('utf8') };
}

function applyConfirmedReleaseInputs({
  repositoryRoot = path.resolve(__dirname, '..'), version, changeSummary, expectedPendingNotes, proposedNotes,
  confirm, replaceFile
} = {}) {
  const report = { outcome: 'not-changed', changed: [], files: {}, error: null, packagingAllowed: false };
  let preimages;
  let operationLock;
  let incompleteMarker;
  const staged = [];
  try {
    const repo = safePath(path.resolve(repositoryRoot), { directory: true, label: 'Repository root' });
    operationLock = acquireOperationLock(repo);
    assertNoIncompleteReleaseInputs(repo);
    assertVersion(version);
    if (typeof changeSummary !== 'string' || !changeSummary.trim()) fail('An evidence-based change summary is required for release-input confirmation');
    if (typeof confirm !== 'function') fail('An explicit confirmation callback is required; absence means no writes');
    preimages = inspectReleasePreimages(repo);
    const nextManifest = updateJsonVersion(preimages.manifest, version, 'package.json');
    const nextLock = updateJsonVersion(preimages.lock, version, 'package-lock.json');
    const nextRootLock = updateJsonVersion(preimages.lock.packages[''], version, 'package-lock.json root package');
    nextLock.packages = { ...preimages.lock.packages, '': nextRootLock };
    const next = {
      manifest: jsonBytes(nextManifest),
      lock: jsonBytes(nextLock),
      changelog: Buffer.from(changelogReplacement(preimages.changelog, expectedPendingNotes, proposedNotes, version), 'utf8')
    };
    const proposal = {
      version,
      changeSummary,
      changes: [
        { file: 'package.json', field: 'version', before: preimages.manifest.version, after: version },
        { file: 'package-lock.json', field: 'version', before: preimages.lock.version, after: version },
        { file: 'package-lock.json', field: 'packages[""].version', before: preimages.lock.packages[''].version, after: version },
        { file: 'CHANGELOG.md', field: 'selected pending Unreleased notes', before: expectedPendingNotes, after: proposedNotes }
      ]
    };
    const confirmed = confirm(proposal);
    if (confirmed !== true) {
      report.outcome = 'confirmation-not-granted';
      report.error = 'Exact release-input confirmation was absent, rejected, or cancelled; no files were written';
      return report;
    }
    for (const [name, file] of Object.entries(preimages.paths)) {
      operationLock.assertHeld();
      assertPathIdentity(preimages.identities[name]);
      if (!fs.readFileSync(file).equals(preimages.bytes[name])) {
        report.outcome = 'preimage-drift';
        report.error = `${name} changed after confirmation; no release-input writes were started`;
        return report;
      }
    }
    // Prepare all replacements beside their targets first. They are uniquely owned and removed if not installed.
    for (const name of ['manifest', 'lock', 'changelog']) {
      const file = preimages.paths[name];
      const temp = path.join(path.dirname(file), `.${path.basename(file)}.${crypto.randomUUID()}.release-input.tmp`);
      operationLock.assertHeld();
      fs.writeFileSync(temp, next[name], { flag: 'wx' });
      operationLock.assertHeld();
      if (!fs.readFileSync(temp).equals(next[name])) fail(`Staged ${name} release input failed readback`);
      staged.push({ name, file, temp, nextBytes: next[name] });
    }
    incompleteMarker = writeIncompleteReleaseInputsMarker(repo, operationLock);
    for (const item of staged) {
      operationLock.assertHeld();
      assertPathIdentity(preimages.identities[item.name]);
      if (!fs.readFileSync(item.file).equals(preimages.bytes[item.name])) {
        report.outcome = report.changed.length ? 'partial' : 'preimage-drift';
        report.error = `${item.name} changed immediately before replacement; stopped without overwriting that file`;
        break;
      }
      const guardedReplace = () => {
        operationLock.assertHeld();
        assertPathIdentity(preimages.identities[item.name]);
        if (!fs.readFileSync(item.file).equals(preimages.bytes[item.name])) {
          fail(`${item.name} changed at the replacement boundary; refusing to overwrite it`);
        }
        fs.renameSync(item.temp, item.file);
      };
      if (replaceFile) replaceFile(item, guardedReplace);
      else guardedReplace();
      operationLock.assertHeld();
      const current = fs.readFileSync(item.file);
      if (!current.equals(item.nextBytes)) fail(`${item.name} release-input readback differs after save`);
      report.changed.push(item.name);
    }
    for (const [name, file] of Object.entries(preimages.paths)) {
      try { report.files[name] = { version: name === 'changelog' ? undefined : JSON.parse(fs.readFileSync(file, 'utf8')).version, sha256: sha256(fs.readFileSync(file)) }; }
      catch (error) { report.files[name] = { state: 'unreadable', error: error.message }; }
    }
    if (report.error) return report;
    const current = inspectReleasePreimages(repo);
    if (current.manifest.version !== version || current.lock.version !== version || current.lock.packages[''].version !== version) {
      report.outcome = 'partial';
      report.error = 'Post-save package versions are inconsistent; dependent packaging is stopped';
      return report;
    }
    for (const name of ['manifest', 'lock', 'changelog']) {
      operationLock.assertHeld();
      assertPathIdentity(current.identities[name]);
      if (!current.bytes[name].equals(next[name])) {
        report.outcome = 'partial';
        report.error = `${name} changed after replacement; dependent packaging is stopped`;
        return report;
      }
    }
    removeIncompleteReleaseInputsMarker(repo, incompleteMarker, operationLock);
    incompleteMarker = undefined;
    report.outcome = report.changed.length ? 'updated-and-validated' : 'unchanged';
    report.packagingAllowed = true;
    return report;
  } catch (error) {
    report.error = error.message;
    if (preimages) {
      for (const [name, file] of Object.entries(preimages.paths)) {
        try {
          const currentBytes = fs.readFileSync(file);
          if (!currentBytes.equals(preimages.bytes[name]) && !report.changed.includes(name)) report.changed.push(name);
          report.files[name] = { sha256: sha256(currentBytes), version: name === 'changelog' ? undefined : JSON.parse(currentBytes.toString('utf8')).version };
        }
        catch (readError) { report.files[name] = { state: 'unreadable', error: readError.message }; }
      }
    }
    report.outcome = report.changed.length ? 'partial' : 'failed';
    report.packagingAllowed = false;
    return report;
  } finally {
    for (const item of staged) {
      try {
        const stat = fs.lstatSync(item.temp);
        if (stat.isFile() && !stat.isSymbolicLink()) fs.unlinkSync(item.temp);
      } catch (error) {
        if (error.code !== 'ENOENT' && !report.error) {
          report.error = `Owned release-input staging cleanup failed: ${error.message}`;
          report.packagingAllowed = false;
          report.outcome = report.changed.length ? 'partial' : 'failed';
        }
      }
    }
    if (operationLock) {
      try { operationLock.release(); }
      catch (error) {
        report.error = report.error || `VSIX operation lock release failed: ${error.message}`;
        report.packagingAllowed = false;
        report.outcome = report.changed.length ? 'partial' : 'failed';
      }
    }
  }
}

function prepareAfterReleaseInputUpdate({ releaseInputResult, ...prepareOptions } = {}) {
  if (!releaseInputResult || releaseInputResult.packagingAllowed !== true ||
      !['updated-and-validated', 'unchanged'].includes(releaseInputResult.outcome)) {
    return {
      candidateId: null, candidateDirectory: null, vsixPath: null, packagedIdentity: null,
      sha256: null, sizeBytes: null,
      checks: [{ id: 'confirmed-release-input-gate', outcome: 'failed' }],
      outcome: 'failed-preflight', verified: false,
      error: 'Release-input update was not confirmed, fully saved/read back, and validated; dependent packaging is stopped'
    };
  }
  return prepareCandidate(prepareOptions);
}

function validateArguments(args) {
  if (!Array.isArray(args) || args.length === 0) {
    fail('Usage: prepare-vsix | inspect-vsix-candidate --candidate <explicit-directory> | confirm-release-inputs --version <numeric-version> --change-summary <evidence> --expected-pending-notes <exact-text> --proposed-notes <exact-text>');
  }
  if (args[0] === 'prepare' && args.length === 1) return { command: 'prepare' };
  if (args[0] === 'inspect' && args.length === 3 && args[1] === '--candidate' && args[2]) {
    return { command: 'inspect', candidateDirectory: args[2] };
  }
  if (args[0] === 'release-inputs' && args.length === 9 &&
      args[1] === '--version' && args[2] &&
      args[3] === '--change-summary' && args[4] &&
      args[5] === '--expected-pending-notes' && args[6] &&
      args[7] === '--proposed-notes' && args[8]) {
    return {
      command: 'release-inputs', version: args[2],
      changeSummary: args[4], expectedPendingNotes: args[6], proposedNotes: args[8]
    };
  }
  fail('Usage: prepare-vsix | inspect-vsix-candidate --candidate <explicit-directory> | confirm-release-inputs --version <numeric-version> --change-summary <evidence> --expected-pending-notes <exact-text> --proposed-notes <exact-text>');
}

function confirmReleaseInputsInteractively(proposal, { input = process.stdin, output = process.stdout } = {}) {
  if (!input.isTTY || !output.isTTY) return false;
  output.write('Exact release-input proposal (no files have been changed):\n');
  output.write(`${JSON.stringify(proposal, null, 2)}\n`);
  output.write(`Type CONFIRM ${proposal.version} to apply only these edits: `);
  const descriptor = input.fd;
  if (!Number.isInteger(descriptor)) return false;
  const chunks = [];
  const byte = Buffer.alloc(1);
  while (true) {
    const count = fs.readSync(descriptor, byte, 0, 1, null);
    if (count === 0) return false;
    if (byte[0] === 10) break;
    if (byte[0] !== 13) chunks.push(byte[0]);
  }
  return Buffer.from(chunks).toString('utf8').trim() === `CONFIRM ${proposal.version}`;
}

function main(args = process.argv.slice(2), dependencies = {}) {
  const command = validateArguments(args);
  let result;
  if (command.command === 'prepare') result = (dependencies.prepareCandidate || prepareCandidate)(dependencies.prepareOptions);
  else if (command.command === 'inspect') result = inspectCandidate({ candidateDirectory: command.candidateDirectory, mode: 'historical' });
  else {
    result = (dependencies.applyConfirmedReleaseInputs || applyConfirmedReleaseInputs)({
      version: command.version,
      changeSummary: command.changeSummary,
      expectedPendingNotes: command.expectedPendingNotes,
      proposedNotes: command.proposedNotes,
      confirm: (proposal) => (dependencies.confirmReleaseInputs || confirmReleaseInputsInteractively)(proposal)
    });
  }
  (dependencies.writeOutput || ((text) => process.stdout.write(text)))(`${JSON.stringify(result, null, 2)}\n`);
  if (!dependencies.suppressExitCode) {
    if (command.command === 'prepare' && result.outcome !== 'prepared-verified') process.exitCode = 1;
    if (command.command === 'inspect' && result.verified !== true) process.exitCode = 1;
    if (command.command === 'release-inputs' && result.packagingAllowed !== true) process.exitCode = 1;
  }
  return result;
}

if (require.main === module) {
  try { main(); }
  catch (error) {
    console.error(`VSIX candidate operation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  CANDIDATE_SCHEMA, EVIDENCE_FILE, METADATA_FILE, STATUS_FILE, STATUS_SCHEMA,
  allocateCandidate, applyConfirmedReleaseInputs, candidateLayout, inspectCandidate,
  confirmReleaseInputsInteractively, main, makeStatus, prepareAfterReleaseInputUpdate, prepareCandidate,
  safePath, validateArguments, validateBuildInputs
};
