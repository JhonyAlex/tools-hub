# Especificacion de Configuracion del AI Report Orchestrator

## 1. Objetivo

Definir una arquitectura de configuracion robusta para modelos/proveedores y prompts del orquestador, con OpenRouter como proveedor prioritario, soporte de proveedores adicionales (por ejemplo OpenAI), persistencia, versionado de prompts, auditoria, fallback y mecanismos de importacion/exportacion.

## 2. Alcance funcional

1. Gestion CRUD completa de proveedores.
2. Gestion CRUD completa de modelos.
3. Edicion y versionado de prompt por modelo.
4. Asignacion de modelo/prompt por caso de orquestacion.
5. Herencia de valores por defecto u override por caso.
6. Configuracion exportable/importable en JSON.
7. Validaciones de integridad referencial.
8. Fallback automatico ante fallo del modelo seleccionado.
9. Flujo de inicializacion con carga local/remota y manejo de errores.
10. Registro de auditoria para cambios de proveedores/modelos/prompts/asignaciones.

## 3. Estructuras de datos canonicas

### 3.1 ProviderEntry

Campos requeridos:
- id
- nombre
- endpoint
- credenciales

Campos recomendados:
- prioridad (menor valor = mayor prioridad)
- activo
- createdAt
- updatedAt

Notas:
- OpenRouter debe existir por defecto como proveedor activo con prioridad mas alta.
- credenciales deben guardarse por referencia segura (secretRef), nunca en texto plano.

### 3.2 ModelEntry

Campos requeridos:
- id
- nombre
- providerId
- providerNombre
- prompt
- activo
- version
- metadatos

Campos recomendados:
- promptHistory[]
- createdAt
- updatedAt

Notas:
- providerId debe referenciar una entrada existente en ProviderEntry.
- providerNombre se conserva por trazabilidad y display, pero la referencia fuente de verdad es providerId.

### 3.3 OrchestratorConfig

Campos principales:
- schemaVersion
- updatedAt
- defaultModelId
- providers: ProviderEntry[]
- models: ModelEntry[]
- promptVersions
- caseMappings
- auditTrail

Definicion de mapeo de caso:
- caseMappings[caseId].mode = "inherit" | "override"
- Si mode = "inherit": usa defaultModelId y prompt del modelo por defecto.
- Si mode = "override": requiere modelId y opcional promptOverride.
- fallbackModelIds opcional por caso, respetando orden de prioridad.

## 4. OpenRouter como prioridad y multi-proveedor

### 4.1 Regla base

1. El proveedor OpenRouter debe inicializarse de fabrica con prioridad 1.
2. Si se agrega OpenAI u otro proveedor, se permite elegirlo por modelo o por caso.
3. El orden de resolucion de fallback es:
- fallback del caso (si existe)
- fallback global por provider.prioridad
- ultimo recurso: defaultModelId

### 4.2 Ejemplo minimo de proveedores

```json
[
  {
    "id": "openrouter",
    "nombre": "OpenRouter",
    "endpoint": "https://openrouter.ai/api/v1",
    "credenciales": {
      "tipo": "apiKey",
      "secretRef": "secrets://ai/openrouter/api_key"
    },
    "prioridad": 1,
    "activo": true
  },
  {
    "id": "openai",
    "nombre": "OpenAI",
    "endpoint": "https://api.openai.com/v1",
    "credenciales": {
      "tipo": "apiKey",
      "secretRef": "secrets://ai/openai/api_key"
    },
    "prioridad": 2,
    "activo": true
  }
]
```

## 5. Reglas de validacion

1. `defaultModelId` debe existir en `models` y estar activo.
2. Todo `model.providerId` debe existir en `providers` activos.
3. Todo `caseMappings[*].modelId` (cuando mode=override) debe existir y estar activo.
4. `providerNombre` de ModelEntry debe coincidir con el `nombre` del proveedor referenciado al guardar (se sincroniza automaticamente).
5. No permitir borrar proveedor con modelos asociados activos.
6. No permitir borrar modelo si es defaultModelId o esta asignado a casos override; exigir reasignacion previa.
7. En importacion JSON, validar schema completo antes de persistir.
8. Si falla la validacion, la configuracion anterior permanece intacta (atomicidad).

