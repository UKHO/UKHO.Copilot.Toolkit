'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const contracts = require('../scripts/verify-copilot-contracts.cjs');
const { discover, root } = require('../scripts/discover-copilot-artifacts.cjs');
const { desiredManifest, differences } = require('../scripts/sync-copilot-manifest.cjs');

const inventory = discover();
const sourceManifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifest = desiredManifest(sourceManifest, inventory);
const expectedSkillContributions = [
  '.github/skills/agent-question-resolution/SKILL.md',
  '.github/skills/architecture-decision-records/SKILL.md',
  '.github/skills/architecture-planning/SKILL.md',
  '.github/skills/code-review/SKILL.md',
  '.github/skills/codebase-research/SKILL.md',
  '.github/skills/create-copilot-agent/SKILL.md',
  '.github/skills/create-copilot-instruction/SKILL.md',
  '.github/skills/create-copilot-prompt/SKILL.md',
  '.github/skills/create-copilot-skill/SKILL.md',
  '.github/skills/create-runbook/SKILL.md',
  '.github/skills/local-git-checkpoints/SKILL.md',
  '.github/skills/maintain-copilot-artifacts/SKILL.md',
  '.github/skills/rpir-lifecycle-core/SKILL.md',
  '.github/skills/rpir-stage-assurance/SKILL.md',
  '.github/skills/safe-implementation/SKILL.md',
  '.github/skills/test-design/SKILL.md',
  '.github/skills/wiki-maintenance/SKILL.md'
];
const agentPaths = inventory.chatAgents;
function readArtifact(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r\n/g, '\n');
}

const agents = new Map(agentPaths.map((relative) => [
  relative,
  contracts.parseFrontmatterText(readArtifact(relative), relative)
]));
const agentNames = new Set([...agents.values()].map(({ values }) => values.name));
let cases = 0;

function assertRejected(label, operation, expected) {
  assert.throws(operation, expected, `${label} must be rejected`);
  cases += 1;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function replaceOnce(text, target, replacement) {
  const matches = typeof target === 'string'
    ? text.split(target).length - 1
    : [...text.matchAll(new RegExp(target.source, `${target.flags.replace(/g/g, '')}g`))].length;
  assert.equal(matches, 1, `Fixture target must be unique: ${target}`);
  const changed = text.replace(target, replacement);
  assert.notEqual(changed, text, 'Fixture must change its intended target');
  return changed;
}

function agentPath(name) {
  return [...agents].find(([, parsed]) => parsed.values.name === name)[0];
}

// Positive controls: current discovered artifacts, tool boundaries, routes,
// manifest parity, and all supported local links are structurally valid.
assert.doesNotThrow(() => contracts.checkCustomizationContracts(inventory));
assert.deepEqual(inventory.chatSkills, expectedSkillContributions,
  'every contributed Skill must be its literal SKILL.md file path');
assert.ok(inventory.chatSkills.every((entry) => fs.statSync(path.join(root, entry)).isFile()),
  'every Skill contribution must resolve to a regular file');
assert.deepEqual(manifest.contributes.chatSkills.map((entry) => entry.path), expectedSkillContributions);
assert.deepEqual(manifest.files.filter((entry) => entry.startsWith('.github/skills/')),
  expectedSkillContributions.map((entry) => path.posix.dirname(entry)),
  'package inclusion must retain complete Skill payload roots');
assert.deepEqual(differences(manifest, inventory), [], 'the generated manifest projection must be idempotent');
const unrelatedFieldFixture = desiredManifest({
  ...clone(sourceManifest),
  customMetadata: { retained: true },
  files: [...sourceManifest.files, 'vendor/custom-payload']
}, inventory);
assert.deepEqual(unrelatedFieldFixture.customMetadata, { retained: true });
assert.ok(unrelatedFieldFixture.files.includes('vendor/custom-payload'));
assert.doesNotThrow(() => contracts.checkManifestParity(manifest, inventory));
for (const [relative, parsed] of agents) {
  assert.doesNotThrow(() => contracts.checkAgentMetadata(relative, parsed.values, parsed.blocks, agentNames));
}
for (const relative of inventory.chatPromptFiles) {
  const parsed = contracts.parseFrontmatterText(readArtifact(relative), relative);
  assert.doesNotThrow(() => contracts.checkPromptMetadata(relative, parsed.values, agentNames));
}
assert.equal(inventory.chatSkills.filter((entry) => entry === '.github/skills/local-git-checkpoints/SKILL.md').length, 1);
assert.doesNotThrow(() => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[checklist](references/checkpoint-checklist.md)'
));
const adrPaths = {
  skill: '.github/skills/architecture-decision-records/SKILL.md',
  coverage: '.github/skills/architecture-decision-records/references/research-input-coverage.md',
  template: '.github/skills/architecture-decision-records/templates/adr.md',
  core: '.github/skills/rpir-lifecycle-core/SKILL.md',
  repository: '.github/copilot-instructions.md',
  plan: '.github/agents/plan.agent.md',
  research: '.github/agents/research.agent.md',
  implement: '.github/agents/implement.agent.md',
  review: '.github/agents/review.agent.md',
  runner: '.github/agents/script-runner.agent.md',
  lifecycleInstruction: '.github/instructions/lifecycle-records.instructions.md',
  researchSkill: '.github/skills/codebase-research/SKILL.md',
  researchTemplate: '.github/skills/codebase-research/research-brief-template.md',
  planning: '.github/skills/architecture-planning/SKILL.md',
  planTemplate: '.github/skills/architecture-planning/implementation-plan-template.md',
  safe: '.github/skills/safe-implementation/SKILL.md',
  validation: '.github/skills/safe-implementation/validation-checklist.md',
  implementationReport: '.github/skills/safe-implementation/implementation-report-template.md',
  codeReview: '.github/skills/code-review/SKILL.md',
  reviewReport: '.github/skills/code-review/review-report-template.md',
  assuranceSkill: '.github/skills/rpir-stage-assurance/SKILL.md',
  assurance: '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md',
  readme: 'README.md', wikiRpir: 'docs/Wiki/rpir.md',
  wikiEvidence: 'docs/Wiki/lifecycle-evidence-and-authority.md',
  wikiCatalogue: 'docs/Wiki/artifact-catalogue.md', planPrompt: '.github/prompts/plan.prompt.md',
  implementPrompt: '.github/prompts/implement.prompt.md'
};
const adrSources = Object.fromEntries(Object.entries(adrPaths).map(([key, relative]) => [key, readArtifact(relative)]));
assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract(adrSources));
assert.doesNotThrow(() => contracts.checkLocalLinks(adrPaths.skill, adrSources.skill));
cases += 5;
cases += 2;

// Decision readiness and residual factual unknowns are owned by normative
// Research/Plan sections and the existing Work Item detail, not metadata,
// history, or a second register. These fixtures test authored contracts, not
// arbitrary Plan meaning or runtime behavior.
for (const [label, key, target, replacement, diagnostic] of [
  ['Research skips foreseeable decisions', 'research', 'Resolve foreseeable engineer-owned choices where practicable', 'list choices when convenient', /Research must resolve foreseeable choices/],
  ['Research fails to separate facts from decisions', 'research', 'distinguish decisions from factual evidence gaps', 'record unresolved items', /Research must resolve foreseeable choices/],
  ['Research relabels a material choice as fact', 'research', 'do not present an unresolved architectural choice as a factual unknown', 'present an unresolved architectural choice as a factual unknown', /Research must resolve foreseeable choices/],
  ['Research treats Proposed as incomplete', 'research', 'Do not treat a complete Proposed ADR as missing decision content merely because sign-off is pending', 'Treat a complete Proposed ADR as missing decision content merely because sign-off is pending', /Research must resolve foreseeable choices/],
  ['Plan permits unresolved architecture', 'plan', 'A completed Plan has no unresolved architectural choice', 'A Plan may retain unresolved architectural choices', /Plan must resolve architecture/],
  ['Plan confuses Proposed state with decision content', 'plan', 'Do not treat a complete Proposed ADR as missing decision content merely because sign-off is pending', 'Treat a complete Proposed ADR as missing decision content merely because sign-off is pending', /Plan must resolve architecture/],
  ['Plan permits unbounded TBD', 'plan', 'A bare `TBD` or “investigate later” is not actionable', 'A bare `TBD` or “investigate later” is an acceptable route', /residual facts need a bounded per-Work-Item route/]
]) {
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message));
}

const researchChoiceRule = 'Resolve foreseeable engineer-owned choices where practicable';
const researchWithoutChoiceRule = replaceOnce(adrSources.research, researchChoiceRule, 'list choices when convenient');
for (const [label, research, researchTemplate] of [
  ['historical decoy', `${researchWithoutChoiceRule}\n\n## Historical example, not operating policy\n\n${researchChoiceRule}\n`, adrSources.researchTemplate],
  ['metadata decoy', replaceOnce(researchWithoutChoiceRule, 'description: ', `description: ${researchChoiceRule}. `), adrSources.researchTemplate],
  ['wrong-section decoy', replaceOnce(researchWithoutChoiceRule, '\n\nOnly after actual acknowledgment', `\n\nSupplementary note: ${researchChoiceRule}.\n\nOnly after actual acknowledgment`), adrSources.researchTemplate],
  ['wrong-owner decoy', researchWithoutChoiceRule, `${adrSources.researchTemplate}\n\n${researchChoiceRule}`]
]) {
  assertRejected(`Research handover ${label} cannot replace its normative rule`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, research, researchTemplate
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && /Research must resolve foreseeable choices/.test(error.message));
}

for (const [label, key, target, replacement, diagnostic] of [
  ['Plan procedure permits unresolved architecture', 'planning', 'A completed Plan has no unresolved architectural choice: resolve foreseeable choices where practicable', 'A Plan may retain unresolved architectural choices', /Plan must resolve architecture/],
  ['Plan gap guidance permits unresolved architecture', 'planning', 'A completed Plan has no unresolved architectural choice;', 'A Plan may retain unresolved architectural choices;', /Plan must resolve architecture/],
  ['Plan prompt permits unresolved architecture', 'planPrompt', 'A completed Plan has no unresolved architectural choice', 'A Plan may retain unresolved architectural choices', /Plan must resolve architecture/],
  ['Plan procedure permits bare TBD', 'planning', 'A bare `TBD` or “investigate later” is not actionable. If a fact changes or invalidates an architectural choice', 'A bare `TBD` or “investigate later” is an acceptable route. If a fact changes or invalidates an architectural choice', /residual facts need a bounded per-Work-Item route/],
  ['Plan prompt permits bare TBD', 'planPrompt', 'A bare `TBD` or “investigate later” is insufficient', 'A bare `TBD` or “investigate later” is sufficient', /residual facts need a bounded per-Work-Item route/]
]) {
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message));
}

