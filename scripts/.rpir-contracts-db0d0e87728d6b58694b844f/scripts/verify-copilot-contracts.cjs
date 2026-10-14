'use strict';

const fs = require('fs');
const path = require('path');
const { classes, discover, normalize, root } = require('./discover-copilot-artifacts.cjs');
const { checkWorkflow } = require('./check-copilot-workflow.cjs');

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
const coordinators = ['research', 'plan', 'implement', 'review'];
const coordinatorTools = {
  Research: ['read', 'search', 'web', 'edit', 'agent'],
  Plan: ['read', 'search', 'edit', 'agent'],
  Implement: ['read', 'search', 'edit', 'agent', 'runInTerminal'],
  Review: ['read', 'search', 'edit', 'agent']
};
const promptRoutes = {
  plan: 'Plan', implement: 'Implement', review: 'Review', 'remediate-review': 'Implement'
};
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
const staticContractLimitation = 'Authored-contract assertions provide static text evidence only; they do not prove runtime permissions, Workspace Trust, managed policy, URI parsing, filesystem behavior or indirection, instruction attachment, or installed-VSIX behavior.';

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
  for (const entry of manifest.files) {
    if (typeof entry !== 'string') fail('package.json files entries must be strings');
    try { normalize(entry); }
    catch (error) { fail(`package.json files contains an invalid path: ${error.message}`); }
  }
  return manifest;
}

function checkManifestParity(manifest, inventory) {
  const roots = classes.map((definition) => definition.directory);
  const controlled = (relative) => roots.some((directory) => relative === directory || relative.startsWith(`${directory}/`));
  const expectedFiles = classes.flatMap((definition) => inventory[definition.name]);
  const actualFiles = manifest.files.filter((entry) => controlled(normalize(entry)));
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
  const text = readText(relative);
  const header = text.match(/^handoffs:\s*$/m);
  if (!header) fail(`${relative} must declare handoffs`);
  const tail = text.slice(header.index + header[0].length).split(/^\S/m, 1)[0];
  const blocks = tail.trimEnd().split(/(?=^  - label: )/m).filter((block) => block.trim());
  if (blocks.length !== handoffRoutes[values.name].length) fail(`${relative} must declare only its stage handoffs`);
  const targets = blocks.map((block) => {
    const match = block.match(/^  - label: [^\n]+\n    agent: (\w+)\n    prompt: [^\n]+\n    send: (true|false)\n?$/);
    if (!match) fail(`${relative} has incomplete, duplicate or unsupported handoff fields`);
    if (match[2] !== 'false') fail(`${relative} handoff to ${match[1]} must use send: false`);
    if (!agentNames.has(match[1])) fail(`${relative} handoff target is not a contributed agent: ${match[1]}`);
    return match[1];
  });
  if (!equal(targets, handoffRoutes[values.name])) fail(`${relative} must declare conditional stage handoffs to ${handoffRoutes[values.name].join(' and ')}`);
}

function requireAnchors(relative, anchors, contract) {
  const text = readText(relative);
  for (const anchor of anchors) {
    if (!text.includes(anchor)) fail(`${relative} is missing the authored ${contract} contract anchor: ${anchor}`);
  }
}

