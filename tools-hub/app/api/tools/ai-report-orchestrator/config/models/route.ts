import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { createModel, listModels } from "../_service";
import type { ModelEntry } from "@/tools/ai-report-orchestrator/lib/config-types";

export async function GET(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  const models = await listModels();
  return NextResponse.json({ models });
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

  const data = body as ModelEntry;
  if (!data?.id || !data?.nombre || !data?.providerId || !data?.prompt) {
    return NextResponse.json({ error: "Invalid model payload" }, { status: 400 });
  }

  try {
    const model = await createModel(userId, data);
    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create model" },
      { status: 400 }
    );
  }
}
