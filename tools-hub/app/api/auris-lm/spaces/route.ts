import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";

// GET /api/auris-lm/spaces – list all spaces with document count
export async function GET(req: NextRequest) {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return unauthorizedResponse();

    const spaces = await db.aurisLMSpace.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { documents: true } },
      },
    });
    return NextResponse.json({ spaces });
  } catch (err) {
    console.error("[AurisLM] GET spaces:", err);
    return NextResponse.json({ error: "Error al obtener espacios" }, { status: 500 });
  }
}

// POST /api/auris-lm/spaces – create a new space
export async function POST(req: NextRequest) {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return unauthorizedResponse();

    const body = await req.json() as { name?: string; description?: string };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }
    const space = await db.aurisLMSpace.create({
      data: {
        userId,
        name: body.name.trim(),
        description: body.description?.trim() || null,
      },
      include: {
        _count: { select: { documents: true } },
      },
    });
    return NextResponse.json({ space }, { status: 201 });
  } catch (err) {
    console.error("[AurisLM] POST spaces:", err);
    return NextResponse.json({ error: "Error al crear espacio" }, { status: 500 });
  }
}
