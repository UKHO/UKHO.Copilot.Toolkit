'use strict';

const fs = require('fs');
const path = require('path');
const { classes, discover, normalize, root } = require('./discover-copilot-artifacts.cjs');

const manifestPath = path.join(root, 'package.json');
const runBookPath = 'docs/run-books/vsix-packaging.md';
const legacyGuidePath = 'docs/vsix-packaging.md';
const vsixRunBookSequence = [
  'toolkit-verify-copilot-contracts',
  'toolkit-discover-copilot-artifacts',
  'toolkit-sync-copilot-manifest',
  'toolkit-check-copilot-manifest',
  'toolkit-package-vsix',
  'toolkit-verify-vsix-boundary'
];
const legacyRunnerSelectionAnchors = [
  'one stable operation ID supplied directly by the operator',
  'prohibit aggregate operation'
];
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
const planAgentsFrontmatter = "agents: ['Requirements Analyst', 'Architecture Analyst', 'Test Strategist', 'Domain Investigator', 'Feasibility Investigator', 'Stage Assurance']";
const stableContractAnchors = [
  ['.github/agents/research.agent.md', 'Research never sets `Completed`.'],
  ['.github/skills/rpir-lifecycle-core/SKILL.md', 'Explicit `/plan` admission and bounded Research closure'],
  ['.github/skills/architecture-planning/SKILL.md', 'implementation-relevant requirement'],
  ['.github/agents/implement.agent.md', 'Before the initial edit, and before any further affected edit'],
  ['.github/agents/implementation-worker.agent.md', 'Do not run commands, expand scope'],
  ['.github/skills/safe-implementation/SKILL.md', 'Before the initial edit, and before any further affected edit']
];
const phasePromptContracts = {
  '.github/prompts/plan.prompt.md': {
    name: 'Plan phase-entry',
    anchors: ['${input:researchBriefPath:', 'This explicit `/plan` invocation and one validated predecessor—the exact canonical in-progress Research-brief evidence—are the handoff confirmation;', 'do not ask a duplicate phase-entry question', 'does not authorize implementation']
  },
  '.github/prompts/implement.prompt.md': {
    name: 'Implement phase-entry',
    anchors: ['${input:implementationPlanPath:', 'The invocation supplies one lifecycle-core-validated canonical implementation-plan route;', 'routing is not approval', 'The recorded developer approval for that exact canonical plan authorizes only its initial non-remediation scoped pass']
  },
  '.github/prompts/review.prompt.md': {
    name: 'Review phase-entry',
    anchors: ['${input:implementationReportPath:', 'The invocation and one validated predecessor—the exact canonical implementation-report evidence—are the handoff confirmation;', 'do not ask a duplicate phase-entry question', 'This confirmation does not authorize edits']
  },
  '.github/prompts/remediate-review.prompt.md': {
    name: 'remediation phase-entry',
    anchors: ['${input:reviewReportPath:', 'The invocation and one validated predecessor—the exact canonical source Review-report evidence—are the handoff confirmation;', 'do not ask a duplicate phase-entry question', 'This confirmation does not replace the separately approved remediation pass']
  }
};
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
  if (!blocks.length) fail(`${relative} must declare a manual handoff`);
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

