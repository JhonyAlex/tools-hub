"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Star, Trash2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  isDefault: boolean;
  hasApiKey: boolean;
}

type EditableProvider = {
  _localId: string;
  id?: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  isDefault: boolean;
  hasExistingKey: boolean;
};

function createEmpty(): EditableProvider {
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

export default function SettingsPage() {
  const [providers, setProviders] = useState<EditableProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/ai-providers", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron cargar los proveedores.");
      const data = (await res.json()) as { providers: Provider[] };
      setProviders(
        data.providers.map((p) => ({
          _localId: p.id,
          id: p.id,
          name: p.name,
          baseUrl: p.baseUrl,
          apiKey: "",
          defaultModel: p.defaultModel,
          isDefault: p.isDefault,
          hasExistingKey: p.hasApiKey,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function addProvider() {
    setProviders((prev) => [...prev, createEmpty()]);
  }

  function removeProvider(localId: string) {
    setProviders((prev) => prev.filter((p) => p._localId !== localId));
  }

  function updateProvider(localId: string, patch: Partial<EditableProvider>) {
    setProviders((prev) =>
      prev.map((p) => (p._localId === localId ? { ...p, ...patch } : p))
    );
  }

  function setDefault(localId: string) {
    setProviders((prev) => prev.map((p) => ({ ...p, isDefault: p._localId === localId })));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setOk(null);

    for (const p of providers) {
      if (!p.name.trim()) { setError("Todos los proveedores necesitan un nombre."); setSaving(false); return; }
      if (!p.baseUrl.trim()) { setError(`URL Base requerida para: ${p.name || "sin nombre"}`); setSaving(false); return; }
      if (!p.defaultModel.trim()) { setError(`Modelo requerido para: ${p.name || "sin nombre"}`); setSaving(false); return; }
      if (!p.id && !p.apiKey.trim()) { setError(`Clave API requerida para nuevo proveedor: ${p.name}`); setSaving(false); return; }
    }

    try {
      // Delete removed providers
      const existingIds = new Set(providers.filter((p) => p.id).map((p) => p.id));
      const currentRes = await fetch("/api/settings/ai-providers", { cache: "no-store" });
      const currentData = (await currentRes.json()) as { providers: Provider[] };
      for (const existing of currentData.providers) {
        if (!existingIds.has(existing.id)) {
          await fetch(`/api/settings/ai-providers?id=${existing.id}`, { method: "DELETE" });
        }
      }

      // Create/update providers
      for (const p of providers) {
        const res = await fetch("/api/settings/ai-providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: p.id,
            name: p.name,
            baseUrl: p.baseUrl,
            apiKey: p.apiKey,
            defaultModel: p.defaultModel,
            isDefault: p.isDefault,
          }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error || "Error al guardar proveedor");
        }
      }

      setOk("Configuracion guardada correctamente.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-10">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando configuracion...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configuracion
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra los proveedores de IA que usan todas las herramientas del sistema.
        </p>
      </div>

      {error && (
        <Card className="border-red-300 bg-red-50/60 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-4 text-sm text-red-700 dark:text-red-300">{error}</CardContent>
        </Card>
      )}

      {ok && (
        <Card className="border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-900/20">
          <CardContent className="pt-4 text-sm text-emerald-700 dark:text-emerald-300">{ok}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Proveedores de IA</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Agrega modelos con URL Base y Clave API dedicada. El proveedor marcado como predeterminado se usa en todas las herramientas.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addProvider}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar proveedor
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No hay proveedores configurados.</p>
              <p className="text-xs mt-1">
                Si no agregas ninguno, el sistema usara la variable de entorno OPENROUTER_API_KEY como respaldo.
              </p>
            </div>
          ) : (
            providers.map((p) => (
              <div
                key={p._localId}
                className={`rounded-lg border p-4 space-y-3 ${
                  p.isDefault ? "border-primary bg-primary/5" : "border-border bg-background"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={p.isDefault ? "default" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                      title="Marcar como predeterminado"
                      onClick={() => setDefault(p._localId)}
                    >
                      <Star className={`h-4 w-4 ${p.isDefault ? "fill-current" : ""}`} />
                    </Button>
                    <span className="text-sm font-medium">{p.name || "Nuevo proveedor"}</span>
                    {p.isDefault && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Predeterminado
                      </Badge>
                    )}
                    {p.hasExistingKey && !p.apiKey && (
                      <Badge variant="outline">API Key guardada</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeProvider(p._localId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Nombre</label>
                    <Input
                      value={p.name}
                      onChange={(e) => updateProvider(p._localId, { name: e.target.value })}
                      placeholder="MiMo v2.5 Pro"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Modelo</label>
                    <Input
                      value={p.defaultModel}
                      onChange={(e) => updateProvider(p._localId, { defaultModel: e.target.value })}
                      placeholder="mimo-v2.5-pro"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">URL Base Dedicada</label>
                  <Input
                    value={p.baseUrl}
                    onChange={(e) => updateProvider(p._localId, { baseUrl: e.target.value })}
                    placeholder="https://api.xiaomimimo.com/v1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Clave API Dedicada</label>
                  <Input
                    type="password"
                    value={p.apiKey}
                    onChange={(e) =>
                      updateProvider(p._localId, {
                        apiKey: e.target.value,
                        hasExistingKey: e.target.value.trim().length > 0 ? true : p.hasExistingKey,
                      })
                    }
                    placeholder={p.hasExistingKey ? "Dejar vacio para mantener la clave actual" : "sk-..."}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </Button>
        <Button variant="outline" onClick={() => void load()} disabled={saving}>
          Recargar
        </Button>
      </div>
    </div>
  );
}
