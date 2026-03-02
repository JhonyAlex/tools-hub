// ============================================================
// AI ANALYSIS - OpenRouter DeepSeek for report generation
// ============================================================
import type { ReportAggregations, AIReportContent } from "../types";
import { formatHours } from "./timeParser";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-v3.2";

async function callOpenRouter(
  prompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tools-hub.local",
      "X-Title": "Pigmea Reporte Semanal/Mensual",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function generateAIReport(
  aggregations: ReportAggregations,
  apiKey: string
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
${topAssets.map((a) => `- ${a.activo}: ${formatHours(a.totalHours)} (${a.otCount} OTs)`).join("\n")}

Tipos de OT:
${aggregations.otTypes.map((t) => `- ${t.tipoDeOT}: ${t.otCount} OTs, ${formatHours(t.totalHours)}, media ${formatHours(t.avgHours)}`).join("\n")}

Trabajadores:
${aggregations.workers.map((w) => `- ${w.worker}: ${w.otCount} OTs, ${formatHours(w.totalHours)}`).join("\n")}
  `.trim();

  const prompt = `Eres un analista de mantenimiento industrial. A partir de los siguientes datos agregados de un informe ${periodLabel.toLowerCase()} de mano de obra, genera:

1. Un "Resumen Ejecutivo" de MÁXIMO 6 líneas que incluya:
   - Total de OTs y horas totales
   - Activos más críticos (por horas y número de OTs)
   - Tipo de mantenimiento predominante
   - Patrón o alerta más relevante detectada

2. Exactamente 3 "Conclusiones clave" (frases concisas en viñetas)

3. Entre 2 y 4 "Recomendaciones prácticas" (accionables, en viñetas)

Responde SOLO con un JSON válido con esta estructura, sin texto adicional:
{
  "executiveSummary": "texto del resumen (máx 6 líneas)",
  "conclusions": ["conclusión 1", "conclusión 2", "conclusión 3"],
  "recommendations": ["recomendación 1", "recomendación 2", ...]
}

DATOS:
${dataSummary}`;

  const content = await callOpenRouter(prompt, apiKey);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      executiveSummary: "No se pudo generar el resumen automáticamente.",
      conclusions: [],
      recommendations: [],
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as AIReportContent;
    return {
      executiveSummary: parsed.executiveSummary ?? "",
      conclusions: parsed.conclusions ?? [],
      recommendations: parsed.recommendations ?? [],
    };
  } catch {
    return {
      executiveSummary: "Error al procesar la respuesta de IA.",
      conclusions: [],
      recommendations: [],
    };
  }
}
