/**
 * Agent flow data for the /agents modal diagrams (hướng C — horizontal
 * swimlane per category). Contract enforced by scripts/check-agent-modal.mjs
 * (AC3 + AC8): exactly one entry per agent id from src/data/agents-skills.ts
 * (28 agents). An entry with non-empty `tracks` drives the dialog's SVG
 * swimlane render (build-time); an entry without tracks falls back to the
 * generic per-category diagram (execution | review | ops | knowledge | infra).
 */
export interface AgentFlowStep {
  /** Lane (actor) this step belongs to — one lane per swimlane track. */
  lane: string;
  /** Short step label shown inside the lane box. */
  label: string;
}

export interface AgentFlow {
  /** Category this flow belongs to (must match the agent's category). */
  category: 'execution' | 'review' | 'ops' | 'knowledge' | 'infra';
  /** Ordered swimlane steps; empty/omitted → generic fallback diagram. */
  tracks?: AgentFlowStep[];
}

export const agentFlows: Record<string, AgentFlow> = {
  // ---- execution (10) ------------------------------------------------------
  captain: {
    category: 'execution',
    tracks: [
      { lane: 'CEO', label: 'send order' },
      { lane: 'Captain', label: 'triage + route' },
      { lane: 'Captain', label: 'split task DAG' },
      { lane: 'Execution', label: 'workers run' },
      { lane: 'Review', label: 'gate verify' },
      { lane: 'Captain', label: 'report to CEO' },
    ],
  },
  'task-executor': {
    category: 'execution',
    tracks: [
      { lane: 'Captain', label: 'assign plan task' },
      { lane: 'Executor', label: 'read spec slice' },
      { lane: 'Executor', label: 'implement + test' },
      { lane: 'Executor', label: 'commit atomically' },
      { lane: 'Review', label: 'resolve gate' },
    ],
  },
  'be-dev': {
    category: 'execution',
    tracks: [
      { lane: 'Captain', label: 'scoped services/ task' },
      { lane: 'Backend', label: 'implement endpoint' },
      { lane: 'Backend', label: 'schema + migration' },
      { lane: 'Backend', label: 'tests + healthcheck' },
      { lane: 'Review', label: 'gate verify' },
    ],
  },
  'fe-dev': {
    category: 'execution',
    tracks: [
      { lane: 'Captain', label: 'scoped app/ task' },
      { lane: 'Frontend', label: 'build screen from kit' },
      { lane: 'Frontend', label: 'tokens + MF compose' },
      { lane: 'Frontend', label: 'vitest + build' },
      { lane: 'Review', label: 'gate verify' },
    ],
  },
  'ui-dev': {
    category: 'execution',
    tracks: [
      { lane: 'Captain', label: 'UI task from spec' },
      { lane: 'UI', label: 'compose @wakii/ui-kit' },
      { lane: 'UI', label: 'a11y + motion check' },
      { lane: 'Review', label: 'design gate' },
    ],
  },
  'mobile-dev': {
    category: 'execution',
    tracks: [
      { lane: 'Captain', label: 'Flutter task' },
      { lane: 'Mobile', label: 'build widgets' },
      { lane: 'Mobile', label: 'widget tests' },
      { lane: 'Mobile', label: 'run on emulator' },
      { lane: 'Review', label: 'gate verify' },
    ],
  },
  'code-simplifier': {
    category: 'execution',
    tracks: [
      { lane: 'Input', label: 'recent diff' },
      { lane: 'Simplifier', label: 'find duplication' },
      { lane: 'Simplifier', label: 'refine in place' },
      { lane: 'Review', label: 'behavior preserved' },
    ],
  },
  'doc-updater': {
    category: 'execution',
    tracks: [
      { lane: 'Trigger', label: 'code drift detected' },
      { lane: 'Docs', label: 'regenerate codemap' },
      { lane: 'Docs', label: 'update README' },
      { lane: 'Review', label: 'docs-only diff' },
    ],
  },
  'harness-optimizer': {
    category: 'execution',
    tracks: [
      { lane: 'Trigger', label: 'usage data' },
      { lane: 'Optimizer', label: 'eval grading pass@k' },
      { lane: 'Optimizer', label: 'apply cost fix' },
      { lane: 'Review', label: 'paired re-eval' },
    ],
  },
  'performance-optimizer': {
    category: 'execution',
    tracks: [
      { lane: 'Trigger', label: 'bottleneck report' },
      { lane: 'Profiler', label: 'profile hot path' },
      { lane: 'Profiler', label: 'targeted fix' },
      { lane: 'Profiler', label: 're-measure' },
      { lane: 'Review', label: 'regression check' },
    ],
  },

  // ---- review (12) ---------------------------------------------------------
  'a11y-architect': {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'UI change ready' },
      { lane: 'Auditor', label: 'WCAG 2.2 audit' },
      { lane: 'Auditor', label: 'flag violations' },
      { lane: 'Output', label: 'fix guidance' },
    ],
  },
  'code-reviewer': {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'diff ready' },
      { lane: 'Reviewer', label: 'read diff + context' },
      { lane: 'Reviewer', label: 'grade P0/P1/P2' },
      { lane: 'Output', label: 'review report' },
    ],
  },
  'design-system': {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'mock or direction in' },
      { lane: 'Guardian', label: 'check tokens + primitives' },
      { lane: 'Guardian', label: 'map to components' },
      { lane: 'Output', label: 'design-spec handoff' },
    ],
  },
  designer: {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'design brief' },
      { lane: 'Designer', label: 'draft 3 directions' },
      { lane: 'User', label: 'pick direction' },
      { lane: 'Designer', label: 'hand-off spec' },
    ],
  },
  'gate-keeper': {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'PR ready' },
      { lane: 'Gate', label: 'run verify + tests' },
      { lane: 'Gate', label: 'check PR checklist' },
      { lane: 'Output', label: 'PASS or block' },
    ],
  },
  mason: {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'DoD contract' },
      { lane: 'QA', label: 'write acceptance tests' },
      { lane: 'QA', label: 'assert RED first' },
      { lane: 'Output', label: 'tests for executor' },
    ],
  },
  'phase0-impact-analyst': {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'feature idea' },
      { lane: 'Analyst', label: 'map touch surface' },
      { lane: 'Analyst', label: 'grade blast radius' },
      { lane: 'User', label: 'approve direction' },
    ],
  },
  'plan-critic': {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'plan + task DAG' },
      { lane: 'Critic', label: 'check edges + granularity' },
      { lane: 'Critic', label: 'flag DAG defects' },
      { lane: 'Output', label: 'critique report' },
    ],
  },
  'pr-test-analyzer': {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'PR opened' },
      { lane: 'Analyzer', label: 'map behavior coverage' },
      { lane: 'Analyzer', label: 'flag real-bug gaps' },
      { lane: 'Output', label: 'coverage report' },
    ],
  },
  'security-audit': {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'pre-prod scope' },
      { lane: 'Auditor', label: 'vuln scan + threat model' },
      { lane: 'Auditor', label: 'grade P0/P1/P2' },
      { lane: 'Output', label: 'CLEAN or findings' },
    ],
  },
  'spec-critic': {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'spec draft' },
      { lane: 'Critic', label: 'adversarial read' },
      { lane: 'Critic', label: 'flag scope creep' },
      { lane: 'Output', label: 'critique report' },
    ],
  },
  verifier: {
    category: 'review',
    tracks: [
      { lane: 'Trigger', label: 'gate criteria' },
      { lane: 'Verifier', label: 'run exit criteria' },
      { lane: 'Verifier', label: 'grade P0/P1/P2' },
      { lane: 'Output', label: 'verdict' },
    ],
  },

  // ---- ops (4) ---------------------------------------------------------------
  'e2e-runner': {
    category: 'ops',
    tracks: [
      { lane: 'Trigger', label: 'verify request' },
      { lane: 'Operator', label: 'boot compose stack' },
      { lane: 'Operator', label: 'run smoke + e2e' },
      { lane: 'Operator', label: 'read logs on fail' },
      { lane: 'Output', label: 'convergence report' },
    ],
  },
  'loop-operator': {
    category: 'ops',
    tracks: [
      { lane: 'Trigger', label: 'loop running' },
      { lane: 'Operator', label: 'watch loop state' },
      { lane: 'Operator', label: 'intervene on stall' },
      { lane: 'Output', label: 'loop healthy' },
    ],
  },
  'rollback-fixer': {
    category: 'ops',
    tracks: [
      { lane: 'Trigger', label: 'diverge or verify-fail' },
      { lane: 'Operator', label: 'diagnose root cause' },
      { lane: 'Operator', label: 'safe revert (git revert)' },
      { lane: 'Output', label: 'audit trail kept' },
    ],
  },
  'story-medic': {
    category: 'ops',
    tracks: [
      { lane: 'Trigger', label: 'STALLED alert' },
      { lane: 'Medic', label: 'diagnose SF stall' },
      { lane: 'Medic', label: 'resume or respawn' },
      { lane: 'Output', label: 'story moving again' },
    ],
  },

  // ---- knowledge (1) ---------------------------------------------------------
  ba: {
    category: 'knowledge',
    tracks: [
      { lane: 'Captain', label: 'ask for CONFIRM' },
      { lane: 'Analyst', label: 'search knowledge base' },
      { lane: 'Analyst', label: 'cite business rule' },
      { lane: 'Output', label: 'confirmed answer' },
    ],
  },

  // ---- infra (1) -------------------------------------------------------------
  forge: {
    category: 'infra',
    tracks: [
      { lane: 'Trigger', label: 'infra change' },
      { lane: 'Platform', label: 'edit compose / CI' },
      { lane: 'Platform', label: 'run verify-quick' },
      { lane: 'Output', label: 'stack green' },
    ],
  },
};
