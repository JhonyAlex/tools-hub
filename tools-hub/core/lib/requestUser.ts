import { NextRequest } from "next/server";

const USER_HEADER = "x-user-id";

export function getRequestUserId(req: NextRequest): string | null {
  const headerValue = req.headers.get(USER_HEADER)?.trim();
  if (headerValue) return headerValue;

  const queryValue = req.nextUrl.searchParams.get("uid")?.trim();
  if (queryValue) return queryValue;

  return null;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "No autorizado: falta x-user-id" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