## 6. Flujo de inicializacion

Objetivo: cargar configuracion desde almacenamiento local o remoto, con estrategia de recuperacion y fallback seguro.

1. Intentar cargar configuracion remota (si esta habilitada).
2. Si falla remoto por timeout/red/auth, intentar local.
3. Si no hay local, crear baseline con OpenRouter por defecto.
4. Validar contra schema y reglas de negocio.
5. Si la config cargada es invalida:
- registrar error de auditoria
- intentar ultima version valida conocida
- si tampoco existe, reconstruir baseline
6. Exponer estado de inicializacion en UI:
- success
- degraded (uso de fallback)
- failed (requiere accion manual)

## 7. CRUD completo (pseudocodigo)

### 7.1 CRUD de ProviderEntry

```ts
function createProvider(input, actor) {
  validateProviderInput(input)
  ensureUniqueProviderId(input.id)
  const provider = {
    ...input,
    activo: input.activo ?? true,
    createdAt: nowISO(),
    updatedAt: nowISO()
  }
  config.providers.push(provider)
  appendAudit("create", "provider", provider.id, actor, diff(null, provider))
  persistConfigAtomic(config)
  return provider
}

function updateProvider(providerId, patch, actor) {
  const provider = findProviderOrThrow(providerId)
  const before = clone(provider)
  if (patch.endpoint) validateEndpoint(patch.endpoint)
  if (patch.credenciales) validateCredentialsRef(patch.credenciales)
  applyPatch(provider, patch)
  provider.updatedAt = nowISO()
  appendAudit("update", "provider", providerId, actor, diff(before, provider))
  persistConfigAtomic(config)
  return provider
}

function deleteProvider(providerId, actor) {
  ensureNoActiveModelsUsingProvider(providerId)
  const before = findProviderOrThrow(providerId)
  config.providers = config.providers.filter(p => p.id !== providerId)
  appendAudit("delete", "provider", providerId, actor, diff(before, null))
  persistConfigAtomic(config)
}

function listProviders(filters) {
  return applyFiltersAndSort(config.providers, filters)
}
```

### 7.2 CRUD de ModelEntry + versionado de prompt

```ts
function createModel(input, actor) {
  validateModelInput(input)
  const provider = findActiveProviderOrThrow(input.providerId)
  const model = {
    ...input,
    providerNombre: provider.nombre,
    version: 1,
    promptHistory: [
      {
        version: 1,
        prompt: sanitizePrompt(input.prompt),
        updatedAt: nowISO(),
        updatedBy: actor,
        changeNote: "initial"
      }
    ],
    createdAt: nowISO(),
    updatedAt: nowISO()
  }
  config.models.push(model)
  appendAudit("create", "model", model.id, actor, diff(null, model))
  persistConfigAtomic(config)
  return model
}

function updateModel(modelId, patch, actor) {
  const model = findModelOrThrow(modelId)
  const before = clone(model)

  if (patch.providerId) {
    const provider = findActiveProviderOrThrow(patch.providerId)
    patch.providerNombre = provider.nombre
  }

  if (patch.prompt && patch.prompt !== model.prompt) {
    const nextVersion = model.version + 1
    model.version = nextVersion
    model.prompt = sanitizePrompt(patch.prompt)
    model.promptHistory.push({
      version: nextVersion,
      prompt: model.prompt,
      updatedAt: nowISO(),
      updatedBy: actor,
      changeNote: patch.changeNote ?? "prompt update"
    })
    delete patch.prompt
  }

  applyPatch(model, patch)
  model.updatedAt = nowISO()
  appendAudit("update", "model", modelId, actor, diff(before, model))
  persistConfigAtomic(config)
  return model
}

function rollbackModelPrompt(modelId, targetVersion, actor) {
  const model = findModelOrThrow(modelId)
  const historical = model.promptHistory.find(v => v.version === targetVersion)
  if (!historical) throw new Error("Prompt version not found")

  const before = clone(model)
  model.version += 1
  model.prompt = historical.prompt
  model.promptHistory.push({
    version: model.version,
    prompt: historical.prompt,
    updatedAt: nowISO(),
    updatedBy: actor,
    changeNote: `rollback to v${targetVersion}`
  })
  model.updatedAt = nowISO()

  appendAudit("rollback", "prompt", modelId, actor, diff(before, model))
  persistConfigAtomic(config)
  return model
}

function deleteModel(modelId, actor) {
  ensureModelNotDefault(modelId)
  ensureModelNotAssignedToOverrides(modelId)
  const before = findModelOrThrow(modelId)
  config.models = config.models.filter(m => m.id !== modelId)
  appendAudit("delete", "model", modelId, actor, diff(before, null))
  persistConfigAtomic(config)
}
```

