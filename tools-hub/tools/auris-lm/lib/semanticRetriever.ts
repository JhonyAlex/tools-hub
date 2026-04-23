import { Prisma } from "@prisma/client";
import { db } from "@/core/lib/db";
import { embedTexts, toPgVectorLiteral } from "@/tools/auris-lm/lib/embeddingClient";
import { rankChunks, type ChunkData, type ChunkResult } from "@/tools/auris-lm/lib/ragEngine";

interface SemanticChunkRow {
  id: string;
  documentId: string;
  spaceId: string;
  content: string;
  docName: string;
  score: number;
}

function diversifyByDocument<T extends { id: string; documentId: string }>(
  items: T[],
  topK: number
): T[] {
  if (items.length <= topK) return items;

  const byDoc = new Map<string, T[]>();
  for (const item of items) {
    const bucket = byDoc.get(item.documentId);
    if (bucket) {
      bucket.push(item);
    } else {
      byDoc.set(item.documentId, [item]);
    }
  }

  const firstPass: T[] = [];
  for (const bucket of byDoc.values()) {
    if (bucket.length > 0) firstPass.push(bucket[0]);
    if (firstPass.length >= topK) break;
  }

  if (firstPass.length >= topK) return firstPass.slice(0, topK);

  const selectedIds = new Set(firstPass.map((item) => item.id));
  const rest = items.filter((item) => !selectedIds.has(item.id));
  return [...firstPass, ...rest].slice(0, topK);
}

export async function retrieveRelevantChunks(params: {
  userId: string;
  spaceId: string;
  query: string;
  topK?: number;
}): Promise<ChunkResult[]> {
  const { userId, spaceId, query, topK = 8 } = params;

  try {
    const [embedding] = await embedTexts([query]);
    const queryVector = toPgVectorLiteral(embedding);
    const candidateLimit = Math.max(topK * 4, 24);

    const rows = await db.$queryRaw<SemanticChunkRow[]>(Prisma.sql`
      SELECT
        c.id,
        c."documentId",
        c."spaceId",
        c.content,
        d."originalName" AS "docName",
        1 - (c.embedding <=> CAST(${queryVector} AS vector)) AS score
      FROM "AurisLMChunk" c
      JOIN "AurisLMDocument" d ON d.id = c."documentId"
      WHERE c."userId" = ${userId}
        AND c."spaceId" = ${spaceId}
        AND c.embedding IS NOT NULL
      ORDER BY c.embedding <=> CAST(${queryVector} AS vector)
      LIMIT ${candidateLimit}
    `);

    if (rows.length > 0) {
      const diversifiedRows = diversifyByDocument(rows, topK);
      return diversifiedRows.map((row) => ({
        id: row.id,
        documentId: row.documentId,
        spaceId: row.spaceId,
        content: row.content,
        docName: row.docName,
        score: row.score,
      }));
    }
  } catch (error) {
    console.warn("[AurisLM] Semantic retrieval failed. Falling back to BM25.", error);
  }

  const lexicalChunks = await db.$queryRaw<Array<{
    id: string;
    documentId: string;
    spaceId: string;
    content: string;
    document: { originalName: string };
  }>>(Prisma.sql`
    SELECT
      c.id,
      c."documentId",
      c."spaceId",
      c.content,
      json_build_object('originalName', d."originalName") AS document
    FROM "AurisLMChunk" c
    JOIN "AurisLMDocument" d ON d.id = c."documentId"
    WHERE c."userId" = ${userId}
      AND c."spaceId" = ${spaceId}
  `);

  const rankedChunks = rankChunks(query, lexicalChunks as ChunkData[], Math.max(topK * 4, 24));
  return diversifyByDocument(rankedChunks, topK);
}
