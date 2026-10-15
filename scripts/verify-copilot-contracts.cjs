'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { classes, discover, inspectPath, normalize, root } = require('./discover-copilot-artifacts.cjs');

const coordinatorTools = {
  Research: ['read', 'search', 'web', 'edit', 'agent'],
  Plan: ['read', 'search', 'edit', 'agent'],
  Implement: ['read', 'search', 'edit', 'agent', 'runInTerminal'],
  Review: ['read', 'search', 'edit', 'agent']
};
const promptRoutes = { plan: 'Plan', implement: 'Implement', review: 'Review', 'remediate-review': 'Implement' };
const handoffRoutes = { Research: ['Plan'], Plan: ['Implement'], Implement: ['Review'], Review: ['Implement', 'Plan'] };
const delegateRoutes = {
  Research: ['Codebase Investigator', 'Domain Investigator', 'Feasibility Investigator', 'Stage Assurance', 'Script Runner'],
  Plan: ['Requirements Analyst', 'Architecture Analyst', 'Test Strategist', 'Domain Investigator', 'Feasibility Investigator', 'Stage Assurance', 'Script Runner'],
  Implement: ['Implementation Worker', 'Test Worker', 'Validation Worker', 'Stage Assurance', 'Script Runner'],
  Review: ['Correctness Reviewer', 'Security Reviewer', 'Maintainability Reviewer', 'Stage Assurance', 'Script Runner']
};
const workerTools = {
  'Architecture Analyst': ['read', 'search'], 'Codebase Investigator': ['read', 'search'],
  'Correctness Reviewer': ['read', 'search'], 'Domain Investigator': ['read', 'search', 'web'],
  'Feasibility Investigator': ['read', 'search', 'web'], 'Implementation Worker': ['read', 'search', 'edit', 'runInTerminal'],
  'Maintainability Reviewer': ['read', 'search'], 'Requirements Analyst': ['read', 'search'],
  'Security Reviewer': ['read', 'search'], 'Stage Assurance': ['read', 'search'],
  'Test Strategist': ['read', 'search'], 'Test Worker': ['read', 'search'],
  'Validation Worker': ['read', 'search']
};
const manualHandoffCoordinators = new Set(['Research', 'Plan', 'Implement', 'Review']);
const templateLinkPlaceholders = new Map([
  ['.github/skills/create-copilot-skill/templates/skill.md', 'relative-path'],
  ['.github/skills/create-runbook/templates/runbook.md', 'repository-relative-link'],
  ['.github/skills/wiki-maintenance/templates/wiki-page.md', 'repository-relative-link']
]);
const limitation = 'Static structure only: this check does not establish conversation compliance, installed loading, platform permissions, or runtime safety. It checks supported inline Markdown links and a bounded frontmatter subset; it is not a complete YAML/Markdown parser.';

function fail(message, contractId = 'STRUCT-001') {
  const error = new Error(message);
  error.contractId = contractId;
  throw error;
}