### 7.3 Asignacion a casos y herencia/override

```ts
function setCaseMapping(caseId, input, actor) {
  // input: { mode, modelId?, promptOverride?, fallbackModelIds? }
  if (input.mode === "override") {
    ensureActiveModelExists(input.modelId)
  }

  if (input.fallbackModelIds) {
    input.fallbackModelIds.forEach(ensureActiveModelExists)
  }

  const before = config.caseMappings[caseId] ?? null
  config.caseMappings[caseId] = {
    mode: input.mode,
    modelId: input.mode === "override" ? input.modelId : undefined,
    promptOverride: input.promptOverride
      ? sanitizePrompt(input.promptOverride)
      : undefined,
    fallbackModelIds: input.fallbackModelIds ?? [],
    updatedAt: nowISO(),
    updatedBy: actor
  }

  appendAudit("assign", "caseMapping", caseId, actor, diff(before, config.caseMappings[caseId]))
  persistConfigAtomic(config)
  return config.caseMappings[caseId]
}

function resolveExecutionConfig(caseId) {
  const mapping = config.caseMappings[caseId]

  if (!mapping || mapping.mode === "inherit") {
    const model = findActiveModelOrThrow(config.defaultModelId)
    return {
      model,
      prompt: model.prompt,
      fallbackModelIds: []
    }
  }

  const model = findActiveModelOrThrow(mapping.modelId)
  return {
    model,
    prompt: mapping.promptOverride ?? model.prompt,
    fallbackModelIds: mapping.fallbackModelIds ?? []
  }
}
```

## 8. Fallback de ejecucion ante fallo del modelo

```ts
async function executeWithFallback(caseId, payload, traceId) {
  const resolved = resolveExecutionConfig(caseId)

  const candidateModelIds = unique([
    resolved.model.id,
    ...resolved.fallbackModelIds,
    ...buildGlobalFallbackIdsByProviderPriority(),
    config.defaultModelId
  ])

  const errors = []
  for (const modelId of candidateModelIds) {
    const model = findActiveModel(modelId)
    if (!model) continue

    try {
      const provider = findActiveProviderOrThrow(model.providerId)
      const prompt = modelId === resolved.model.id
        ? resolved.prompt
        : model.prompt

      const safePrompt = sanitizePrompt(prompt)
      const response = await callProvider(provider, model, safePrompt, payload, traceId)

      appendAudit("update", "config", "runtime", "system", {
        event: "model_success",
        caseId,
        modelId,
        providerId: provider.id,
        traceId
      })

      return response
    } catch (error) {
      errors.push({ modelId, message: String(error) })
      appendAudit("update", "config", "runtime", "system", {
        event: "model_failure",
        caseId,
        modelId,
        traceId,
        error: String(error)
      })
      continue
    }
  }

  throw new Error(`All model calls failed for case ${caseId}: ${JSON.stringify(errors)}`)
}
```

## 9. Seguridad

1. Sanitizacion de prompts:
- eliminar tokens de control no permitidos
- truncar a maximo permitido
- bloquear patrones de leakage (`BEGIN PRIVATE KEY`, `password=`)

2. Manejo de credenciales:
- usar `secretRef` y resolver en runtime
- nunca persistir secrets en export JSON
- logs y auditoria con secretos enmascarados

3. Export/import:
- opcion de export "redacted" por defecto (sin credenciales sensibles)
- checksum y firma opcional para verificar integridad

