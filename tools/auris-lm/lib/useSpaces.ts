"use client";
import { useState, useCallback, useEffect } from "react";

export interface AurisSpace {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { documents: number };
}

export function useSpaces() {
  const [spaces, setSpaces] = useState<AurisSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/auris-lm/spaces");
      if (!res.ok) throw new Error("Error al cargar espacios");
      const data = await res.json();
      setSpaces(data.spaces ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSpaces();
  }, [fetchSpaces]);

  const createSpace = useCallback(
    async (name: string, description?: string): Promise<AurisSpace | null> => {
      try {
        const res = await fetch("/api/auris-lm/spaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        if (!res.ok) throw new Error("Error al crear espacio");
        const data = await res.json();
        const newSpace: AurisSpace = data.space;
        setSpaces((prev) => [newSpace, ...prev]);
        return newSpace;
      } catch {
        return null;
      }
    },
    []
  );

  const updateSpace = useCallback(
    async (id: string, name: string, description?: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/auris-lm/spaces/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        setSpaces((prev) =>
          prev.map((s) => (s.id === id ? data.space : s))
        );
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const deleteSpace = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/auris-lm/spaces/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) return false;
      setSpaces((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    spaces,
    loading,
    error,
    fetchSpaces,
    createSpace,
    updateSpace,
    deleteSpace,
  };
}
