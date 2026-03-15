import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/core/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { extractDocumentText } from "@/tools/auris-lm/lib/pdfExtractor";
import { chunkText, estimateTokens } from "@/tools/auris-lm/lib/ragEngine";
import { UPLOADS_BASE } from "@/core/lib/uploads";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { embedTexts, toPgVectorLiteral } from "@/tools/auris-lm/lib/embeddingClient";

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/webm",
  "video/webm",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// GET /api/auris-lm/spaces/[id]/documents
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getRequestUserId(req);
    if (!userId) return unauthorizedResponse();

    const { id: spaceId } = await params;
    const documents = await db.$queryRaw<Array<{
      id: string;
      spaceId: string;
      originalName: string;
      storedPath: string;
      mimeType: string;
      fileSize: number;
      status: string;
      errorMessage: string | null;
      createdAt: Date;
    }>>(Prisma.sql`
      SELECT
        id,
        "spaceId",
        "originalName",
        "storedPath",
        "mimeType",
        "fileSize",
        status,
        "errorMessage",
        "createdAt"
      FROM "AurisLMDocument"
      WHERE "userId" = ${userId}
        AND "spaceId" = ${spaceId}
      ORDER BY "createdAt" DESC
    `);
    return NextResponse.json({ documents });
  } catch (err) {
    console.error("[AurisLM] GET documents:", err);
    return NextResponse.json({ error: "Error al obtener documentos" }, { status: 500 });
  }
}

