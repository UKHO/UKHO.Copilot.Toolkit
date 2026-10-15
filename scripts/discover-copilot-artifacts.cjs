'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const classes = [
  { name: 'chatInstructions', directory: '.github/instructions', suffix: '.instructions.md', kind: 'file' },
  { name: 'chatAgents', directory: '.github/agents', suffix: '.agent.md', kind: 'file' },
  { name: 'chatPromptFiles', directory: '.github/prompts', suffix: '.prompt.md', kind: 'file' },
  { name: 'chatSkills', directory: '.github/skills', suffix: 'SKILL.md', kind: 'skill' }
];

function fail(message) {
  throw new Error(message);
}

function compare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalize(relative) {
  if (typeof relative !== 'string' || relative.includes('\\')) fail(`Invalid path: ${relative}`);
  if (relative.split('/').includes('..')) fail(`Path traversal is not allowed: ${relative}`);
  const normalized = path.posix.normalize(relative.replace(/^\.\//, ''));
  if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized.startsWith('/') || normalized.includes('/../')) {
    fail(`Path is not extension-root-relative: ${relative}`);
  }
  return normalized;
}

// Check the root and every component, not just the leaf: lstat of a leaf
// follows symlink/junction ancestors. No cache: each read rechecks its path.
function inspectPath(relative) {
  const full = path.resolve(root, relative);
  if (full !== root && !full.startsWith(`${root}${path.sep}`)) fail(`Path escapes fixed repository root: ${relative}`);
  const parts = path.relative(root, full).split(path.sep).filter(Boolean);
  let current = root;
  let stat;
  for (let index = 0; index <= parts.length; index += 1) {
    if (index) current = path.join(current, parts[index - 1]);
    try { stat = fs.lstatSync(current); }
    catch (error) { fail(`Cannot inspect ${relative} at ${current}: ${error.message}`); }
    if (stat.isSymbolicLink()) fail(`Symbolic links/junctions are not allowed: ${relative} at ${current}`);
    if (index < parts.length && !stat.isDirectory()) fail(`Expected directory: ${relative} at ${current}`);
  }
  return { full, stat };
}

function lstat(full, relative) {
  return inspectPath(path.relative(root, full)).stat;
}

function requireDirectory(full, relative) {
  const stat = lstat(full, relative);
  if (!stat.isDirectory()) fail(`Expected directory: ${relative}`);
}

function entries(full, relative) {
  let names;
  try {
    names = fs.readdirSync(full).sort(compare);
  } catch (error) {
    fail(`Cannot read ${relative}: ${error.message}`);
  }
  return names.map((name) => ({ name, full: path.join(full, name), relative: `${relative}/${name}` }));
}

function discoverFiles(definition) {
  const base = path.join(root, definition.directory);
  requireDirectory(base, definition.directory);
  const result = [];
  function visit(full, relative) {
    const stat = lstat(full, relative);
    if (stat.isFile()) {
      if (relative.endsWith(definition.suffix)) result.push(normalize(relative));
      return;
    }
    if (!stat.isDirectory()) fail(`Unsupported source path: ${relative}`);
    if (relative.endsWith(definition.suffix)) fail(`Artifact path is not a regular file: ${relative}`);
    for (const entry of entries(full, relative)) visit(entry.full, entry.relative);
  }
  for (const entry of entries(base, definition.directory)) visit(entry.full, entry.relative);
  return result;
}

function discoverSkills(definition) {
  const base = path.join(root, definition.directory);
  requireDirectory(base, definition.directory);
  const result = [];
  function visit(full, relative) {
    const stat = lstat(full, relative);
    if (stat.isFile()) return;
    if (!stat.isDirectory()) fail(`Unsupported source path: ${relative}`);
    const children = entries(full, relative);
    const manifest = children.find((entry) => entry.name === 'SKILL.md');
    if (manifest) {
      const manifestStat = lstat(manifest.full, manifest.relative);
      if (!manifestStat.isFile()) fail(`Skill SKILL.md is not a regular file: ${manifest.relative}`);
      result.push(normalize(relative));
    }
    for (const entry of children) visit(entry.full, entry.relative);
  }
  for (const entry of entries(base, definition.directory)) visit(entry.full, entry.relative);
  return result;
}

function discover() {
  const inventory = {};
  const seen = new Set();
  for (const definition of classes) {
    const values = definition.kind === 'skill' ? discoverSkills(definition) : discoverFiles(definition);
    values.sort(compare);
    for (const value of values) {
      if (seen.has(value)) fail(`Duplicate normalized contribution path: ${value}`);
      seen.add(value);
    }
    inventory[definition.name] = values;
  }
  return inventory;
}

if (require.main === module) {
  try {
    process.stdout.write(`${JSON.stringify(discover(), null, 2)}\n`);
  } catch (error) {
    console.error(`Copilot artifact discovery failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { classes, discover, inspectPath, normalize, root };