const residualFactTemplate = adrSources.planTemplate.match(/\*\*Residual factual unknown \(include only when a material fact remains\):\*\*[^\n]*/)?.[0];
assert.ok(residualFactTemplate, 'Plan template requires an optional residual-fact field in its existing Work Item detail');
for (const [label, target, replacement] of [
  ['current evidence', 'current evidence', 'evidence'],
  ['bounded check', 'bounded check/observation', 'check'],
  ['expected interpretation and allowed response', 'expected interpretation and allowed in-scope response', 'interpretation'],
  ['affected Work Items/effects', 'affected Work Items/effects', 'affected work'],
  ['engineer escalation', 'engineer-escalation condition', 'escalation'],
  ['independent continuation', 'independent work that can continue', 'independent work'],
  ['architectural-decision boundary', 'Do not use this route for an unresolved architectural decision', 'This route may carry unresolved architecture'],
  ['zero-unknowns safeguard', 'Do not require zero unknown facts', 'Require zero unknown facts']
]) {
  assertRejected(`Plan template residual route omits ${label}`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources,
    planTemplate: replaceOnce(adrSources.planTemplate, residualFactTemplate,
      replaceOnce(residualFactTemplate, target, replacement))
  }), (error) => error.contractId === 'ADR-CONTRACT-001' &&
    error.message === 'Plan template: existing Work Item detail must provide the complete optional factual-unknown route');
}

for (const [key, target, replacement] of [
  ['research', 'Resolve foreseeable engineer-owned choices where practicable', 'Resolve foreseeable choices when practical'],
  ['research', 'distinguish decisions from factual evidence gaps', 'separate factual evidence gaps from unresolved decisions'],
  ['plan', 'no unresolved architectural choice', 'no unsettled architectural decision'],
  ['planPrompt', 'affected Work Items/effects', 'affected items and effects'],
  ['planPrompt', 'engineer-escalation condition', 'condition for engineer direction'],
  ['planPrompt', 'do not require zero factual unknowns', 'this is not a zero-unknowns requirement']
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}

const safeFactRoute = '**Residual factual unknown (include only when a material fact remains):** `Current evidence: the container image tag is not stated in the checked configuration. Bounded check/observation: inspect the configured image tag in the deployment descriptor. Expected interpretation and allowed in-scope response: if the tag matches the approved baseline, continue the existing Work Item; otherwise hold only the affected deployment effect. Affected Work Items/effects: WI1 deployment verification. Engineer-escalation condition: if the observed value changes a security or architecture commitment, ask the engineer before that effect. Independent work that can continue: complete unrelated documentation checks. A bare TBD is not actionable. Do not use this route for an unresolved architectural decision. Do not require zero unknown facts.`';
assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources, planTemplate: replaceOnce(adrSources.planTemplate, residualFactTemplate, safeFactRoute)
}), 'a concrete bounded non-decision fact route remains valid');
cases += 1;

function rejectSignoff(label, key, target, replacement, diagnostic) {
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message));
}

const signoffCoreDiagnostic = /Lifecycle core sign-off effect:/;
for (const [label, target, replacement, rule] of [
  ['sign-off effective after invocation', 'effective before the qualifying explicit `/implement` invocation', 'effective after the qualifying explicit `/implement` invocation', /effective-before-invocation guard/],
  ['retroactive invocation accepted', 'not retroactive sign-off', 'is retroactive sign-off', /no-retroactive-sign-off guard/],
  ['non-Proposed preimage accepted', 'current `Proposed` state', 'any decision state', /Proposed preimage state/],
  ['metadata scope broadened', 'Update only `Status: Accepted`, the actual decision date, and actual agreement evidence', 'Update ADR decision content and status metadata', /metadata-only update fields/],
  ['decision rationale rewrite allowed', 'Preserve the decision text, all other metadata, and accepted/superseded history', 'Revise the decision text and metadata', /decision and history preservation/],
  ['permission guard omitted', 'identity, containment, absence of conflicting edits and effective permission', 'identity and containment', /identity, containment, conflict and permission guards/],
  ['postimage readback omitted', 'read back the complete postimage', 'assume the saved result', /non-overwrite and postimage readback/],
  ['multi-record outcomes coupled', 'Assess multiple bound ADRs independently', 'Assess all bound ADRs as one transaction', /per-record handling/],
  ['failed write described as Accepted', 'do not claim `Accepted`', 'claim `Accepted` after an attempted write', /failure is not Accepted/],
  ['partial success rollback introduced', 'A successful record is not rolled back because another record failed', 'Rollback every successful record when another record fails', /partial-success preservation/],
  ['general ADR authorship granted', 'not general ADR authorship', 'general ADR authorship', /no general ADR authorship/]
]) rejectSignoff(label, 'core', target, replacement, rule);

const exactPreimageSentence = 'The Plan handoff must visibly enumerate each exact bound ADR path/ID, identifiable decision section, substantive preimage version/snapshot, current `Proposed` state, actual agreement evidence/conditions and affected Work Items;';
const coreWithoutPreimage = replaceOnce(adrSources.core, exactPreimageSentence,
  'The Plan handoff identifies an ADR;');
for (const [label, core, template] of [
  ['historical decoy', `${coreWithoutPreimage}\n\n## Historical example, not operating policy\n\n${exactPreimageSentence}\n`, adrSources.template],
  ['wrong-owner decoy', coreWithoutPreimage, `${adrSources.template}\n\n${exactPreimageSentence}\n`]
]) assertRejected(`core exact-preimage ${label} cannot satisfy the effect`, () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources, core, template
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Lifecycle core sign-off effect: exact binding identity/.test(error.message));

for (const [label, target, replacement, rule] of [
  ['handoff omits exact substantive version', "Visibly enumerate every bound ADR's exact path/ID, section, substantive version/snapshot", "Visibly enumerate every bound ADR's exact path/ID and section", /exact ADR identity, section and version/],
  ['handoff asks duplicate approval', 'no separate routine approval is requested', 'a separate routine approval is required', /no duplicate approval/],
  ['handoff makes prefill sign-off', 'The handoff is a manual prefill, not approval or invocation.', 'The handoff is an approval and invocation.', /manual handoff is not approval or invocation/],
  ['handoff allows retroactive sign-off', 'Never treat a prior invocation as retroactive.', 'Treat a prior invocation as retroactive.', /no retroactive sign-off/]
]) rejectSignoff(label, 'plan', target, replacement, rule);

for (const [label, target, replacement, rule] of [
  ['Implement lets workers record ADR', 'Workers, Script Runner, Review and helpers receive no ADR authorship/status authority.', 'Workers, Script Runner, Review and helpers may record ADR status.', /Implement coordinator must bind exact sign-off and narrow recording guards/],
  ['Implement treats failed persistence as Accepted', 'do not claim `Accepted`', 'claim `Accepted`', /Implement coordinator must bind exact sign-off and narrow recording guards/],
  ['report conflates invocation and persistence', 'Distinguish invocation from persisted Accepted state', 'Treat invocation as persisted Accepted state', /Implementation report must distinguish sign-off invocation from per-record persistence/]
]) rejectSignoff(label, label.startsWith('report') ? 'implementationReport' : 'implement', target, replacement, rule);

for (const [key, target, replacement] of [
  ['core', 'Do not request a duplicate routine approval.', 'Do not request another confirmation.'],
  ['plan', 'no separate routine approval is requested', 'no additional routine approval is requested'],
  ['core', 'A successful record is not rolled back because another record failed',
    'Keep a successfully recorded ADR if another independent record fails']
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}

const reviewInvocationCaveat = 'A prior `/implement` invocation is not retroactive if the exact-snapshot rule was not effective before it.';
const reviewWithoutInvocationCaveat = replaceOnce(adrSources.review, reviewInvocationCaveat, 'A qualifying invocation follows the effective policy.');
assertRejected('Review historical decoy cannot replace its exact-invocation rule', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  review: `${reviewWithoutInvocationCaveat}\n\n## Historical note\n\n${reviewInvocationCaveat}\n`
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Review guidance: no retroactive sign-off/.test(error.message));

const reviewCleanIsNotSignoff = 'a clean `/review` is not ADR sign-off and does not establish enterprise or architectural approval.';
rejectSignoff('Review claims a clean delivery Review signs off ADR', 'review', reviewCleanIsNotSignoff,
  'A clean `/review` is ADR sign-off and establishes architectural approval.', /Review guidance: Review is not architectural sign-off/);
rejectSignoff('Review permits ADR status writes', 'review', 'Review remains source-read-only and does not author or revise ADRs.',
  'Review may update ADR status when evidence is clear.', /Review guidance: source-read-only boundary/);

const reviewSkillNoInference = 'do not infer `Accepted` from invocation alone or assume an unverified save succeeded.';
const reviewSkillWithoutInference = replaceOnce(adrSources.codeReview, reviewSkillNoInference, 'compare available report evidence.');
assertRejected('Review Skill wrong-owner decoy cannot replace no-inference rule', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  codeReview: `${reviewSkillWithoutInference}\n\n## Unrelated note\n\n${reviewSkillNoInference}\n`
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Code Review Skill: no Accepted inference/.test(error.message));

const reportNoInference = 'do not infer `Accepted` from invocation, or retroactive sign-off from a prior invocation when the policy was not effective before it.';
rejectSignoff('Review report infers Accepted from invocation', 'reviewReport', reportNoInference,
  'Report that every invocation is Accepted.', /Review report schema: no Accepted inference/);
rejectSignoff('Review report makes Review ADR sign-off', 'reviewReport', 'A clean delivery Review is not ADR sign-off or architectural approval',
  'A clean delivery Review is ADR sign-off and architectural approval', /Review report schema: Review is not ADR sign-off/);

const assuranceNoInference = 'Do not infer `Accepted` from invocation alone or retroactive sign-off from an invocation predating effective policy.';
const assuranceWithoutInference = replaceOnce(adrSources.assuranceSkill, assuranceNoInference, 'Compare the evidence available.');
assertRejected('Assurance historical decoy cannot replace its sign-off assessment', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  assuranceSkill: `${assuranceWithoutInference}\n\n## Historical note\n\n${assuranceNoInference}\n`
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Stage Assurance Skill: no Accepted inference/.test(error.message));

rejectSignoff('Assurance checklist grants status authority', 'assurance', 'Assurance is advisory and grants no ADR status-write authority.',
  'Assurance may write ADR status.', /Stage Assurance checklist must compare sign-off evidence/);

for (const [key, prefix, target, replacement, diagnostic] of [
  ['readme', 'Under the prospective exact-snapshot rule', 'explicit `/implement` invocation signs off only the exact Proposed ADR preimage',
    'any invocation accepts the ADR', /README summary must present/],
  ['wikiRpir', 'When the prospective exact-snapshot rule', 'A prior invocation is not retroactive',
    'A prior invocation is retroactive', /RPIR Wiki summary must distinguish/],
  ['wikiEvidence', 'The prospective ADR sign-off rule', 'no prior invocation is retroactive',
    'prior invocations apply retroactively', /Lifecycle evidence Wiki summary must state/]
]) {
  const summaryWithoutRule = replaceOnce(adrSources[key], target, replacement);
  assertRejected(`${key} historical decoy cannot replace its summary rule`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources,
    [key]: `${summaryWithoutRule}\n\n## Historical note\n\n${target}\n`
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message));
}

