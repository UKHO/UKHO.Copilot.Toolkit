'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const PINNED_VSCE = '3.9.2';
const EXTENSION_NAME = 'ukho-copilot-toolkit';
const EXTENSION_VERSION = '1.0.0';

function fail(message) {
  throw new Error(message);
}

function regularFile(full, label) {
  let stat;
  try { stat = fs.lstatSync(full); }
  catch (error) { fail(`${label} is unavailable: ${error.message}`); }
  if (stat.isSymbolicLink() || !stat.isFile()) fail(`${label} must be a regular non-symbolic-link file`);
  return stat;
}

function containedFile(repositoryRoot, relative, label) {
  const resolvedRoot = path.resolve(repositoryRoot);
  const full = path.resolve(resolvedRoot, relative);
  if (full === resolvedRoot || !full.startsWith(`${resolvedRoot}${path.sep}`)) fail(`${label} escapes the repository root`);
  const parts = path.relative(resolvedRoot, full).split(path.sep).filter(Boolean);
  let current = resolvedRoot;
  let stat;
  for (let index = 0; index <= parts.length; index += 1) {
    if (index) current = path.join(current, parts[index - 1]);
    try { stat = fs.lstatSync(current); }
    catch (error) { fail(`${label} is unavailable at ${current}: ${error.message}`); }
    if (stat.isSymbolicLink()) fail(`${label} cannot use symbolic links or junctions`);
    if (index < parts.length && !stat.isDirectory()) fail(`${label} has a non-directory path component`);
  }
  if (!stat.isFile()) fail(`${label} must be a regular file`);
  return full;
}

function requireAbsent(full, label) {
  try {
    fs.lstatSync(full);
    fail(`${label} already exists; refusing to overwrite it`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function expectedTarget(repositoryRoot, manifest) {
  if (!manifest || manifest.name !== EXTENSION_NAME || manifest.version !== EXTENSION_VERSION) {
    fail(`package.json identity must remain ${EXTENSION_NAME} ${EXTENSION_VERSION}`);
  }
  const target = path.resolve(repositoryRoot, `${manifest.name}-${manifest.version}.vsix`);
  if (path.dirname(target) !== path.resolve(repositoryRoot)) fail('Version-derived VSIX target escapes the repository root');
  return target;
}

function installedVsce(repositoryRoot, manifest) {
  if (manifest.devDependencies?.['@vscode/vsce'] !== PINNED_VSCE) {
    fail(`package.json must retain pinned @vscode/vsce ${PINNED_VSCE}`);
  }
  const packagePath = containedFile(repositoryRoot, path.join('node_modules', '@vscode', 'vsce', 'package.json'), 'Pinned @vscode/vsce package metadata');
  const installed = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (installed.version !== PINNED_VSCE) fail(`Installed @vscode/vsce must be ${PINNED_VSCE}, found ${installed.version}`);
  const executable = containedFile(repositoryRoot, path.join('node_modules', '@vscode', 'vsce', 'vsce'), 'Pinned @vscode/vsce executable');
  return executable;
}

function runVsce({ repositoryRoot, executable, outputPath }) {
  const args = [executable, 'package', '--allow-missing-repository', '--out', outputPath];
  const result = spawnSync(process.execPath, args, { cwd: repositoryRoot, stdio: 'inherit' });
  if (result.error) fail(`Could not start pinned @vscode/vsce: ${result.error.message}`);
  return result;
}

function packageVsix({ repositoryRoot, manifest, runPackage = runVsce }) {
  const resolvedRoot = path.resolve(repositoryRoot);
  const rootStat = fs.lstatSync(resolvedRoot);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) fail('Repository root must be a regular directory');
  if (manifest.engines?.vscode !== '^1.130.0') fail('package.json VS Code engine constraint must remain ^1.130.0');
  const finalPath = expectedTarget(resolvedRoot, manifest);
  requireAbsent(finalPath, 'Version-derived VSIX target');

  const executable = installedVsce(resolvedRoot, manifest);
  const temporaryDirectory = fs.mkdtempSync(path.join(resolvedRoot, '.ukho-vsix-build-'));
  const temporaryStat = fs.lstatSync(temporaryDirectory);
  if (temporaryStat.isSymbolicLink() || !temporaryStat.isDirectory() || path.dirname(temporaryDirectory) !== resolvedRoot) {
    fail('Temporary build directory is not a contained regular directory');
  }
  const temporaryPath = path.join(temporaryDirectory, path.basename(finalPath));
  let packageError;
  try {
    requireAbsent(temporaryPath, 'Temporary VSIX target');
    const result = runPackage({ repositoryRoot: resolvedRoot, executable, outputPath: temporaryPath });
    if (!result || result.error || result.status !== 0) {
      fail(`Pinned @vscode/vsce package operation failed (status ${result?.status ?? 'unknown'}${result?.signal ? `, signal ${result.signal}` : ''})`);
    }
    regularFile(temporaryPath, 'Pinned @vscode/vsce output');
    const candidate = fs.readFileSync(temporaryPath);

    // Recheck immediately before exclusive publication; COPYFILE_EXCL also
    // protects against a collision introduced after this check.
    requireAbsent(finalPath, 'Version-derived VSIX target');
    fs.copyFileSync(temporaryPath, finalPath, fs.constants.COPYFILE_EXCL);
    regularFile(finalPath, 'Published VSIX candidate');
    const published = fs.readFileSync(finalPath);
    if (!published.equals(candidate)) fail('Published VSIX bytes differ from the uniquely built candidate');
    return { target: finalPath, bytes: published.length };
  } catch (error) {
    packageError = error;
    throw error;
  } finally {
    try {
      const current = fs.lstatSync(temporaryDirectory);
      if (!current.isSymbolicLink() && current.isDirectory() && path.dirname(temporaryDirectory) === resolvedRoot) {
        fs.rmSync(temporaryDirectory, { recursive: true, force: false });
      }
    } catch (cleanupError) {
      if (!packageError) throw new Error(`Temporary build directory cleanup failed: ${cleanupError.message}`);
      console.error(`Temporary build directory cleanup failed: ${cleanupError.message}`);
    }
  }
}

function validateArguments(argumentsList) {
  if (!Array.isArray(argumentsList) || argumentsList.length !== 0) fail('Usage: node scripts/package-vsix.cjs (no arguments)');
}

function main(argumentsList = process.argv.slice(2)) {
  validateArguments(argumentsList);
  const packagePath = path.join(root, 'package.json');
  containedFile(root, 'package.json', 'package.json');
  const manifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const result = packageVsix({ repositoryRoot: root, manifest });
  console.log(`Created ${path.basename(result.target)} (${result.bytes} bytes) without replacing an existing archive.`);
}

if (require.main === module) {
  try { main(); }
  catch (error) {
    console.error(`VSIX packaging failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { EXTENSION_NAME, EXTENSION_VERSION, PINNED_VSCE, expectedTarget, packageVsix, requireAbsent, runVsce, validateArguments };
