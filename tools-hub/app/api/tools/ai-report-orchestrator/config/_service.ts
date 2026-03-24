import { promises as fs } from "node:fs";
import { constants as fsConstants } from "node:fs";
import os from "node:os";
import path from "node:path";
import type {
  AuditEntry,
  CaseMappingEntry,
  ConfigInitState,
  FallbackExecutionResult,
  ModelEntry,
  OrchestratorConfig,
  ProviderEntry,
  PromptVersionEntry,
  ResolvedExecutionConfig,
} from "@/tools/ai-report-orchestrator/lib/config-types";

const CONFIG_SCHEMA_VERSION = 1;
const CONFIG_FILE_NAME = "config.json";
const MAX_AUDIT_ITEMS = 1000;

const REMOTE_CONFIG_URL = process.env.AI_REPORT_ORCHESTRATOR_REMOTE_CONFIG_URL;
const REMOTE_CONFIG_TOKEN = process.env.AI_REPORT_ORCHESTRATOR_REMOTE_CONFIG_TOKEN;

let cachedConfig: OrchestratorConfig | null = null;
let cachedInitState: ConfigInitState | null = null;
let resolvedConfigDir: string | null = null;

function nowISO() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function sanitizePrompt(prompt: string) {
  const stripped = prompt
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/BEGIN\s+PRIVATE\s+KEY/gi, "[REDACTED_PRIVATE_KEY]")
    .replace(/password\s*=\s*[^\s\n]+/gi, "password=[REDACTED]")
    .trim();
  return stripped.slice(0, 64_000);
}

function buildBaselineConfig(): OrchestratorConfig {
  const createdAt = nowISO();

  const openRouterProvider: ProviderEntry = {
    id: "openrouter",
    nombre: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1",
    credenciales: {
      tipo: "apiKey",
      secretRef: "secrets://ai/openrouter/api_key",
    },
    prioridad: 1,
    activo: true,
    createdAt,
    updatedAt: createdAt,
  };

  const defaultPrompt =
    "Sos un analista ejecutivo. Entrega respuestas claras, estructuradas y accionables en espanol.";

  const openRouterModel: ModelEntry = {
    id: "openrouter/openai/gpt-4o-mini",
    nombre: "GPT-4o mini via OpenRouter",
    providerId: openRouterProvider.id,
    providerNombre: openRouterProvider.nombre,
    prompt: defaultPrompt,
    activo: true,
    version: 1,
    metadatos: {
      temperature: 0.2,
      maxTokens: 4096,
      tags: ["default", "orchestrator"],
    },
    promptHistory: [
      {
        version: 1,
        prompt: defaultPrompt,
        updatedAt: createdAt,
        updatedBy: "system",
        changeNote: "initial baseline",
      },
    ],
    createdAt,
    updatedAt: createdAt,
  };

  return {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    updatedAt: createdAt,
    defaultModelId: openRouterModel.id,
    providers: [openRouterProvider],
    models: [openRouterModel],
    promptVersions: {
      [openRouterModel.id]: clone(openRouterModel.promptHistory ?? []),
    },
    caseMappings: {},
    auditTrail: [
      {
        id: crypto.randomUUID(),
        at: createdAt,
        actor: "system",
        action: "create",
        entityType: "config",
        entityId: "baseline",
        changes: {
          message: "Baseline configuration created with OpenRouter as default provider",
        },
      },
    ],
  };
}

