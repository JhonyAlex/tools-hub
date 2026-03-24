export interface ProviderCredentials {
  tipo: "apiKey" | "oauth2" | "token";
  secretRef: string;
  headers?: Record<string, string>;
  maskedPreview?: string;
}

export interface ProviderEntry {
  id: string;
  nombre: string;
  endpoint: string;
  credenciales: ProviderCredentials;
  prioridad?: number;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromptVersionEntry {
  version: number;
  prompt: string;
  updatedAt: string;
  updatedBy: string;
  changeNote?: string;
}

export interface ModelEntry {
  id: string;
  nombre: string;
  providerId: string;
  providerNombre: string;
  prompt: string;
  activo: boolean;
  version: number;
  metadatos: Record<string, unknown>;
  promptHistory?: PromptVersionEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseMappingEntry {
  mode: "inherit" | "override";
  modelId?: string;
  promptOverride?: string;
  fallbackModelIds?: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: "create" | "update" | "delete" | "assign" | "unassign" | "import" | "rollback";
  entityType: "provider" | "model" | "prompt" | "caseMapping" | "config";
  entityId: string;
  changes: Record<string, unknown>;
}

export interface OrchestratorConfig {
  schemaVersion: number;
  updatedAt: string;
  defaultModelId: string;
  providers: ProviderEntry[];
  models: ModelEntry[];
  promptVersions: Record<string, PromptVersionEntry[]>;
  caseMappings: Record<string, CaseMappingEntry>;
  auditTrail: AuditEntry[];
}

export interface ConfigInitState {
  source: "remote" | "local" | "baseline";
  status: "success" | "degraded";
  warnings: string[];
}

export interface ResolvedExecutionConfig {
  caseId: string;
  model: ModelEntry;
  provider: ProviderEntry;
  prompt: string;
  fallbackModelIds: string[];
}

export interface FallbackExecutionResult {
  traceId: string;
  usedModelId: string;
  usedProviderId: string;
  usedPromptVersion: number;
  responseText: string;
  attempts: Array<{ modelId: string; providerId?: string; ok: boolean; error?: string }>;
}
