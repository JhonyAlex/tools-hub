// ============================================================
// OCR Client — Extrae texto de imágenes via OpenRouter Vision API
// ============================================================
// Modelo principal: mistralai/mistral-small-3.2-24b-instruct
// Fallback (si no soporta visión): mistralai/pixtral-12b-2409

const PRIMARY_MODEL = "mistralai/mistral-small-3.2-24b-instruct";
const FALLBACK_MODEL = "mistralai/pixtral-12b-2409";

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
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY no configurada.");
  }

  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  // Intentar con modelo principal, fallback si no soporta visión
  const text = await callVisionModel(apiKey, PRIMARY_MODEL, dataUrl);
  if (text !== null) return text;

  console.warn(
    `[OCR] ${PRIMARY_MODEL} no soportó visión, usando fallback: ${FALLBACK_MODEL}`
  );
  const fallbackText = await callVisionModel(apiKey, FALLBACK_MODEL, dataUrl);
  if (fallbackText !== null) return fallbackText;

  throw new Error("No se pudo extraer texto de la imagen con OCR.");
}

async function callVisionModel(
  apiKey: string,
  model: string,
  imageDataUrl: string
): Promise<string | null> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
