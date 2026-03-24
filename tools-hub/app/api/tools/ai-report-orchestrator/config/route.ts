import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { getConfigState, updateDefaultModelId } from "./_service";

export async function GET(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  const data = await getConfigState();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
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

  const defaultModelId = (body as { defaultModelId?: string })?.defaultModelId;
  if (!defaultModelId || !defaultModelId.trim()) {
    return NextResponse.json({ error: "defaultModelId is required" }, { status: 400 });
  }

  try {
    const config = await updateDefaultModelId(userId, defaultModelId.trim());
    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update default model" },
      { status: 400 }
    );
  }
}
