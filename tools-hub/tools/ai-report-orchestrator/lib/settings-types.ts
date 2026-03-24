export const AGENT_ROLES = ["orchestrator", "organizer", "visualizer", "writer"] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];

export interface AgentConfigInput {
  role: AgentRole;
  provider: string;
  model: string;
  systemPrompt: string;
}

export interface OrchestratorSettingsInput {
  globalProvider: string;
  defaultPreferences: Record<string, unknown>;
  apiKeys?: Record<string, string>;
  agents: AgentConfigInput[];
}

export interface OrchestratorSettingsResponse {
  id: string;
  userId: string;
  globalProvider: string;
  defaultPreferences: Record<string, unknown>;
  apiKeysStatus: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
  agents: AgentConfigInput[];
}

export interface WorkflowRunInput {
  title: string;
  goal: string;
  sources: Array<
    | { type: "file"; file: { name: string; size: number; mimeType: string } }
    | { type: "text"; title: string; content: string; format: "md" }
  >;
  language?: "es" | "en";
}

export interface WorkflowRunOutput {
  content: string;
  qualityScore: number;
  reviewCycles: number;
  usedAgents: AgentConfigInput[];
  log: string[];
}
