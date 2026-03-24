import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { db } from "@/core/lib/db";
import {
  AGENT_ROLES,
  type AgentConfigInput,
  type AgentRole,
  type OrchestratorSettingsInput,
  type OrchestratorSettingsResponse,
} from "@/tools/ai-report-orchestrator/lib/settings-types";

const DEFAULT_PROVIDER = "openrouter";

const DEFAULT_MODELS: Record<AgentRole, string> = {
  orchestrator: "deepseek/deepseek-chat-v3-0324",
  organizer: "deepseek/deepseek-chat-v3-0324",
  visualizer: "deepseek/deepseek-chat-v3-0324",
  writer: "deepseek/deepseek-chat-v3-0324",
};

const DEFAULT_PROMPTS: Record<AgentRole, string> = {
  orchestrator:
    "Sos el agente supervisor. Tenes que planificar, evaluar la calidad final y pedir correcciones hasta que el reporte cumpla objetivo, claridad e integracion de visuales.",
  organizer:
    "Sos el organizador documental. Extrae ideas clave de las fuentes y crea una estructura de reporte accionable, sin inventar hechos.",
  visualizer:
    "Sos el generador de visuales. Define que graficos o diagramas hacen falta y entrega codigo Mermaid o especificacion de visual para reforzar el texto.",
  writer:
    "Sos el redactor final. Escribi un reporte completo, claro y profesional usando la estructura del organizador e integrando las visuales propuestas.",
};

const DEFAULT_PREFERENCES = {
  language: "es",
  outputStyle: "report_with_explanatory_images",
  tone: "professional",
};

const prisma = db as any;

type SettingsWithAgents = {
  id: string;
  userId: string;
  globalProvider: string;
  defaultPreferences: unknown;
  encryptedApiKeys: unknown;
  createdAt: Date;
  updatedAt: Date;
  agents: Array<{
    role: AgentRole;
    provider: string;
    model: string;
    systemPrompt: string;
  }>;
};

function getEncryptionKey() {
  const secret =
    process.env.ORCHESTRATOR_SETTINGS_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "tools-hub-dev-only-key-change-me";

  return createHash("sha256").update(secret).digest();
}

function encryptValue(plainText: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${encrypted.toString("base64")}:${tag.toString("base64")}`;
}

function decryptValue(payload: string) {
  const [ivRaw, encryptedRaw, tagRaw] = payload.split(":");
  if (!ivRaw || !encryptedRaw || !tagRaw) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivRaw, "base64")
    );
    decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedRaw, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

function normalizeAgentConfigs(input?: AgentConfigInput[]): AgentConfigInput[] {
  const map = new Map<AgentRole, AgentConfigInput>();

  for (const role of AGENT_ROLES) {
    map.set(role, {
      role,
      provider: DEFAULT_PROVIDER,
      model: DEFAULT_MODELS[role],
      systemPrompt: DEFAULT_PROMPTS[role],
    });
  }

  for (const item of input ?? []) {
    if (!AGENT_ROLES.includes(item.role)) {
      continue;
    }

    map.set(item.role, {
      role: item.role,
      provider: item.provider?.trim() || DEFAULT_PROVIDER,
      model: item.model?.trim() || DEFAULT_MODELS[item.role],
      systemPrompt: item.systemPrompt?.trim() || DEFAULT_PROMPTS[item.role],
    });
  }

  return AGENT_ROLES.map((role) => map.get(role)!);
}

function toResponse(settings: SettingsWithAgents): OrchestratorSettingsResponse {
  const encrypted = (settings.encryptedApiKeys ?? {}) as Record<string, string>;
  const apiKeysStatus: Record<string, boolean> = {};
  for (const [provider, value] of Object.entries(encrypted)) {
    apiKeysStatus[provider] = Boolean(value && decryptValue(value));
  }

  const defaultPreferences =
    settings.defaultPreferences && typeof settings.defaultPreferences === "object"
      ? (settings.defaultPreferences as Record<string, unknown>)
      : {};

  return {
    id: settings.id,
    userId: settings.userId,
    globalProvider: settings.globalProvider,
    defaultPreferences,
    apiKeysStatus,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
    agents: settings.agents.map((agent: SettingsWithAgents["agents"][number]) => ({
      role: agent.role,
      provider: agent.provider,
      model: agent.model,
      systemPrompt: agent.systemPrompt,
    })),
  };
}

function mergeApiKeys(existing: unknown, incoming?: Record<string, string>) {
  const current = (existing ?? {}) as Record<string, string>;
  if (!incoming) {
    return current;
  }

  const merged: Record<string, string> = { ...current };

  for (const [provider, key] of Object.entries(incoming)) {
    const trimmedProvider = provider.trim();
    if (!trimmedProvider) {
      continue;
    }

    if (!key?.trim()) {
      continue;
    }

    merged[trimmedProvider] = encryptValue(key.trim());
  }

  return merged;
}

async function createDefaultSettings(userId: string) {
  const agents = normalizeAgentConfigs();

  return prisma.orchestratorSettings.create({
    data: {
      userId,
      globalProvider: DEFAULT_PROVIDER,
      defaultPreferences: DEFAULT_PREFERENCES,
      encryptedApiKeys: {},
      agents: {
        create: agents.map((agent) => ({
          role: agent.role,
          provider: agent.provider,
          model: agent.model,
          systemPrompt: agent.systemPrompt,
        })),
      },
    },
    include: { agents: true },
  });
}

export async function getOrchestratorSettings(userId: string) {
  const existing = await prisma.orchestratorSettings.findUnique({
    where: { userId },
    include: { agents: true },
  });

  if (existing) {
    return toResponse(existing);
  }

  const created = await createDefaultSettings(userId);
  return toResponse(created);
}

export async function upsertOrchestratorSettings(
  userId: string,
  payload: Partial<OrchestratorSettingsInput>
) {
  const current = await prisma.orchestratorSettings.findUnique({
    where: { userId },
    include: { agents: true },
  });

  if (!current) {
    const created = await createDefaultSettings(userId);
    return updateOrchestratorSettings(userId, payload, created);
  }

  return updateOrchestratorSettings(userId, payload, current);
}

async function updateOrchestratorSettings(
  userId: string,
  payload: Partial<OrchestratorSettingsInput>,
  current: SettingsWithAgents
) {
  const nextGlobalProvider = payload.globalProvider?.trim() || current.globalProvider || DEFAULT_PROVIDER;
  const nextPreferences = {
    ...(typeof current.defaultPreferences === "object" && current.defaultPreferences
      ? (current.defaultPreferences as Record<string, unknown>)
      : {}),
    ...(payload.defaultPreferences ?? {}),
  };

  const nextApiKeys = mergeApiKeys(current.encryptedApiKeys, payload.apiKeys);
  const nextAgents = normalizeAgentConfigs(payload.agents ?? current.agents);

  const updated = await prisma.$transaction(async (tx: any) => {
    await tx.agentConfig.deleteMany({ where: { settingsId: current.id } });

    return tx.orchestratorSettings.update({
      where: { userId },
      data: {
        globalProvider: nextGlobalProvider,
        defaultPreferences: nextPreferences,
        encryptedApiKeys: nextApiKeys,
        agents: {
          create: nextAgents.map((agent) => ({
            role: agent.role,
            provider: agent.provider,
            model: agent.model,
            systemPrompt: agent.systemPrompt,
          })),
        },
      },
      include: { agents: true },
    });
  });

  return toResponse(updated);
}

export const ORCHESTRATOR_DEFAULT_PROMPTS = DEFAULT_PROMPTS;
