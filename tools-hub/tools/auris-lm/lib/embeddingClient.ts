interface OpenRouterEmbeddingResponse {
  data?: Array<{ embedding?: number[] }>;
}

const DEFAULT_EMBEDDING_MODEL =
  process.env.AURIS_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY no configurada");
  }

  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tools-hub.app",
      "X-Title": "AurisLM-Embeddings",
    },
    body: JSON.stringify({
      model: DEFAULT_EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "unknown");
    throw new Error(`OpenRouter embeddings error ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as OpenRouterEmbeddingResponse;
  const vectors = payload.data?.map((item) => item.embedding ?? []) ?? [];

  if (vectors.length !== texts.length || vectors.some((v) => v.length === 0)) {
    throw new Error("OpenRouter embeddings retornó un resultado incompleto");
  }

  return vectors;
}

export function toPgVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