rejectSignoff('catalogue summary overstates sign-off authority', 'wikiCatalogue',
  'only an explicit `/implement` invocation with the inspected Plan signs off the exact visible Proposed preimage',
  'any implementation invocation accepts all ADRs', /Artifact catalogue must summarize/);

for (const [key, target, replacement] of [
  ['review', 'plus the implementation report\'s actual invocation and per-record persistence evidence',
    'plus actual invocation and per-record persistence evidence from the implementation report'],
  ['reviewReport', 'Compare actual invocation and per-record persistence evidence with the exact ADR preimage/postimage and conditions',
    'Compare the actual invocation and per-record persistence evidence against the bound ADR preimage, postimage, and conditions'],
  ['assuranceSkill', 'report\'s actual invocation and per-record persistence claims', 'report\'s actual invocation plus per-record persistence claims']
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}

const readinessSentence = 'A completed Plan has no unresolved architectural choice';
const planWithoutReadiness = replaceOnce(adrSources.plan, readinessSentence, 'Plan readiness is assessed');
for (const [label, plan, prompt] of [
  ['historical decoy', `${planWithoutReadiness}\n\n## Historical example, not operating policy\n\n${readinessSentence}\n`, adrSources.planPrompt],
  ['metadata decoy', replaceOnce(planWithoutReadiness, 'description: ', `description: ${readinessSentence}. `), adrSources.planPrompt],
  ['wrong-owner decoy', planWithoutReadiness, `${adrSources.planPrompt}\n\n${readinessSentence}`]
]) {
  assertRejected(`Plan readiness ${label} cannot replace its normative rule`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, plan, planPrompt: prompt
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && /Plan must resolve architecture/.test(error.message));
}

const executionPaths = {
  repository: '.github/copilot-instructions.md', core: '.github/skills/rpir-lifecycle-core/SKILL.md',
  checklist: '.github/skills/local-git-checkpoints/references/checkpoint-checklist.md',
  planning: '.github/skills/architecture-planning/SKILL.md',
  planTemplate: '.github/skills/architecture-planning/implementation-plan-template.md',
  runner: '.github/agents/script-runner.agent.md', implementAgent: '.github/agents/implement.agent.md',
  reviewAgent: '.github/agents/review.agent.md', researchAgent: '.github/agents/research.agent.md',
  safe: '.github/skills/safe-implementation/SKILL.md',
  validationChecklist: '.github/skills/safe-implementation/validation-checklist.md',
  implementationReport: '.github/skills/safe-implementation/implementation-report-template.md',
  reviewTemplate: '.github/skills/code-review/review-report-template.md',
  assurance: '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md',
  planAgent: '.github/agents/plan.agent.md', checkpointSkill: '.github/skills/local-git-checkpoints/SKILL.md',
  codeReview: '.github/skills/code-review/SKILL.md', assuranceSkill: '.github/skills/rpir-stage-assurance/SKILL.md',
  planPrompt: '.github/prompts/plan.prompt.md', implementPrompt: '.github/prompts/implement.prompt.md',
  remediatePrompt: '.github/prompts/remediate-review.prompt.md', reviewPrompt: '.github/prompts/review.prompt.md',
  lifecycleInstruction: '.github/instructions/lifecycle-records.instructions.md',
  readme: 'README.md', wikiRpir: 'docs/Wiki/rpir.md', wikiEvidence: 'docs/Wiki/lifecycle-evidence-and-authority.md',
  wikiCatalogue: 'docs/Wiki/artifact-catalogue.md', wikiMaintenance: 'docs/Wiki/maintain-the-toolkit.md'
};
const executionSources = Object.fromEntries(Object.entries(executionPaths).map(([key, relative]) => [key, readArtifact(relative)]));
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract(executionSources));
cases += 1;

// The Research checkpoint sentence owns its safeguards independently of ADR
// discovery prose, paragraph layout, metadata and historical examples.
const researchEquivalent = replaceOnce(executionSources.researchAgent,
  'Explicitly identify architectural choices after existing discovery/acknowledgment or explicit-deferral limits permit investigation.',
  'Identify architectural choices explicitly once the existing discovery/acknowledgment or explicit-deferral boundary permits investigation.');
const researchCheckpointSentence = executionSources.researchAgent.match(/Script Runner may observe,[^\n]*?\.(?=\s|$)/)?.[0];
assert.ok(researchCheckpointSentence, 'Research fixture requires its normative checkpoint sentence');
for (const researchAgent of [
  researchEquivalent,
  replaceOnce(researchEquivalent, ' Script Runner may observe,', '\n\nScript Runner may observe,'),
  replaceOnce(researchEquivalent, 'separately granted local Git index/history checkpoint',
    'separately authorized local Git index/history checkpoint'),
  replaceOnce(researchEquivalent, 'eligible Research brief after physical save/readback',
    'eligible Research brief following physical save/readback')
]) {
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources, researchAgent }));
  cases += 1;
}
for (const target of [
  'separately granted local Git index/history checkpoint',
  'eligible Research brief after physical save/readback'
]) {
  const missing = replaceOnce(researchEquivalent, target, 'safeguard omitted');
  for (const [label, researchAgent, reviewAgent] of [
    ['missing safeguard', missing, executionSources.reviewAgent],
    ['historical decoy', `${missing}\n\n## Historical example (not operating policy)\n\n${researchCheckpointSentence}\n`, executionSources.reviewAgent],
    ['metadata decoy', replaceOnce(missing, 'description: ', `description: ${researchCheckpointSentence} `), executionSources.reviewAgent],
    ['wrong-subject decoy', replaceOnce(missing, ' Script Runner may observe,',
      ` Unrelated documentation quotes: ${researchCheckpointSentence} Script Runner may observe,`), executionSources.reviewAgent],
    ['wrong-owner decoy', missing, `${executionSources.reviewAgent}\n\n## Historical Research example\n\n${researchCheckpointSentence}\n`]
  ]) {
    assertRejected(`Research ${label}: ${target}`, () => contracts.checkIncrementalRpirContract({
      ...executionSources, researchAgent, reviewAgent
    }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
      error.message === 'Research must retain its separately authorized saved-brief checkpoint route');
  }
}
assertRejected('Research checkpoint moved entirely to history', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  researchAgent: `${replaceOnce(researchEquivalent, researchCheckpointSentence, 'Research remains read-only outside its records.')}\n\n## Historical example (not operating policy)\n\n${researchCheckpointSentence}\n`
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  error.message === 'Research must retain its separately authorized saved-brief checkpoint route');

for (const [label, key, mutate, diagnostic] of [
  ['duplicate grant reintroduced in checkpoint owner', 'checklist', (text) => replaceOnce(text,
    'no separate grant exchange is required', 'a separate grant exchange is required'),
  /Checkpoint checklist authorization must cover approved Plans/],
  ['future candidate distinction removed', 'checklist', (text) => replaceOnce(text,
    'Approval may precede a concrete candidate', 'Approval requires a concrete candidate'),
  /Checkpoint checklist authorization must cover approved Plans/],
  ['silent Plan negative removed', 'checklist', (text) => replaceOnce(text,
    'A silent, prohibiting, or merely optional/unapproved strategy does not authorize Git.',
    'A strategy authorizes Git.'), /Checkpoint checklist authorization must cover approved Plans/],
  ['revocation limit removed', 'checklist', (text) => replaceOnce(text,
    'validity, resume/revalidation and revocation conditions', 'validity and resume/revalidation conditions'),
  /Checkpoint checklist authorization must cover approved Plans/],
  ['material drift limit removed', 'checklist', (text) => replaceOnce(text,
    'permission or consequential helper changes require reassessment', 'permission or consequential helper changes need no reassessment'),
  /Checkpoint checklist authorization must cover approved Plans/],
  ['duplicate-grant requirement reintroduced in validation checklist', 'validationChecklist', (text) => replaceOnce(text,
    'Do not demand duplicate grants for unchanged Plan-covered effects.', 'Demand duplicate grants for unchanged Plan-covered effects.'),
  /Implementation checklist must use Plan-covered authority/],
  ['Review checkpoint omits Plan coverage', 'reviewAgent', (text) => replaceOnce(text,
    'only when an applicable approved Plan explicitly covers that record and phase', 'only when a checkpoint is useful'),
  /Review checkpoint summary must accept covered Plan authority/],
  ['Work Item cadence removed', 'checklist', (text) => replaceOnce(text,
    'after each completed Work Item before unrelated items', 'at convenient times'),
  /Checkpoint checklist must state normal Work Item cadence/],
  ['earlier Task consideration removed', 'checklist', (text) => replaceOnce(text,
    'proactively consider earlier coherent, validated Task boundaries', 'consider other work'),
  /Checkpoint checklist must state normal Work Item cadence/],
  ['loop order loses checkpoint disposition', 'safe', (text) => replaceOnce(text,
    '→ handle checkpoint disposition → select the next unit', '→ select the next unit'),
  /Safe implementation loop must persist progress in order/],
  ['unsaved affected-ID disclosure removed', 'safe', (text) => replaceOnce(text,
    'promptly disclose affected Step/Task/Work Item IDs as unsaved tracking', 'record a tracking issue'),
  /Safe implementation loop must persist progress in order/],
  ['report timing evidence omitted', 'implementationReport', (text) => replaceOnce(text,
    'observed late reconciliation, and unverified timing', 'timing information'),
  /Implementation report marker field must distinguish/],
  ['Review no-commit opportunity omitted', 'reviewTemplate', (text) => replaceOnce(text,
    'including no-commit dispositions', 'where relevant'),
  /Review template must assess available chronology/],
  ['assurance silence-based pass allowed', 'assurance', (text) => replaceOnce(text,
    'no silence-based pass or commit-count gate', 'silence may demonstrate compliance'),
  /Stage assurance must distinguish observed timing/]
]) {
  const fixture = { ...executionSources, [key]: mutate(executionSources[key]) };
  assertRejected(label, () => contracts.checkIncrementalRpirContract(fixture),
    (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && diagnostic.test(error.message));
}

const supportedCheckpointEquivalent = {
  ...executionSources,
  checklist: replaceOnce(executionSources.checklist, 'no separate grant exchange is required', 'no additional grant step is required')
};
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract(supportedCheckpointEquivalent));
cases += 1;

// Preserve positive rules while adding contradictions: absence-only fixtures
// cannot prove rejection of conflicting legacy requirements.
for (const [key, boundary, owner] of [
  ['checklist', '## 4. Inspect and preserve the candidate', 'Checkpoint checklist authorization'],
  ['validationChecklist', '## Evidence, records and independent review', 'Implementation checklist capabilities'],
  ['runner', 'Before every Git command,', 'Script Runner authority']
]) {
  for (const contradiction of [
    'A separate grant exchange is required for every candidate.',
    'You must obtain an additional grant for each checkpoint.'
  ]) {
    assertRejected(`additive duplicate grant in ${key}: ${contradiction}`, () => contracts.checkIncrementalRpirContract({
      ...executionSources,
      [key]: replaceOnce(executionSources[key], boundary, `${contradiction}\n\n${boundary}`)
    }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
      error.message === `${owner} must reject mandatory duplicate grants for covered effects`);
  }
}

for (const key of ['safe', 'implementAgent']) {
  for (const [target, replacement] of [
    ['→ handle checkpoint disposition → select the next unit', '→ select the next unit → handle checkpoint disposition'],
    [key === 'safe'
      ? '→ update eligible existing markers only, save and read back/verify preservation → handle checkpoint disposition'
      : '→ save eligible existing markers only and read back/verify preservation → handle checkpoint disposition',
    key === 'safe'
      ? '→ handle checkpoint disposition → update eligible existing markers only, save and read back/verify preservation'
      : '→ handle checkpoint disposition → save eligible existing markers only and read back/verify preservation']
  ]) {
    assertRejected(`phrase-preserving loop reorder in ${key}: ${target}`, () => contracts.checkIncrementalRpirContract({
      ...executionSources, [key]: replaceOnce(executionSources[key], target, replacement)
    }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
      (key === 'safe' ? /Safe implementation loop must persist progress in order/ : /Implement summary must preserve the ordered/).test(error.message));
  }
}

const runnerOpening = executionSources.runner.match(/^Accept a self-contained[^\n]*\n\nOnly `read`[^\n]*/m)?.[0];
assert.ok(runnerOpening, 'Runner fixture requires its two normative opening paragraphs');
assertRejected('Runner rules relocated to historical section', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  runner: `${replaceOnce(executionSources.runner, runnerOpening, 'Accept only the supplied goal.\n\nObserve the requested scope.')}\n\n## Historical example (not operating policy)\n\n${runnerOpening}\n`
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && /Script Runner summary must consume Plan authority/.test(error.message));

for (const replacement of ['', 'reopen all markers and unaffected completed work']) {
  let safe = replaceOnce(executionSources.safe,
    'reopen only the invalidated markers and dependent parent markers whose completion is no longer supported', replacement);
  safe = replaceOnce(safe, 'on resume reopen only disproved completion and dependent parents, with evidence', 'on resume assess progress');
  assertRejected(`selective reopening removed or reversed: ${replacement}`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, safe
  }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && /Safe implementation recovery must selectively reopen/.test(error.message));
}
assertRejected('unaffected completed work preservation reversed', () => contracts.checkIncrementalRpirContract({
  ...executionSources, safe: replaceOnce(executionSources.safe,
    'preserve unaffected completed work', 'reopen unaffected completed work')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && /Safe implementation recovery must selectively reopen/.test(error.message));

for (const [key, target, diagnostic] of [
  ['repository', 'or an explicit bounded phase-record grant', /Repository command entry must preserve/],
  ['checklist', 'do not demand an approved implementation Plan or `/implement` evidence for this route', /Checkpoint checklist must retain separately bounded/],
  ['runner', 'without requiring an approved implementation Plan or `/implement` evidence', /Script Runner must retain separately bounded/],
  ['researchAgent', 'separately granted local Git index/history checkpoint', /Research must retain/],
  ['reviewAgent', 'or other valid bounded authorization applies, ', /Review must retain/]
]) {
  assertRejected(`separate phase-record route removed from ${key}`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], target, 'route omitted')
  }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && diagnostic.test(error.message));
}

// Legitimate bootstrap, uncovered effects and separate phase-record grants are
// not duplicate-grant contradictions; supported local equivalents remain valid.
for (const [key, target, replacement] of [
  ['safe', 'reopen only the invalidated markers', 'reopen only disproved markers'],
  ['safe', '→ make the coherent change, check and repair →', '→ perform the coherent change and relevant checks →'],
  ['implementAgent', '→ make/check/repair the coherent change →', '→ perform the coherent change and checks →'],
  ['checklist', '## 4. Inspect and preserve the candidate',
    'A bootstrap session still requires its distinct actual bounded grant. Genuinely uncovered effects require an engineer decision.\n\n## 4. Inspect and preserve the candidate']
]) {
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], target, replacement)
  }));
  cases += 1;
}

