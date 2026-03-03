import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { extractPdfText } from "@/tools/auris-lm/lib/pdfExtractor";
import { chunkText, estimateTokens } from "@/tools/auris-lm/lib/ragEngine";

const UPLOADS_BASE = process.env.UPLOADS_DIR ?? "/app/uploads";

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
]);

// GET /api/auris-lm/spaces/[id]/documents
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documents = await db.aurisLMDocument.findMany({
      where: { spaceId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        spaceId: true,
        originalName: true,
        storedPath: true,
        mimeType: true,
        fileSize: true,
        status: true,
        errorMessage: true,
        createdAt: true,
      },
    });
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
    const { id: spaceId } = await params;

    // Verify space exists
    const space = await db.aurisLMSpace.findUnique({ where: { id: spaceId } });
    if (!space) {
      return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const isAudio = mimeType.startsWith("audio/") || mimeType.startsWith("video/webm");
    const isPdf = mimeType === "application/pdf";
    const isText = mimeType === "text/plain";

    if (!ACCEPTED_TYPES.has(mimeType) && !isAudio && !isPdf && !isText) {
      return NextResponse.json(
        { error: `Tipo de archivo no soportado: ${mimeType}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.includes(".") ? file.name.split(".").pop() ?? "bin" : "bin";
    const docId = crypto.randomUUID ? crypto.randomUUID() : `doc_${Date.now()}`;

    // Prepare storage path
    const spaceUploadsDir = path.join(UPLOADS_BASE, "auris-lm", spaceId);
    await mkdir(spaceUploadsDir, { recursive: true });
    const fileName = `${docId}.${ext}`;
    const storedPath = path.join("auris-lm", spaceId, fileName);
    const fullPath = path.join(UPLOADS_BASE, storedPath);
    await writeFile(fullPath, buffer);

    // Create document record with processing status
    const doc = await db.aurisLMDocument.create({
      data: {
        id: docId,
        spaceId,
        originalName: file.name,
        storedPath,
        mimeType,
        fileSize: buffer.length,
        extractedText: "",
        status: "processing",
      },
    });

    // Use setImmediate to ensure the HTTP response is flushed before processing starts.
    // In Next.js standalone (Docker Node.js process), this runs reliably.
    setImmediate(() => {
      void processDocument(docId, buffer, mimeType, spaceId, isAudio, isPdf, isText);
    });

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err) {
    console.error("[AurisLM] POST document:", err);
    return NextResponse.json({ error: "Error al subir documento" }, { status: 500 });
  }
}

async function processDocument(
  docId: string,
  buffer: Buffer,
  mimeType: string,
  spaceId: string,
  isAudio: boolean,
  isPdf: boolean,
  isText: boolean
) {
  try {
    let extractedText = "";

    if (isPdf) {
      extractedText = await extractPdfText(buffer);
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
    const chunkData = chunks.map((content, i) => ({
      documentId: docId,
      spaceId,
      content,
      chunkIndex: i,
      tokenCount: estimateTokens(content),
    }));

    // Update document and create chunks in transaction
    await db.$transaction([
      db.aurisLMDocument.update({
        where: { id: docId },
        data: { extractedText, status: "ready" },
      }),
      db.aurisLMChunk.createMany({ data: chunkData }),
    ]);
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
      diarize: "true",
      utterances: "true",
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
        alternatives?: Array<{ transcript?: string }>;
      }>;
    };
  };

  return (
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ""
  );
}
