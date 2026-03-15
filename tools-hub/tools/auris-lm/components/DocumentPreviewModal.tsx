"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, FileAudio, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/tools/doc-chat/components/MarkdownRenderer";
import type { AurisDocument } from "../lib/useDocuments";
import { getAurisHeaders, getAurisIdentityQueryParam } from "@/tools/auris-lm/lib/clientIdentity";

interface DocumentWithText extends AurisDocument {
  extractedText: string;
}

interface DocumentPreviewModalProps {
  document: AurisDocument | null;
  spaceId: string;
  onClose: () => void;
}

function isAudioType(mimeType: string) {
  return mimeType.startsWith("audio/") || mimeType.startsWith("video/webm");
}

export function DocumentPreviewModal({
  document: doc,
  spaceId,
  onClose,
}: DocumentPreviewModalProps) {
  const [data, setData] = useState<DocumentWithText | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!doc) { setData(null); setError(null); return; }
    setData(null);
    setError(null);
    setLoading(true);
    fetch(`/api/auris-lm/spaces/${spaceId}/documents/${doc.id}`, {
      headers: getAurisHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudo cargar el documento");
        const json = await res.json() as { document: DocumentWithText };
        setData(json.document);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error desconocido"))
      .finally(() => setLoading(false));
  }, [doc, spaceId]);

  if (!doc) return null;

  const handleCopy = async () => {
    if (!data?.extractedText) return;
    await navigator.clipboard.writeText(data.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAudio = isAudioType(doc.mimeType);
  const wordCount = data?.extractedText
    ? data.extractedText.trim().split(/\s+/).length
    : 0;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex flex-col w-full max-w-2xl max-h-[85vh] rounded-xl border bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="shrink-0 text-muted-foreground">
            {isAudio ? <FileAudio className="size-4" /> : <FileText className="size-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{doc.originalName}</p>
            {data && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAudio ? "Transcripción" : "Texto extraído"} · {wordCount.toLocaleString()} palabras
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {data?.extractedText && (
              <Button size="icon-sm" variant="ghost" onClick={() => void handleCopy()} title="Copiar texto">
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </Button>
            )}
            <Button size="icon-sm" variant="ghost" onClick={onClose} title="Cerrar">
              <X className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Cargando…</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* PDF inline viewer */}
          {!loading && !error && doc.mimeType === "application/pdf" && (
            <iframe
              src={`/api/auris-lm/spaces/${spaceId}/documents/${doc.id}/download?inline=true&${getAurisIdentityQueryParam()}`}
              title={doc.originalName}
              className="w-full h-full min-h-[60vh] border-0 rounded-lg"
            />
          )}

          {/* Text preview for non-PDF */}
          {data && !loading && doc.mimeType !== "application/pdf" && (
            <>
              {data.status === "error" && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive mb-3">
                  {data.errorMessage ?? "Error al procesar el documento"}
                </div>
              )}
              {data.status === "processing" && (
                <div className="flex items-center gap-2 py-8 text-muted-foreground justify-center text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  El documento aún se está procesando…
                </div>
              )}
              {data.status === "ready" && data.extractedText ? (
                doc.originalName && /\.(md|markdown)$/i.test(doc.originalName) ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
                    <MarkdownRenderer content={data.extractedText} />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                    {data.extractedText}
                  </pre>
                )
              ) : data.status === "ready" && !data.extractedText ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No hay texto disponible para este documento.
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
