// ============================================================
// RAG Engine – BM25 Lexical Search (server-only)
// ============================================================

export interface ChunkResult {
  id: string;
  documentId: string;
  spaceId: string;
  content: string;
  score: number;
  docName: string;
}

export interface ChunkData {
  id: string;
  documentId: string;
  spaceId: string;
  content: string;
  document?: { originalName: string };
}

// Simple tokenizer: lowercase, remove punctuation, split on whitespace
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

// BM25 parameters
const K1 = 1.5;
const B = 0.75;

export function bm25Score(
  queryTerms: string[],
  docTerms: string[],
  avgDocLen: number,
  idfMap: Map<string, number>
): number {
  const docLen = docTerms.length;
  const termFreq = new Map<string, number>();
  for (const t of docTerms) {
    termFreq.set(t, (termFreq.get(t) ?? 0) + 1);
  }

  let score = 0;
  for (const term of queryTerms) {
    const tf = termFreq.get(term) ?? 0;
    if (tf === 0) continue;
    const idf = idfMap.get(term) ?? 0;
    const numerator = tf * (K1 + 1);
    const denominator = tf + K1 * (1 - B + B * (docLen / avgDocLen));
    score += idf * (numerator / denominator);
  }
  return score;
}

export function buildIdfMap(
  queryTerms: string[],
  allDocTerms: string[][]
): Map<string, number> {
  const N = allDocTerms.length;
  const idfMap = new Map<string, number>();
  for (const term of queryTerms) {
    const docsWithTerm = allDocTerms.filter((terms) =>
      terms.includes(term)
    ).length;
    const idf = Math.log((N - docsWithTerm + 0.5) / (docsWithTerm + 0.5) + 1);
    idfMap.set(term, idf);
  }
  return idfMap;
}

export function rankChunks(
  query: string,
  chunks: ChunkData[],
  topK = 8
): ChunkResult[] {
  if (chunks.length === 0) return [];

  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const allDocTerms = chunks.map((c) => tokenize(c.content));
  const avgDocLen =
    allDocTerms.reduce((sum, t) => sum + t.length, 0) / allDocTerms.length;
  const idfMap = buildIdfMap(queryTerms, allDocTerms);

  const scored: ChunkResult[] = chunks.map((chunk, i) => ({
    id: chunk.id,
    documentId: chunk.documentId,
    spaceId: chunk.spaceId,
    content: chunk.content,
    score: bm25Score(queryTerms, allDocTerms[i], avgDocLen, idfMap),
    docName: chunk.document?.originalName ?? "Documento",
  }));

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Text chunking for document ingestion
export function chunkText(
  text: string,
  chunkSize = 600,
  overlap = 100
): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  let i = 0;

  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }
    i += chunkSize - overlap;
    if (i >= words.length) break;
  }

  return chunks;
}

// Rough token count estimate (1 token ≈ 4 chars)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