function equal(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function sourcePath(relative) {
  try { return inspectPath(relative).full; }
  catch (error) { fail(`Cannot inspect source ${relative}: ${error.message}`); }
}

function readText(relative) {
  try {
    const { full, stat } = inspectPath(relative);
    if (!stat.isFile()) fail(`${relative} is not a regular file`);
    return fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n');
  } catch (error) {
    if (error.contractId) throw error;
    fail(`Cannot read ${relative}: ${error.message}`);
  }
}

// Support quoted identity/route/required text, not a general YAML parser.
// Double quotes use JSON-compatible escapes; other YAML forms fail explicitly.
function parseTextScalar(value, relative, field) {
  if (value.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(value)) fail(`${relative} has unsupported quoted ${field} metadata`);
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value.startsWith('"')) {
    try { return JSON.parse(value); }
    catch { fail(`${relative} has unsupported quoted ${field} metadata; expected JSON-compatible escapes`); }
  }
  // Plain text only: collection/block/tag/anchor/alias forms, comments and
  // implicit non-text scalars are outside this subset. Quote literal tokens.
  if (/^[\[\]{},&*!|>%@`#]/.test(value) || /^[?:-](?:\s|$)/.test(value) || /:\s|\s#/.test(value) ||
      /^(?:null|~|true|false|[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?|0[xob][0-9a-f]+|[-+]?\.inf|\.nan)$/i.test(value)) {
    fail(`${relative} has unsupported non-text ${field} metadata; quote literal text`);
  }
  return value;
}

function parseFrontmatterText(text, relative) {
  const lines = text.split('\n');
  if (lines[0] !== '---') fail(`${relative} must begin with an opening YAML delimiter`);
  const end = lines.indexOf('---', 1);
  if (end < 1) fail(`${relative} must contain a closing YAML delimiter`);
  const values = Object.create(null);
  const blocks = Object.create(null);
  let currentKey;
  for (const line of lines.slice(1, end)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^\s*\t/.test(line)) fail(`${relative} uses unsupported tab indentation in frontmatter`);
    if (/^\s/.test(line)) {
      if (!currentKey) fail(`${relative} has an unsupported indented frontmatter line`);
      // Only handoffs support a block; all other metadata is single-line.
      if (currentKey !== 'handoffs') fail(`${relative} has unsupported continuation metadata for ${currentKey}`);
      blocks[currentKey].push(line);
      continue;
    }
    const match = line.match(/^([A-Za-z][A-Za-z0-9-]*):(?:[ \t]*(.*))?$/);
    if (!match) fail(`${relative} has unsupported frontmatter syntax: ${line}`);
    const [, key, value = ''] = match;
    if (Object.hasOwn(values, key)) fail(`${relative} has duplicate frontmatter field: ${key}`);
    values[key] = ['name', 'applyTo', 'agent'].includes(key) ? parseTextScalar(value.trim(), relative, key) : value;
    blocks[key] = [];
    currentKey = key;
  }
  if (typeof values.name !== 'string' || !values.name.trim()) fail(`${relative} must declare a non-empty name`);
  if (Object.hasOwn(values, 'handoffs') && values.handoffs.trim()) {
    fail(`${relative} has unsupported handoffs metadata; expected a block sequence`);
  }
  return { values, blocks, text };
}

function parseStringList(value, relative, field) {
  if (typeof value !== 'string' || !/^\[(?:'[^'\n]*'(?:, '[^'\n]*')*)?\]$/.test(value)) {
    fail(`${relative} has unsupported ${field} frontmatter; expected a single-quoted inline list`);
  }
  const entries = value === '[]' ? [] : value.slice(1, -1).split(', ').map((entry) => entry.slice(1, -1));
  if (entries.some((entry) => !entry.trim()) || new Set(entries).size !== entries.length) {
    fail(`${relative} has an empty or duplicate ${field} declaration`);
  }
  return entries;
}

function checkLocalLinks(relative, text) {
  const pattern = /!?\[[^\]]*\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+[^)]*)?\)/g;
  for (const match of text.matchAll(pattern)) {
    const angleDestination = match[1].startsWith('<') && match[1].endsWith('>');
    let destination = angleDestination ? match[1].slice(1, -1) : match[1];
    if (angleDestination && templateLinkPlaceholders.get(relative) === destination) continue;
    if (/^[a-z]:/i.test(destination)) fail(`${relative} has an unsafe local link: ${destination}`);
    if (/^file:/i.test(destination)) fail(`${relative} has an unsupported filesystem link: ${destination}`);
    if (!destination || destination.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(destination)) continue;
    if (destination.startsWith('/') || destination.startsWith('\\') || destination.includes('\\')) {
      fail(`${relative} has an unsafe local link: ${destination}`);
    }
    const pathPart = destination.split(/[?#]/, 1)[0];
    if (!pathPart) continue;
    try { destination = decodeURIComponent(pathPart); }
    catch { fail(`${relative} has an invalid encoded local link: ${pathPart}`); }
    if (/^[a-z]:/i.test(destination) || destination.startsWith('/') || destination.includes('\\')) fail(`${relative} has an unsafe local link: ${destination}`);

    const resolved = path.resolve(path.dirname(sourcePath(relative)), ...destination.split('/'));
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) fail(`${relative} local link escapes the repository: ${destination}`);
    let stat;
    try { ({ stat } = inspectPath(path.relative(root, resolved))); }
    catch (error) { fail(`${relative} local link does not resolve to a supported file: ${destination} (${error.message})`); }
    if (!stat.isFile()) fail(`${relative} local link does not resolve to a regular file: ${destination}`);
  }
}

function readManifest() {
  let manifest;
  try { manifest = JSON.parse(readText('package.json')); }
  catch (error) { fail(`Cannot parse package.json: ${error.message}`, 'PARITY-INPUT-001'); }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || !Array.isArray(manifest.files) || !manifest.contributes || typeof manifest.contributes !== 'object') {
    fail('package.json must contain files and contributes objects', 'PARITY-INPUT-001');
  }
  for (const entry of manifest.files) {
    if (typeof entry !== 'string') fail('package.json files entries must be strings', 'PARITY-001');
    try { normalize(entry); }
    catch (error) { fail(`package.json files contains an invalid path: ${error.message}`, 'PARITY-001'); }
  }
  return manifest;
}

function checkManifestParity(manifest, inventory) {
  const roots = classes.map((definition) => definition.directory);
  const controlled = (relative) => roots.some((directory) => relative === directory || relative.startsWith(`${directory}/`));
  const expectedFiles = classes.flatMap((definition) => inventory[definition.name]);
  const actualFiles = manifest.files.filter((entry) => controlled(normalize(entry)));
  if (!equal(actualFiles, expectedFiles)) fail('package.json controlled files do not match shared discovery inventory', 'PARITY-001');
  for (const definition of classes) {
    const entries = manifest.contributes[definition.name];
    if (!Array.isArray(entries)) fail(`package.json contributes.${definition.name} must be an array`, 'PARITY-001');
    const actual = entries.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.path !== 'string') fail(`package.json contributes.${definition.name} has an invalid path`, 'PARITY-001');
      return normalize(entry.path);
    });
    if (!equal(actual, inventory[definition.name])) fail(`package.json contributes.${definition.name} does not match shared discovery inventory`, 'PARITY-001');
  }
}

function parseHandoffs(relative, blockLines, expectedTargets, agentNames) {
  const blocks = [];
  let current;
  let itemIndent;
  const fields = ['label', 'agent', 'prompt', 'send'];
  for (const line of blockLines) {
    if (!line.trim()) continue;
    const item = line.match(/^( +)- ([A-Za-z][A-Za-z0-9-]*): *(.*)$/);
    let key;
    let value;
    if (item) {
      if (itemIndent === undefined) itemIndent = item[1].length;
      if (item[1].length !== itemIndent) fail(`${relative} has unsupported handoff sequence indentation`);
      current = Object.create(null);
      blocks.push(current);
      [, , key, value] = item;
    } else {
      const field = line.match(/^( +)([A-Za-z][A-Za-z0-9-]*): *(.*)$/);
      if (!field || !current || field[1].length !== itemIndent + 2) {
        fail(`${relative} has unsupported handoff property indentation or nesting`);
      }
      [, , key, value] = field;
    }
    if (!fields.includes(key)) fail(`${relative} has unsupported handoff field: ${key}`);
    if (Object.hasOwn(current, key)) fail(`${relative} has duplicate handoff field: ${key}`);
    current[key] = key === 'send' ? value.trim() : parseTextScalar(value.trim(), relative, `handoff ${key}`);
  }
  if (blocks.length !== expectedTargets.length) fail(`${relative} must declare only its stage handoffs`);
  const targets = blocks.map((block) => {
    if (!fields.every((field) => typeof block[field] === 'string' && block[field].trim())) {
      fail(`${relative} has an incomplete handoff declaration`);
    }
    if (block.send !== 'false') fail(`${relative} handoff to ${block.agent} must use send: false`);
    if (!agentNames.has(block.agent)) fail(`${relative} handoff target is not a contributed agent: ${block.agent}`);
    return block.agent;
  });
  if (!equal(targets, expectedTargets)) fail(`${relative} must declare stage handoffs to ${expectedTargets.join(' and ')}`);
}

function checkPromptMetadata(relative, values, agentNames) {
  const name = path.basename(relative, '.prompt.md');
  if (!agentNames.has(values.agent) || values.agent !== promptRoutes[name] || values.name !== name) {
    fail(`${relative} must declare its valid name and RPIR stage route`, 'STRUCT-PROMPT-001');
  }
  if (Object.hasOwn(values, 'tools')) {
    const allowed = coordinatorTools[values.agent];
    if (!allowed || parseStringList(values.tools, relative, 'tools').some((tool) => !allowed.includes(tool))) {
      fail(`${relative} tools must not expand ${values.agent} capabilities`);
    }
  }
}

function checkAgentMetadata(relative, values, blocks, agentNames) {
  const name = values.name;
  if (!manualHandoffCoordinators.has(name) && name !== 'Script Runner' && !Object.hasOwn(workerTools, name)) {
    fail(`${relative} has an unrecognized agent role: ${name}; declare its tool and invocation boundary in the checker`);
  }
  if (!manualHandoffCoordinators.has(name) && (Object.hasOwn(values, 'agents') || Object.hasOwn(values, 'handoffs'))) {
    fail(`${relative} non-coordinator must not declare delegation or handoffs`);
  }
  if (manualHandoffCoordinators.has(name)) {
    if (!Object.hasOwn(values, 'tools') || !equal(parseStringList(values.tools, relative, 'tools'), coordinatorTools[name])) {
      fail(`${relative} coordinator tools differ from its declared role boundary`);
    }
    const delegates = parseStringList(values.agents, relative, 'agents');
    if (!equal(delegates, delegateRoutes[name]) || delegates.some((delegate) => !agentNames.has(delegate))) {
      fail(`${relative} delegates differ from its declared role boundary`);
    }
    if (!Object.hasOwn(values, 'handoffs')) fail(`${relative} must declare manual stage handoffs`);
    parseHandoffs(relative, blocks.handoffs, handoffRoutes[name], agentNames);
  }
  if (name === 'Script Runner' && (values['user-invocable'] !== 'false' || Object.hasOwn(values, 'agents') ||
      !equal(parseStringList(values.tools, relative, 'tools'), ['read', 'search', 'runInTerminal']))) {
    fail(`${relative} must remain non-invocable, non-delegating and non-editing`);
  }
  if (Object.hasOwn(workerTools, name) && (values['user-invocable'] !== 'false' ||
      !equal(parseStringList(values.tools, relative, 'tools'), workerTools[name]))) {
    fail(`${relative} worker tools or invocation metadata differ from its declared role boundary`);
  }
}

function skillMarkdownResources(inventory) {
  const resources = new Set();
  for (const skill of inventory.chatSkills) {
    const base = sourcePath(skill);
    function visit(full, relative) {
      let stat;
      try { ({ stat } = inspectPath(relative)); }
      catch (error) { fail(`Cannot inspect Skill resource ${relative}: ${error.message}`); }
      if (stat.isSymbolicLink()) fail(`Symbolic links are not allowed in Skill resources: ${relative}`);
      if (stat.isFile()) {
        if (relative.toLowerCase().endsWith('.md')) resources.add(normalize(relative));
        return;
      }
      if (!stat.isDirectory()) fail(`Unsupported Skill resource path: ${relative}`);
      let names;
      try { names = fs.readdirSync(full).sort(); }
      catch (error) { fail(`Cannot read Skill resource directory ${relative}: ${error.message}`); }
      for (const name of names) visit(path.join(full, name), `${relative}/${name}`);
    }
    visit(base, skill);
  }
  return [...resources].sort();
}

function checkCustomizationContracts(inventory) {
  const artifacts = classes.flatMap((definition) => definition.kind === 'skill'
    ? inventory[definition.name].map((skill) => `${skill}/SKILL.md`)
    : inventory[definition.name]);
  const parsedByPath = new Map();
  const names = new Map();
  const skillEntries = new Set(inventory.chatSkills.map((skill) => `${skill}/SKILL.md`));
  for (const relative of artifacts) {
    const parsed = parseFrontmatterText(readText(relative), relative);
    if (skillEntries.has(relative)) {
      const description = parseTextScalar((parsed.values.description || '').trim(), relative, 'description');
      if (!description.trim()) fail(`${relative} must declare a non-empty text description`);
    }
    if (names.has(parsed.values.name)) fail(`Duplicate contributed customization name ${parsed.values.name}: ${names.get(parsed.values.name)} and ${relative}`);
    names.set(parsed.values.name, relative);
    parsedByPath.set(relative, parsed);
  }

  const agentPaths = inventory.chatAgents;
  const agentNames = new Set(agentPaths.map((relative) => parsedByPath.get(relative).values.name));
  const promptPaths = inventory.chatPromptFiles;
  for (const relative of promptPaths) {
    checkPromptMetadata(relative, parsedByPath.get(relative).values, agentNames);
  }

  for (const relative of agentPaths) {
    const { values, blocks } = parsedByPath.get(relative);
    checkAgentMetadata(relative, values, blocks, agentNames);
  }

  for (const relative of artifacts) {
    const parsed = parsedByPath.get(relative);
    if (relative.startsWith('.github/instructions/') && !parsed.values.applyTo?.trim()) {
      fail(`${relative} must declare a non-empty applyTo field`);
    }
    checkLocalLinks(relative, parsed.text);
  }

  const resources = skillMarkdownResources(inventory);
  for (const relative of resources) {
    if (!parsedByPath.has(relative)) checkLocalLinks(relative, readText(relative));
  }
  return { artifactCount: artifacts.length, resourceCount: resources.length };
}

function report(label, error, category) {
  if (!error) {
    console.log(`${label}: PASS`);
    return false;
  }
  console.error(`DIAGNOSTIC FAIL ${error.contractId || category}: ${error.message}`);
  console.error(`${label}: FAIL`);
  return true;
}

function main() {
  let failed = false;
  let inventory;
  let manifest;
  try { inventory = discover(); }
  catch (error) { failed = report('Discovery', error, 'DISCOVERY-001'); }
  try { manifest = readManifest(); }
  catch (error) { failed = report('Manifest input', error, 'PARITY-INPUT-001') || failed; }

  if (manifest && inventory) {
    try { checkManifestParity(manifest, inventory); failed = report('Manifest/discovery parity', null, 'PARITY-001') || failed; }
    catch (error) { failed = report('Manifest/discovery parity', error, 'PARITY-001') || failed; }
  } else {
    console.error('Manifest/discovery parity: NOT RUN (required input unavailable)');
    failed = true;
  }

  if (inventory) {
    try {
      const { artifactCount, resourceCount } = checkCustomizationContracts(inventory);
      failed = report(`Customization structure (${artifactCount} artifacts; ${resourceCount} Skill Markdown files)`, null, 'STRUCT-001') || failed;
    } catch (error) { failed = report('Customization structure', error, 'STRUCT-001') || failed; }
  } else {
    console.error('Customization structure: NOT RUN (discovery unavailable)');
    failed = true;
  }

  console.log(limitation);
  if (failed) process.exitCode = 1;
}

if (require.main === module) {
  try { main(); }
  catch (error) {
    console.error(`Copilot structural verification failed: ${error.message}`);
    process.exitCode = 1;
    console.log(limitation);
  }
}

module.exports = {
  checkAgentMetadata, checkLocalLinks, checkManifestParity, checkPromptMetadata,
  checkCustomizationContracts, parseFrontmatterText, parseHandoffs, parseStringList
};