// A literal candidate mention elsewhere in the checklist must not satisfy the
// authorization section's candidate requirement.
assertRejected('wrong-section candidate decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  checklist: replaceOnce(executionSources.checklist,
    'literal candidate and candidate-relevant validation evidence', 'a candidate and relevant validation evidence')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Checkpoint checklist authorization must cover approved Plans/.test(error.message));

const cadenceSectionDecoy = replaceOnce(executionSources.checklist,
  'after each completed Work Item before unrelated items', 'at convenient times');
assertRejected('wrong-section Work Item cadence decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  checklist: replaceOnce(cadenceSectionDecoy, '## 4. Inspect and preserve the candidate',
    '## 4. Inspect and preserve the candidate\n\nNormally checkpoint eligible coherent work after each completed Work Item before unrelated items.')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Checkpoint checklist must state normal Work Item cadence/.test(error.message));

const progressLoopDecoy = replaceOnce(executionSources.safe,
  '→ handle checkpoint disposition → select the next unit', '→ select the next unit');
assertRejected('wrong-section progress-loop decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  safe: `${progressLoopDecoy}\n\nUnrelated note: handle checkpoint disposition before selecting the next unit.`
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Safe implementation loop must persist progress in order/.test(error.message));

const reportTimingDecoy = replaceOnce(executionSources.implementationReport,
  'observed late reconciliation, and unverified timing', 'timing information');
assertRejected('wrong-field implementation timing decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  implementationReport: replaceOnce(reportTimingDecoy, '## Validation',
    '## Validation\n\nObserved late reconciliation, and unverified timing may be noted here.')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Implementation report marker field must distinguish/.test(error.message));

const reviewTimingDecoy = replaceOnce(executionSources.reviewTemplate,
  'observed late/omitted action, or unverified timing', 'timing evidence');
assertRejected('wrong-field Review timing decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  reviewTemplate: replaceOnce(reviewTimingDecoy, '## Findings',
    '## Findings\n\nObserved late/omitted action, or unverified timing is considered.')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Review template must assess available chronology/.test(error.message));

for (const [label, key, mutate, diagnostic] of [
  ['missing mapped ADR input', 'coverage', (text) => replaceOnce(text, /^\| 4\.3[^\n]*\n/m, ''), /all 22 sample inputs/],
  ['unguarded ADR directory destination', 'core', (text) => replaceOnce(text, 'explicitly engineer-selected, verified contained destination', 'selected destination'), /Plan-only authority, guarded effects/],
  ['unresolved ADR version drift', 'implement', (text) => replaceOnce(text, 'material mismatch, ', ''), /missing material version mismatch before dependent effects/],
  ['unavailable ADR content omitted', 'implement', (text) => replaceOnce(text, 'unavailable content or ', ''), /missing unavailable content before dependent effects/],
  ['unsatisfied ADR condition omitted', 'implement', (text) => replaceOnce(text, ' or an unsatisfied condition', ''), /missing unsatisfied conditions before dependent effects/],
  ['independent work continuity omitted', 'implement', (text) => {
    const changed = text.replaceAll('independent approved work', '');
    assert.notEqual(changed, text);
    return changed;
  }, /unexpected architecture requires engineer-directed Plan resolution/],
  ['dependent-effects guard omitted', 'implement', (text) => replaceOnce(text, ' before dependent effects', ''), /missing material version mismatch before dependent effects/],
  ['Review implies architecture approval', 'review', (text) => replaceOnce(
    text, 'a clean `/review` is not ADR sign-off and does not establish enterprise or architectural approval.',
    'a clean `/review` is ADR sign-off and establishes architectural approval.'
  ), /Review guidance: Review is not architectural sign-off/],
  ['missing decision date field', 'template', (text) => replaceOnce(text, /^- \*\*Decision date:\*\*[^\n]*\n/m, ''), /decision provenance/]
]) {
  const fixture = { ...adrSources, [key]: mutate(adrSources[key]) };
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract(fixture), diagnostic);
}
assertRejected('Runner inherits ADR authorship', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  runner: replaceOnce(adrSources.runner, "Plan coordinator's separate associated-Proposed-ADR exception never transfers to Runner", '')
}), /Script Runner guidance must not inherit/);

for (const owner of ['skill', 'template']) {
  for (const [label, target, replacement, diagnostic] of [
    ['pending approval allowed', 'required decision approvals and ', '', /requires satisfied decision approvals/],
    ['pending condition allowed', ' and decision-critical conditions', '', /requires satisfied decision-critical conditions/],
    ['pending disposition omitted', /Otherwise retain Proposed[^.\n]*\./, '', /outstanding prerequisites require Proposed/],
    ['unconditional acceptance with outstanding prerequisites', /Unconditional Accepted requires[^.\n]*\./,
      'Unconditional Accepted is permitted with outstanding required decision approvals or decision-critical conditions.', /requires satisfied decision approvals/]
  ]) {
    const fixture = { ...adrSources, [owner]: replaceOnce(adrSources[owner], target, replacement) };
    assertRejected(`${owner}: ${label}`, () => contracts.checkArchitectureDecisionRecordContract(fixture),
      (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message));
  }
}

