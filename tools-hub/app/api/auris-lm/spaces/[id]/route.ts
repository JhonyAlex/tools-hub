import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/core/lib/db";
import { unlink, readdir, rmdir } from "fs/promises";
import path from "path";
import { UPLOADS_BASE } from "@/core/lib/uploads";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";

// PATCH /api/auris-lm/spaces/[id] – rename / update description
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return unauthorizedResponse();

    const { id } = await params;
    const body = await req.json() as { name?: string; description?: string };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const existing = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id
      FROM "AurisLMSpace"
      WHERE id = ${id}
        AND "userId" = ${userId}
      LIMIT 1
    `);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
    }

    const space = await db.aurisLMSpace.update({
      where: { id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim() ?? null,
      },
      include: {
        _count: { select: { documents: true } },
      },
    });
    return NextResponse.json({ space });
  } catch (err) {
    console.error("[AurisLM] PATCH space:", err);
    return NextResponse.json({ error: "Error al actualizar espacio" }, { status: 500 });
  }
}

// DELETE /api/auris-lm/spaces/[id] – delete space + all files
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return unauthorizedResponse();

    const { id } = await params;

    const existing = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id
      FROM "AurisLMSpace"
      WHERE id = ${id}
        AND "userId" = ${userId}
      LIMIT 1
    `);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
    }

    // Delete physical files in uploads/auris-lm/{spaceId}/
    const spaceDir = path.join(UPLOADS_BASE, "auris-lm", id);
    try {
      const files = await readdir(spaceDir);
      await Promise.all(files.map((f) => unlink(path.join(spaceDir, f))));
      await rmdir(spaceDir);
    } catch {
      // Directory may not exist (no files uploaded), ignore
    }

    // Cascade delete in DB (Prisma cascade handles docs, chunks, messages)
    await db.aurisLMSpace.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[AurisLM] DELETE space:", err);
    return NextResponse.json({ error: "Error al eliminar espacio" }, { status: 500 });
  }
}