// POST /api/auris-lm/spaces/[id]/documents – upload & process file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getRequestUserId(req);
    if (!userId) return unauthorizedResponse();

    const { id: spaceId } = await params;

    // Verify space exists
    const space = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id
      FROM "AurisLMSpace"
      WHERE id = ${spaceId}
        AND "userId" = ${userId}
      LIMIT 1
    `);
    if (space.length === 0) {
      return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
    }

    const formData = await req.formData();
    const filesFromList = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);
    const singleFile = formData.get("file");
    const files =
      filesFromList.length > 0
        ? filesFromList
        : singleFile instanceof File
          ? [singleFile]
          : [];

    if (files.length === 0) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    const spaceUploadsDir = path.join(UPLOADS_BASE, "auris-lm", spaceId);
    await mkdir(spaceUploadsDir, { recursive: true });

    const createdDocuments = [] as Array<{
      id: string;
      spaceId: string;
      originalName: string;
      storedPath: string;
      mimeType: string;
      fileSize: number;
      extractedText: string;
      status: string;
      errorMessage: string | null;
      createdAt: Date;
      userId: string;
      checksum: string | null;
    }>;

    for (const file of files) {
      const mimeType = file.type || "application/octet-stream";
      const isAudio = mimeType.startsWith("audio/") || mimeType.startsWith("video/webm");
      const isPdf = mimeType === "application/pdf";
      const isText = mimeType === "text/plain";
      const isImage = mimeType.startsWith("image/");

      if (!ACCEPTED_TYPES.has(mimeType) && !isAudio && !isPdf && !isText && !isImage) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const checksum = createHash("sha256").update(buffer).digest("hex");

      const duplicate = await db.$queryRaw<Array<{
        id: string;
        userId: string;
        spaceId: string;
        originalName: string;
        storedPath: string;
        mimeType: string;
        fileSize: number;
        checksum: string | null;
        extractedText: string;
        status: string;
        errorMessage: string | null;
        createdAt: Date;
      }>>(Prisma.sql`
        SELECT
          id,
          "userId",
          "spaceId",
          "originalName",
          "storedPath",
          "mimeType",
          "fileSize",
          checksum,
          "extractedText",
          status,
          "errorMessage",
          "createdAt"
        FROM "AurisLMDocument"
        WHERE "userId" = ${userId}
          AND "spaceId" = ${spaceId}
          AND checksum = ${checksum}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `);
      if (duplicate.length > 0) {
        createdDocuments.push(duplicate[0]);
        continue;
      }

      const ext = file.name.includes(".") ? file.name.split(".").pop() ?? "bin" : "bin";
      const docId = crypto.randomUUID ? crypto.randomUUID() : `doc_${Date.now()}`;
      const fileName = `${docId}.${ext}`;
      const storedPath = path.join("auris-lm", spaceId, fileName);
      const fullPath = path.join(UPLOADS_BASE, storedPath);
      await writeFile(fullPath, buffer);

      await db.$executeRaw(Prisma.sql`
        INSERT INTO "AurisLMDocument" (
          id,
          "userId",
          "spaceId",
          checksum,
          "originalName",
          "storedPath",
          "mimeType",
          "fileSize",
          "extractedText",
          status
        )
        VALUES (
          ${docId},
          ${userId},
          ${spaceId},
          ${checksum},
          ${file.name},
          ${storedPath},
          ${mimeType},
          ${buffer.length},
          ${""},
          ${"queued"}
        )
      `);

      createdDocuments.push({
        id: docId,
        userId,
        spaceId,
        originalName: file.name,
        storedPath,
        mimeType,
        fileSize: buffer.length,
        checksum,
        extractedText: "",
        status: "queued",
        errorMessage: null,
        createdAt: new Date(),
      });

      setImmediate(() => {
        void processDocument({
          docId,
          userId,
          spaceId,
          buffer,
          mimeType,
          isAudio,
          isPdf,
          isText,
          isImage,
        });
      });
    }

    if (createdDocuments.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron archivos válidos para procesar" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        document: createdDocuments[0],
        documents: createdDocuments,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[AurisLM] POST document:", err);
    return NextResponse.json({ error: "Error al subir documento" }, { status: 500 });
  }
}

async function processDocument(params: {
  docId: string;
  userId: string;
  spaceId: string;
  buffer: Buffer;
  mimeType: string;
  isAudio: boolean;
  isPdf: boolean;
  isText: boolean;
  isImage: boolean;
}) {
  const { docId, userId, spaceId, buffer, mimeType, isAudio, isPdf, isText, isImage } = params;

  try {
    await db.aurisLMDocument.update({
      where: { id: docId },
      data: { status: "processing", errorMessage: null },
    });

    let extractedText = "";

    if (isImage || isPdf) {
      // Usa extractDocumentText para imágenes (OCR directo) y PDFs (texto + OCR híbrido)
      extractedText = await extractDocumentText(buffer, mimeType);
    } else if (isText) {
      extractedText = buffer.toString("utf-8");
    } else if (isAudio) {
      extractedText = await transcribeWithDeepgram(buffer, mimeType);
    }

    if (!extractedText.trim()) {
      await db.aurisLMDocument.update({
        where: { id: docId },
        data: {
          status: "error",
          errorMessage: "No se pudo extraer texto del archivo",
        },
      });
      return;
    }

    // Create chunks
    const chunks = chunkText(extractedText, 600, 100);
    if (chunks.length === 0) {
      await db.aurisLMDocument.update({
        where: { id: docId },
        data: {
          status: "error",
          errorMessage: "No se pudieron generar fragmentos de texto",
        },
      });
      return;
    }

    const sourceKind = isImage
      ? "image"
      : isAudio
        ? "audio"
        : isPdf
          ? "pdf"
          : "text";
    const modality = isImage ? "ocr" : isAudio ? "audio" : "text";

    const chunkData = chunks.map((content, i) => ({
      id: crypto.randomUUID(),
      userId,
      documentId: docId,
      spaceId,
      sourceKind,
      modality,
      content,
      chunkIndex: i,
      tokenCount: estimateTokens(content),
    }));

    let embeddings: number[][] = [];
    let embeddingError: string | null = null;

    try {
      embeddings = await embedTexts(chunks);
    } catch (error) {
      embeddingError = error instanceof Error ? error.message : "No se pudieron generar embeddings";
      console.warn("[AurisLM] Embedding generation failed:", error);
    }

    // Update document and create chunks in transaction
    await db.$transaction([
      db.aurisLMDocument.update({
        where: { id: docId },
        data: {
          extractedText,
          status: embeddingError ? "partial" : "ready",
          errorMessage: embeddingError,
        },
      }),
      db.aurisLMChunk.createMany({ data: chunkData }),
    ]);

    if (embeddings.length === chunkData.length) {
      try {
        await Promise.all(
          chunkData.map((chunk, index) =>
            db.$executeRaw`
              UPDATE "AurisLMChunk"
              SET embedding = CAST(${toPgVectorLiteral(embeddings[index])} AS vector)
              WHERE id = ${chunk.id}
            `
          )
        );
      } catch (error) {
        const vectorMessage = error instanceof Error
          ? error.message
          : "No se pudieron guardar embeddings";
        console.warn("[AurisLM] Embedding persistence skipped:", error);

        await db.aurisLMDocument.update({
          where: { id: docId },
          data: {
            status: "partial",
            errorMessage: embeddingError
              ? `${embeddingError} | ${vectorMessage}`
              : vectorMessage,
          },
        });
      }
    }
  } catch (err) {
    console.error("[AurisLM] processDocument error:", err);
    const msg = err instanceof Error ? err.message : "Error en el procesamiento";
    try {
      await db.aurisLMDocument.update({
        where: { id: docId },
        data: { status: "error", errorMessage: msg },
      });
    } catch {
      // Ignore secondary error
    }
  }
}

async function transcribeWithDeepgram(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.YOUR_SECRET_DEEPGRAM;
  if (!apiKey) throw new Error("DEEPGRAM_API_KEY no configurada");

  const url =
    "https://api.deepgram.com/v1/listen?" +
    new URLSearchParams({
      model: "nova-3",
      language: "es-419",
      smart_format: "true",
      paragraphs: "true",
      punctuate: "true",
    }).toString();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": mimeType,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Deepgram error ${res.status}: ${text}`);
  }

  const data = await res.json() as {
    results?: {
      channels?: Array<{
        alternatives?: Array<{
          transcript?: string;
          paragraphs?: { transcript?: string };
        }>;
      }>;
    };
  };

  const alt = data.results?.channels?.[0]?.alternatives?.[0];
  // paragraphs.transcript includes proper line breaks when paragraphs=true;
  // fall back to the flat transcript otherwise.
  return alt?.paragraphs?.transcript ?? alt?.transcript ?? "";
}