// Supported equivalent wording and satisfied-prerequisite controls. These are
// contract-source fixtures, not execution of a governance/agent state machine.
for (const [key, target, replacement] of [
  ['plan', 'against inspected ADR coverage using the',
    'against inspected ADR coverage (bind delivery evidence to its source) using the'],
  ['plan', 'description: ', 'description: Bind delivery evidence to its source. '],
  ['implement', 'continuing independent approved work', 'allowing unrelated approved work to continue'],
  ['implement', 'material mismatch, unavailable content or an unsatisfied condition before dependent effects',
    'material version mismatch, missing content or unsatisfied decision conditions before dependent changes'],
  ['plan', 'Bind each to actual ADR path/ID, identifiable section, inspected substantive version/snapshot, decision state, actual agreement evidence/conditions and affected Work Items',
    'Bind each to actual ADR identity, identifiable section, inspected substantive snapshot, decision status, evidence of actual agreement/conditions and affected Work Items'],
  ['template', 'Unconditional Accepted requires all applicable required decision approvals and decision-critical conditions to be satisfied.',
    'Unconditional Accepted requires satisfied applicable required decision approvals and decision-critical conditions, with all prerequisites satisfied.'],
  ['template', '<consumer convention; distinguish proposed decision state from delivery progress>',
    'Accepted — applicable authority and agreement verified; all required decision approvals and decision-critical conditions satisfied.'],
  ['template', '<consumer convention; distinguish proposed decision state from delivery progress>',
    'Proposed — agreement subject to an outstanding compatibility condition; dependent work remains pending.']
]) {
  const fixture = { ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement) };
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract(fixture));
  cases += 1;
}

for (const [label, target] of [
  ['identity', 'actual ADR path/ID, '],
  ['section', 'identifiable section, '],
  ['substantive version', 'inspected substantive version/snapshot, '],
  ['decision state', 'decision state, '],
  ['agreement evidence', 'actual agreement evidence/'],
  ['conditions', '/conditions'],
  ['dependent work', ' and affected Work Items']
]) {
  const binding = adrSources.plan.match(/\bBind each[^.]*\./)?.[0];
  assert.ok(binding);
  const fixture = { ...adrSources, plan: replaceOnce(adrSources.plan, binding, replaceOnce(binding, target, '')) };
  assertRejected(`Plan binding omits ${label}`, () => contracts.checkArchitectureDecisionRecordContract(fixture),
    (error) => error.contractId === 'ADR-CONTRACT-001' && error.message === `Plan ADR binding is missing ${label}`);
}

const planBindingSentence = 'Bind each to actual ADR path/ID, identifiable section, inspected substantive version/snapshot, decision state, actual agreement evidence/conditions and affected Work Items.';
const missingPlanBinding = replaceOnce(adrSources.plan, planBindingSentence, 'Record remaining ADR questions.');
for (const [label, plan, research] of [
  ['before ADR guidance in the same paragraph', replaceOnce(missingPlanBinding,
    'Reconcile every architectural choice identified in Research',
    `Reconcile every architectural choice identified in Research; ${planBindingSentence} Research`), adrSources.research],
  ['unrelated paragraph', replaceOnce(missingPlanBinding,
    '\n# Plan coordinator\n', `\n# Plan coordinator\n\n${planBindingSentence}\n`), adrSources.research],
  ['metadata', replaceOnce(missingPlanBinding, 'description: ', `description: ${planBindingSentence} `), adrSources.research],
  ['history', `${missingPlanBinding}\n\n## Historical example (not operating policy)\n\n${planBindingSentence}\n`, adrSources.research],
  ['wrong owner', missingPlanBinding, `${adrSources.research}\n\n## Historical Plan example\n\n${planBindingSentence}\n`]
]) {
  assertRejected(`Plan ADR binding decoy in ${label}`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, plan, research
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && error.message === 'Plan ADR binding is missing identity');
}

// Complete architecture coverage is a cross-owner contract, not a keyword
// anywhere or a check that one valid bound ADR exists. All mutations below
// use exact-once targets and require the intended coverage diagnostic.
function rejectCoverage(label, key, target, replacement, diagnostic, diagnosticOwner = key) {
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'ADR-COVERAGE-001' && error.message === `${diagnosticOwner}: ${diagnostic}`);
}

const downstreamCoverageOwners = [
  'implement', 'safe', 'validation', 'implementationReport', 'review',
  'codeReview', 'reviewReport', 'assuranceSkill', 'assurance'
];
const coverageDiagnostic = 'detect missing/partial choice coverage despite a valid bound ADR';
const unexpectedDiagnostic = 'unexpected architecture requires engineer-directed Plan resolution before dependent effects with independent-work continuity';
const routineDiagnostic = 'routine coding needs no ADR and material ambiguity needs engineer resolution';
const gapRule = 'including missing or partial coverage even when a valid ADR is bound';
const unexpectedRule = 'engineer-directed Plan resolution before dependent architectural effects';
for (const key of downstreamCoverageOwners) {
  for (const replacement of [
    'assessing only ADR binding consistency',
    'including only selected choices when a valid ADR is bound'
  ]) rejectCoverage(`${key} omits complete or partial-coverage assessment`, key, gapRule, replacement, coverageDiagnostic);

  const missing = replaceOnce(adrSources[key], gapRule, 'assessing only ADR binding consistency');
  for (const [label, fixture] of [
    ['history decoy', `${missing}\n\n## Historical example (not operating policy)\n\nAssess complete architectural choice coverage against Research, the approved Plan and actual changes, ${gapRule}.\n`],
    ['metadata decoy', replaceOnce(missing, 'description: ', `description: ${gapRule}; `)]
  ]) {
    assertRejected(`${key} ${label} cannot satisfy completeness`, () => contracts.checkArchitectureDecisionRecordContract({
      ...adrSources, [key]: fixture
    }), (error) => error.contractId === 'ADR-COVERAGE-001' && error.message === `${key}: ${coverageDiagnostic}`);
  }
  assertRejected(`${key} wrong-owner coverage decoy`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: missing,
    template: `${adrSources.template}\n\n## Historical downstream example\n\n${gapRule}\n`
  }), (error) => error.contractId === 'ADR-COVERAGE-001' && error.message === `${key}: ${coverageDiagnostic}`);

  rejectCoverage(`${key} unexpected architecture is treated as routine discretion`, key, unexpectedRule,
    'Implement-owned resolution before dependent architectural effects', unexpectedDiagnostic);
  rejectCoverage(`${key} unexpected architecture loses dependent-effect guard`, key, unexpectedRule,
    'engineer-directed Plan resolution after dependent architectural effects', unexpectedDiagnostic);
  rejectCoverage(`${key} blanket stop replaces independent work`, key,
    'before dependent architectural effects; continue independent approved work',
    'before dependent architectural effects; stop all approved work', unexpectedDiagnostic);
  rejectCoverage(`${key} routine coding ADR burden`, key,
    'Routine naming, helper extraction and architecture-preserving repairs remain Implement-owned without ADR reference',
    'Routine naming, helper extraction and architecture-preserving repairs require an ADR reference', routineDiagnostic);
  rejectCoverage(`${key} classification ambiguity silently exempted`, key,
    'resolve material classification ambiguity with the engineer using evidence',
    'silently exempt material classification ambiguity', routineDiagnostic);

  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], gapRule,
      'including missing/partial coverage even when a valid ADR is bound')
  }));
  cases += 1;
}

for (const [key, target, replacement] of [
  ['skill', 'reconcile every architectural choice, including planning discoveries, against inspected ADR coverage by Plan',
    'reconcile selected architectural choices, including planning discoveries, against inspected ADR coverage by Plan'],
  ['research', 'Explicitly identify architectural choices after', 'Identify only selected choices after'],
  ['researchSkill', 'Explicitly identify architectural choices only within', 'Identify only selected choices within'],
  ['coverage', 'Identify all architectural choices after', 'Identify selected choices after'],
  ['researchTemplate', 'Explicitly identify each architectural choice with', 'Identify selected choices with'],
  ['plan', 'Reconcile every architectural choice identified in Research and every planning discovery',
    'Reconcile selected architectural choices identified in Research and selected planning discoveries'],
  ['planning', 'Reconcile every architectural choice from Research and every planning discovery',
    'Reconcile selected architectural choices from Research and selected planning discoveries'],
  ['planTemplate', 'Reconcile every architectural choice from Research and every planning discovery',
    'Reconcile selected architectural choices from Research and selected planning discoveries'],
  ['core', 'Plan reconciles all Research choices and planning discoveries to complete inspected ADR coverage',
    'Plan reconciles selected Research choices and planning discoveries to complete inspected ADR coverage'],
  ['repository', 'Plan reconciles every choice, including planning discoveries, to inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to inspected ADR coverage']
]) {
  rejectCoverage(`${key} partial upstream identification/reconciliation`, key, target, replacement,
    'complete upfront choice identification/reconciliation is required');
}

// Add contradictions in a separate normative paragraph while preserving the
// complete positive rule; wrong-owner/history controls above must still fail.
const architectureBoundaries = [
  ['skill', '## Inputs and outputs'],
  ['coverage', '| Sample input |'],
  ['template', '## Alternatives and reasoning'],
  ['research', 'Only after actual acknowledgment or explicit deferral,'],
  ['researchSkill', '## Outputs'],
  ['researchTemplate', '## Recommendation and validation'],
  ['plan', 'Create/revise only a directly associated Proposed ADR'],
  ['planning', '### Resolve material planning gaps'],
  ['planTemplate', '## Planned work'],
  ['core', '## Contain allocation and effects'],
  ['repository', '## Validation, references, and runtime limits'],
  ['implement', 'Before every engineer-facing question,'],
  ['safe', '### Incremental Plan progress'],
  ['validation', '## Capabilities and effects'],
  ['implementationReport', '## Validation'],
  ['review', 'Before every engineer-facing question,'],
  ['codeReview', '## Output and validation'],
  ['reviewReport', '## Findings'],
  ['assuranceSkill', '## Boundary'],
  ['assurance', '## Stage-specific outcome']
];
for (const [key, boundary] of architectureBoundaries) {
  for (const contradiction of [
    'Small reversible spikes may skip ADR coverage.',
    'Small projects are exempt from architectural coverage.',
    'ADR coverage is selective.',
    'A valid bound ADR is sufficient for all architectural choices.',
    'Every routine coding choice requires an ADR.'
  ]) rejectCoverage(`${key} additive contradiction: ${contradiction}`, key, boundary,
    `${contradiction}\n\n${boundary}`, 'contradictory architectural coverage exemption or coding burden');
}

