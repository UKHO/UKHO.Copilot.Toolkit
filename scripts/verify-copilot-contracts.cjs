'use strict';

const fs = require('fs');
const path = require('path');
const { classes, discover, normalize, root } = require('./discover-copilot-artifacts.cjs');

const manifestPath = path.join(root, 'package.json');
const runBookPath = 'docs/run-books/vsix-packaging.md';
const legacyGuidePath = 'docs/vsix-packaging.md';
const guideCatalogueCouplingIdentifiers = [
  'cataloguePath',
  'catalogueFieldOrder',
  'catalogueExpectedOperations',
  'parseCatalogue',
  'verifyCatalogue',
  'copilot-script-catalogue.md'
];
const reportPatterns = {
  '.github/instructions/lifecycle-implementation-reports.instructions.md': "docs/{planning,delivery}/**/[0-9][0-9][0-9]-implementation-report.md",
  '.github/instructions/lifecycle-review-reports.instructions.md': "docs/{planning,delivery}/**/[0-9][0-9][0-9]-review-report.md"
};
const coordinators = ['research', 'plan', 'implement', 'review'];
const coordinatorTools = {
  Research: ['read', 'search', 'web', 'edit', 'agent'],
  Plan: ['read', 'search', 'edit', 'agent'],
  Implement: ['read', 'search', 'edit', 'agent', 'runInTerminal'],
  Review: ['read', 'search', 'edit', 'agent']
};
const promptRoutes = {
  plan: 'Plan', implement: 'Implement', review: 'Review', 'remediate-review': 'Plan'
};
const handoffRoutes = { Research: 'Plan', Plan: 'Implement', Implement: 'Review', Review: 'Plan' };
const workerTools = {
  'Architecture Analyst': ['read', 'search'], 'Codebase Investigator': ['read', 'search'],
  'Correctness Reviewer': ['read', 'search'], 'Domain Investigator': ['read', 'search', 'web'],
  'Feasibility Investigator': ['read', 'search', 'web'], 'Implementation Worker': ['read', 'search', 'edit'],
  'Maintainability Reviewer': ['read', 'search'], 'Requirements Analyst': ['read', 'search'],
  'Security Reviewer': ['read', 'search'], 'Stage Assurance': ['read', 'search'],
  'Test Strategist': ['read', 'search'], 'Test Worker': ['read', 'search'],
  'Validation Worker': ['read', 'search']
};
const manualHandoffCoordinators = new Set(['Research', 'Plan', 'Implement', 'Review']);
const staticContractLimitation = 'Authored-contract assertions are static only; they do not enforce runtime permissions, Workspace Trust, managed policy, URI parsing, filesystem behavior or indirection, or installed-VSIX behavior.';

function fail(message) { throw new Error(message); }
function equal(actual, expected) { return JSON.stringify(actual) === JSON.stringify(expected); }

function sourcePath(relative) {
  const full = path.resolve(root, relative);
  if (full !== root && !full.startsWith(`${root}${path.sep}`)) fail(`Path escapes fixed repository root: ${relative}`);
  return full;
}

function readText(relative) {
  try { return fs.readFileSync(sourcePath(relative), 'utf8').replace(/\r\n/g, '\n'); }
  catch (error) { fail(`Cannot read ${relative}: ${error.message}`); }
}

function parseFrontmatter(relative) {
  const text = readText(relative);
  const lines = text.split('\n');
  if (lines[0] !== '---') fail(`${relative} must begin with an opening YAML delimiter`);
  const end = lines.indexOf('---', 1);
  if (end < 1) fail(`${relative} must contain a closing YAML delimiter`);
  const values = {};
  for (const line of lines.slice(1, end)) {
    if (/^\s+/.test(line)) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9-]*):(?:\s(.*))?$/);
    if (!match || Object.hasOwn(values, match[1])) fail(`${relative} has unsupported or duplicate frontmatter`);
    values[match[1]] = match[2] || '';
  }
  if (!values.name) fail(`${relative} must declare a non-empty name`);
  return { text, values };
}

