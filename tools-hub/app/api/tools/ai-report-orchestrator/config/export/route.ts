import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";
import { exportConfig } from "../_service";

export async function GET(req: NextRequest) {
  const userId = await getRequestUserId(req);
  if (!userId) {
    return unauthorizedResponse();
  }

  const redacted = req.nextUrl.searchParams.get("redacted") !== "false";
  const data = await exportConfig(redacted);
  return NextResponse.json(data);
}