4. Auditoria inmutable:
- registrar actor, timestamp, entidad y diff
- no permitir borrado fisico de eventos de auditoria

## 10. Importacion y exportacion JSON

### 10.1 Export

- Endpoint sugerido: `GET /api/tools/ai-report-orchestrator/config/export`
- Respuesta con `OrchestratorConfig` validada.
- Modo `redacted=true` para ocultar `secretRef` y cualquier campo sensible.

### 10.2 Import

- Endpoint sugerido: `POST /api/tools/ai-report-orchestrator/config/import`
- Pasos:
1. parse JSON
2. validar schema
3. validar reglas de negocio
4. persistir de forma atomica
5. registrar auditoria `import`

## 11. Casos de uso

1. Equipo define OpenRouter como default y asigna un modelo estrategico al caso "monthly-exec-summary".
2. Caso "incident-postmortem" usa override con prompt especializado y fallback a OpenAI.
3. Prompt de un modelo se actualiza de v3 a v4 por compliance; si degrada resultados, rollback a v3 en segundos.
4. Administrador exporta config redacted para moverla entre entornos dev/staging/prod.

## 12. Plan de pruebas de integracion

### 12.1 Inicializacion

1. Carga remota OK -> config valida en memoria.
2. Carga remota falla -> fallback local OK.
3. Remoto y local invalidos -> baseline con OpenRouter.

### 12.2 CRUD proveedores/modelos

1. Crear proveedor OpenAI exitoso.
2. Rechazar proveedor con endpoint invalido.
3. Crear modelo con providerId inexistente -> error 400.
4. Actualizar prompt de modelo incrementa version e historial.
5. Bloquear borrado de proveedor con modelos activos.

### 12.3 Asignaciones por caso

1. Caso en modo inherit usa defaultModelId.
2. Caso en modo override usa modelId especifico.
3. Rechazar override con modelId inexistente.
4. promptOverride se sanitiza y persiste.

### 12.4 Fallback runtime

1. Falla primer modelo -> usa primer fallback y retorna OK.
2. Fallan todos -> error controlado con trazas.
3. Auditoria registra cada intento/fallo/exito.

### 12.5 Import/export

1. Export redacted no incluye datos sensibles.
2. Import valido reemplaza config atomica.
3. Import invalido no rompe config previa.

## 13. Plan de migracion (si existe config previa)

Contexto actual del modulo:
- El orquestador usa store en memoria para reportes (`Map`) y no tiene aun subsistema formal de config de modelos/proveedores.

Estrategia de migracion:

1. Paso 0: Snapshot
- Exportar cualquier configuracion legacy disponible.

2. Paso 1: Introducir schemaVersion=1
- Crear baseline con OpenRouter + modelo default.

3. Paso 2: Adaptador legacy -> canonico
- Si hay campos previos como `model`, `provider`, `prompt` sueltos, mapear a arrays `providers/models`.

4. Paso 3: Validacion y reparacion
- Detectar referencias rotas y reasignar a defaultModelId.
- Reportar incidencias en auditoria tipo `import`.

5. Paso 4: Doble lectura temporal
- Leer config nueva; si no existe, intentar legacy y migrar on-read.

6. Paso 5: Corte definitivo
- Tras una ventana de estabilizacion, eliminar lectura legacy.

Rollback de migracion:
- Conservar backup JSON previo.
- Si post-migracion falla validacion runtime, restaurar snapshot y registrar `rollback`.

## 14. Recomendaciones de implementacion

1. Persistencia:
- Inicialmente archivo JSON versionado por usuario/tenant.
- Opcional: backend remoto (S3, KV, DB) con cache local.

2. Validacion:
- Compilar schemas con AJV y encapsular reglas de negocio en validador adicional.

3. Observabilidad:
- `traceId` por ejecucion de caso.
- Metricas: tasa de fallback, proveedor usado, latencia por modelo.

4. Gobernanza de prompts:
- Convencion de `changeNote` obligatoria para actualizaciones de prompt.
- Revisiones por pares para prompts de alto impacto.
