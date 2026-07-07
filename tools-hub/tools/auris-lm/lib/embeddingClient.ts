import { getActiveAIProvider } from "@/core/lib/ai-provider";

interface OpenRouterEmbeddingResponse {
  data?: Array<{ embedding?: number[] }>;
}

const DEFAULT_EMBEDDING_MODEL =
  process.env.AURIS_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const provider = await getActiveAIProvider();

  const response = await fetch(`${provider.baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
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
    throw new Error(`Embeddings error (${provider.name}) ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as OpenRouterEmbeddingResponse;
  const vectors = payload.data?.map((item) => item.embedding ?? []) ?? [];

  if (vectors.length !== texts.length || vectors.some((v) => v.length === 0)) {
    throw new Error("Embeddings retornó un resultado incompleto");
  }

  return vectors;
}

export function toPgVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