function checkLifecyclePatternScope(relative) {
  const { values } = parseFrontmatter(relative);
  const suffixes = ['research-brief', 'implementation-plan', 'implementation-report', 'review-report'];
  const legacy = suffixes.flatMap((suffix) => ['planning', 'delivery'].map((parent) => `docs/${parent}/**/[0-9][0-9][0-9]-${suffix}.md`));
  const prospective = suffixes.map((suffix) => `**/copilot/[0-9][0-9][0-9]-[a-z0-9]*/[0-9][0-9][0-9]-${suffix}.md`);
  const patterns = values.applyTo.replace(/^'|'$/g, '').split(',');
  if (!equal(patterns, [...legacy, ...prospective])) fail(`${relative} must declare twelve exact legacy/prospective lifecycle suffix patterns (static only)`);
  // Illustrative authored-shape examples, NOT the VS Code glob engine or runtime attachment.
  const legacyShape = /^docs\/(planning|delivery)\/.+\/[0-9]{3}-(research-brief|implementation-plan|implementation-report|review-report)\.md$/;
  const prospectiveShape = /^(?:.+\/)?copilot\/[0-9]{3}-[a-z0-9][^/]*\/[0-9]{3}-(research-brief|implementation-plan|implementation-report|review-report)\.md$/;
  const positives = suffixes.flatMap((suffix) => [
    `docs/planning/001-topic/001-${suffix}.md`, `docs/delivery/001-topic/001-${suffix}.md`,
    `docs/copilot/001-topic/001-${suffix}.md`, `team/handbook/copilot/001-topic/001-${suffix}.md`
  ]);
  positives.push('archive/copilot/001-topic/001-review-report.md'); // Unavoidable path overmatch; identity is separate.
  const negatives = ['docs/copilot/topic/001-research-brief.md', 'docs/copilot/001-topic/research-brief.md',
    'docs/copilot/001-topic/001-notes.md', 'team/handbook/001-topic/001-research-brief.md',
    'docs/planning/001-topic/001-notes.md'];
  for (const sample of positives) {
    if (!legacyShape.test(sample) && !prospectiveShape.test(sample)) fail(`${relative} loses intended static example ${sample}`);
  }
  for (const sample of negatives) {
    if (legacyShape.test(sample) || prospectiveShape.test(sample)) fail(`${relative} includes unrelated static example ${sample}`);
  }
  if (!invariant(section(relative, 'Applies to'), [/numbered local Research briefs/i, /unrelated `copilot\/` tree/i]) ||
      !invariant(section(relative, 'Validation boundaries'), [/Static examples do not prove glob attachment/i, /physical lifecycle identity, actual containment and direct lineage/i])) {
    fail(`${relative} loses physical-identity or static-attachment safeguards`);
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

function section(relative, heading) {
  const text = readText(relative);
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^#{1,2} ${escaped}\\s*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'));
  if (!match) fail(`${relative} is missing owning section: ${heading}`);
  return match[1];
}

function paragraph(relative, heading, start) {
  const matches = section(relative, heading).split('\n').filter((line) => line.startsWith(start));
  if (matches.length !== 1) fail(`${relative} must have one owning paragraph: ${start}`);
  return matches[0];
}

// Test affirmative clauses in their owner, not a keyword anywhere in the file. A
// contradictory clause in that same owner cannot be rescued by a later quotation.
function invariant(text, required, forbidden = []) {
  return required.every((pattern) => pattern.test(text)) && !forbidden.some((pattern) => pattern.test(text));
}

function authoredChecks(manifestUnavailable) {
  const core = '.github/skills/rpir-lifecycle-core/SKILL.md';
  const policy = '.github/copilot-instructions.md';
  const review = '.github/agents/review.agent.md';
  const runner = '.github/agents/script-runner.agent.md';
  const questions = '.github/skills/agent-question-resolution/SKILL.md';
  const workflow = '.github/workflows/package.yml';
  const checks = [
    ['RECOVERY-001', policy, () => {
      const scope = section(policy, 'Lifecycle authority and transitions');
      const recovery = paragraph(policy, 'Lifecycle authority and transitions', '- An approved Plan defines the outcome');
      const denial = paragraph(policy, 'Lifecycle authority and transitions', '- Ask the engineer promptly');
      return invariant(recovery, [/Implement may investigate ordinary failures/, /correct attributable mistakes/, /rerun relevant checks/, /failed check keeps dependent acceptance unmet/], [/never (?:replay|retry) a failed consequential (?:build|write|package)/i]) &&
        invariant(denial, [/A real platform denial cannot be evaded by another route/, /Reconcile uncertain destructive or external completion before repetition/, /ordinary local test failures can be diagnosed and rechecked/], [/denial can be evaded/i]) &&
        !/blanket no-retry|never replay a failed consequential build/i.test(scope);
    }],
    ['RECOVERY-002', policy, () => invariant(section(policy, 'Lifecycle authority and transitions'),
      [/preserving user work/, /Report partial delivery as a checkpoint, not success/, /A failed check keeps dependent acceptance unmet/],
      [/\b(?:may|can|must) (?:reset|overwrite|discard) (?:unrelated )?user (?:work|edits)/i,
        /\b(?:may|can|must) (?:claim|report) (?:unperformed|failed) (?:execution|checks?|saves?) (?:as )?(?:passed|successful)/i,
        /\b(?:may|can|must) (?:weaken|drop|ignore) (?:original )?acceptance criteria/i])],
    ['PERMISSION-001', runner, () => invariant(section(runner, 'Script Runner'),
      [/establish effective platform permission/, /Absence of separate Workspace Trust telemetry alone proves neither permission nor denial/],
      [/\b(?:may|can|must) (?:assume|guess|infer) permission (?:without|from) (?:evidence|telemetry)/i])],
    ['IDENTITY-001', core, () => invariant(section(core, 'Inspect and bind one actual document'),
      [/canonical phase predecessors must be independently verified, contained, numbered physical Markdown records/i, /Verify kind, subject, version, direct ancestry, freshness/, /direct source lineage/],
      [/\b(?:need not|not required to|may skip) (?:be )?independently verified/i]) &&
      invariant(section(core, 'Preserve physical lineage and historical evidence'), [/direct same-folder links/, /real, contained, numbered physical Markdown record/])],
    ['IDENTITY-002', core, () => invariant(section(core, 'Contain allocation and effects'),
      [/save only an absent exact candidate/, /[Oo]n a collision, re-read the inventory and (?:select|choose) an absent next number/, /never overwrite/],
      [/save to an existing candidate/i, /overwrite (?:the|an) existing (?:record|candidate)/i])],
    ['REVIEW-001', review, () => invariant(section(review, 'Review coordinator'),
      [/For an in-boundary correction, offer the manual Implement route with the original approved Plan/, /fresh independent Review/, /Material new requirements, public behavior, dependencies, security\/compatibility commitments or external effects require an engineer choice and a Plan-owned amendment\/new Plan/, /Unresolved findings prohibit acceptance/, /Review and its Correctness, Security and Maintainability reviewers remain source-read-only/],
      [/material new requirements may be implemented without a decision/i, /unresolved findings permit acceptance/i, /Review (?:may|can|must) edit (?:source|implementation)/i,
        /Review (?:may|can|must) (?:self-accept|accept its own implementation)/i])],
    ['RECORD-002', '.github/skills/safe-implementation/SKILL.md', () => invariant(section('.github/skills/safe-implementation/SKILL.md', 'Execution, validation and record evidence'),
      [/A failed save is not persisted evidence/, /fresh numbered report/],
      [/\b(?:may|can|must) (?:claim|report) (?:an? )?(?:failed|unperformed) save (?:as )?persisted/i])],
    ['PLAN-HIERARCHY-001', '.github/skills/architecture-planning/implementation-plan-template.md', () => {
      const template = '.github/skills/architecture-planning/implementation-plan-template.md';
      const work = section(template, 'Planned work');
      const details = section(template, 'Detailed work items');
      const tables = [...work.matchAll(/(?:^\|.*\|\n?)+/gm)];
      return tables.length === 1 &&
        invariant(work, [/one authoritative Work Item register/i, /\| Completion and ID \|/i, /\[ \] Work Item 1/, /Research\/requirements evidence/i, /observable acceptance/i,
          /track execution progress only/i, /never validation pass, approval, or Review acceptance/i],
          [/Tasks? or Steps? only when useful/i, /checkboxes? (?:are|is) approval/i, /approval gate/i]) &&
        invariant(details, [/### Work Item 1\b/, /\[ \] \*\*Task 1\.1:/, /\[ \] \*\*Step 1\.1\.1:/,
          /(?:IDs and detail sections must match the register|item identifiers and their detail sections correspond to the register)/i,
          /meaningful/i, /minimum count beyond meaningful traceability/i, /dependencies where applicable/i,
          /item-level acceptance/i, /validation/i, /not a prediction of every debugging command/i],
          [/mandatory minimum count/i]);
    }],
    ['PLANNING-001', '.github/skills/architecture-planning/SKILL.md', () => {
      const owner = '.github/skills/architecture-planning/SKILL.md';
      return invariant(section(owner, 'Procedure'), [/persist and read back a contained, numbered physical working Plan/, /A non-local draft or locator is not a substitute/]) &&
        invariant(section(owner, 'Procedure'), [/otherwise record the remaining question/, /Do not invent a target/],
          [/\b(?:may|can|must) invent (?:an? )?(?:answer|resolution) (?:for|to) (?:an? )?unresolved/i]);
    }],
    ['WORKER-001', '.github/agents/implementation-worker.agent.md', () => invariant(section('.github/agents/implementation-worker.agent.md', 'Safety and exclusions'),
      [/Projected files guide related-file\/test selection/, /Honor any explicit delegation restriction/],
      [/\b(?:may|can|must) (?:ignore|bypass) (?:an? )?explicit (?:delegation )?restriction/i])],
    ['STATUS-001', '.github/prompts/plan.prompt.md', () => invariant(section('.github/prompts/plan.prompt.md', 'Constraints'),
      [/Status is optional bookkeeping, not a transition gate/], [/status (?:write|update) is (?:required|mandatory)/i]) &&
      invariant(section('.github/agents/research.agent.md', 'Research coordinator'), [/A failed save is not persisted evidence/]) &&
      invariant(readText('.github/agents/research.agent.md').split('---')[1] || '', [/the update is optional bookkeeping/]) &&
      invariant(section('.github/skills/create-copilot-prompt/SKILL.md', 'Workflow'), [/Permit diagnosis, attributable in-boundary correction and relevant rechecks/])],
    ['FRAGMENT-001', '.github/agents/validation-worker.agent.md', () => {
      const agent = readText('.github/agents/validation-worker.agent.md');
      const checklist = readText('.github/skills/safe-implementation/validation-checklist.md');
      const fragment = agent.match(/validation-checklist\.md#([^)]*)\)/)?.[1];
      return fragment === 'read-only-validation-worker' && /^## Read-only Validation Worker\s*$/m.test(checklist);
    }],
    ['PILOT-SAFETY-001', '.github/skills/create-copilot-skill/SKILL.md', () => {
      const owner = '.github/skills/create-copilot-skill/SKILL.md';
      const safety = `${section(owner, 'Limits and safety')}\n${section(owner, 'Safety boundaries')}\n${section(owner, 'Resource layout')}`;
      return invariant(safety, [
        /read-only discovery and (?:validation|checks)/i,
        /(?:add or recommend|recommend or add).{0,100}edit, terminal, web, MCP, hook, or agent-delegation capability/i,
        /(?:genuinely requires it and the user has approved that scope|genuine workflow need and (?:the )?user (?:explicitly )?approved that scope|genuine workflow need and (?:with )?(?:the )?user's explicit approval of that scope)/i,
        /(?:do not infer approval from the Skill request itself|the Skill request itself is not approval|requesting this Skill does not grant approval|a request for this Skill alone is not approval)/i,
        /agent-delegation capability speculatively/i,
        /Include no resource merely speculatively/i,
        /relative links/i,
        /embed secrets/i,
        /experimental forked context/i,
        /treat a Skill's instructions as granting platform tools or permissions/i
      ], [
        /genuine workflow need\s+or\s+(?:the )?user (?:explicitly )?approved/i,
        /the Skill request itself (?:is|counts as) approval/i,
        /Skill(?:'s)? instructions grant (?:platform )?tools(?: or permissions)?/i,
        /(?:may|can|must) recommend (?:any )?(?:capability|tool) without (?:approval|a genuine need)/i
      ]);
    }],
    ['MAINTAIN-AUTHORITY-001', '.github/skills/maintain-copilot-artifacts/SKILL.md', () => {
      const owner = '.github/skills/maintain-copilot-artifacts/SKILL.md';
      return invariant(section(owner, 'Limits and authority'), [
        /supplies a method only/i,
        /grants no edit, execution, delegation, lifecycle-transition, approval or acceptance authority/i,
        /active phase's approved scope and actual permission/i
      ], [/(?:this Skill|Skill invocation) (?:approves|grants) (?:edits?|execution|delegation|lifecycle transitions?|acceptance)/i]);
    }],
    ['MAINTAIN-PRESERVATION-001', '.github/skills/maintain-copilot-artifacts/SKILL.md', () => {
      const owner = '.github/skills/maintain-copilot-artifacts/SKILL.md';
      return invariant(section(owner, 'Procedure'), [
        /Map baseline rules to candidate wording and candidate normative clauses back to baseline rules/i,
        /Every removed sentence needs complete retained equivalents/i
      ], [/(?:silently|without (?:an )?approved decision) (?:delete|remove|reinterpret|choose) (?:a rule|new behavior)/i,
        /(?:rules?|sentences?) may be (?:silently )?(?:deleted|removed) as obsolete/i]) &&
        invariant(section(owner, 'Limits and authority'), [
          /Do not silently delete, add, relocate, deprecate or reinterpret a normative rule/i,
          /If preservation is uncertain or a contradiction requires a behavior choice, retain the source wording and ask for an engineer decision/i
        ]);
    }],
    ['MAINTAIN-STATIC-001', '.github/skills/maintain-copilot-artifacts/SKILL.md', () => {
      const owner = '.github/skills/maintain-copilot-artifacts/SKILL.md';
      return invariant(section(owner, 'Procedure'), [
        /Static checks and review do not establish runtime equivalence/i,
        /Do not claim semantic proof or runtime equivalence from finite checks/i
      ], [/static checks (?:prove|establish) runtime equivalence/i, /finite checks prove semantic equivalence/i]);
    }],
    ['RESEARCH-INTENT-001', '.github/agents/research.agent.md', () => {
      const owner = '.github/agents/research.agent.md';
      const text = section(owner, 'Research coordinator');
      return invariant(text, [
        /\*\*every\*\* engineer-facing question|every engineer-facing question/i,
        /load and apply .*agent-question-resolution/i,
        /clarification message template/i,
        /linked .*Research intent-discovery method/i,
        /explicit confirm\/correct acknowledgment/i,
        /(?:A detailed prompt is not a bypass|Even a comprehensive request still receives a confirm\/correct readback)/i,
        /explicitly directs Research to defer acknowledgment/i,
        /provisional objective and consequential assumptions/i,
        /do not resist, demand duplicate confirmation/i,
        /necessary context reads and independent factual checks/i,
        /Plan-owned formal outcome, scope, acceptance and hierarchy/i,
        /actual deferral direction\/scope and dependent limits/i
      ], [
        /A clear (?:request|prompt) proceeds without (?:a )?(?:compulsory )?confirmation/i,
        /detailed (?:request|prompt).{0,80}(?:bypass|exempt|skip) (?:the )?(?:readback|acknowledgment)/i,
        /deferral (?:is|counts as) confirmation/i,
        /acknowledgment (?:is )?(?:required|a prerequisite) (?:for )?`?\/plan`?/i
      ]);
    }],
    ['QUESTIONS-METHOD-001', questions, () => {
      const template = '.github/skills/agent-question-resolution/templates/clarification-message.md';
      const skill = section(questions, 'Procedure');
      const skillText = readText(questions);
      const message = readText(template);
      return invariant(skillText, [
        /every engineer-facing question/i,
        /In Research, every new objective normally receives an explicit confirm\/correct readback/i,
        /explicitly direct Research to defer/i,
        /honor that direction without duplicate confirmation/i,
        /Known → Uncertain → Recommendation \(if supported\) → Question/s,
        /recommendation only when supported/i,
        /without inventing options or requiring letters/i,
        /Clarification or acknowledgment alone does not invoke or approve a phase transition/i
      ], [
        /A clear Research request proceeds without/i,
        /Never require a confirmation .* clear Research request/i
      ]) && invariant(skill, [
        /every new objective normally receives an explicit confirm\/correct readback/i,
        /explicitly direct Research to defer/i,
        /honor that direction without duplicate confirmation/i,
        /Clarification or acknowledgment alone does not invoke or approve a phase transition/i
      ]) && invariant(message, [
        /every discovery question and later clarification/i,
        /normally ends with a substantive confirm\/correct readback/i,
        /explicitly directs Research to proceed without that checkpoint/i,
        /provisional/i,
        /Silence, uncertainty, or a clear prompt is not deferral/i,
        /letters are optional/i,
        /not phase-transition approval/i
      ], [/A clear Research request needs no confirmation/i, /Do not invent alternatives or require a confirmation checkpoint/i]);
    }],
    ['RESEARCH-DISCOVERY-001', '.github/skills/agent-question-resolution/references/research-intent-discovery.md', () => {
      const resource = '.github/skills/agent-question-resolution/references/research-intent-discovery.md';
      const text = readText(resource);
      checkLocalLinks(resource, text);
      return invariant(text, [
        /## Discover the objective adaptively/i,
        /problem before a named solution/i,
        /highest-value unresolved follow-up/i,
        /one primary open question per turn/i,
        /## Read back, correct and stop/i,
        /confirm\/correct readback/i,
        /## Honor explicit engineer-directed deferral/i,
        /provisional objective and consequential assumptions/i,
        /Do not resist, demand a second confirmation/i,
        /silence, uncertainty/i,
        /requested timing/i,
        /actual safety or permission limits/i,
        /## Continue or change objective/i,
        /reuse the existing intent trace/i,
        /I don't know/i,
        /or invoke another phase/i
      ], [/deferral is confirmation/i, /silence is deferral/i]);
    }],
    ['RESEARCH-POLICY-001', policy, () => invariant(section(policy, 'Lifecycle authority and transitions'), [
      /Research-specific intake normally uses an explicit confirm\/correct readback for every new objective/i,
      /even a detailed request/i,
      /explicit engineer direction may defer that checkpoint/i,
      /truthful provisional understanding/i,
      /This is not a gate on `\/plan`/i,
      /This is not a gate on `\/plan`, and does not alter other phases' contextual material clarification/i
    ], [/clear Research requests proceed without (?:a )?compulsory confirmation/i, /deferred acknowledgment (?:blocks|gates) `?\/plan`?/i])],
    ['RESEARCH-CORE-001', core, () => invariant(section(core, 'Status, questions and validation'), [
      /For every new Research objective/i,
      /explicit confirm\/correct acknowledgment before broad intent-dependent investigation/i,
      /including for detailed prompts/i,
      /explicit engineer direction may defer acknowledgment/i,
      /disclosed provisional understanding/i,
      /This intake rule neither applies an initial interview to other phases nor creates a `\/plan` gate/i,
      /Established lifecycle folders still need no routine confirmation/i
    ], [/clear Research requests proceed without (?:a )?confirmation/i, /acknowledgment is (?:a )?prerequisite for `?\/plan`?/i])],
    ['RESEARCH-RECORDS-001', '.github/instructions/lifecycle-records.instructions.md', () => invariant(readText('.github/instructions/lifecycle-records.instructions.md'), [
      /Research normally obtains explicit confirm\/correct acknowledgment for every new objective/i,
      /even when the prompt is detailed/i,
      /explicit engineer direction to defer that checkpoint/i,
      /disclosed provisional understanding/i,
      /does not create a `\/plan` gate/i,
      /does not create a `\/plan` gate, alter other phases' contextual material clarification/i
    ], [/clear Research request proceeds without a compulsory confirmation/i]) &&
      invariant(readText('.github/instructions/lifecycle-records.instructions.md'), [/Intent and discovery/i, /honored deferral is not itself a defect/i])],
    ['RESEARCH-BRIEF-001', '.github/skills/codebase-research/research-brief-template.md', () => {
      const text = readText('.github/skills/codebase-research/research-brief-template.md');
      return invariant(text, [
        /## Intent and discovery/i,
        /Original request/i,
        /Shared understanding/i,
        /Examples and boundaries/i,
        /Understanding changes/i,
        /Acknowledgment or deferral/i,
        /Unknowns and dependent limits/i,
        /never label provisional understanding confirmed/i,
        /A truthfully provisional brief is valid evidence, not a transition approval/i,
        /agent-question-resolution and its template for every engineer-facing question/i
      ], [/clear requests proceed without compulsory confirmation/i]);
    }],
    ['RESEARCH-ASSURANCE-001', '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md', () => invariant(section('.github/skills/rpir-stage-assurance/stage-assurance-checklist.md', 'Stage-specific outcome'), [
      /substantive acknowledged\/corrected readback/i,
      /actual engineer-directed deferral with provisional understanding/i,
      /detailed prompts do not silently bypass the default/i,
      /Do not treat acknowledgment or assurance as phase-transition approval/i,
      /truthfully provisional brief is not rejected solely for deferral/i
    ], [/Research .* clear request proceeds without/i])],
    ['RESEARCH-GUIDE-001', 'README.md', () => invariant(section('README.md', 'Follow the RPIR workflow'), [
      /adaptive questions/i,
      /explicit confirmation or correction/i,
      /even when your initial request is detailed/i,
      /explicitly direct Research to defer acknowledgment/i,
      /provisional understanding/i,
      /neither confirmation nor deferral invokes Plan/i
    ]) && invariant(section('docs/Wiki/rpir.md', 'Prerequisites'), [
      /adaptive initial Q&A/i,
      /confirm\/correct readback for every new objective/i,
      /explicitly direct Research to defer acknowledgment/i,
      /does not invoke `\/plan`; invoke it manually/i
    ]) && invariant(section('docs/Wiki/rpir.md', 'Content'), [
      /Normally acknowledge a substantive confirm\/correct intent readback/i,
      /explicit engineer direction may defer it/i,
      /Neither acknowledgment nor deferral is Plan approval/i
    ]) && invariant(readText('docs/Wiki/artifact-catalogue.md'), [
      /leads adaptive intent discovery/i,
      /applies the shared question method to every engineer-facing question/i,
      /Research also uses it for adaptive discovery/i
    ])]
  ];
  const violations = [];
  const unavailable = [];
  for (const [id, owner, check] of checks) {
    try {
      const result = check();
      if (result === null) unavailable.push(`DIAGNOSTIC NOT RUN ${id} ${owner}: malformed manifest`);
      else if (!result) violations.push(`DIAGNOSTIC FAIL ${id} ${owner}: owning contract is missing or contradicted`);
    }
    catch (error) { violations.push(`DIAGNOSTIC FAIL ${id} ${owner}: ${error.message}`); }
  }
  return { violations, unavailable };
}

function main() {
  let inventory, manifest;
  let discoveryError, manifestError;
  try { inventory = discover(); } catch (error) { discoveryError = error.message; }
  try { manifest = readManifest(); } catch (error) { manifestError = error.message; }
  let failed = false;
  function group(label, diagnostics, unavailable = []) {
    for (const line of [...diagnostics, ...unavailable]) console.error(line);
    const state = diagnostics.length ? 'FAIL' : unavailable.length ? 'NOT RUN' : 'PASS';
    console.error(`${label}: ${state}`);
    if (state !== 'PASS') failed = true;
  }
  const parity = [];
  const parityUnavailable = [];
  if (manifestError) parityUnavailable.push(`DIAGNOSTIC NOT RUN PARITY-INPUT-MANIFEST package.json: ${manifestError}`);
  if (discoveryError) parityUnavailable.push(`DIAGNOSTIC NOT RUN PARITY-INPUT-DISCOVERY scripts/discover-copilot-artifacts.cjs: ${discoveryError}`);
  if (!parityUnavailable.length) {
    try { checkManifestParity(manifest, inventory); }
    catch (error) { parity.push(`DIAGNOSTIC FAIL PARITY-001 package.json: ${error.message}`); }
  }
  group('Manifest parity', parity, parityUnavailable);
  // A malformed manifest makes only manifest-dependent assertions unavailable.
  const authored = authoredChecks(Boolean(manifestError));
  group('Authored contracts', authored.violations, authored.unavailable);
  const structural = [];
  const structuralUnavailable = [];
  if (discoveryError) structuralUnavailable.push(`DIAGNOSTIC NOT RUN STRUCT-INPUT-DISCOVERY scripts/discover-copilot-artifacts.cjs: ${discoveryError}`);
  else {
    try { checkCustomizationContracts(inventory); }
    catch (error) { structural.push(`DIAGNOSTIC FAIL ${error.contractId || 'STRUCT-AGENT'} ${error.message}`); }
  }
  group('Frontmatter, links, routes, handoffs and tools', structural, structuralUnavailable);
  if (failed) process.exitCode = 1;
  console.log(staticContractLimitation);
}

function checkCustomizationContracts(inventory) {
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
    if (!agentNames.has(values.agent) || values.agent !== promptRoutes[name] || values.name !== name) {
      const error = new Error(`${relative} must use its declared RPIR stage route`);
      error.contractId = 'STRUCT-PROMPT';
      throw error;
    }
    if (Object.hasOwn(values, 'tools')) {
      const allowed = coordinatorTools[values.agent];
      if (!parseStringList(values.tools, relative).every((tool) => allowed.includes(tool))) fail(`${relative} tools must not expand ${values.agent} capabilities`);
    }
  }
  for (const relative of inventory.chatAgents) {
    const { values } = frontmatter.get(relative);
    if (!manualHandoffCoordinators.has(values.name) && (Object.hasOwn(values, 'agents') || Object.hasOwn(values, 'handoffs')))
      fail(`${relative} non-coordinator must not declare delegation or handoffs`);
    checkHandoffs(relative, values, agentNames);
    if (Object.hasOwn(coordinatorTools, values.name) && !equal(parseStringList(values.tools, relative), coordinatorTools[values.name])) fail(`${relative} coordinator tools exceed its stage contract`);
    if (coordinators.includes(values.name.toLowerCase())) {
      const delegates = parseStringList(values.agents, relative);
      if (!equal(delegates, delegateRoutes[values.name]) || delegates.some((delegate) => !agentNames.has(delegate)))
        fail(`${relative} must declare only its contributed least-privilege delegates`);
    }
    if (values.name === 'Script Runner') {
      if (values['user-invocable'] !== 'false' || Object.hasOwn(values, 'agents') ||
          !equal(parseStringList(values.tools, relative), ['read', 'search', 'runInTerminal'])) {
        fail(`${relative} must remain non-invocable, non-delegating and non-editing`);
      }
    }
    if (Object.hasOwn(workerTools, values.name)) {
      if (values['user-invocable'] !== 'false') fail(`${relative} worker must declare user-invocable: false`);
      if (!equal(parseStringList(values.tools, relative), workerTools[values.name])) fail(`${relative} worker tools do not match its least-privilege contract`);
    }
  }
}

try { main(); } catch (error) { console.error(`Copilot contract verification failed: ${error.message}`); process.exitCode = 1; }