"use client";

export function getAurisHeaders(extra?: HeadersInit): HeadersInit {
  // Identity is resolved server-side via Clerk auth cookies.
  return { ...(extra ?? {}) };
}

export function getAurisIdentityQueryParam(): string {
  // Kept for backward compatibility in callers; no longer needed.
  return "";
}
