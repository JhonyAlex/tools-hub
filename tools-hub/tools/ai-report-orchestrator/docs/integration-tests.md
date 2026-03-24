# Pruebas de integracion - AI Report Orchestrator Config

## Objetivo

Validar de punta a punta:
- inicializacion local/remota
- CRUD de proveedores y modelos
- versionado de prompts
- asignacion de casos con herencia/override
- fallback de runtime
- import/export
- auditoria

## Suposiciones tecnicas

- Test runner: Vitest o Jest.
- API routes en Next.js.
- Persistencia simulada con store en memoria y doubles de almacenamiento remoto/local.

## Datos de prueba base

```ts
const OPENROUTER_PROVIDER = {
  id: "openrouter",
  nombre: "OpenRouter",
  endpoint: "https://openrouter.ai/api/v1",
  credenciales: { tipo: "apiKey", secretRef: "secrets://ai/openrouter/key" },
  prioridad: 1,
  activo: true
}

const OPENAI_PROVIDER = {
  id: "openai",
  nombre: "OpenAI",
  endpoint: "https://api.openai.com/v1",
  credenciales: { tipo: "apiKey", secretRef: "secrets://ai/openai/key" },
  prioridad: 2,
  activo: true
}

const DEFAULT_MODEL = {
  id: "openrouter/anthropic/claude-3.7-sonnet",
  nombre: "Claude 3.7 Sonnet via OpenRouter",
  providerId: "openrouter",
  providerNombre: "OpenRouter",
  prompt: "Sos un analista ejecutivo. Resumi en espanol.",
  activo: true,
  version: 1,
  metadatos: { temperature: 0.2 }
}
```

## Escenarios de integracion

### 1) Inicializacion: remoto OK

```ts
it("carga config remota cuando esta disponible", async () => {
  mockRemote.load.mockResolvedValue(validConfig)
  mockLocal.load.mockResolvedValue(null)

  const result = await initializeConfig()

  expect(result.state).toBe("success")
  expect(result.config.defaultModelId).toBe(validConfig.defaultModelId)
  expect(mockLocal.save).not.toHaveBeenCalled()
})
```

### 2) Inicializacion: remoto falla, local OK

```ts
it("usa fallback local si remoto falla", async () => {
  mockRemote.load.mockRejectedValue(new Error("timeout"))
  mockLocal.load.mockResolvedValue(validConfig)

  const result = await initializeConfig()

  expect(result.state).toBe("degraded")
  expect(result.source).toBe("local")
})
```

### 3) Inicializacion: todo falla, baseline

```ts
it("reconstruye baseline con OpenRouter cuando no hay config valida", async () => {
  mockRemote.load.mockResolvedValue(null)
  mockLocal.load.mockResolvedValue(null)

  const result = await initializeConfig()

  expect(result.state).toBe("degraded")
  expect(result.config.providers.some(p => p.id === "openrouter")).toBe(true)
  expect(result.config.defaultModelId).toContain("openrouter")
})
```

### 4) CRUD Proveedor + Modelo con validaciones referenciales

```ts
it("rechaza crear modelo con providerId inexistente", async () => {
  await createProvider(OPENROUTER_PROVIDER, "tester")

  await expect(
    createModel({
      ...DEFAULT_MODEL,
      id: "bad-model",
      providerId: "missing-provider",
      providerNombre: "Missing"
    }, "tester")
  ).rejects.toThrow("provider")
})
```

### 5) Versionado de prompt

```ts
it("incrementa version y guarda historial al editar prompt", async () => {
  await createProvider(OPENROUTER_PROVIDER, "tester")
  await createModel(DEFAULT_MODEL, "tester")

  const updated = await updateModel(DEFAULT_MODEL.id, {
    prompt: "Nuevo prompt orientado a riesgos",
    changeNote: "compliance update"
  }, "tester")

  expect(updated.version).toBe(2)
  expect(updated.promptHistory.length).toBeGreaterThanOrEqual(2)
  expect(updated.promptHistory.at(-1)?.changeNote).toBe("compliance update")
})
```

### 6) Asignacion por caso: inherit vs override

```ts
it("resolveExecutionConfig usa default en modo inherit", async () => {
  seedConfigWithDefaultModel()

  await setCaseMapping("monthly-exec-summary", { mode: "inherit" }, "tester")

  const resolved = resolveExecutionConfig("monthly-exec-summary")
  expect(resolved.model.id).toBe(getConfig().defaultModelId)
})

it("resolveExecutionConfig usa override en modo override", async () => {
  seedConfigWithTwoModels()

  await setCaseMapping("incident-postmortem", {
    mode: "override",
    modelId: "openai/gpt-4.1",
    promptOverride: "Analiza causa raiz y blast radius"
  }, "tester")

  const resolved = resolveExecutionConfig("incident-postmortem")
  expect(resolved.model.id).toBe("openai/gpt-4.1")
  expect(resolved.prompt).toContain("causa raiz")
})
```

### 7) Fallback runtime

```ts
it("si falla el primer modelo usa fallback y responde", async () => {
  seedCaseWithFallback()

  mockCallProvider
    .mockRejectedValueOnce(new Error("429 rate limit"))
    .mockResolvedValueOnce({ text: "ok fallback" })

  const output = await executeWithFallback("incident-postmortem", { input: "..." }, "trace-1")

  expect(output.text).toBe("ok fallback")
  expect(mockCallProvider).toHaveBeenCalledTimes(2)
})
```

### 8) Import/export atomico

```ts
it("import invalido no pisa la configuracion actual", async () => {
  const before = getConfigSnapshot()

  await expect(importConfig({ invalid: true }, "tester")).rejects.toThrow()

  expect(getConfigSnapshot()).toEqual(before)
})
```

### 9) Auditoria

```ts
it("registra auditoria en create/update/delete/assign", async () => {
  await createProvider(OPENAI_PROVIDER, "tester")
  await updateProvider("openai", { nombre: "OpenAI Primary" }, "tester")
  await setCaseMapping("monthly-exec-summary", { mode: "inherit" }, "tester")

  const audit = getConfig().auditTrail
  expect(audit.length).toBeGreaterThanOrEqual(3)
  expect(audit.every(e => e.actor && e.entityType)).toBe(true)
})
```

## Criterios de aceptacion

1. Ningun caso puede resolver modelo/prompt con referencias rotas.
2. Todo cambio de provider/model/prompt/caseMapping deja traza en auditoria.
3. Import/export mantiene consistencia con schema.
4. Fallback evita hard-fail cuando hay alternativas activas.
5. OpenRouter permanece como opcion principal por defecto salvo override explicito.
