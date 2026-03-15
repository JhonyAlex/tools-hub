import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export function getRequestUserId(req: NextRequest): string | null {
  void req;
  const { userId } = auth();
  return userId ?? null;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "No autorizado: sesión de usuario no válida" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
