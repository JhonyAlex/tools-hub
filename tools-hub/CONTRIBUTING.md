# Guia para Agregar Herramientas al Tools Hub

Este documento es el manual obligatorio para humanos e IAs. Seguir estas reglas
garantiza que el sistema plug-and-play funcione correctamente.

---

## Paso a Paso: Agregar una Nueva Herramienta

### 1. Crear la carpeta de la herramienta

```
tools/mi-herramienta/
  manifest.ts          # Metadata obligatoria
  index.ts             # Barrel export
  components/          # Componentes React
    MiHerramientaApp.tsx
  lib/                 # Logica y utilidades
  hooks/               # Hooks personalizados (opcional)
  actions/             # Server Actions (opcional)
  types.ts             # Tipos TypeScript (opcional)
```

### 2. Crear el manifest.ts

```typescript
import type { ToolManifest } from "@/core/types/tool.types";

export const manifest: ToolManifest = {
  slug: "mi-herramienta",        // DEBE coincidir con el nombre de carpeta
  name: "Mi Herramienta",
  description: "Descripcion corta de una oracion.",
  icon: "Wrench",                // Nombre de icono de lucide-react
  category: "utilities",         // Ver ToolCategory en core/types/tool.types.ts
  status: "active",
  version: "1.0.0",
  author: "Tu Nombre",
  tags: ["tag1", "tag2"],
  requiresDb: false,
  path: "/tools/mi-herramienta", // DEBE coincidir con el slug
};
```

### 3. Crear la pagina de ruta

```
app/(dashboard)/tools/mi-herramienta/page.tsx
```

```typescript
import { MiHerramientaApp } from "@/tools/mi-herramienta";

export default function MiHerramientaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Herramienta</h1>
        <p className="mt-1 text-muted-foreground">Descripcion corta.</p>
      </div>
      <MiHerramientaApp />
    </div>
  );
}
```

### 4. Registrar en el registry

Editar `core/registry/tools.registry.ts`:

```typescript
import { manifest as miHerramienta } from "@/tools/mi-herramienta/manifest";
// --- ADD NEW TOOL IMPORTS ABOVE THIS LINE ---

export const TOOL_REGISTRY: ToolManifest[] = [
  // ...herramientas existentes,
  miHerramienta,
  // --- ADD NEW TOOLS TO THIS ARRAY ABOVE THIS LINE ---
];
```

### 5. Si necesita base de datos

Agregar modelos en `prisma/schema.prisma` con prefijo obligatorio:

```prisma
// ============ TOOL: mi-herramienta ============
model MiHerramientaRecord {
  id        String   @id @default(cuid())
  // ...campos
  createdAt DateTime @default(now())
}
```

Luego ejecutar: `npx prisma migrate dev --name add-mi-herramienta`

---

## Las 5 Reglas de Oro

### Regla 1: Un Slug, Tres Coincidencias
El slug debe ser identico en:
1. Nombre de carpeta: `tools/mi-herramienta/`
2. Campo slug en `manifest.ts`: `slug: "mi-herramienta"`
3. Carpeta de ruta: `app/(dashboard)/tools/mi-herramienta/`

### Regla 2: Nunca Importar Entre Herramientas
`tools/herramienta-a/` NUNCA importa de `tools/herramienta-b/`.
Si dos herramientas necesitan lo mismo, se promueve a `core/lib/`.

### Regla 3: El Core es Solo-Lectura
Solo puedes tocar:
- Tu carpeta en `tools/`
- Tu ruta en `app/(dashboard)/tools/`
- Tu API en `app/api/tools/` (si la necesitas)
- Las 2 lineas en `core/registry/tools.registry.ts`

### Regla 4: Todo el Estado Dentro de la Herramienta
Sin stores globales. Cada herramienta maneja su estado con hooks locales,
Server Actions, o modelos Prisma prefijados con su nombre.

### Regla 5: El Manifest es la Fuente de Verdad
Toda metadata vive en `manifest.ts`. Para deshabilitar: `status: "maintenance"`.
Nunca comentar rutas ni usar variables de entorno sueltas.

---

## Categorias Disponibles

| Categoria       | Slug            |
|-----------------|-----------------|
| Generadores     | `generators`    |
| Reportes        | `reports`       |
| Utilidades      | `utilities`     |
| Comunicacion    | `communication` |
| SEO             | `seo`           |
| Finanzas        | `finance`       |
| Diseno          | `design`        |
| Desarrollo      | `development`   |

## Iconos

Usar nombres de [Lucide Icons](https://lucide.dev/icons/).
Ejemplo: `Calculator`, `FileText`, `Braces`, `BarChart3`, `Mail`.