for (const [key, target, replacement] of [
  ['plan', 'Reconcile every architectural choice', 'Reconcile all architectural choices'],
  ['skill', 'Group related choices only where shared context, rationale and governance make this meaningful',
    'Group related choices only where shared context, rationale and governance support meaningful reuse'],
  ['coverage', 'Related choices may share a record', 'Group related choices in a shared record'],
  ['template', 'Reuse verified appropriate existing ADR coverage without duplication.',
    'Reuse verified applicable existing ADR coverage without duplicate records.'],
  ['planTemplate', 'Inspect existing records for substantive applicability before reuse without duplicates.',
    'Inspect existing records for substantive applicability before reuse without duplication.']
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}

for (const [key, target] of [
  ['skill', "keeping each choice's alternatives, selection/pending state, reasoning, conditions and affected Work Items individually identifiable"],
  ['coverage', "each choice must retain individually identifiable alternatives, reasoning, selection/pending state, conditions and affected Work Items"],
  ['template', 'keep each choice identifiable even when context is shared'],
  ['plan', "each choice's rationale, realistic alternatives/reasons, actual selection or explicit pending state, conditions and affected Work Items"],
  ['planning', 'For each choice retain rationale, realistic alternatives and option-specific reasons, actual selection or explicit pending state, conditions and affected Work Item IDs'],
  ['planTemplate', "Meaningful grouping preserves each choice's alternatives, reasoning, selection/pending state, conditions and affected work"],
  ['repository', "each choice's reasoning, alternatives, selection/pending state, conditions and affected Work Items"]
]) {
  rejectCoverage(`${key} vague umbrella replaces individually meaningful grouped coverage`, key, target,
    'a shared umbrella rationale covers the group', 'meaningful per-choice grouped/reused coverage is required');
}

// Mutate only the explicit per-choice clause/field, once. Leave all surrounding
// owner text intact: nearby rationale/binding/context tokens must not mask a
// missing grouped field. These are bounded authored-wording controls, not NLP.
const groupedCoverageFixtures = [
  ['skill', "keeping each choice's alternatives, selection/pending state, reasoning, conditions and affected Work Items individually identifiable",
    ['reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected Work Items']],
  ['coverage', 'each choice must retain individually identifiable alternatives, reasoning, selection/pending state, conditions and affected Work Items',
    ['reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected Work Items']],
  ['plan', "Preserve each choice's rationale, realistic alternatives/reasons, actual selection or explicit pending state, conditions and affected Work Items.",
    ['rationale', 'realistic alternatives/reasons', 'actual selection or explicit pending state', 'conditions', 'affected Work Items']],
  ['planning', 'For each choice retain rationale, realistic alternatives and option-specific reasons, actual selection or explicit pending state, conditions and affected Work Item IDs.',
    ['rationale', 'realistic alternatives and option-specific reasons', 'actual selection or explicit pending state', 'conditions', 'affected Work Item IDs']],
  ['planTemplate', "Meaningful grouping preserves each choice's alternatives, reasoning, selection/pending state, conditions and affected work",
    ['reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected work']],
  ['core', "grouped coverage must retain each choice's rationale, alternatives, selection/pending state, conditions and affected Work Items, not hide choices in a vague umbrella record.",
    ['rationale', 'alternatives', 'selection/pending state', 'conditions', 'affected Work Items']],
  ['repository', "meaningful grouping must preserve each choice's reasoning, alternatives, selection/pending state, conditions and affected Work Items, not hide choices in an umbrella record.",
    ['reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected Work Items']],
  ['template', null, ['Choice and rationale', 'Realistic alternatives and reasoning', 'Actual selection or pending state', 'Conditions', 'affected Work Items']]
];
const groupedFieldNames = ['rationale/reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected work'];
const groupedFieldEquivalents = ['reasoning', 'realistic alternatives', 'selection or explicit pending state', 'conditions', 'affected work'];
const groupedFieldWeakening = ['group-wide motivation', 'a common option', 'selection only', 'unqualified context', 'unmapped delivery'];
for (const [key, clause, targets] of groupedCoverageFixtures) {
  for (const [index, target] of targets.entries()) {
    const templateLabel = index < 3 ? target : 'Conditions and affected Work Items';
    const owned = clause || adrSources.template.split('\n').find((line) => line.startsWith(`- **${templateLabel}:**`));
    assert.ok(owned, `${key} requires its literal grouped field`);
    for (const [label, replacement] of [['removal', ''], ['weakening', groupedFieldWeakening[index]]]) {
      const mutated = replaceOnce(owned, target, replacement);
      rejectCoverage(`${key} independent grouped ${groupedFieldNames[index]} ${label}`, key,
        owned, mutated, `grouped per-choice coverage is missing ${groupedFieldNames[index]}`);
    }
    // Field-level equivalent phrasing remains valid, including existing ADR
    // reuse and meaningful grouping; never require one document per choice.
    const equivalent = key === 'template'
      ? [
          ['Choice and rationale', 'Choice and reasoning'],
          ['Realistic alternatives and reasoning', 'Alternatives and rationale'],
          ['Actual selection or pending state', 'Selection or explicit pending state'],
          ['Conditions', 'conditions'], ['affected Work Items', 'affected work']
        ][index][1]
      : groupedFieldEquivalents[index];
    const rewritten = replaceOnce(owned, target, equivalent === target ? `${target} (choice-specific)` : equivalent);
    assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
      ...adrSources, [key]: replaceOnce(adrSources[key], owned, rewritten)
    }));
    cases += 1;
  }
}

// Remove only individual traceability, retaining all grouped field names and
// every other per-choice rule elsewhere in the same owner.
for (const [key, clause, target, replacement] of [
  ['skill', groupedCoverageFixtures[0][1], 'each choice', 'the group'],
  ['coverage', groupedCoverageFixtures[1][1], 'each choice', 'the group'],
  ['plan', 'Group only where shared context, rationale and governance are meaningful, keeping every individual choice traceable;',
    'every individual choice', 'the group'],
  ['planning', 'Group choices only where shared context, rationale and governance are clear, preserving each choice individually rather than hiding omissions in an umbrella record.',
    'each choice individually', 'the group collectively'],
  ['planTemplate', groupedCoverageFixtures[4][1], 'each choice', 'the group'],
  ['core', groupedCoverageFixtures[5][1], 'each choice', 'the group'],
  ['repository', groupedCoverageFixtures[6][1], 'each choice', 'the group'],
  ['template', 'keep each choice identifiable even when context is shared', 'each choice', 'the group']
]) {
  rejectCoverage(`${key} grouped fields lose individual traceability`, key, clause,
    replaceOnce(clause, target, replacement), 'meaningful per-choice grouped/reused coverage is required');
}

rejectCoverage('assurance Plan checks only existing bindings', 'assurance',
  'Reconcile every Research architectural choice and planning discovery',
  'Check only existing ADR bindings', 'assess every choice and truthful gaps, not only bound-record consistency', 'assurance Plan');

for (const [key, target, replacement] of [
  ['readme', 'Plan reconciles every choice, including planning discoveries, to inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to inspected ADR coverage'],
  ['wikiRpir', 'Plan reconciles every choice, including planning discoveries, to inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to inspected ADR coverage'],
  ['wikiEvidence', 'Plan reconciles every choice, including planning discoveries, to inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to inspected ADR coverage'],
  ['wikiCatalogue', 'Plan reconciles every choice, including planning discoveries, to complete inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to complete inspected ADR coverage']
]) rejectCoverage(`${key} user summary retains selective coverage`, key, target, replacement,
  'user guidance must describe complete coverage and static/runtime limits');

for (const [key, target, diagnostic] of [
  ['skill', 'explicitly engineer-selected, verified contained destination',
    'ADR Skill is missing phase, ownership, or effect safeguards'],
  ['skill', 'Do not recursively create unselected ancestors',
    'ADR Skill is missing phase, ownership, or effect safeguards'],
  ['core', 'Do not recursively create unselected ancestor directories',
    'Lifecycle core ADR exception lacks Plan-only authority, guarded effects, preservation, or version binding'],
  ['core', 'identity, containment, absence/collision and effective permission',
    'Lifecycle core ADR exception lacks Plan-only authority, guarded effects, preservation, or version binding'],
  ['core', 'save without overwrite',
    'Lifecycle core ADR exception lacks Plan-only authority, guarded effects, preservation, or version binding'],
  ['core', 'no unrelated source/document/register edits',
    'Lifecycle core ADR exception lacks Plan-only authority, guarded effects, preservation, or version binding']
]) {
  assertRejected(`${key} complete coverage must preserve ${target}`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, 'safeguard omitted')
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && error.message === diagnostic);
}

// Directory authority never substitutes for a separately guarded file effect;
// complete coverage never licenses accepted-history rewrites.
for (const [target, diagnostic] of [
  ['Preserve accepted and superseded substantive history.', 'ADR skill must preserve accepted history'],
  ['Check each ADR file effect separately for identity, containment, absence/collision, effective permission, saved result, and readback.',
    'ADR skill must guard each file effect separately'],
  ['Directory creation does not grant file creation.', 'Lifecycle core must separate directory and file authority']
]) {
  const key = target.startsWith('Directory') ? 'core' : 'skill';
  assertRejected(`governance regression: ${target}`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, '')
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && error.message === diagnostic);
}

assertRejected('broken ADR resource link', () => contracts.checkLocalLinks(
  adrPaths.skill, '[missing](references/not-present.md)'
));
assertRejected('escaping ADR resource link', () => contracts.checkLocalLinks(
  adrPaths.skill, '[outside](../../../../README.md)'
));

// Expected checkpoint planning is an authored owner contract, not a runtime
// arbitrary-Plan validation service. Each mutation is exact-once and must fail
// its own diagnostic; keep the independent Research/architecture tests above.
function rejectCheckpoint(label, key, target, replacement, owner, diagnostic) {
  assertRejected(label, () => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], target, replacement)
  }), (error) => error.contractId === 'RPIR-CHECKPOINT-001' &&
    error.message === `${owner}: ${diagnostic}`);
}
const planningDiagnostic = 'require bounded prospective planning and meaningful per-item exceptions without granting Git authority';
const entryDiagnostic = 'each detailed item needs a useful checkpoint or concrete justified exception field';
const accountingDiagnostic = 'account for each planned versus actual boundary without retrospective Plan exceptions or commit-count acceptance';
const runtimeDiagnostic = 'preserve effect-specific runtime safeguards and honest dispositions';
const entry = executionSources.planTemplate.split('\n').find((line) => line.startsWith('**Commit plan:**'));
assert.ok(entry, 'Plan template requires an owned commit field');
for (const replacement of ['', '**Commit plan:**', '**Commit plan:** `<No commits for any Work Item.>`',
  '**Commit plan:** `<Combine everything because it is simpler.>`']) {
  rejectCheckpoint(`missing/empty/generic blanket item field: ${replacement}`, 'planTemplate', entry, replacement,
    'planTemplate', entryDiagnostic);
}
const exceptionParts = ['actual constraint/reason', 'affected IDs', 'validation/dependency consequence',
  'later checkpoint boundary if one exists', 'why the normal boundary is unsuitable'];