function parseStringList(value, relative) {
  if (!/^\[(?:'[^']*'(?:, )?)*\]$/.test(value)) fail(`${relative} has unsupported tools frontmatter`);
  return value === '[]' ? [] : value.slice(1, -1).split(', ').map((entry) => entry.slice(1, -1));
}

function checkLocalLinks(relative, text) {
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)) {
    const destination = match[1];
    if (destination.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(destination)) continue;
    if (destination.startsWith('/') || destination.includes('\\')) fail(`${relative} has an unsafe local link: ${destination}`);
    const target = destination.split('#', 1)[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(sourcePath(relative)), target);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) fail(`${relative} local link escapes the repository: ${destination}`);
    if (!fs.existsSync(resolved) || !fs.lstatSync(resolved).isFile()) fail(`${relative} local link does not resolve to a file: ${destination}`);
  }
}

function readManifest() {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
  catch (error) { fail(`Cannot parse package.json: ${error.message}`); }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || !Array.isArray(manifest.files) || !manifest.contributes || typeof manifest.contributes !== 'object') fail('package.json must contain files and contributes objects');
  return manifest;
}

function checkManifestParity(manifest, inventory) {
  const roots = classes.map((definition) => definition.directory);
  const controlled = (relative) => roots.some((directory) => relative === directory || relative.startsWith(`${directory}/`));
  const expectedFiles = classes.flatMap((definition) => inventory[definition.name]);
  const actualFiles = manifest.files.filter((entry) => typeof entry === 'string' && controlled(normalize(entry)));
  if (!equal(actualFiles, expectedFiles)) fail('package.json controlled files do not match shared discovery inventory');
  for (const definition of classes) {
    const entries = manifest.contributes[definition.name];
    if (!Array.isArray(entries)) fail(`package.json contributes.${definition.name} must be an array`);
    const actual = entries.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.path !== 'string') fail(`package.json contributes.${definition.name} has an invalid path`);
      return normalize(entry.path);
    });
    if (!equal(actual, inventory[definition.name])) fail(`package.json contributes.${definition.name} does not match shared discovery inventory`);
  }
}

function checkHandoffs(relative, values, agentNames) {
  if (!manualHandoffCoordinators.has(values.name)) return;
  const blocks = [...readText(relative).matchAll(/- label: [^\n]+\n\s+agent: ([^\n]+)\n\s+prompt: [^\n]+\n\s+send: (\w+)/g)];
  if (blocks.length !== 1 || blocks[0][1] !== handoffRoutes[values.name]) fail(`${relative} must declare its single conditional stage handoff to ${handoffRoutes[values.name]}`);
  for (const block of blocks) {
    if (block[2] !== 'false') fail(`${relative} handoff to ${block[1]} must use send: false`);
    if (!agentNames.has(block[1])) fail(`${relative} handoff target is not a contributed agent: ${block[1]}`);
  }
}

function requireAnchors(relative, anchors, contract) {
  const text = readText(relative);
  for (const anchor of anchors) {
    if (!text.includes(anchor)) fail(`${relative} is missing the authored ${contract} contract anchor: ${anchor}`);
  }
}

function requireConcepts(relative, concepts) {
  const text = readText(relative);
  for (const [label, pattern] of Object.entries(concepts)) {
    if (!pattern.test(text)) fail(`${relative} lacks authored ${label} guidance (static only)`);
  }
}

function checkVsixRunBook() {
  if (fs.existsSync(sourcePath(legacyGuidePath))) fail(`${legacyGuidePath} must be absent after the Run Book move`);
  const text = readText(runBookPath);
  checkLocalLinks(runBookPath, text);
  requireAnchors(runBookPath, [
    '## Purpose',
    '## Scope',
    '## Preparation',
    '## Ordered process',
    '## Expected results',
    '## Diagnostics and failure disposition',
    '## Safety limits',
    '## Validation and limitations',
    'The command examples in this section are human guidance only',
    'Native Windows is not sandbox containment.'
  ], 'moved human-readable Run Book');
  if (text.includes('## Script Runner operations')) fail(`${runBookPath} must remain human guidance, not Runner ID selection`);
}

