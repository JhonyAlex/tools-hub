import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { createProvider, listProviders } from "../_service";
import type { ProviderEntry } from "@/tools/ai-report-orchestrator/lib/config-types";

export async function GET(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  const providers = await listProviders();
  return NextResponse.json({ providers });
}

export async function POST(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const data = body as ProviderEntry;
  if (!data?.id || !data?.nombre || !data?.endpoint || !data?.credenciales?.secretRef) {
    return NextResponse.json({ error: "Invalid provider payload" }, { status: 400 });
  }

  try {
    const provider = await createProvider(userId, data);
    return NextResponse.json({ provider }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create provider" },
      { status: 400 }
    );
  }
}