function validateConfig(config: OrchestratorConfig): string[] {
  const errors: string[] = [];

  if (config.schemaVersion < 1) {
    errors.push("schemaVersion must be >= 1");
  }

  if (!Array.isArray(config.providers) || config.providers.length === 0) {
    errors.push("at least one provider is required");
  }

  if (!Array.isArray(config.models) || config.models.length === 0) {
    errors.push("at least one model is required");
  }

  const providerMap = new Map(config.providers.map((provider) => [provider.id, provider]));
  const modelMap = new Map(config.models.map((model) => [model.id, model]));

  const defaultModel = modelMap.get(config.defaultModelId);
  if (!defaultModel || !defaultModel.activo) {
    errors.push("defaultModelId must point to an active existing model");
  }

  for (const provider of config.providers) {
    if (!provider.id?.trim()) {
      errors.push("provider.id is required");
    }

    if (!provider.nombre?.trim()) {
      errors.push(`provider.nombre is required: ${provider.id || "unknown"}`);
    }

    try {
      new URL(provider.endpoint);
    } catch {
      errors.push(`provider.endpoint must be a valid URL: ${provider.id}`);
    }

    if (!provider.credenciales?.secretRef?.trim()) {
      errors.push(`provider.credenciales.secretRef is required: ${provider.id}`);
    }
  }

  for (const model of config.models) {
    if (!model.id?.trim()) {
      errors.push("model.id is required");
      continue;
    }

    const provider = providerMap.get(model.providerId);
    if (!provider || provider.activo === false) {
      errors.push(`model.providerId must reference an active provider: ${model.id}`);
      continue;
    }

    if (model.providerNombre !== provider.nombre) {
      errors.push(`model.providerNombre mismatch for model: ${model.id}`);
    }

    if (!model.prompt?.trim()) {
      errors.push(`model.prompt is required: ${model.id}`);
    }
  }

  for (const [caseId, mapping] of Object.entries(config.caseMappings)) {
    if (mapping.mode === "override") {
      if (!mapping.modelId) {
        errors.push(`case mapping override must include modelId: ${caseId}`);
      } else {
        const model = modelMap.get(mapping.modelId);
        if (!model || !model.activo) {
          errors.push(`case mapping modelId must exist and be active: ${caseId}`);
        }
      }
    }

    for (const fallbackModelId of mapping.fallbackModelIds ?? []) {
      const fallbackModel = modelMap.get(fallbackModelId);
      if (!fallbackModel || !fallbackModel.activo) {
        errors.push(`case mapping fallback model must exist and be active: ${caseId}`);
      }
    }
  }

  return errors;
}