for (const target of ['strategy reference', 'normal post-validation checkpoint boundary', 'coherent content and purpose', ...exceptionParts]) {
  rejectCheckpoint(`template item independently loses ${target}`, 'planTemplate', entry,
    replaceOnce(entry, target, 'omitted'), 'planTemplate', entryDiagnostic);
}
const missingEntry = replaceOnce(executionSources.planTemplate, entry, '**Commit plan:**');
for (const [label, planTemplate, readme] of [
  ['wrong section', replaceOnce(missingEntry, '## Execution guidance and validation', `## Execution guidance and validation\n\n${entry}`), executionSources.readme],
  ['history', `${missingEntry}\n\n## Historical example\n\n${entry}`, executionSources.readme],
  ['wrong owner', missingEntry, `${executionSources.readme}\n\n${entry}`]
]) assertRejected(`item-entry ${label} decoy`, () => contracts.checkIncrementalRpirContract({
  ...executionSources, planTemplate, readme
}), (error) => error.contractId === 'RPIR-CHECKPOINT-001' && error.message === `planTemplate: ${entryDiagnostic}`);
// A second detailed item cannot borrow the first item's intact entry.
assertRejected('second detailed item lacks checkpoint entry', () => contracts.checkIncrementalRpirContract({
  ...executionSources, planTemplate: replaceOnce(executionSources.planTemplate, '## Execution guidance and validation',
    '### Work Item 2: coupled tests\n\n**Validation:** both required checks pass.\n\n## Execution guidance and validation')
}), (error) => error.contractId === 'RPIR-CHECKPOINT-001' && error.message === `planTemplate: ${entryDiagnostic}`);

for (const [key, anchor] of [
  ['repository', '- **Expected checkpoint planning, conditional execution:**'],
  ['core', 'Every prospective Plan includes'], ['planAgent', 'Plan the deliverable'],
  ['planning', 'Specify the approved outcome'], ['checkpointSkill', 'Every prospective Plan must include'],
  ['checklist', 'Require one explicit bounded strategy']
]) {
  const paragraph = executionSources[key].split(/\n\s*\n/).find((part) => part.startsWith(anchor));
  assert.ok(paragraph, `${key} planning paragraph must exist`);
  for (const target of ['actual constraint/reason', 'affected IDs', 'validation/dependency consequence',
    'later boundary if one exists', 'why the normal boundary is unsuitable']) {
    rejectCheckpoint(`${key} independently loses exception ${target}`, key, paragraph,
      replaceOnce(paragraph, target, 'omitted'), key, planningDiagnostic);
  }
  const weakened = replaceOnce(paragraph, 'explicit bounded', 'bounded');
  rejectCheckpoint(`${key} missing explicit strategy requirement`, key, paragraph,
    weakened, key, planningDiagnostic);
  assertRejected(`${key} historical decoy cannot restore explicit strategy requirement`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: `${replaceOnce(executionSources[key], paragraph, weakened)}\n\n## Historical planning example, not operating policy\n\n${paragraph}`
  }), (error) => error.contractId === 'RPIR-CHECKPOINT-001' && error.message === `${key}: ${planningDiagnostic}`);
  for (const contradiction of ['Checkpoint planning is optional.', 'Git strategy remains optional.',
    'Work Items may omit the commit entry.', 'A generic blanket exception is sufficient.',
    'Historical prohibitions may be ignored.']) {
    rejectCheckpoint(`${key} additive contradiction with positive rule intact: ${contradiction}`, key,
      paragraph, `${paragraph}\n\n${contradiction}`, key,
      'contradictory optional checkpoint planning or prohibition bypass');
  }
}

const combination = `**Commit plan:** Strategy reference G1: normal post-validation checkpoint boundary after WI1 is deferred to WI2; coherent content and purpose are the contract change plus coupled regression tests. This specific justified combination/deferral/no-commit exception has actual constraint/reason: WI1 changes a contract that WI2's fixtures must consume, so separate snapshots fail required checks; affected IDs: WI1 and WI2; validation/dependency consequence: neither is independently validated until both contract entries pass together; later checkpoint boundary if one exists: immediately after WI2 validation before unrelated WI3; why the normal boundary is unsuitable: WI1 alone would preserve a knowingly broken contract/test snapshot.`;
// This positive illustrates a useful exception, not proof that prose keywords
// establish its truth. Manually reconcile its IDs, dependency and later gate.
for (const planTemplate of [
  replaceOnce(executionSources.planTemplate, entry, combination),
  replaceOnce(executionSources.planTemplate, entry, replaceOnce(entry, 'coherent content and purpose', 'coherent content/purpose')),
  replaceOnce(executionSources.planTemplate, entry, entry.replace('coherent content and purpose', 'coherent content and purpose (policy, tests and directly related docs together)')),
  replaceOnce(executionSources.planTemplate, 'Every prospective Plan must state one explicit bounded', 'Every prospective Plan must state one explicit bounded and reviewable'),
  `${executionSources.planTemplate}\n\n## Historical evidence, not prospective policy\n\nA historical prohibition supplies no Git authority. Checkpoint planning is optional in this quoted historical example only.`
]) {
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources, planTemplate }));
  cases += 1;
}
for (const [key, target, replacement] of [
  ['planAgent', 'Each detailed Work Item must reference that strategy', 'Every detailed Work Item must reference that strategy'],
  ['checkpointSkill', 'Every detailed Work Item references it', 'Each detailed Work Item references it'],
  ['checkpointSkill', 'coherent content and purpose', 'coherent content/purpose']
]) {
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], target, replacement)
  }));
  cases += 1;
}
for (const [key, anchor] of [
  ['implementationReport', '- **Planned-versus-actual checkpoint accounting:**'],
  ['reviewTemplate', '- **Planned-versus-actual boundary assessment:**'],
  ['validationChecklist', '- [ ] Reconcile planned versus actual'],
  ['implementAgent', 'Reconcile the inspected Plan']
]) {
  const owned = executionSources[key].split('\n').find((line) => line.startsWith(anchor));
  assert.ok(owned);
  for (const target of ['before unrelated work', key === 'implementAgent'
    ? 'substantive approved Plan content to invent retrospective' : 'retrospective substantive']) {
    rejectCheckpoint(`${key} boundary evidence loses ${target}`, key, owned,
      replaceOnce(owned, target, 'omitted'), key, accountingDiagnostic);
  }
  for (const target of ['actual constraint/reason', 'affected IDs', 'validation/dependency consequence', 'later boundary if one exists']) {
    rejectCheckpoint(`${key} departure loses ${target}`, key, owned,
      replaceOnce(owned, target, 'omitted'), key,
      'assess each departure reason, IDs, validation consequence and later boundary');
  }
}
for (const [owner, target] of [
  ['preflight', 'incidental index refresh/cache writes'],
  ['preflight', 'Unknown, changed or incompatible consequential effects stop that command before execution'],
  ['applicability', 'Skipped — not applicable'], ['applicability', 'Skipped — no eligible changes'],
  ['applicability', 'Unavailable / unresolved'], ['applicability', 'Do not call this a verified no-repository skip'],
  ['authorization', 'A real platform denial stops the affected action and is never bypassed through another role.'],
  ['candidate', 'unrelated staged content exists'], ['candidate', 'partial staging/same-file ownership is ambiguous'],
  ['candidate', 'validation actually applies to the staged snapshot'], ['candidate', 'HEAD/index drift'],
  ['candidate', 'if drift occurs, stop and re-inspect'], ['candidate', 'source-read-only in every phase'],
  ['candidate', 'stop before invoking a source-mutating helper'], ['candidate', 'Do not disable a required hook'],
  ['candidate', 'Never bypass hooks/signing'], ['candidate', 'invent identity/legal signoff'],
  ['candidate', 'Remote/network effects are outside this checkpoint capability'],
  ['reconciliation', 'Only after the complete candidate and relevant checks are supported and state remains current'],
  ['reconciliation', 'A command success alone does not verify a commit'],
  ['reconciliation', 'If completion is uncertain, reconcile'], ['evidence', 'No commit verified'],
  ['evidence', 'Commit verified with unexpected effects'], ['evidence', 'Completion uncertain'],
  ['evidence', 'chronology unverified']
]) {
  // Isolate the actual owner occurrence when outcome labels also appear in §6.
  const headings = { preflight: '## Prospective Plan coverage', applicability: '## 1. Decide whether a checkpoint applies',
    authorization: '## 3. Bind authorization to the approved Plan', candidate: '## 4. Inspect and preserve the candidate',
    reconciliation: '## 5. Append and reconcile; never assume success', evidence: '## 6. Report evidence without lifecycle claims' };
  const start = executionSources.checklist.indexOf(headings[owner]);
  const end = executionSources.checklist.indexOf('\n## ', start + headings[owner].length);
  const owned = executionSources.checklist.slice(start, end < 0 ? undefined : end);
  rejectCheckpoint(`runtime ${owner} loses ${target}`, 'checklist', owned,
    replaceOnce(owned, target, 'safeguard omitted'), `checklist ${owner}`, runtimeDiagnostic);
}

for (const [key, boundary] of [
  ['planTemplate', '## Planned work'], ['implementAgent', 'Before every engineer-facing question,'],
  ['reviewAgent', 'Before every engineer-facing question,'], ['safe', '## Outputs'],
  ['validationChecklist', '## Read-only Validation Worker'], ['implementationReport', '## Identity, direct lineage and next action'],
  ['reviewTemplate', '## Findings'], ['codeReview', 'Return cited, severity-ranked findings'],
  ['assuranceSkill', 'Do not edit, run commands, delegate, persist records'], ['assurance', '## Stage-specific outcome'],
  ['readme', 'Plan, Implement and Review retain contextual material clarification'], ['wikiRpir', '## Canonical references'],
  ['wikiEvidence', '## Canonical references'], ['wikiCatalogue', '## Canonical references'],
  ['wikiMaintenance', '## Canonical references'], ['planPrompt', '## Process'],
  ['implementPrompt', '## Process'], ['reviewPrompt', '## Process'],
  ['lifecycleInstruction', '## Validation boundaries']
]) {
  // Insert inside the relevant normative section, not before the next heading
  // for catalogue/maintenance whose Skills/diagnostic sections end earlier.
  const target = key === 'wikiCatalogue'
    ? '| Convert requirements and evidence into an implementation plan'
    : key === 'wikiMaintenance' ? 'The retained [archive-boundary fixture suite]' : boundary;
  for (const contradiction of ['Checkpoint planning is optional.', 'A generic blanket exception is sufficient.']) {
    rejectCheckpoint(`${key} additive optional-planning contradiction`, key, target,
      `${contradiction}\n\n${target}`, key, 'contradictory optional checkpoint planning or prohibition bypass');
  }
}

