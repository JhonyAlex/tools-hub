"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AGENT_ROLES,
  type AgentConfigInput,
  type CustomProviderInput,
  type CustomProviderResponse,
  type OrchestratorSettingsResponse,
} from "@/tools/ai-report-orchestrator/lib/settings-types";

type SettingsPayload = {
  settings: OrchestratorSettingsResponse;
};

const PROVIDER_OPTIONS = ["openrouter", "openai", "anthropic", "google", "groq"];

const AGENT_LABELS: Record<(typeof AGENT_ROLES)[number], string> = {
  orchestrator: "Orquestador (Supervisor)",
  organizer: "Organizador de Documentos",
  visualizer: "Generador de Imagenes / Graficos",
  writer: "Redactor",
};

const API_KEY_PLACEHOLDERS: Record<string, string> = {
  openrouter: "sk-or-v1-...",
  openai: "sk-...",
  anthropic: "sk-ant-...",
  google: "AIza...",
  groq: "gsk_...",
};

const DEFAULT_AGENTS: AgentConfigInput[] = AGENT_ROLES.map((role) => ({
  role,
  provider: "openrouter",
  model: "deepseek/deepseek-chat-v3-0324",
  systemPrompt: "",
}));

type EditableCustomProvider = {
  _localId: string;
  id?: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  isDefault: boolean;
  hasExistingKey: boolean;
};

function createEmptyProvider(): EditableCustomProvider {
  return {
    _localId: crypto.randomUUID(),
    name: "",
    baseUrl: "",
    apiKey: "",
    defaultModel: "",
    isDefault: false,
    hasExistingKey: false,
  };
}

