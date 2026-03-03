"use server";

import { db } from "@/core/lib/db";

// ============================================================
// DocChat -> AurisLM Export Actions
// We interact directly with Prisma models instead of importing
// from auris-lm tool (respecting tool isolation rule).
// ============================================================

interface AurisSpace {
    id: string;
    name: string;
    description: string | null;
    documentCount: number;
}

export async function getAurisSpaces(): Promise<AurisSpace[]> {
    const spaces = await db.aurisLMSpace.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            name: true,
            description: true,
            _count: { select: { documents: true } },
        },
    });

    return spaces.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        documentCount: s._count.documents,
    }));
}

// Text chunking (local copy – cannot import from auris-lm)
function chunkText(text: string, chunkSize = 600, overlap = 100): string[] {
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

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

interface ExportResult {
    success: boolean;
    documentId?: string;
    chunksCreated?: number;
    error?: string;
}

export async function exportToAuris(
    spaceId: string,
    fileName: string,
    extractedText: string,
    mimeType: string
): Promise<ExportResult> {
    try {
        // Create AurisLMDocument
        const doc = await db.aurisLMDocument.create({
            data: {
                spaceId,
                originalName: fileName,
                storedPath: `doc-chat-export/${fileName}`,
                mimeType,
                fileSize: Buffer.byteLength(extractedText, "utf-8"),
                extractedText,
                status: "ready",
            },
        });

        // Chunk and create AurisLMChunks
        const chunks = chunkText(extractedText);
        await db.aurisLMChunk.createMany({
            data: chunks.map((content, index) => ({
                documentId: doc.id,
                spaceId,
                content,
                chunkIndex: index,
                tokenCount: estimateTokens(content),
            })),
        });

        // Update space timestamp
        await db.aurisLMSpace.update({
            where: { id: spaceId },
            data: { updatedAt: new Date() },
        });

        return {
            success: true,
            documentId: doc.id,
            chunksCreated: chunks.length,
        };
    } catch (err) {
        console.error("[DocChat] Export to AurisLM error:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Error al exportar.",
        };
    }
}
