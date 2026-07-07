// ============================================================
// AI ANALYSIS - Uses global AI provider config
// ============================================================
import type { ReportAggregations, AIReportContent } from "../types";
import { formatHours } from "./timeParser";
import { getActiveAIProvider } from "@/core/lib/ai-provider";

async function callAI(
  prompt: string
): Promise<string> {
  const provider = await getActiveAIProvider();

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tools-hub.local",
      "X-Title": "Pigmea Reporte Semanal/Mensual",
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Error IA (${provider.name}): ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function generateAIReport(
  aggregations: ReportAggregations,
): Promise<AIReportContent> {
  const topAssets = aggregations.assets.slice(0, 10);
  const periodLabel =
    aggregations.periodType === "semanal"
      ? "Semanal"
      : aggregations.periodType === "mensual"
        ? "Mensual"
        : "Personalizado";

  const dataSummary = `
Período: ${periodLabel}
Total registros de mano de obra: ${aggregations.filteredRecords}
OTs únicas: ${aggregations.uniqueOTs}
Horas totales: ${formatHours(aggregations.totalHours)} (${aggregations.totalHours.toFixed(2)}h)

Top activos por horas:
${topAssets.map((a) => `- ${a.activo}: ${formatHours(a.totalHours)}, ${a.otCount} OTs, ${a.recordCount} registros M.O.`).join("\n")}

Tipos de OT:
${aggregations.otTypes.map((t) => `- ${t.tipoDeOT}: ${t.otCount} OTs, ${t.recordCount} registros M.O., ${formatHours(t.totalHours)}, media ${formatHours(t.avgHours)}`).join("\n")}

Trabajadores:
${aggregations.workers.map((w) => `- ${w.worker}: ${w.otCount} OTs, ${w.recordCount} registros M.O., ${formatHours(w.totalHours)}`).join("\n")}
  `.trim();

  const prompt = `Eres un analista de mantenimiento industrial. A partir de los siguientes datos agregados de un informe ${periodLabel.toLowerCase()} de mano de obra, genera:

1. Un "Resumen Ejecutivo" de MÁXIMO 6 líneas que incluya:
   - Total de OTs y horas totales
   - Activos más críticos (por horas y número de OTs)
   - Tipo de mantenimiento predominante
   - Patrón o alerta más relevante detectada

2. Un "Análisis de Activos" (2-3 líneas): análisis breve de los activos que más recursos consumen, patrones notables y posibles causas.

3. Un "Análisis de Tipos de OT" (2-3 líneas): análisis de la distribución de tipos de mantenimiento, proporción correctivo vs preventivo, y qué indica sobre la estrategia de mantenimiento.

4. Un "Análisis de Trabajadores" (2-3 líneas): análisis de la distribución de carga laboral, si hay desequilibrios, y observaciones sobre la asignación de personal.

5. Exactamente 3 "Conclusiones clave" (frases concisas en viñetas)

6. Entre 2 y 4 "Recomendaciones prácticas" (accionables, en viñetas)

Responde SOLO con un JSON válido con esta estructura, sin texto adicional:
{
  "executiveSummary": "texto del resumen (máx 6 líneas)",
  "assetAnalysis": "análisis de activos (2-3 líneas)",
  "otTypeAnalysis": "análisis de tipos de OT (2-3 líneas)",
  "workerAnalysis": "análisis de trabajadores (2-3 líneas)",
  "conclusions": ["conclusión 1", "conclusión 2", "conclusión 3"],
  "recommendations": ["recomendación 1", "recomendación 2", ...]
}

DATOS:
${dataSummary}`;

  const content = await callAI(prompt);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      executiveSummary: "No se pudo generar el resumen automáticamente.",
      assetAnalysis: "",
      otTypeAnalysis: "",
      workerAnalysis: "",
      conclusions: [],
      recommendations: [],
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as AIReportContent;
    return {
      executiveSummary: parsed.executiveSummary ?? "",
      assetAnalysis: parsed.assetAnalysis ?? "",
      otTypeAnalysis: parsed.otTypeAnalysis ?? "",
      workerAnalysis: parsed.workerAnalysis ?? "",
      conclusions: parsed.conclusions ?? [],
      recommendations: parsed.recommendations ?? [],
    };
  } catch {
    return {
      executiveSummary: "Error al procesar la respuesta de IA.",
      assetAnalysis: "",
      otTypeAnalysis: "",
      workerAnalysis: "",
      conclusions: [],
      recommendations: [],
    };
  }
}