export function OrchestratorSettingsPanel() {
  const [settings, setSettings] = useState<OrchestratorSettingsResponse | null>(null);
  const [agents, setAgents] = useState<AgentConfigInput[]>(DEFAULT_AGENTS);
  const [globalProvider, setGlobalProvider] = useState("openrouter");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [customProviders, setCustomProviders] = useState<EditableCustomProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const providersWithStatus = useMemo(() => {
    const status = settings?.apiKeysStatus ?? {};
    return PROVIDER_OPTIONS.map((provider) => ({
      provider,
      configured: Boolean(status[provider]),
    }));
  }, [settings]);

  const allProviderOptions = useMemo(() => {
    const custom = customProviders.map((cp) => `custom:${cp._localId}`);
    return [...PROVIDER_OPTIONS, ...custom];
  }, [customProviders]);

  function getProviderLabel(provider: string) {
    if (provider.startsWith("custom:")) {
      const localId = provider.replace("custom:", "");
      const cp = customProviders.find((p) => p._localId === localId);
      return cp ? `⭐ ${cp.name || "Sin nombre"}` : provider;
    }
    return provider;
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/settings", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los ajustes.");
      }

      const data = (await response.json()) as SettingsPayload;
      setSettings(data.settings);
      setGlobalProvider(data.settings.globalProvider || "openrouter");
      setAgents(data.settings.agents.length > 0 ? data.settings.agents : DEFAULT_AGENTS);
      setApiKeys({});
      setCustomProviders(
        (data.settings.customProviders ?? []).map((cp) => ({
          _localId: cp.id,
          id: cp.id,
          name: cp.name,
          baseUrl: cp.baseUrl,
          apiKey: "",
          defaultModel: cp.defaultModel,
          isDefault: cp.isDefault,
          hasExistingKey: cp.hasApiKey,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function updateAgent(role: AgentConfigInput["role"], patch: Partial<AgentConfigInput>) {
    setAgents((prev) =>
      prev.map((agent) => (agent.role === role ? { ...agent, ...patch } : agent))
    );
  }

  function addCustomProvider() {
    setCustomProviders((prev) => [...prev, createEmptyProvider()]);
  }

  function removeCustomProvider(localId: string) {
    setCustomProviders((prev) => prev.filter((cp) => cp._localId !== localId));
  }

  function updateCustomProvider(localId: string, patch: Partial<EditableCustomProvider>) {
    setCustomProviders((prev) =>
      prev.map((cp) => (cp._localId === localId ? { ...cp, ...patch } : cp))
    );
  }

  function setDefaultCustomProvider(localId: string) {
    setCustomProviders((prev) =>
      prev.map((cp) => ({ ...cp, isDefault: cp._localId === localId }))
    );
  }

  async function saveSettings() {
    setSaving(true);
    setError(null);
    setOkMessage(null);

    // Validate custom providers
    for (const cp of customProviders) {
      if (!cp.name.trim()) {
        setError("Todos los modelos personalizados necesitan un nombre.");
        setSaving(false);
        return;
      }
      if (!cp.baseUrl.trim()) {
        setError(`URL Base es requerida para: ${cp.name || "modelo sin nombre"}`);
        setSaving(false);
        return;
      }
      if (!cp.defaultModel.trim()) {
        setError(`El ID del modelo es requerido para: ${cp.name || "modelo sin nombre"}`);
        setSaving(false);
        return;
      }
      if (!cp.id && !cp.apiKey.trim() && !cp.hasExistingKey) {
        setError(`La Clave API Dedicada es requerida para: ${cp.name}`);
        setSaving(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/settings", {
        method: settings ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalProvider,
          agents,
          apiKeys,
          customProviders: customProviders.map((cp) => ({
            id: cp.id,
            name: cp.name,
            baseUrl: cp.baseUrl,
            apiKey: cp.apiKey,
            defaultModel: cp.defaultModel,
            isDefault: cp.isDefault,
          })),
          defaultPreferences: {
            language: "es",
            outputStyle: "report_with_explanatory_images",
            tone: "professional",
          },
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudieron guardar los ajustes.");
      }

      const payload = (await response.json()) as SettingsPayload;
      setSettings(payload.settings);
      setApiKeys({});
      setOkMessage("Configuracion guardada en la nube.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !settings) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando ajustes avanzados...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <Card className="border-red-300 bg-red-50/60 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-4 text-sm text-red-700 dark:text-red-300">{error}</CardContent>
        </Card>
      ) : null}

      {okMessage ? (
        <Card className="border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-900/20">
          <CardContent className="pt-4 text-sm text-emerald-700 dark:text-emerald-300">
            {okMessage}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proveedor global y llaves API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Proveedor global por defecto</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={globalProvider}
              onChange={(event) => setGlobalProvider(event.target.value)}
            >
              {PROVIDER_OPTIONS.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {providersWithStatus.map((item) => (
              <div key={item.provider} className="rounded-lg border bg-background p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.provider}</p>
                  <Badge variant="outline">{item.configured ? "API Key guardada" : "Sin API Key"}</Badge>
                </div>
                <Input
                  type="password"
                  value={apiKeys[item.provider] || ""}
                  placeholder={API_KEY_PLACEHOLDERS[item.provider] || "API Key"}
                  onChange={(event) =>
                    setApiKeys((prev) => ({
                      ...prev,
                      [item.provider]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Modelos personalizados</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Agrega modelos con URL Base y Clave API dedicada (ej: MiMo, modelos locales, etc.)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addCustomProvider}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar modelo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {customProviders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay modelos personalizados configurados. Hace click en "Agregar modelo" para comenzar.
            </p>
          ) : (
            customProviders.map((cp) => (
              <div
                key={cp._localId}
                className={`rounded-lg border p-4 space-y-3 ${
                  cp.isDefault
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={cp.isDefault ? "default" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                      title="Marcar como predeterminado"
                      onClick={() => setDefaultCustomProvider(cp._localId)}
                    >
                      <Star
                        className={`h-4 w-4 ${cp.isDefault ? "fill-current" : ""}`}
                      />
                    </Button>
                    <span className="text-sm font-medium">
                      {cp.name || "Nuevo modelo"}
                    </span>
                    {cp.isDefault ? (
                      <Badge variant="outline" className="border-primary text-primary">
                        Predeterminado
                      </Badge>
                    ) : null}
                    {cp.hasExistingKey && !cp.apiKey ? (
                      <Badge variant="outline">API Key guardada</Badge>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeCustomProvider(cp._localId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Nombre</label>
                    <Input
                      value={cp.name}
                      onChange={(event) =>
                        updateCustomProvider(cp._localId, { name: event.target.value })
                      }
                      placeholder="MiMo v2.5 Pro"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">ID del Modelo</label>
                    <Input
                      value={cp.defaultModel}
                      onChange={(event) =>
                        updateCustomProvider(cp._localId, {
                          defaultModel: event.target.value,
                        })
                      }
                      placeholder="mimo-v2.5-pro"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">URL Base Dedicada</label>
                  <Input
                    value={cp.baseUrl}
                    onChange={(event) =>
                      updateCustomProvider(cp._localId, { baseUrl: event.target.value })
                    }
                    placeholder="https://api.xiaomimimo.com/v1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Clave API Dedicada</label>
                  <Input
                    type="password"
                    value={cp.apiKey}
                    onChange={(event) =>
                      updateCustomProvider(cp._localId, {
                        apiKey: event.target.value,
                        hasExistingKey: event.target.value.trim().length > 0 ? true : cp.hasExistingKey,
                      })
                    }
                    placeholder={
                      cp.hasExistingKey
                        ? "Dejar vacio para mantener la clave actual"
                        : "sk-..."
                    }
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuracion por agente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {AGENT_ROLES.map((role) => {
            const agent = agents.find((item) => item.role === role) || {
              role,
              provider: globalProvider,
              model: "",
              systemPrompt: "",
            };

            return (
              <div key={role} className="rounded-lg border bg-background p-4 space-y-3">
                <div>
                  <p className="font-medium">{AGENT_LABELS[role]}</p>
                  <p className="text-xs text-muted-foreground">role: {role}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Provider</label>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={agent.provider}
                      onChange={(event) =>
                        updateAgent(role, { provider: event.target.value })
                      }
                    >
                      {allProviderOptions.map((provider) => (
                        <option key={provider} value={provider}>
                          {getProviderLabel(provider)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Model</label>
                    <Input
                      value={agent.model}
                      onChange={(event) => updateAgent(role, { model: event.target.value })}
                      placeholder="deepseek/deepseek-v3.2"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">System Prompt</label>
                  <textarea
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={agent.systemPrompt}
                    onChange={(event) =>
                      updateAgent(role, { systemPrompt: event.target.value })
                    }
                    placeholder="Defini el comportamiento del agente"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button onClick={() => void saveSettings()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </Button>
        <Button variant="outline" onClick={() => void loadSettings()} disabled={saving}>
          Recargar
        </Button>
      </div>
    </div>
  );
}
