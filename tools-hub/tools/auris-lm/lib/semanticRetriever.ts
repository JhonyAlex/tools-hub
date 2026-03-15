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
      LIMIT ${topK}
    `);

    if (rows.length > 0) {
      return rows.map((row) => ({
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

  return rankChunks(query, lexicalChunks as ChunkData[], topK);
}