function checkScriptRunnerAutonomyContracts() {
  const runnerPath = '.github/agents/script-runner.agent.md';
  const runner = parseFrontmatter(runnerPath);
  if (!equal(parseStringList(runner.values.tools, runnerPath), ['read', 'search', 'runInTerminal'])) fail('Script Runner must have read, search, terminal and no edit or nested agent tool');
  if (Object.hasOwn(runner.values, 'agents')) fail('Script Runner must not delegate');
  requireAnchors(runnerPath, ['goal', 'phase', 'cwd', 'with multiple', 'denial', 'tracked', 'untracked', 'generated', 'Native Windows'], 'bounded Runner goal and effect inspection');
  for (const name of coordinators) {
    const relative = `.github/agents/${name}.agent.md`;
    const parsed = parseFrontmatter(relative);
    if (!parseStringList(parsed.values.agents, relative).includes('Script Runner')) fail(`${relative} must name Script Runner as a delegate`);
    requireAnchors(relative, ['Script Runner', 'goal', 'phase', 'scope'], 'phase-scoped Runner delegation');
  }
  for (const relative of [runnerPath, '.github/copilot-instructions.md', '.github/skills/rpir-lifecycle-core/SKILL.md']) {
    const text = readText(relative);
    if (/stable catalogue operation IDs|complete unchanged Tier 1|## Script Runner operations/.test(text)) fail(`${relative} retains obsolete Runner eligibility`);
  }
  requireAnchors('.github/skills/create-runbook/SKILL.md', [
    'name: create-runbook',
    '[Run Book template](templates/runbook.md)',
    'human-readable repository Run Book'
  ], 'Run Book Skill');
  requireAnchors('.github/skills/create-runbook/templates/runbook.md', ['## Purpose', '## Ordered process', '## Sources'], 'human Run Book template');
  const manifest = readManifest();
  if (manifest.name !== 'ukho-copilot-toolkit') fail('package.json must use the ukho-copilot-toolkit package identity');
  if (!manifest.scripts || !manifest.scripts.package?.includes('`${p.name}-${p.version}.vsix`')) fail('package.json package output must derive from name and version');
  requireAnchors('scripts/verify-vsix-boundary.cjs', ['`${manifest.name}-${manifest.version}.vsix`'], 'VSIX boundary output formula');
  const guideValidator = readText('scripts/verify-vsix-packaging-guide.cjs');
  for (const forbidden of guideCatalogueCouplingIdentifiers) {
    if (guideValidator.includes(forbidden)) fail(`VSIX packaging-guide validator must not couple to consumer catalogue ${forbidden}`);
  }
  checkVsixRunBook();
}

function checkAuthoredLifecycleContracts() {
  const core = '.github/skills/rpir-lifecycle-core/SKILL.md';
  const lifecycle = {
    'four intake channels': /attachment[\s\S]*HTTPS[\s\S]*past(?:e|ed)[\s\S]*local path/i,
    'inspected version binding': /inspected content[\s\S]*version[\s\S]*fingerprint/i,
    'kind and freshness checks': /expected kind[\s\S]*freshness/i,
    'conflicting versions': /versions conflict[\s\S]*clarify/i,
    'changed mutable version': /version changed[^\n]*re-inspect and rebind/i,
    'wrong kind': /Verify expected kind[^\n]*subject[^\n]*freshness/i,
    'blocked input cannot authorize effects': /blocked draft[^\n]*does not authorize dependent effects/i,
    'ordinary HTTPS versus local alias': /HTTPS[\s\S]*redirect[\s\S]*unsafe[\s\S]*file:/i,
    'file aliases cannot use the remote fetch route': /local `file:` alias[^\n]*local-path input[^\n]*never[^\n]*remote fetch/i,
    'untrusted remote instructions': /Do not treat[^\n]*embedded instructions[^\n]*agent instructions/i,
    'local traversal': /dot segments[\s\S]*percent encoding/i,
    'raw alias validation': /validate the raw alias before path or URI normalization/i,
    'local indirection containment': /lexical workspace containment[\s\S]*resolved-target containment/i,
    'local junction escape': /junctions or reparse points/i,
    'local field/link pairing': /canonical-path fields[\s\S]*matching direct[\s\S]*Markdown links/i,
    'local status preimage': /complete exact-record preimage[^\n]*immediately compare/i,
    'bounded status-only postimage': /Write only that status field\.[^\n]*Re-read the complete postimage[^\n]*one-field difference/i,
    'report-first terminal status': /all-OK Review report[\s\S]*Ready for review[\s\S]*Accepted/i,
    'collision second scan': /immediately re-inspect before creation and never overwrite/i,
    'phase tool permission': /Workspace Trust[\s\S]*tool[\s\S]*permissions/i
  };
  requireConcepts(core, lifecycle);
  const stageContracts = {
    research: { 'working Research document': /subject[\s\S]*draft[\s\S]*iterate/i, 'Research cannot complete itself': /Research never sets `Completed`/ },
    plan: { 'both predecessor kinds': /Research document[^\n]*Review report/i, 'supported mixed subset': /independently evidenced findings[^\n]*engineer chooses[^\n]*carry[^\n]*blocker/i, 'distinct plan': /distinct issue-scoped plan[^\n]*previous plan/i },
    implement: { 'per-pass approval': /\/implement[\s\S]*approval[\s\S]*bounded[\s\S]*pass/i, 'readiness before edits': /Before the initial edit[\s\S]*stop and refuse/i, 'no previous-plan reuse': /Never reopen[\s\S]*previous plan/i },
    review: { 'report-first acceptance': /all-OK report[\s\S]*ends RPIR[\s\S]*Accepted/i, 'mixed outcome': /mixed[\s\S]*supported[\s\S]*blockers/i, 'no direct implementation': /Never route a finding directly to Implement/i }
  };
  for (const [name, concepts] of Object.entries(stageContracts)) requireConcepts(`.github/agents/${name}.agent.md`, concepts);
  const prompts = {
    plan: { 'dual-kind input': /Research document[\s\S]*Review report/i, 'issue plan': /distinct issue-scoped plan/i },
    implement: { 'per-pass authorization': /\/implement[\s\S]*approval[\s\S]*bounded/i, 'readiness': /executable readiness[\s\S]*scope/i },
    review: { 'admission versus outcome': /Review admission[\s\S]*not final acceptance/i, 'conditional next step': /all-OK[\s\S]*issue-bearing[\s\S]*blocked/i },
    'remediate-review': { 'compatibility only': /deprecated compatibility[\s\S]*same Review-origin intake as `\/plan`/i, 'new plan not direct edits': /distinct issue-scoped plan[\s\S]*not a reused old plan or direct implementation/i }
  };
  for (const [name, concepts] of Object.entries(prompts)) {
    const relative = `.github/prompts/${name}.prompt.md`;
    const text = readText(relative);
    const inputs = [...text.matchAll(/\$\{input:([A-Za-z][A-Za-z0-9]*):([^}]+)\}/g)];
    if (inputs.length !== 1 || !/attachment[^\n]*HTTPS URL[^\n]*paste[^\n]*local path/i.test(inputs[0][2])) fail(`${relative} must accept one actual four-channel predecessor document`);
    if (name === 'plan' && !/Research document[^\n]*Review report/i.test(inputs[0][2])) fail(`${relative} must accept both Research and issue-bearing Review inputs`);
    requireConcepts(relative, concepts);
  }
  requireConcepts('.github/skills/architecture-planning/implementation-plan-template.md', {
    'source-neutral issue lineage': /Review-origin lineage[^\n]*reviewed implementation report[^\n]*previous plan[^\n]*original Research/i,
    'fresh issue units': /new unchecked units[\s\S]*old plans/i
  });
  requireConcepts('.github/skills/architecture-planning/SKILL.md', {
    'active material-gap resolution': /Resolve material planning gaps[^\n]*derive an evidenced solution or use `agent-question-resolution` to obtain the engineer's decision/
  });
  for (const relative of ['.github/skills/safe-implementation/implementation-report-template.md', '.github/skills/code-review/review-report-template.md']) {
    requireConcepts(relative, {
      'source-neutral record envelope': /envelope[\s\S]*channel\/locator[\s\S]*version/i,
      'verified local field/link pair only': /local record pairs \(only when real\)[\s\S]*matching direct one-hop local Markdown link/i,
      'non-authorizing evidence': /non-authorizing/i
    });
  }
  requireConcepts('.github/copilot-instructions.md', {
    'local write safety': /full.*preimage[\s\S]*status-only postimage/i,
    'independent allocation': /matching-suffix inventory[\s\S]*Never overwrite/i,
    'phase permission boundary': /Workspace Trust[\s\S]*managed-policy permission/i
  });
}

