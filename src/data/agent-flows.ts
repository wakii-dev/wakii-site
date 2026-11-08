/**
 * Agent flow data for the /agents modal diagrams (hướng C — horizontal
 * swimlane per category). Contract enforced by scripts/check-agent-modal.mjs
 * (AC3 + AC8): exactly one entry per agent id from src/data/agents-skills.ts
 * (28 agents). An entry with non-empty `tracks` drives the dialog's SVG
 * swimlane render (build-time); an entry without tracks falls back to the
 * generic per-category diagram (execution | review | ops | knowledge | infra).
 *
 * SKELETON — intentionally empty so AC8 runs RED until implemented.
 * SKELETON: no entries yet, /agents modal implementation phase fills it.
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

export const agentFlows: Record<string, AgentFlow> = {};
