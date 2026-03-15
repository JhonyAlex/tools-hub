"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  getAurisHeaders,
  getAurisIdentityQueryParam,
} from "@/tools/auris-lm/lib/clientIdentity";

export interface AurisDocument {
  id: string;
  spaceId: string;
  originalName: string;
  storedPath: string;
  mimeType: string;
  fileSize: number;
  checksum?: string | null;
  status: "queued" | "processing" | "ready" | "partial" | "error";
  errorMessage?: string | null;
  createdAt: string;
}

export interface UploadResult {
  ok: boolean;
  error?: string;
  code?: string;
}

export interface DocumentActionResult {
  ok: boolean;
  error?: string;
  code?: string;
}

export function useDocuments(spaceId: string | null) {
  const [documents, setDocuments] = useState<AurisDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDocuments = useCallback(async (silent = false) => {
    if (!spaceId) return;
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/auris-lm/spaces/${spaceId}/documents`, {
        headers: getAurisHeaders(),
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { documents: AurisDocument[] };
      const incoming = data.documents ?? [];
      // Merge: prefer server data but keep optimistic entries not yet in server response
      setDocuments((prev) => {
        const serverIds = new Set(incoming.map((d) => d.id));
        const optimistic = prev.filter(
          (d) => !serverIds.has(d.id) && (d.status === "queued" || d.status === "processing")
        );
        return [...incoming, ...optimistic];
      });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [spaceId]);

  // Poll while queued/processing docs exist so background processing is reflected without refresh.
  const hasPendingDocs = documents.some(
    (d) => d.status === "queued" || d.status === "processing"
  );
  useEffect(() => {
    if (!hasPendingDocs) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }
    if (!pollRef.current) {
      pollRef.current = setInterval(() => void fetchDocuments(true), 1500);
    }
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [hasPendingDocs, fetchDocuments]);

  useEffect(() => {
    if (spaceId) {
      setDocuments([]);
      void fetchDocuments();
    }
  }, [spaceId, fetchDocuments]);

  const uploadDocument = useCallback(
    async (file: File): Promise<UploadResult> => {
      if (!spaceId) return { ok: false, error: "Espacio no seleccionado" };
      try {
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", file);

        // Use XMLHttpRequest for real progress tracking
        return await new Promise<UploadResult>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText) as {
                document?: AurisDocument;
                documents?: AurisDocument[];
              };
              const incoming = data.documents ?? (data.document ? [data.document] : []);
              setDocuments((prev) => {
                const seen = new Set(prev.map((d) => d.id));
                const merged = [...incoming.filter((d) => !seen.has(d.id)), ...prev];
                return merged;
              });
              setTimeout(() => {
                void fetchDocuments(true);
              }, 150);
              resolve({ ok: true });
            } else {
              let parsed: { error?: string; code?: string; duplicate?: { originalName?: string } } | null = null;
              try {
                parsed = JSON.parse(xhr.responseText) as {
                  error?: string;
                  code?: string;
                  duplicate?: { originalName?: string };
                };
              } catch {
                parsed = null;
              }

              if (xhr.status === 409 && parsed?.code === "DUPLICATE_DOCUMENT") {
                const duplicateName = parsed.duplicate?.originalName;
                resolve({
                  ok: false,
                  code: parsed.code,
                  error: duplicateName
                    ? `La fuente ya existe (duplicado por hash SHA-256): ${duplicateName}.`
                    : "La fuente ya existe (duplicado por hash SHA-256).",
                });
                return;
              }

              resolve({
                ok: false,
                code: parsed?.code,
                error: parsed?.error ?? "Error al subir el archivo.",
              });
            }
          });
          xhr.addEventListener("error", () => resolve({ ok: false, error: "Error de red al subir el archivo." }));
          xhr.open("POST", `/api/auris-lm/spaces/${spaceId}/documents`);
          xhr.send(formData);
        });
      } catch {
        return { ok: false, error: "Error inesperado durante la subida." };
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [fetchDocuments, spaceId]
  );

  const deleteDocument = useCallback(
    async (docId: string): Promise<boolean> => {
      if (!spaceId) return false;
      try {
        const res = await fetch(
          `/api/auris-lm/spaces/${spaceId}/documents/${docId}`,
          {
            method: "DELETE",
            headers: getAurisHeaders(),
            cache: "no-store",
          }
        );
        if (!res.ok) return false;
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        return true;
      } catch {
        return false;
      }
    },
    [spaceId]
  );

  const renameDocument = useCallback(
    async (docId: string, originalName: string): Promise<boolean> => {
      if (!spaceId) return false;

      const nextName = originalName.trim();
      if (!nextName) return false;

      try {
        const res = await fetch(
          `/api/auris-lm/spaces/${spaceId}/documents/${docId}`,
          {
            method: "PATCH",
            headers: getAurisHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ originalName: nextName }),
            cache: "no-store",
          }
        );

        if (!res.ok) return false;

        const data = (await res.json()) as { document?: AurisDocument };
        const updated = data.document;
        if (!updated) return false;

        setDocuments((prev) =>
          prev.map((doc) => (doc.id === docId ? { ...doc, originalName: updated.originalName } : doc))
        );
        return true;
      } catch {
        return false;
      }
    },
    [spaceId]
  );

  const suggestDocumentName = useCallback(
    async (docId: string): Promise<DocumentActionResult> => {
      if (!spaceId) {
        return { ok: false, error: "Espacio no seleccionado" };
      }

      try {
        const res = await fetch(
          `/api/auris-lm/spaces/${spaceId}/documents/${docId}/suggest-name`,
          {
            method: "POST",
            headers: getAurisHeaders(),
            cache: "no-store",
          }
        );

        if (!res.ok) {
          let parsed: { error?: string; code?: string } | null = null;
          try {
            parsed = (await res.json()) as { error?: string; code?: string };
          } catch {
            parsed = null;
          }

          return {
            ok: false,
            code: parsed?.code,
            error: parsed?.error ?? "No se pudo sugerir el nombre de la fuente.",
          };
        }

        const data = (await res.json()) as { document?: AurisDocument };
        const updated = data.document;
        if (!updated) {
          return { ok: false, error: "El servidor no devolvió el documento actualizado." };
        }

        setDocuments((prev) =>
          prev.map((doc) => (doc.id === docId ? { ...doc, originalName: updated.originalName } : doc))
        );
        return { ok: true };
      } catch {
        return { ok: false, error: "Error de red al sugerir el nombre." };
      }
    },
    [spaceId]
  );

  const downloadDocument = useCallback(
    (docId: string, originalName: string) => {
      if (!spaceId) return;
      const a = document.createElement("a");
      const identityQuery = getAurisIdentityQueryParam();
      a.href = identityQuery
        ? `/api/auris-lm/spaces/${spaceId}/documents/${docId}/download?${identityQuery}`
        : `/api/auris-lm/spaces/${spaceId}/documents/${docId}/download`;
      a.download = originalName;
      a.click();
    },
    [spaceId]
  );

  return {
    documents,
    loading,
    uploading,
    uploadProgress,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    renameDocument,
    suggestDocumentName,
    downloadDocument,
  };
}