async function ensureConfigDir() {
  const configured = process.env.AI_REPORT_ORCHESTRATOR_CONFIG_DIR?.trim();
  const candidates = [
    configured,
    path.join(process.cwd(), ".data", "ai-report-orchestrator"),
    path.join(os.tmpdir(), "tools-hub", "ai-report-orchestrator"),
  ].filter((value): value is string => Boolean(value));

  if (resolvedConfigDir) {
    return resolvedConfigDir;
  }

  for (const candidate of candidates) {
    try {
      await fs.mkdir(candidate, { recursive: true });
      await fs.access(candidate, fsConstants.W_OK);
      resolvedConfigDir = candidate;
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("Unable to find a writable config directory");
}

function getConfigFilePathFromDir(dir: string) {
  return path.join(dir, CONFIG_FILE_NAME);
}

async function readLocalConfig(): Promise<OrchestratorConfig | null> {
  const configured = process.env.AI_REPORT_ORCHESTRATOR_CONFIG_DIR?.trim();
  const candidateDirs = [
    configured,
    resolvedConfigDir,
    path.join(process.cwd(), ".data", "ai-report-orchestrator"),
    path.join(os.tmpdir(), "tools-hub", "ai-report-orchestrator"),
  ].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

  for (const dir of candidateDirs) {
    try {
      const raw = await fs.readFile(getConfigFilePathFromDir(dir), "utf-8");
      const parsed = JSON.parse(raw) as unknown;
      if (!isObject(parsed)) {
        continue;
      }
      resolvedConfigDir = dir;
      return parsed as unknown as OrchestratorConfig;
    } catch {
      continue;
    }
  }

  return null;
}

async function writeLocalConfig(config: OrchestratorConfig) {
  const dir = await ensureConfigDir();
  const configFile = getConfigFilePathFromDir(dir);
  const nextPath = `${configFile}.tmp`;
  await fs.writeFile(nextPath, JSON.stringify(config, null, 2), "utf-8");
  await fs.rename(nextPath, configFile);
}

async function readRemoteConfig(): Promise<OrchestratorConfig | null> {
  if (!REMOTE_CONFIG_URL) {
    return null;
  }

  try {
    const headers = new Headers();
    if (REMOTE_CONFIG_TOKEN) {
      headers.set("Authorization", `Bearer ${REMOTE_CONFIG_TOKEN}`);
    }

    const response = await fetch(REMOTE_CONFIG_URL, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const parsed = (await response.json()) as unknown;
    if (!isObject(parsed)) {
      return null;
    }

    if (isObject(parsed.config)) {
      return parsed.config as unknown as OrchestratorConfig;
    }

    return parsed as unknown as OrchestratorConfig;
  } catch {
    return null;
  }
}

function syncDerivedFields(config: OrchestratorConfig) {
  const providerMap = new Map(config.providers.map((provider) => [provider.id, provider]));

  for (const model of config.models) {
    const provider = providerMap.get(model.providerId);
    if (provider) {
      model.providerNombre = provider.nombre;
    }
    model.prompt = sanitizePrompt(model.prompt);
    model.promptHistory = model.promptHistory ?? [];
    config.promptVersions[model.id] = clone(model.promptHistory);
  }
}

function addAudit(
  config: OrchestratorConfig,
  actor: string,
  action: AuditEntry["action"],
  entityType: AuditEntry["entityType"],
  entityId: string,
  changes: Record<string, unknown>
) {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    at: nowISO(),
    actor,
    action,
    entityType,
    entityId,
    changes,
  };

  config.auditTrail.unshift(entry);
  if (config.auditTrail.length > MAX_AUDIT_ITEMS) {
    config.auditTrail = config.auditTrail.slice(0, MAX_AUDIT_ITEMS);
  }
}

async function persistAndCache(nextConfig: OrchestratorConfig) {
  syncDerivedFields(nextConfig);
  const errors = validateConfig(nextConfig);
  if (errors.length > 0) {
    throw new Error(`Invalid orchestrator config: ${errors.join("; ")}`);
  }

  nextConfig.updatedAt = nowISO();
  try {
    await writeLocalConfig(nextConfig);
  } catch (error) {
    console.warn("[AIReportOrchestrator] local config persistence disabled", error);
  }
  cachedConfig = nextConfig;
  return nextConfig;
}

export async function initializeOrchestratorConfig() {
  if (cachedConfig && cachedInitState) {
    return {
      config: clone(cachedConfig),
      init: clone(cachedInitState),
    };
  }

  const warnings: string[] = [];

  const remoteCandidate = await readRemoteConfig();
  if (remoteCandidate) {
    const remoteErrors = validateConfig(remoteCandidate);
    if (remoteErrors.length === 0) {
      syncDerivedFields(remoteCandidate);
      try {
        await writeLocalConfig(remoteCandidate);
      } catch (error) {
        warnings.push(
          `remote config loaded but local cache write failed: ${
            error instanceof Error ? error.message : "unknown error"
          }`
        );
      }
      cachedConfig = remoteCandidate;
      cachedInitState = {
        source: "remote",
        status: "success",
        warnings,
      };
      return {
        config: clone(remoteCandidate),
        init: clone(cachedInitState),
      };
    }
    warnings.push(`remote config invalid: ${remoteErrors.join(", ")}`);
  }

  const localCandidate = await readLocalConfig();
  if (localCandidate) {
    const localErrors = validateConfig(localCandidate);
    if (localErrors.length === 0) {
      syncDerivedFields(localCandidate);
      cachedConfig = localCandidate;
      cachedInitState = {
        source: "local",
        status: warnings.length > 0 ? "degraded" : "success",
        warnings,
      };
      return {
        config: clone(localCandidate),
        init: clone(cachedInitState),
      };
    }
    warnings.push(`local config invalid: ${localErrors.join(", ")}`);
  }

  const baseline = buildBaselineConfig();
  addAudit(baseline, "system", "import", "config", "init-fallback", {
    warnings,
    message: "Invalid or unavailable remote/local config. Baseline loaded.",
  });
  try {
    await writeLocalConfig(baseline);
  } catch (error) {
    warnings.push(
      `baseline loaded in memory only (local persistence unavailable): ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }

  cachedConfig = baseline;
  cachedInitState = {
    source: "baseline",
    status: "degraded",
    warnings,
  };

  return {
    config: clone(baseline),
    init: clone(cachedInitState),
  };
}

async function getMutableConfig() {
  const { config } = await initializeOrchestratorConfig();
  return config;
}

function requireProvider(config: OrchestratorConfig, providerId: string) {
  const provider = config.providers.find((item) => item.id === providerId);
  if (!provider) {
    throw new Error(`Provider not found: ${providerId}`);
  }
  return provider;
}

function requireModel(config: OrchestratorConfig, modelId: string) {
  const model = config.models.find((item) => item.id === modelId);
  if (!model) {
    throw new Error(`Model not found: ${modelId}`);
  }
  return model;
}

function ensureProviderNotUsed(config: OrchestratorConfig, providerId: string) {
  const used = config.models.some((model) => model.providerId === providerId && model.activo);
  if (used) {
    throw new Error("Cannot delete provider with active associated models");
  }
}

function ensureModelNotPinned(config: OrchestratorConfig, modelId: string) {
  if (config.defaultModelId === modelId) {
    throw new Error("Cannot delete model configured as defaultModelId");
  }

  const usedByCases = Object.entries(config.caseMappings).some(
    ([, mapping]) => mapping.mode === "override" && mapping.modelId === modelId
  );

  if (usedByCases) {
    throw new Error("Cannot delete model assigned to override case mappings");
  }
}

function resolveProviderFallbackOrder(config: OrchestratorConfig): string[] {
  const providerOrder = [...config.providers]
    .filter((provider) => provider.activo !== false)
    .sort((a, b) => (a.prioridad ?? 100) - (b.prioridad ?? 100))
    .map((provider) => provider.id);

  const modelOrder: string[] = [];
  for (const providerId of providerOrder) {
    for (const model of config.models) {
      if (model.providerId === providerId && model.activo) {
        modelOrder.push(model.id);
      }
    }
  }

  return modelOrder;
}

export async function updateDefaultModelId(actor: string, defaultModelId: string) {
  const config = await getMutableConfig();
  const model = requireModel(config, defaultModelId);
  if (!model.activo) {
    throw new Error("default model must be active");
  }

  const before = config.defaultModelId;
  config.defaultModelId = defaultModelId;
  addAudit(config, actor, "update", "config", "defaultModelId", {
    before,
    after: defaultModelId,
  });

  return persistAndCache(config);
}

export async function listProviders() {
  const { config } = await initializeOrchestratorConfig();
  return config.providers;
}

export async function createProvider(actor: string, input: ProviderEntry) {
  const config = await getMutableConfig();

  if (config.providers.some((provider) => provider.id === input.id)) {
    throw new Error("Provider id already exists");
  }

  const createdAt = nowISO();
  const provider: ProviderEntry = {
    ...input,
    id: input.id.trim(),
    nombre: input.nombre.trim(),
    endpoint: input.endpoint.trim(),
    credenciales: {
      ...input.credenciales,
      secretRef: input.credenciales.secretRef.trim(),
    },
    prioridad: input.prioridad ?? 100,
    activo: input.activo ?? true,
    createdAt,
    updatedAt: createdAt,
  };

  config.providers.push(provider);
  addAudit(config, actor, "create", "provider", provider.id, {
    created: provider,
  });

  await persistAndCache(config);
  return provider;
}

export async function updateProvider(actor: string, providerId: string, patch: Partial<ProviderEntry>) {
  const config = await getMutableConfig();
  const provider = requireProvider(config, providerId);
  const before = clone(provider);

  if (typeof patch.nombre === "string") {
    provider.nombre = patch.nombre.trim();
  }

  if (typeof patch.endpoint === "string") {
    provider.endpoint = patch.endpoint.trim();
  }

  if (isObject(patch.credenciales)) {
    provider.credenciales = {
      ...provider.credenciales,
      ...patch.credenciales,
    } as ProviderEntry["credenciales"];
  }

  if (typeof patch.prioridad === "number") {
    provider.prioridad = patch.prioridad;
  }

  if (typeof patch.activo === "boolean") {
    provider.activo = patch.activo;
  }

  provider.updatedAt = nowISO();

  addAudit(config, actor, "update", "provider", provider.id, {
    before,
    after: provider,
  });

  await persistAndCache(config);
  return provider;
}

export async function deleteProvider(actor: string, providerId: string) {
  const config = await getMutableConfig();
  requireProvider(config, providerId);
  ensureProviderNotUsed(config, providerId);

  config.providers = config.providers.filter((provider) => provider.id !== providerId);
  addAudit(config, actor, "delete", "provider", providerId, {
    message: "provider deleted",
  });

  await persistAndCache(config);
  return true;
}

export async function listModels() {
  const { config } = await initializeOrchestratorConfig();
  return config.models;
}

export async function createModel(actor: string, input: ModelEntry) {
  const config = await getMutableConfig();

  if (config.models.some((model) => model.id === input.id)) {
    throw new Error("Model id already exists");
  }

  const provider = requireProvider(config, input.providerId);
  if (provider.activo === false) {
    throw new Error("Cannot use inactive provider");
  }

  const createdAt = nowISO();
  const cleanPrompt = sanitizePrompt(input.prompt);

  const promptHistory: PromptVersionEntry[] = [
    {
      version: 1,
      prompt: cleanPrompt,
      updatedAt: createdAt,
      updatedBy: actor,
      changeNote: "initial",
    },
  ];

  const model: ModelEntry = {
    ...input,
    id: input.id.trim(),
    nombre: input.nombre.trim(),
    providerId: provider.id,
    providerNombre: provider.nombre,
    prompt: cleanPrompt,
    activo: input.activo ?? true,
    version: 1,
    metadatos: input.metadatos ?? {},
    promptHistory,
    createdAt,
    updatedAt: createdAt,
  };

  config.models.push(model);
  config.promptVersions[model.id] = clone(promptHistory);

  addAudit(config, actor, "create", "model", model.id, {
    created: model,
  });

  await persistAndCache(config);
  return model;
}

export async function updateModel(actor: string, modelId: string, patch: Partial<ModelEntry>) {
  const config = await getMutableConfig();
  const model = requireModel(config, modelId);
  const before = clone(model);

  if (typeof patch.nombre === "string") {
    model.nombre = patch.nombre.trim();
  }

  if (typeof patch.providerId === "string" && patch.providerId !== model.providerId) {
    const provider = requireProvider(config, patch.providerId);
    if (provider.activo === false) {
      throw new Error("Cannot assign inactive provider to model");
    }
    model.providerId = provider.id;
    model.providerNombre = provider.nombre;
  }

  if (typeof patch.activo === "boolean") {
    model.activo = patch.activo;
  }

  if (isObject(patch.metadatos)) {
    model.metadatos = {
      ...model.metadatos,
      ...patch.metadatos,
    };
  }

  model.updatedAt = nowISO();

  addAudit(config, actor, "update", "model", model.id, {
    before,
    after: model,
  });

  await persistAndCache(config);
  return model;
}

export async function updateModelPrompt(
  actor: string,
  modelId: string,
  prompt: string,
  changeNote?: string
) {
  const config = await getMutableConfig();
  const model = requireModel(config, modelId);
  const before = clone(model);

  const nextVersion = model.version + 1;
  const cleanPrompt = sanitizePrompt(prompt);

  model.version = nextVersion;
  model.prompt = cleanPrompt;
  model.updatedAt = nowISO();

  model.promptHistory = model.promptHistory ?? [];
  model.promptHistory.push({
    version: nextVersion,
    prompt: cleanPrompt,
    updatedAt: model.updatedAt,
    updatedBy: actor,
    changeNote: changeNote?.trim() || "prompt update",
  });

  config.promptVersions[model.id] = clone(model.promptHistory);

  addAudit(config, actor, "update", "prompt", model.id, {
    beforeVersion: before.version,
    afterVersion: model.version,
    changeNote: changeNote?.trim() || "prompt update",
  });

  await persistAndCache(config);
  return model;
}

export async function rollbackModelPrompt(actor: string, modelId: string, targetVersion: number) {
  const config = await getMutableConfig();
  const model = requireModel(config, modelId);
  const target = (model.promptHistory ?? []).find((entry) => entry.version === targetVersion);

  if (!target) {
    throw new Error("Prompt version not found");
  }

  const nextVersion = model.version + 1;
  model.version = nextVersion;
  model.prompt = target.prompt;
  model.updatedAt = nowISO();
  model.promptHistory = model.promptHistory ?? [];
  model.promptHistory.push({
    version: nextVersion,
    prompt: target.prompt,
    updatedAt: model.updatedAt,
    updatedBy: actor,
    changeNote: `rollback to v${targetVersion}`,
  });
  config.promptVersions[model.id] = clone(model.promptHistory);

  addAudit(config, actor, "rollback", "prompt", model.id, {
    targetVersion,
    newVersion: nextVersion,
  });

  await persistAndCache(config);
  return model;
}

export async function deleteModel(actor: string, modelId: string) {
  const config = await getMutableConfig();
  requireModel(config, modelId);
  ensureModelNotPinned(config, modelId);

  config.models = config.models.filter((model) => model.id !== modelId);
  delete config.promptVersions[modelId];

  for (const mapping of Object.values(config.caseMappings)) {
    mapping.fallbackModelIds = (mapping.fallbackModelIds ?? []).filter((item) => item !== modelId);
  }

  addAudit(config, actor, "delete", "model", modelId, {
    message: "model deleted",
  });

  await persistAndCache(config);
  return true;
}

export async function getCaseMapping(caseId: string) {
  const { config } = await initializeOrchestratorConfig();
  return config.caseMappings[caseId] ?? null;
}

export async function setCaseMapping(actor: string, caseId: string, mapping: CaseMappingEntry) {
  const config = await getMutableConfig();

  if (mapping.mode === "override") {
    if (!mapping.modelId) {
      throw new Error("modelId is required for override mode");
    }

    const model = requireModel(config, mapping.modelId);
    if (!model.activo) {
      throw new Error("override model must be active");
    }
  }

  for (const fallbackModelId of mapping.fallbackModelIds ?? []) {
    const fallbackModel = requireModel(config, fallbackModelId);
    if (!fallbackModel.activo) {
      throw new Error(`fallback model inactive: ${fallbackModelId}`);
    }
  }

  const before = config.caseMappings[caseId] ?? null;

  config.caseMappings[caseId] = {
    mode: mapping.mode,
    modelId: mapping.mode === "override" ? mapping.modelId : undefined,
    promptOverride: mapping.promptOverride ? sanitizePrompt(mapping.promptOverride) : undefined,
    fallbackModelIds: mapping.fallbackModelIds ?? [],
    updatedAt: nowISO(),
    updatedBy: actor,
  };

  addAudit(config, actor, "assign", "caseMapping", caseId, {
    before,
    after: config.caseMappings[caseId],
  });

  await persistAndCache(config);
  return config.caseMappings[caseId];
}

export async function deleteCaseMapping(actor: string, caseId: string) {
  const config = await getMutableConfig();
  const before = config.caseMappings[caseId];
  if (!before) {
    return false;
  }

  delete config.caseMappings[caseId];
  addAudit(config, actor, "unassign", "caseMapping", caseId, {
    before,
  });

  await persistAndCache(config);
  return true;
}

export async function resolveExecutionConfig(caseId: string): Promise<ResolvedExecutionConfig> {
  const { config } = await initializeOrchestratorConfig();
  const mapping = config.caseMappings[caseId];

  if (!mapping || mapping.mode === "inherit") {
    const model = requireModel(config, config.defaultModelId);
    const provider = requireProvider(config, model.providerId);
    return {
      caseId,
      model,
      provider,
      prompt: model.prompt,
      fallbackModelIds: [],
    };
  }

  const model = requireModel(config, mapping.modelId || config.defaultModelId);
  const provider = requireProvider(config, model.providerId);

  return {
    caseId,
    model,
    provider,
    prompt: sanitizePrompt(mapping.promptOverride || model.prompt),
    fallbackModelIds: mapping.fallbackModelIds ?? [],
  };
}

async function callProvider(
  provider: ProviderEntry,
  model: ModelEntry,
  prompt: string,
  payload: Record<string, unknown> | undefined,
  traceId: string
) {
  const failFromPayload = Array.isArray(payload?.simulateFailureFor)
    ? (payload?.simulateFailureFor as unknown[])
        .filter((value): value is string => typeof value === "string")
        .includes(model.id)
    : false;

  const forceError = Boolean(model.metadatos?.forceError) || failFromPayload;
  if (forceError) {
    throw new Error(`Provider call failed for model ${model.id}`);
  }

  return {
    text: `trace=${traceId} provider=${provider.id} model=${model.id} promptLength=${prompt.length}`,
  };
}

export async function executeWithFallback(
  actor: string,
  caseId: string,
  payload?: Record<string, unknown>
): Promise<FallbackExecutionResult> {
  const config = await getMutableConfig();
  const resolved = await resolveExecutionConfig(caseId);
  const traceId = crypto.randomUUID();

  const candidateModelIds = Array.from(
    new Set([
      resolved.model.id,
      ...(resolved.fallbackModelIds ?? []),
      ...resolveProviderFallbackOrder(config),
      config.defaultModelId,
    ])
  );

  const attempts: FallbackExecutionResult["attempts"] = [];

  for (const modelId of candidateModelIds) {
    const model = config.models.find((item) => item.id === modelId && item.activo);
    if (!model) {
      continue;
    }

    const provider = config.providers.find(
      (item) => item.id === model.providerId && item.activo !== false
    );

    if (!provider) {
      continue;
    }

    const prompt = modelId === resolved.model.id ? resolved.prompt : model.prompt;

    try {
      const result = await callProvider(provider, model, prompt, payload, traceId);
      attempts.push({ modelId, providerId: provider.id, ok: true });

      addAudit(config, actor, "update", "config", "runtime", {
        event: "fallback-success",
        caseId,
        traceId,
        usedModelId: model.id,
        usedProviderId: provider.id,
      });
      await persistAndCache(config);

      return {
        traceId,
        usedModelId: model.id,
        usedProviderId: provider.id,
        usedPromptVersion: model.version,
        responseText: result.text,
        attempts,
      };
    } catch (error) {
      attempts.push({
        modelId,
        providerId: provider.id,
        ok: false,
        error: error instanceof Error ? error.message : "unknown error",
      });
      continue;
    }
  }

  addAudit(config, actor, "update", "config", "runtime", {
    event: "fallback-failure",
    caseId,
    traceId,
    attempts,
  });
  await persistAndCache(config);

  throw new Error(`All configured model calls failed for case ${caseId}`);
}

function redactProvider(provider: ProviderEntry) {
  return {
    ...provider,
    credenciales: {
      ...provider.credenciales,
      secretRef: "[REDACTED]",
    },
  };
}

export async function exportConfig(redacted: boolean) {
  const { config } = await initializeOrchestratorConfig();
  const exportedConfig = clone(config);

  if (redacted) {
    exportedConfig.providers = exportedConfig.providers.map(redactProvider);
  }

  return {
    exportedAt: nowISO(),
    redacted,
    config: exportedConfig,
  };
}

export async function importConfig(actor: string, payload: unknown) {
  if (!isObject(payload)) {
    throw new Error("Invalid payload");
  }

  const candidate = isObject(payload.config) ? payload.config : payload;
  if (!isObject(candidate)) {
    throw new Error("Invalid payload.config");
  }

  const config = candidate as unknown as OrchestratorConfig;
  syncDerivedFields(config);
  const errors = validateConfig(config);
  if (errors.length > 0) {
    throw new Error(`Invalid import config: ${errors.join("; ")}`);
  }

  addAudit(config, actor, "import", "config", "import", {
    message: "configuration imported",
  });

  await persistAndCache(config);
  return config;
}

export async function getConfigState() {
  const initialized = await initializeOrchestratorConfig();
  return {
    ...initialized,
    availableCaseMappings: Object.keys(initialized.config.caseMappings),
  };
}