const runnerPath = agentPath('Script Runner');
const runner = agents.get(runnerPath);
for (const [label, mutate] of [
  ['Runner edit tool', (values) => { values.tools = "['read', 'search', 'runInTerminal', 'edit']"; }],
  ['Runner agent tool', (values) => { values.tools = "['read', 'search', 'runInTerminal', 'agent']"; }],
  ['Runner user invocation', (values) => { values['user-invocable'] = 'true'; }],
  ['Runner nested delegation', (values) => { values.agents = "['Implement']"; }],
  ['Runner handoff declaration', (values) => { values.handoffs = ''; }]
]) {
  const values = clone(runner.values);
  mutate(values);
  assertRejected(label, () => contracts.checkAgentMetadata(runnerPath, values, runner.blocks, agentNames));
}

const planPath = agentPath('Plan');
const plan = agents.get(planPath);
const expandedCoordinatorTools = clone(plan.values);
expandedCoordinatorTools.tools = "['read', 'search', 'edit', 'agent', 'runInTerminal']";
assertRejected('coordinator terminal-tool expansion', () => contracts.checkAgentMetadata(
  planPath, expandedCoordinatorTools, plan.blocks, agentNames
));
const expandedDelegates = clone(plan.values);
expandedDelegates.agents = "['Requirements Analyst', 'Architecture Analyst', 'Test Strategist', 'Domain Investigator', 'Feasibility Investigator', 'Stage Assurance', 'Script Runner', 'Test Worker']";
assertRejected('coordinator delegation expansion', () => contracts.checkAgentMetadata(
  planPath, expandedDelegates, plan.blocks, agentNames
));

const implementPath = agentPath('Implement');
const implement = agents.get(implementPath);
const handoffCases = [
  ['automatic handoff', implement.blocks.handoffs.map((line) => line.replace('send: false', 'send: true'))],
  ['wrong handoff target', implement.blocks.handoffs.map((line) => line.replace('agent: Review', 'agent: Plan'))],
  ['incomplete handoff', implement.blocks.handoffs.filter((line) => !line.includes('prompt:'))]
];
for (const [label, handoffs] of handoffCases) {
  assertRejected(label, () => contracts.parseHandoffs(implementPath, handoffs, ['Review'], agentNames));
}
const wrongPromptRoute = contracts.parseFrontmatterText(
  readArtifact('.github/prompts/plan.prompt.md'),
  '.github/prompts/plan.prompt.md'
).values;
wrongPromptRoute.agent = 'Implement';
assertRejected('wrong prompt route', () => contracts.checkPromptMetadata(
  '.github/prompts/plan.prompt.md', wrongPromptRoute, agentNames
));

// Isolate each defect to one manifest surface. Check the diagnostic so a
// contribution failure cannot be masked by an earlier controlled-files failure.
const checkpointSkill = '.github/skills/local-git-checkpoints/SKILL.md';
const adrSkill = '.github/skills/architecture-decision-records/SKILL.md';
for (const skill of [checkpointSkill, adrSkill]) {
  for (const surface of ['files', 'contributes.chatSkills']) {
    for (const defect of ['missing', 'duplicate', 'misordered']) {
    const fixture = clone(manifest);
    const entries = surface === 'files' ? fixture.files : fixture.contributes.chatSkills;
    const expectedPath = surface === 'files' ? path.posix.dirname(skill) : skill;
    const currentIndex = entries.findIndex((entry) => (
      typeof entry === 'string' ? entry : entry.path
    ) === expectedPath);
    assert.ok(currentIndex >= 0 && currentIndex + 1 < entries.length);
    if (defect === 'missing') entries.splice(currentIndex, 1);
    if (defect === 'duplicate') entries.push(clone(entries[currentIndex]));
    if (defect === 'misordered') {
      [entries[currentIndex], entries[currentIndex + 1]] = [entries[currentIndex + 1], entries[currentIndex]];
    }
    if (surface === 'files') {
      assert.deepEqual(fixture.contributes, manifest.contributes);
    } else {
      assert.deepEqual(fixture.files, manifest.files);
    }
    const diagnostic = surface === 'files'
      ? /controlled files do not match shared discovery inventory/
      : /contributes\.chatSkills does not match shared discovery inventory/;
    assertRejected(`${defect} skill in ${surface}`, () => contracts.checkManifestParity(fixture, inventory), diagnostic);
    }
  }
}
cases += 6;

for (const [label, contribution] of [
  ['directory-valued skill contribution', '.github/skills/local-git-checkpoints'],
  ['doubled skill filename', '.github/skills/local-git-checkpoints/SKILL.md/SKILL.md']
]) {
  const fixture = clone(manifest);
  const entry = fixture.contributes.chatSkills.find((item) => item.path === checkpointSkill);
  assert.ok(entry);
  entry.path = contribution;
  assertRejected(label, () => contracts.checkManifestParity(fixture, inventory),
    /contributes\.chatSkills does not match shared discovery inventory/);
}

assertRejected('unresolved Skill resource link', () => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[missing](references/not-present.md)'
));
assertRejected('escaping Skill resource link', () => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[outside](../../../../README.md)'
));

// The packaging Run Book must describe only implemented interfaces and keep
// confirmed release-input writes separately bounded and interactive.
const runbookPath = 'docs/run-books/vsix-packaging.md';
const runbook = readArtifact(runbookPath);
const runbookSkill = readArtifact('.github/skills/create-runbook/SKILL.md');
const runbookTemplate = readArtifact('.github/skills/create-runbook/templates/runbook.md');
const packagingScripts = JSON.parse(readArtifact('package.json')).scripts;
const prepareVsix = require('../scripts/prepare-vsix.cjs');
assert.equal(packagingScripts['prepare-vsix'], 'node scripts/prepare-vsix.cjs prepare');
assert.equal(packagingScripts['inspect-vsix-candidate'], 'node scripts/prepare-vsix.cjs inspect');
assert.equal(packagingScripts['confirm-release-inputs'], 'node scripts/prepare-vsix.cjs release-inputs');
assert.deepEqual(prepareVsix.validateArguments(['prepare']), { command: 'prepare' });
assert.deepEqual(prepareVsix.validateArguments(['inspect', '--candidate', 'candidate']), {
  command: 'inspect', candidateDirectory: 'candidate'
});
assert.deepEqual(prepareVsix.validateArguments([
  'release-inputs', '--version', '2.4.8', '--change-summary', 'Evidence summary',
  '--expected-pending-notes', 'old notes', '--proposed-notes', 'new notes'
]), {
  command: 'release-inputs', version: '2.4.8', changeSummary: 'Evidence summary',
  expectedPendingNotes: 'old notes', proposedNotes: 'new notes'
});
assert.equal(typeof prepareVsix.applyConfirmedReleaseInputs, 'function',
  'the confirmed-input helper API exists separately from an operational CLI');
for (const [label, text] of [
  ['Run Book', runbook],
  ['authoring Skill', runbookSkill],
  ['authoring template', runbookTemplate]
]) {
  assert.match(text, /Run Book itself|Run Books?.*never|does not confer/i,
    `${label} must not make itself authority`);
}
assert.match(runbook, /npm run prepare-vsix/);
assert.match(runbook, /npm run inspect-vsix-candidate -- --candidate <explicit-candidate-directory>/);
assert.match(runbook, /Releases\/YYYY-MM-DD\/HHmmssZ-<unique-id>\//);
assert.match(runbook, /candidate\.json.*verification-evidence\.json.*status\.json/s);
assert.match(runbook, /pending\/unknown/);
assert.match(runbook, /exact candidate.*SHA-256/s);
assert.match(runbook, /maintainer owns backup outside this workflow/i);
assert.match(runbook, /npm run confirm-release-inputs/);
assert.match(runbook, /--change-summary .*--expected-pending-notes .*--proposed-notes/);
assert.match(runbook, /interactive `CONFIRM <version>` response/i);
assert.match(runbook, /partial state without rollback/i);
assert.match(runbook, /current pending text to match exactly once.*replacement must begin with/s);
assert.match(runbook, /## Operating mode and authority/);
assert.match(runbookSkill, /specifically authorized.*Agent-followable/is);
assert.match(runbookSkill, /never Script Runner command-selection input/i);
assert.match(runbookTemplate, /## Operating mode and authority/);
assert.doesNotThrow(() => contracts.checkLocalLinks(runbookPath, runbook));
assert.doesNotThrow(() => contracts.checkLocalLinks(
  '.github/skills/create-runbook/SKILL.md', runbookSkill
));
assert.doesNotThrow(() => contracts.checkLocalLinks(
  '.github/skills/create-runbook/templates/runbook.md', runbookTemplate
));
const repositoryPolicy = readArtifact('.github/copilot-instructions.md');
const packagingPolicy = repositoryPolicy.split('\n## Packaging\n')[1] || '';
const packagingWorkflow = readArtifact('.github/workflows/package.yml');
assert.match(packagingPolicy, /^### Prospective local candidate preparation/m);
assert.match(packagingPolicy, /built-in VS Code Agent mode may follow the canonical \[VSIX candidate preparation Run Book\]/);
assert.match(packagingPolicy, /explicit interactive confirmation/);
assert.match(packagingPolicy, /prepare, verify, retain and hand off one local candidate/);
assert.match(packagingPolicy, /agent stops after candidate handoff/);
assert.match(packagingPolicy, /do not self-upgrade a currently loaded session/);
for (const prohibited of [
  'dependency installation', 'manifest synchronization', 'arbitrary source/customization edits',
  'Git effects', 'installation/activation', 'manual testing', 'credentials',
  'network/account queries', 'publication', 'backup', 'archive migration/pruning',
  "changes to Script Runner's tools or role"
]) assert.ok(packagingPolicy.includes(prohibited), `Prospective packaging policy must retain prohibition: ${prohibited}`);
assert.match(packagingWorkflow, /package:\s*\n\s+if: false/,
  'the hosted package job remains disabled');
assert.match(packagingPolicy, /Real packaging remains deferred outside this prospective local-candidate task/);
cases += 38;

console.log(`Passed ${cases} Copilot contract cases, including valid structure and rejected privilege/parity/link defects.`);
