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
  status: "queued" | "processing" | "ready" | "partial" | "error";
  errorMessage?: string | null;
  createdAt: string;
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
    async (file: File): Promise<boolean> => {
      if (!spaceId) return false;
      try {
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", file);

        // Use XMLHttpRequest for real progress tracking
        return await new Promise<boolean>((resolve) => {
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
              resolve(true);
            } else {
              resolve(false);
            }
          });
          xhr.addEventListener("error", () => resolve(false));
          xhr.open("POST", `/api/auris-lm/spaces/${spaceId}/documents`);
          xhr.send(formData);
        });
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
    downloadDocument,
  };
}