function checkLifecycleContracts() {
  checkAuthoredLifecycleContracts();
  checkScriptRunnerAutonomyContracts();
}

function main() {
  const inventory = discover();
  const manifest = readManifest();
  checkManifestParity(manifest, inventory);
  checkLifecycleContracts();
  const artifacts = classes.flatMap((definition) => definition.kind === 'skill' ? inventory[definition.name].map((skill) => `${skill}/SKILL.md`) : inventory[definition.name]);
  const names = new Map();
  const frontmatter = new Map();
  for (const relative of artifacts) {
    const parsed = parseFrontmatter(relative);
    if (names.has(parsed.values.name)) fail(`Duplicate contributed customization name ${parsed.values.name}: ${names.get(parsed.values.name)} and ${relative}`);
    names.set(parsed.values.name, relative);
    frontmatter.set(relative, parsed);
    checkLocalLinks(relative, parsed.text);
  }
  const agentNames = new Set(inventory.chatAgents.map((relative) => frontmatter.get(relative).values.name));
  for (const relative of inventory.chatPromptFiles) {
    const values = frontmatter.get(relative).values;
    const name = path.basename(relative, '.prompt.md');
    if (!agentNames.has(values.agent) || values.agent !== promptRoutes[name] || values.name !== name) fail(`${relative} must use its declared RPIR stage route`);
    if (Object.hasOwn(values, 'tools')) {
      const allowed = coordinatorTools[values.agent];
      if (!parseStringList(values.tools, relative).every((tool) => allowed.includes(tool))) fail(`${relative} tools must not expand ${values.agent} capabilities`);
    }
  }
  for (const relative of inventory.chatAgents) {
    const { values } = frontmatter.get(relative);
    checkHandoffs(relative, values, agentNames);
    if (Object.hasOwn(coordinatorTools, values.name) && !equal(parseStringList(values.tools, relative), coordinatorTools[values.name])) fail(`${relative} coordinator tools exceed its stage contract`);
    if (Object.hasOwn(workerTools, values.name)) {
      if (values['user-invocable'] !== 'false') fail(`${relative} worker must declare user-invocable: false`);
      if (!equal(parseStringList(values.tools, relative), workerTools[values.name])) fail(`${relative} worker tools do not match its least-privilege contract`);
    }
  }
  for (const [relative, pattern] of Object.entries(reportPatterns)) {
    if (frontmatter.get(relative)?.values.applyTo !== `'${pattern}'`) fail(`${relative} must use the exact numbered report applyTo pattern`);
  }
  console.log(`Copilot customization contracts match fixed-root discovery, manifest, frontmatter, link, handoff, worker, report-instruction, and authored lifecycle-contract requirements. ${staticContractLimitation}`);
}

try { main(); } catch (error) { console.error(`Copilot contract verification failed: ${error.message}`); process.exitCode = 1; }