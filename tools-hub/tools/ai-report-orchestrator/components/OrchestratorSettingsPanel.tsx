"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Save, Settings2, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  CaseMappingEntry,
  ModelEntry,
  OrchestratorConfig,
  ProviderEntry,
} from "@/tools/ai-report-orchestrator/lib/config-types";

type SettingsState = {
  config: OrchestratorConfig;
  init: {
    source: "remote" | "local" | "baseline";
    status: "success" | "degraded";
    warnings: string[];
  };
};

type ResolveResult = {
  resolved: {
    caseId: string;
    model: { id: string; nombre: string };
    provider: { id: string; nombre: string };
    prompt: string;
  };
  execution: {
    traceId: string;
    usedModelId: string;
    usedProviderId: string;
    responseText: string;
    attempts: Array<{ modelId: string; ok: boolean; error?: string }>;
  };
};

type PurposeSetup = {
  caseId: string;
  title: string;
  description: string;
  whatItDoes: string;
  defaultPrompt: string;
};

type PurposeDraft = {
  providerId: string;
  modelId: string;
  prompt: string;
};

const PURPOSE_SETUPS: PurposeSetup[] = [
  {
    caseId: "orchestrator.default",
    title: "Orquestador de Informes",
    description: "Genera informes completos a partir de archivos y texto.",
    whatItDoes:
      "Lee fuentes, estructura hallazgos, redacta resumen ejecutivo y prepara salida final.",
    defaultPrompt:
      "Sos un analista ejecutivo. Escribi en espanol claro, con estructura y recomendaciones accionables.",
  },
  {
    caseId: "images.generate",
    title: "Generador de Imagenes",
    description: "Genera prompts e instrucciones para piezas visuales.",
    whatItDoes:
      "Traduce una idea de negocio en un brief visual claro y listo para generar imagenes.",
    defaultPrompt:
      "Sos un director de arte. Converti pedidos ambiguos en prompts visuales precisos, con estilo, encuadre y restricciones.",
  },
  {
    caseId: "assistant.general",
    title: "Asistente General",
    description: "Responde preguntas y apoya tareas generales.",
    whatItDoes:
      "Da respuestas directas, didacticas y orientadas a resolver rapido sin perder calidad.",
    defaultPrompt:
      "Sos un asistente practico. Responde con pasos claros, ejemplos concretos y lenguaje simple.",
  },
];

const EMPTY_PROVIDER: ProviderEntry = {
  id: "",
  nombre: "",
  endpoint: "",
  credenciales: {
    tipo: "apiKey",
    secretRef: "",
  },
  activo: true,
  prioridad: 100,
};

const EMPTY_MODEL: ModelEntry = {
  id: "",
  nombre: "",
  providerId: "",
  providerNombre: "",
  prompt: "",
  activo: true,
  version: 1,
  metadatos: {},
};

