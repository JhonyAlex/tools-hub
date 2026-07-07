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
  customProviders?: CustomProviderInput[];
}

export interface CustomProviderInput {
  id?: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  isDefault?: boolean;
}

export interface CustomProviderResponse {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  isDefault: boolean;
  hasApiKey: boolean;
  createdAt: string;
  updatedAt: string;
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
  customProviders: CustomProviderResponse[];
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
