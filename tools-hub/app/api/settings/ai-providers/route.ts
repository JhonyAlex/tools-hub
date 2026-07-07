import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { db } from "@/core/lib/db";
import { encryptValue } from "@/core/lib/ai-provider";
import { createDecipheriv, createHash } from "node:crypto";

const prisma = db as any;

function getEncryptionKey() {
  const secret =
    process.env.ORCHESTRATOR_SETTINGS_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "tools-hub-dev-only-key-change-me";
  return createHash("sha256").update(secret).digest();
}

function decryptValue(payload: string): string | null {
  const [ivRaw, encryptedRaw, tagRaw] = payload.split(":");
  if (!ivRaw || !encryptedRaw || !tagRaw) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivRaw, "base64"));
    decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64")), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) return unauthorizedResponse();

  const providers = await prisma.globalAIProvider.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    providers: providers.map((p: any) => ({
      id: p.id,
      name: p.name,
      baseUrl: p.baseUrl,
      defaultModel: p.defaultModel,
      isDefault: p.isDefault,
      hasApiKey: Boolean(p.encryptedApiKey && decryptValue(p.encryptedApiKey)),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const baseUrl = typeof data.baseUrl === "string" ? data.baseUrl.trim() : "";
  const apiKey = typeof data.apiKey === "string" ? data.apiKey.trim() : "";
  const defaultModel = typeof data.defaultModel === "string" ? data.defaultModel.trim() : "";
  const isDefault = Boolean(data.isDefault);

  if (!name || !baseUrl || !defaultModel) {
    return NextResponse.json({ error: "Nombre, URL Base y Modelo son requeridos." }, { status: 400 });
  }

  // For new providers, apiKey is required
  const existingId = typeof data.id === "string" ? data.id : undefined;
  if (!existingId && !apiKey) {
    return NextResponse.json({ error: "La Clave API es requerida para nuevos proveedores." }, { status: 400 });
  }

  // If setting as default, unset all others
  if (isDefault) {
    await prisma.globalAIProvider.updateMany({ data: { isDefault: false } });
  }

  if (existingId) {
    // Update existing
    const updateData: any = { name, baseUrl, defaultModel, isDefault };
    if (apiKey) updateData.encryptedApiKey = encryptValue(apiKey);

    const updated = await prisma.globalAIProvider.update({
      where: { id: existingId },
      data: updateData,
    });
    return NextResponse.json({ provider: { id: updated.id, name: updated.name, baseUrl: updated.baseUrl, defaultModel: updated.defaultModel, isDefault: updated.isDefault } });
  }

  // Create new
  const created = await prisma.globalAIProvider.create({
    data: { name, baseUrl, encryptedApiKey: encryptValue(apiKey), defaultModel, isDefault },
  });
  return NextResponse.json({ provider: { id: created.id, name: created.name, baseUrl: created.baseUrl, defaultModel: created.defaultModel, isDefault: created.isDefault } }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  await prisma.globalAIProvider.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