export function OrchestratorSettingsPanel() {
  const [data, setData] = useState<SettingsState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newProvider, setNewProvider] = useState<ProviderEntry>(EMPTY_PROVIDER);
  const [newModel, setNewModel] = useState<ModelEntry>(EMPTY_MODEL);

  const [caseId, setCaseId] = useState("orchestrator.default");
  const [caseMode, setCaseMode] = useState<"inherit" | "override">("inherit");
  const [caseModelId, setCaseModelId] = useState("");
  const [casePromptOverride, setCasePromptOverride] = useState("");
  const [caseFallbacks, setCaseFallbacks] = useState("");

  const [promptTargetModelId, setPromptTargetModelId] = useState("");
  const [promptText, setPromptText] = useState("");
  const [promptChangeNote, setPromptChangeNote] = useState("manual update");
  const [rollbackVersion, setRollbackVersion] = useState("1");

  const [ioJson, setIoJson] = useState("");
  const [resolveOutput, setResolveOutput] = useState<ResolveResult | null>(null);
  const [purposeDrafts, setPurposeDrafts] = useState<Record<string, PurposeDraft>>({});

  const models = useMemo(() => data?.config.models ?? [], [data]);
  const providers = useMemo(() => data?.config.providers ?? [], [data]);

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!newModel.providerId && providers.length > 0) {
      setNewModel((prev) => ({ ...prev, providerId: providers[0].id }));
    }
  }, [providers, newModel.providerId]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const nextDrafts: Record<string, PurposeDraft> = {};
    for (const purpose of PURPOSE_SETUPS) {
      const mapping = data.config.caseMappings[purpose.caseId];
      const mappedModelId = mapping?.mode === "override" ? mapping.modelId || "" : data.config.defaultModelId;
      const model = data.config.models.find((item) => item.id === mappedModelId);

      nextDrafts[purpose.caseId] = {
        providerId: model?.providerId || providers[0]?.id || "openrouter",
        modelId: model?.id || "",
        prompt: mapping?.promptOverride || model?.prompt || purpose.defaultPrompt,
      };
    }

    setPurposeDrafts(nextDrafts);
  }, [data, providers]);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/config", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("No se pudo cargar la configuracion");
      }
      const nextData = (await response.json()) as SettingsState;
      setData(nextData);
      if (!promptTargetModelId && nextData.config.models.length > 0) {
        setPromptTargetModelId(nextData.config.models[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function createProvider() {
    if (!newProvider.id || !newProvider.nombre || !newProvider.endpoint || !newProvider.credenciales.secretRef) {
      setError("Completa id, nombre, endpoint y secretRef del proveedor");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/config/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProvider),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo crear el proveedor");
      }

      setNewProvider(EMPTY_PROVIDER);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function ensureOpenRouterProvider() {
    const exists = providers.some((provider) => provider.id === "openrouter");
    if (exists) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/config/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "openrouter",
          nombre: "OpenRouter",
          endpoint: "https://openrouter.ai/api/v1",
          credenciales: {
            tipo: "apiKey",
            secretRef: "secrets://ai/openrouter/api_key",
          },
          prioridad: 1,
          activo: true,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo crear OpenRouter");
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProvider(providerId: string) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/tools/ai-report-orchestrator/config/providers/${providerId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo eliminar el proveedor");
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function createModel() {
    if (!newModel.id || !newModel.nombre || !newModel.providerId || !newModel.prompt) {
      setError("Completa id, nombre, providerId y prompt del modelo");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/config/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newModel),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo crear el modelo");
      }

      setNewModel((prev) => ({ ...EMPTY_MODEL, providerId: prev.providerId }));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function deleteModel(modelId: string) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/tools/ai-report-orchestrator/config/models/${modelId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo eliminar el modelo");
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function saveDefaultModel(defaultModelId: string) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultModelId }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo actualizar el modelo por defecto");
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function savePrompt() {
    if (!promptTargetModelId || !promptText.trim()) {
      setError("Selecciona modelo y define prompt");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/tools/ai-report-orchestrator/config/models/${promptTargetModelId}/prompt`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptText, changeNote: promptChangeNote }),
        }
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo actualizar el prompt");
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function rollbackPrompt() {
    if (!promptTargetModelId) {
      setError("Selecciona un modelo");
      return;
    }

    const targetVersion = Number.parseInt(rollbackVersion, 10);
    if (!Number.isFinite(targetVersion) || targetVersion < 1) {
      setError("Version invalida para rollback");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/tools/ai-report-orchestrator/config/models/${promptTargetModelId}/prompt/rollback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetVersion }),
        }
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo ejecutar rollback");
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function upsertCaseMapping() {
    if (!caseId.trim()) {
      setError("El caseId es obligatorio");
      return;
    }

    if (caseMode === "override" && !caseModelId) {
      setError("En modo override debes seleccionar modelId");
      return;
    }

    const fallbackModelIds = caseFallbacks
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setSaving(true);
    setError(null);
    try {
      const payload: CaseMappingEntry = {
        mode: caseMode,
        modelId: caseMode === "override" ? caseModelId : undefined,
        promptOverride: casePromptOverride.trim() || undefined,
        fallbackModelIds,
      };

      const response = await fetch(`/api/tools/ai-report-orchestrator/config/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responsePayload = (await response.json()) as { error?: string };
        throw new Error(responsePayload.error || "No se pudo guardar el mapping");
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCaseMapping() {
    if (!caseId.trim()) {
      setError("El caseId es obligatorio");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await fetch(`/api/tools/ai-report-orchestrator/config/cases/${caseId}`, {
        method: "DELETE",
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function doExport() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/config/export?redacted=true");
      if (!response.ok) {
        throw new Error("No se pudo exportar la configuracion");
      }
      const payload = (await response.json()) as Record<string, unknown>;
      setIoJson(JSON.stringify(payload, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function doImport() {
    if (!ioJson.trim()) {
      setError("Pega el JSON a importar");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const parsed = JSON.parse(ioJson) as unknown;
      const response = await fetch("/api/tools/ai-report-orchestrator/config/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo importar la configuracion");
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function runResolveTest() {
    if (!caseId.trim()) {
      setError("El caseId es obligatorio para probar fallback");
      return;
    }

    setSaving(true);
    setError(null);
    setResolveOutput(null);
    try {
      const response = await fetch("/api/tools/ai-report-orchestrator/config/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo resolver la ejecucion");
      }

      const payload = (await response.json()) as ResolveResult;
      setResolveOutput(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  function setPurposeDraft(caseId: string, patch: Partial<PurposeDraft>) {
    setPurposeDrafts((prev) => ({
      ...prev,
      [caseId]: {
        providerId: prev[caseId]?.providerId || providers[0]?.id || "openrouter",
        modelId: prev[caseId]?.modelId || "",
        prompt: prev[caseId]?.prompt || "",
        ...patch,
      },
    }));
  }

  async function savePurpose(caseId: string) {
    const purpose = PURPOSE_SETUPS.find((item) => item.caseId === caseId);
    const draft = purposeDrafts[caseId];

    if (!purpose || !draft) {
      setError("No se encontro la finalidad a guardar");
      return;
    }

    const modelId = draft.modelId.trim();
    if (!modelId) {
      setError("El modelo es obligatorio. Ejemplo: deepseek/deepseek-v3.2");
      return;
    }

    if (!draft.providerId) {
      setError("Selecciona un proveedor");
      return;
    }

    if (!draft.prompt.trim()) {
      setError("El prompt no puede estar vacio");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const existingModel = models.find((item) => item.id === modelId);

      if (!existingModel) {
        const createResponse = await fetch("/api/tools/ai-report-orchestrator/config/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: modelId,
            nombre: modelId,
            providerId: draft.providerId,
            providerNombre: providers.find((item) => item.id === draft.providerId)?.nombre || draft.providerId,
            prompt: draft.prompt,
            activo: true,
            version: 1,
            metadatos: { source: "simple-setup", purpose: caseId },
          }),
        });

        if (!createResponse.ok) {
          const payload = (await createResponse.json()) as { error?: string };
          throw new Error(payload.error || "No se pudo crear el modelo");
        }
      } else if (existingModel.providerId !== draft.providerId) {
        const patchResponse = await fetch(`/api/tools/ai-report-orchestrator/config/models/${modelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerId: draft.providerId }),
        });

        if (!patchResponse.ok) {
          const payload = (await patchResponse.json()) as { error?: string };
          throw new Error(payload.error || "No se pudo actualizar el proveedor del modelo");
        }
      }

      const promptResponse = await fetch(`/api/tools/ai-report-orchestrator/config/models/${modelId}/prompt`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: draft.prompt,
          changeNote: `simple setup: ${purpose.title}`,
        }),
      });

      if (!promptResponse.ok) {
        const payload = (await promptResponse.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo actualizar el prompt del modelo");
      }

      const mappingResponse = await fetch(`/api/tools/ai-report-orchestrator/config/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "override",
          modelId,
          promptOverride: draft.prompt,
          fallbackModelIds: [],
        }),
      });

      if (!mappingResponse.ok) {
        const payload = (await mappingResponse.json()) as { error?: string };
        throw new Error(payload.error || "No se pudo guardar la configuracion de finalidad");
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando ajustes...
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Estado de inicializacion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Source: {data?.init.source ?? "n/a"}</Badge>
            <Badge variant="outline">Status: {data?.init.status ?? "n/a"}</Badge>
          </div>
          {(data?.init.warnings ?? []).map((warning) => (
            <p key={warning} className="text-amber-700 dark:text-amber-300">{warning}</p>
          ))}
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={saving}>
            <Loader2 className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
            Recargar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuracion Basica (Desde Cero)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Paso 1: asegura OpenRouter. Paso 2: por cada finalidad, elegi proveedor, modelo (ej: deepseek/deepseek-v3.2) y edita su prompt.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => void ensureOpenRouterProvider()} disabled={saving}>
              Crear OpenRouter automaticamente
            </Button>
            <Badge variant="outline">
              Proveedor recomendado: {providers.some((item) => item.id === "openrouter") ? "OpenRouter activo" : "OpenRouter pendiente"}
            </Badge>
          </div>

          <div className="grid gap-4">
            {PURPOSE_SETUPS.map((purpose) => {
              const draft = purposeDrafts[purpose.caseId] || {
                providerId: providers[0]?.id || "openrouter",
                modelId: "",
                prompt: purpose.defaultPrompt,
              };

              return (
                <div key={purpose.caseId} className="rounded-lg border bg-background p-4 space-y-3">
                  <div>
                    <p className="font-medium">{purpose.title}</p>
                    <p className="text-xs text-muted-foreground">{purpose.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">Que hace este agente:</span> {purpose.whatItDoes}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">caseId: {purpose.caseId}</p>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Proveedor</label>
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={draft.providerId}
                        onChange={(event) =>
                          setPurposeDraft(purpose.caseId, { providerId: event.target.value })
                        }
                      >
                        {providers.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.nombre} ({provider.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Modelo</label>
                      <Input
                        value={draft.modelId}
                        onChange={(event) =>
                          setPurposeDraft(purpose.caseId, { modelId: event.target.value })
                        }
                        placeholder="deepseek/deepseek-v3.2"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Prompt del agente</label>
                    <textarea
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={draft.prompt}
                      onChange={(event) =>
                        setPurposeDraft(purpose.caseId, { prompt: event.target.value })
                      }
                      placeholder={purpose.defaultPrompt}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={() => void savePurpose(purpose.caseId)} disabled={saving}>
                      Guardar {purpose.title}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <details className="rounded-lg border bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium">Opciones avanzadas (opcional)</summary>
        <div className="mt-4 space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proveedores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(providers || []).map((provider) => (
              <div key={provider.id} className="rounded-lg border bg-background p-3 text-sm space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{provider.nombre}</p>
                  <Button size="icon" variant="ghost" onClick={() => void deleteProvider(provider.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">id: {provider.id}</p>
                <p className="text-xs text-muted-foreground">endpoint: {provider.endpoint}</p>
              </div>
            ))}

            <div className="grid gap-2 border-t pt-3">
              <Input placeholder="provider id" value={newProvider.id} onChange={(event) => setNewProvider((prev) => ({ ...prev, id: event.target.value }))} />
              <Input placeholder="nombre" value={newProvider.nombre} onChange={(event) => setNewProvider((prev) => ({ ...prev, nombre: event.target.value }))} />
              <Input placeholder="endpoint" value={newProvider.endpoint} onChange={(event) => setNewProvider((prev) => ({ ...prev, endpoint: event.target.value }))} />
              <Input placeholder="secretRef" value={newProvider.credenciales.secretRef} onChange={(event) => setNewProvider((prev) => ({ ...prev, credenciales: { ...prev.credenciales, secretRef: event.target.value } }))} />
              <Button onClick={() => void createProvider()} disabled={saving}>Agregar proveedor</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modelos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(models || []).map((model) => (
              <div key={model.id} className="rounded-lg border bg-background p-3 text-sm space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{model.nombre}</p>
                  <Button size="icon" variant="ghost" onClick={() => void deleteModel(model.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">id: {model.id}</p>
                <p className="text-xs text-muted-foreground">providerId: {model.providerId}</p>
                <p className="text-xs text-muted-foreground">version prompt: v{model.version}</p>
              </div>
            ))}

            <div className="grid gap-2 border-t pt-3">
              <Input placeholder="model id" value={newModel.id} onChange={(event) => setNewModel((prev) => ({ ...prev, id: event.target.value }))} />
              <Input placeholder="nombre" value={newModel.nombre} onChange={(event) => setNewModel((prev) => ({ ...prev, nombre: event.target.value }))} />
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={newModel.providerId}
                onChange={(event) => setNewModel((prev) => ({ ...prev, providerId: event.target.value }))}
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.id}</option>
                ))}
              </select>
              <textarea
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="prompt base del modelo"
                value={newModel.prompt}
                onChange={(event) => setNewModel((prev) => ({ ...prev, prompt: event.target.value }))}
              />
              <Button onClick={() => void createModel()} disabled={saving}>Agregar modelo</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Default + Prompt versionado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <label className="text-xs text-muted-foreground">Modelo por defecto del orquestador</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={data?.config.defaultModelId || ""}
              onChange={(event) => void saveDefaultModel(event.target.value)}
              disabled={saving}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>{model.id}</option>
              ))}
            </select>

            <label className="text-xs text-muted-foreground">Editar prompt por modelo</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={promptTargetModelId}
              onChange={(event) => setPromptTargetModelId(event.target.value)}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>{model.id}</option>
              ))}
            </select>
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
              placeholder="Nuevo prompt"
            />
            <Input value={promptChangeNote} onChange={(event) => setPromptChangeNote(event.target.value)} placeholder="change note" />
            <div className="flex gap-2">
              <Button onClick={() => void savePrompt()} disabled={saving}><Save className="h-4 w-4" />Guardar prompt</Button>
              <Input value={rollbackVersion} onChange={(event) => setRollbackVersion(event.target.value)} placeholder="v" />
              <Button variant="outline" onClick={() => void rollbackPrompt()} disabled={saving}>Rollback</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asignacion por caso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Input value={caseId} onChange={(event) => setCaseId(event.target.value)} placeholder="caseId" />
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={caseMode}
              onChange={(event) => setCaseMode(event.target.value as "inherit" | "override")}
            >
              <option value="inherit">inherit</option>
              <option value="override">override</option>
            </select>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={caseModelId}
              onChange={(event) => setCaseModelId(event.target.value)}
            >
              <option value="">(sin override)</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>{model.id}</option>
              ))}
            </select>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={casePromptOverride}
              onChange={(event) => setCasePromptOverride(event.target.value)}
              placeholder="promptOverride opcional"
            />
            <Input
              value={caseFallbacks}
              onChange={(event) => setCaseFallbacks(event.target.value)}
              placeholder="fallbackModelIds separados por coma"
            />
            <div className="flex gap-2">
              <Button onClick={() => void upsertCaseMapping()} disabled={saving}>Guardar mapping</Button>
              <Button variant="outline" onClick={() => void deleteCaseMapping()} disabled={saving}>Eliminar mapping</Button>
              <Button variant="outline" onClick={() => void runResolveTest()} disabled={saving}>Probar fallback</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import / Export JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void doExport()} disabled={saving}><Download className="h-4 w-4" />Exportar</Button>
            <Button onClick={() => void doImport()} disabled={saving}><Upload className="h-4 w-4" />Importar</Button>
          </div>
          <textarea
            className="min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
            value={ioJson}
            onChange={(event) => setIoJson(event.target.value)}
            placeholder="Pega JSON de import o usa export"
          />
        </CardContent>
      </Card>

        </div>
      </details>

      {resolveOutput ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado fallback</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto rounded-lg bg-muted/30 p-3 text-xs whitespace-pre-wrap">
              {JSON.stringify(resolveOutput, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {saving ? (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando cambios...
        </p>
      ) : null}
    </div>
  );
}
