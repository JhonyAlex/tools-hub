// ============================================================
// OCR Client — Extrae texto de imágenes via AI Provider
// ============================================================
import { getActiveAIProvider } from "@/core/lib/ai-provider";
// Modelo principal: qwen/qwen3.5-flash-02-23
// Fallback (si no funciona qwen): mistralai/mistral-small-3.2-24b-instruct

const PRIMARY_MODEL = "qwen/qwen3.5-flash-02-23";
const FALLBACK_MODEL = "mistralai/mistral-small-3.2-24b-instruct";

const SYSTEM_PROMPT =
  "Extrae todo el texto visible en esta imagen con precisión. " +
  "Responde SOLO con el texto extraído, sin introducciones ni comentarios.";

interface OpenRouterChoice {
  message?: { content?: string };
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
  error?: { message?: string; code?: number };
}

/**
 * Envía una imagen al modelo de visión de OpenRouter y retorna el texto extraído.
 */
export async function ocrFromImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const provider = await getActiveAIProvider();

  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  // Intentar con modelo principal, fallback si no soporta visión
  const text = await callVisionModel(provider.baseUrl, provider.apiKey, PRIMARY_MODEL, dataUrl);
  if (text !== null) return text;

  console.warn(
    `[OCR] ${PRIMARY_MODEL} no soportó visión, usando fallback: ${FALLBACK_MODEL}`
  );
  const fallbackText = await callVisionModel(provider.baseUrl, provider.apiKey, FALLBACK_MODEL, dataUrl);
  if (fallbackText !== null) return fallbackText;

  throw new Error("No se pudo extraer texto de la imagen con OCR.");
}

async function callVisionModel(
  baseUrl: string,
  apiKey: string,
  model: string,
  imageDataUrl: string
): Promise<string | null> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tools-hub.app",
      "X-Title": "ToolsHub-OCR",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageDataUrl },
            },
            {
              type: "text",
              text: "Extrae el texto de esta imagen.",
            },
          ],
        },
      ],
    }),
  });

  // Si el modelo no soporta visión/multimodal, retornar null para fallback
  if (!res.ok) {
    const status = res.status;
    if (status >= 400 && status < 500) {
      console.warn(`[OCR] Modelo ${model} retornó ${status}, intentando fallback.`);
      return null;
    }
    const body = await res.text();
    throw new Error(`OpenRouter OCR error ${status}: ${body}`);
  }

  const data = (await res.json()) as OpenRouterResponse;

  if (data.error) {
    console.warn(`[OCR] Modelo ${model} error: ${data.error.message}`);
    return null;
  }

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