function checkSingleReportPrompt(relative, inputName, typeAnchor, forbiddenInput) {
  const text = readText(relative);
  const inputs = [...text.matchAll(/\$\{input:([A-Za-z][A-Za-z0-9]*):/g)].map((match) => match[1]);
  if (!equal(inputs, [inputName])) fail(`${relative} must declare exactly one ${typeAnchor} input`);
  if (!text.includes(typeAnchor) || !text.includes('lifecycle-core-eligible')) fail(`${relative} must type its single input as a lifecycle-core-eligible ${typeAnchor}`);
  if (text.includes(`input:${forbiddenInput}:`)) fail(`${relative} must not retain the separate ${forbiddenInput} input or fallback`);
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
    'The command examples in this section are human guidance only; Script Runner treats only the dedicated stable-ID list',
    'Native Windows is not sandbox containment.'
  ], 'moved human-readable Run Book');
  const lines = text.split('\n');
  const headings = lines.reduce((matches, line, index) => line === '## Script Runner operations' ? [...matches, index] : matches, []);
  if (headings.length !== 1) fail(`${runBookPath} must contain exactly one Script Runner operations heading`);
  const expectedItems = vsixRunBookSequence.map((id, index) => `${index + 1}. ${id}`);
  const items = lines.slice(headings[0] + 1, headings[0] + 1 + expectedItems.length);
  if (!equal(items, expectedItems)) fail(`${runBookPath} must contain the exact ordered VSIX Script Runner sequence`);
  const following = lines.slice(headings[0] + 1 + expectedItems.length);
  const endsAtFile = following.length === 0 || (following.length === 1 && following[0] === '');
  if (!endsAtFile && !following[0].startsWith('## ')) fail(`${runBookPath} Script Runner operations section must end after its exact ordered list`);
}

function checkCatalogueOperation(id, requiredAnchors) {
  const catalogue = readText('.github/copilot-script-catalogue.md');
  const heading = `## Operation: \`${id}\``;
  const start = catalogue.indexOf(heading);
  if (start < 0) fail(`Consumer catalogue is missing ${id}`);
  const end = catalogue.indexOf('\n## Operation: ', start + heading.length);
  const operation = catalogue.slice(start, end < 0 ? undefined : end);
  for (const anchor of requiredAnchors) {
    if (!operation.includes(anchor)) fail(`${id} is missing objective prerequisite or boundary: ${anchor}`);
  }
  if (/\b(?:reviewed|understood|approved)\b/i.test(operation)) {
    fail(`${id} must not retain a subjective review, understanding, or approval prerequisite`);
  }
}

