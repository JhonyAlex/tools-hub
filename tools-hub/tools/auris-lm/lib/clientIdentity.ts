"use client";

const STORAGE_KEY = "auris-user-id";

export function getAurisUserId(): string {
  if (typeof window === "undefined") return "server-anonymous";

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing && existing.trim()) return existing;

  const created = `u_${crypto.randomUUID()}`;
  window.localStorage.setItem(STORAGE_KEY, created);
  return created;
}

export function getAurisHeaders(extra?: HeadersInit): HeadersInit {
  return {
    ...(extra ?? {}),
    "x-user-id": getAurisUserId(),
  };
}

export function getAurisIdentityQueryParam(): string {
  return `uid=${encodeURIComponent(getAurisUserId())}`;
}