function checkScriptRunnerAutonomyContracts() {
  const runner = readText('.github/agents/script-runner.agent.md');
  for (const legacy of legacyRunnerSelectionAnchors) {
    if (runner.includes(legacy)) fail(`.github/agents/script-runner.agent.md must not retain legacy single-operation selection anchor: ${legacy}`);
  }
  requireAnchors('.github/agents/script-runner.agent.md', [
    'one or more stable catalogue operation IDs enumerated directly by the operator in the requested order, or one developer-named repository-contained Run Book',
    'Scan the complete fixed-root catalogue only to establish that stable operation IDs are unique.',
    'semantically validate only the complete selected entry and its referenced artifacts',
    'Validate, execute, and inspect only the exact Skill-validated selected operations in their stated order.',
    'Refuse duplicate requested IDs and never discover, infer, substitute, skip, retry, or dynamically add IDs, commands, arguments, dependencies, or follow-on operations.',
    'A refusal, failed prerequisite, prompt or denial, failure, mismatch, undeclared effect, or inspection discrepancy stops the remaining sequence.',
    'It does not provide a generic terminal route',
    'lifecycle implementation, create or edit catalogues or scripts, delegate work, create reports, or bypass',
    'Native Windows provides no sandbox-containment guarantee.'
  ], 'direct-or-Run-Book ordered selection');
  requireAnchors('.github/skills/repository-script-catalogue/SKILL.md', [
    'Scan the complete fixed-root catalogue only to establish stable-operation-ID uniqueness; do not semantically validate, recertify, or require fresh operator confirmation for unrelated entries.',
    'Require one or more stable IDs enumerated directly by the developer in order, or one developer-named repository-contained Run Book.',
    'Validate, execute, and inspect selected entries only in their stated order.',
    'Refuse duplicate requested IDs; do not discover, infer, substitute, skip, retry, or dynamically add an ID, command, argument, dependency, or follow-on operation.',
    'Stop the remaining sequence and report any refusal, failed prerequisite, prompt or denial, error, unexpected network or script effect, non-zero result, timeout, mismatch, undeclared artifact, or other unexpected effect.',
    'This Skill grants no edit, installation, generic `mutation` operation classification, lifecycle, report, delegation, or general terminal authority.',
    'Native Windows provides no sandbox-containment guarantee'
  ], 'selected-entry-only catalogue validation');
  requireAnchors('.github/copilot-instructions.md', [
    'The developer must enumerate one or more lowercase-kebab-case stable IDs in order directly, or name one repository-contained Run Book',
    'Refuse blank lines, nested items, Markdown decoration or links, comments, commands, arguments, or any other content in that section',
    'Do not discover, infer, substitute, skip, retry, or dynamically add an ID, command, argument, dependency, or follow-on operation; refuse duplicate requested IDs.',
    'Scan the complete fixed-root catalogue only to establish stable-ID uniqueness.',
    'Do not require repository-authored fresh operator confirmation, attestation, or semantic recertification of unrelated entries.',
    'Semantically validate only each selected entry and its referenced artifacts',
    'any refusal, invalid entry, failed prerequisite, prompt or denial, failure, mismatch, undeclared effect, or inspection discrepancy stops the remaining sequence.',
    'Catalogue selection does not override Workspace Trust, VS Code permissions, or managed-policy prompts and denials'
  ], 'Script Runner ordered-selection policy');
  requireAnchors('.github/skills/create-runbook/SKILL.md', [
    'name: create-runbook',
    '[Run Book template](templates/runbook.md)',
    'It provides authoring guidance only; it cannot authorize Script Runner execution, commands, or catalogue mutation.'
  ], 'Run Book Skill');
  requireAnchors('.github/skills/create-runbook/templates/runbook.md', [
    '## Script Runner selection grammar',
    '## Script Runner operations',
    'Each item must contain exactly one plain-text lowercase-kebab-case stable ID',
    'Include the following section only when this Run Book has Script Runner intent; otherwise omit it entirely.',
    'do not include blank lines, nested items, Markdown decoration or links, comments, commands, arguments, or any other content.'
  ], 'Run Book template');
  checkCatalogueOperation('toolkit-sync-copilot-manifest', [
    '- Classification: `packaging-controlled-write`',
    '- Packaging identity: `ukho-copilot-toolkit`',
    'Readable, parseable package.json whose name is exactly ukho-copilot-toolkit.',
    'Declared fixed toolkit-discover-copilot-artifacts probe captures complete sorted JSON inventory.',
    'Immediately before sync, rerun that exact probe and require byte-for-byte equality',
    'synchronizer\'s existing immediate discover() comparison/write remains a second check.'
  ]);
  checkCatalogueOperation('toolkit-package-vsix', [
    '- Classification: `build/test`',
    'Readable, parseable package.json whose name is ukho-copilot-toolkit.',
    'Declared package script and fixed local @vscode/vsce executable exist.',
    'Local package dependencies exist.',
    'Immediately preceding successful requested toolkit-check-copilot-manifest operation with no requested intervening operation',
    'Immediately before packaging, reread/reprobe and require byte-for-byte equality.'
  ]);
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
  for (const [relative, contract] of Object.entries(phasePromptContracts)) {
    requireAnchors(relative, contract.anchors, contract.name);
  }

  requireAnchors('.github/agents/plan.agent.md', [
    'This confirmation does not authorize edits, commands, remediation, scope or hierarchy changes, acceptance, or automatic submission',
    'separate explicit developer approval remains required before implementation.'
  ], 'Plan coordinator handoff-only authority');
  requireAnchors('.github/agents/implement.agent.md', [
    'The invocation routes one canonical implementation plan and the handoff is evidence-only; routing and handoff cannot authorize edits, commands, remediation, reports, scope or hierarchy changes, or automatic progression.',
    'The recorded developer approval for that exact canonical plan authorizes only its initial non-remediation scoped pass; preserve the separate scope, command, write, report, remediation, acceptance, and manual-handoff gates.'
  ], 'Implement coordinator handoff-only authority');
  requireAnchors('.github/copilot-instructions.md', [
    'exact developer-named approved canonical plan',
    'initial non-remediation pass',
    'complete unchanged Tier 1 row',
    'VS Code and managed organization policy control permissions and approvals',
    'Tier 2 is a separately approved dependency-installation invocation',
    'never a worker, delegate, Research, Plan, Review, or nested agent',
    'bounded terminal/cleanup controls remain unchanged'
  ], 'exact-plan initial-pass Tier 1 authority and retained boundaries');
  requireAnchors(core, [
    'recorded exact-plan developer approval governs the initial scoped pass',
    'complete unchanged Tier 1',
    'Tier 2',
    'remediation',
    'cleanup',
    'Script Runner',
    'worker',
    'Workspace Trust',
    'managed policy'
  ], 'exact-plan initial-pass Tier 1 authority and retained boundaries');
  requireAnchors('.github/skills/safe-implementation/SKILL.md', [
    'exact developer-named canonical plan',
    'initial non-remediation pass',
    'complete unchanged Tier 1',
    'Tier 2 is a separate dependency-installation route',
    'cleanup exception',
    'Workspace Trust',
    'managed policy'
  ], 'exact-plan initial-pass Tier 1 authority and retained boundaries');
  requireAnchors('.github/skills/safe-implementation/validation-checklist.md', [
    'exact developer-named canonical plan',
    'initial non-remediation pass',
    'complete unchanged Tier 1',
    'Tier 2 is separately checked',
    'cleanup exception',
    'Workspace Trust',
    'managed policy'
  ], 'exact-plan initial-pass Tier 1 authority and retained boundaries');
  requireAnchors('.github/skills/architecture-planning/SKILL.md', [
    'exact approved canonical plan',
    'initial non-remediation pass',
    'complete unchanged Tier 1',
    'Tier 2 separation',
    'Script Runner',
    'cleanup',
    'Workspace Trust',
    'managed policy'
  ], 'exact-plan initial-pass Tier 1 authority and retained boundaries');
  requireAnchors('.github/skills/architecture-planning/implementation-plan-template.md', [
    'exact approved canonical plan',
    'initial non-remediation pass',
    'complete unchanged Tier 1',
    'Tier 2 must be recorded separately',
    'Script Runner',
    'cleanup',
    'Workspace Trust',
    'managed policy'
  ], 'exact-plan initial-pass Tier 1 authority and retained boundaries');
  requireAnchors('docs/Wiki/rpir.md', [
    'exact saved plan',
    'initial non-remediation pass',
    'complete unchanged Tier 1',
    'Tier 2',
    'remediation',
    'cleanup',
    'Script Runner',
    'workers do not execute commands',
    'Workspace Trust',
    'managed policy'
  ], 'exact-plan initial-pass Tier 1 authority and retained boundaries');
  requireAnchors('.github/agents/review.agent.md', [
    'The invocation and handoff are evidence-only; they cannot authorize edits, commands, remediation, reports, scope or hierarchy changes, or automatic progression.',
    'Review-entry confirmation does not replace this coordinator\'s separate explicit developer acceptance, write, report, remediation, scope, or manual-handoff gates; acceptance remains a separate developer decision.'
  ], 'Review coordinator handoff-only authority');
  requireAnchors('.github/agents/script-runner.agent.md', [
    'It does not provide a generic terminal route',
    'Script Runner never creates or edits the consumer catalogue or scripts'
  ], 'Script Runner stable-ID and non-authority');
  requireAnchors('.github/copilot-instructions.md', [
    '**Script Runner ordered selection:** This supersedes the one-ID/direct-only and aggregate-operation wording',
    'This is not a lifecycle command route: the `Implement` coordinator remains the sole executor of guarded lifecycle implementation commands',
    'lifecycle-command proxy, edit, installation, approval reuse',
    '**Script Runner root binding:** The current workspace must contain exactly one opened workspace folder'
  ], 'Script Runner policy selection and authority');

  requireAnchors(core, [
    'hostless local `file:` URL in the exact platform form: on Windows, `file:///C:/<non-empty slash-separated segments>`',
    'on POSIX, `file:///<non-empty slash-separated segments>`',
    'First validate the alias as written, before URI or path-parser normalization:',
    'reject symbolic links, junctions, reparse points, or equivalent filesystem indirection that makes the resolved target escape the workspace',
    'Reject with no repair or inference: multiple candidates; filename-only, empty, dangling, malformed, label-only, reference-style, or indirect-link values; mixed or duplicate separators; `.` or `..` segments or traversal; non-file URI schemes, fragments, encoded paths, redirects, UNC or network paths; external absolute paths; inaccessible paths; incompatible record types; wrong lifecycle folders; and inconsistent or missing required linkage.',
    'do not select, allocate, amend, write, mutate, or hand off a record on rejection.',
    'Do not select by prefix, suffix, recency, or `latest`,'
  ], 'local-file grammar, rejection, and containment');

  checkSingleReportPrompt('.github/prompts/review.prompt.md', 'implementationReportPath', 'implementation-report', 'implementationPlanPath');
  checkSingleReportPrompt('.github/prompts/remediate-review.prompt.md', 'reviewReportPath', 'source Review-report', 'implementationPlanPath');
  requireAnchors('.github/agents/review.agent.md', [
    'exactly one implementation-report input for this review as a lifecycle-core-eligible bounded alias',
    'confirm its expected type, accessibility, lifecycle folder, and exact direct canonical-plan linkage',
    'Reject invalid input and allocate no Review report for that rejection.'
  ], 'Review input cardinality, type, and validation');
  requireAnchors('.github/agents/implement.agent.md', [
    'exactly one source Review-report input as a lifecycle-core-eligible bounded alias',
    'same-folder',
    'Then validate its expected type, accessibility, lifecycle folder, and exact canonical linkage:',
    'Do not infer a source report, plan, or reviewed report from a prefix, suffix, recency, or directory contents.'
  ], 'remediation input cardinality, type, and chain');

  requireAnchors('.github/skills/safe-implementation/implementation-report-template.md', [
    '**Canonical implementation plan:**',
    'a direct one-hop local Markdown link matching the canonical implementation-plan field',
    '**Canonical source Review report:**',
    '**Reviewed implementation report:**'
  ], 'implementation-report field/link pairs');
  requireAnchors('.github/skills/code-review/review-report-template.md', [
    '**Canonical implementation plan:**',
    '**Reviewed implementation report:**',
    'a direct one-hop local Markdown link matching the canonical implementation-plan field',
    'same-folder'
  ], 'Review-report field/link pairs');

  requireAnchors(core, [
    'It does not authorize acceptance, remediation, report allocation, or status changes',
    'No other report content, fallback, discovery, substitution, prefix, suffix, recency, or inferred relationship is permitted.',
    'No other report content, fallback, discovery, substitution, prefix, suffix, recency, or inferred relationship is permitted.'
  ], 'no-discovery and no-fallback');
  requireAnchors('.github/copilot-instructions.md', [
    'reports remain immutable, non-authorizing evidence',
    'manual handoffs, `send: false`, Review\'s explicit developer acceptance',
    'The implementation plan remains the sole authority for scope, Work Item/Task/Step hierarchy, lifecycle status, and completion markers.',
    'Remediation requires a separately approved Implement pass naming the exact canonical plan and exact source Review-report path.'
  ], 'authority and approval safeguards');
  requireAnchors(core, [
    'It does not authorize acceptance, remediation, report allocation, or status changes',
    'Preserve manual `send: false` handoffs'
  ], 'manual-handoff and non-authority safeguards');
}

function checkLifecycleContracts() {
  const plan = readText('.github/agents/plan.agent.md');
  if (!plan.split('\n').includes(planAgentsFrontmatter)) fail('.github/agents/plan.agent.md must use the fixed Plan investigator allow-list');
  for (const [relative, anchor] of stableContractAnchors) {
    if (!readText(relative).includes(anchor)) fail(`${relative} is missing the fixed lifecycle contract anchor: ${anchor}`);
  }
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
    const target = frontmatter.get(relative).values.agent;
    if (!target || !agentNames.has(target)) fail(`${relative} must target a contributed agent by exact name`);
  }
  for (const relative of inventory.chatAgents) {
    const { values } = frontmatter.get(relative);
    checkHandoffs(relative, values, agentNames);
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