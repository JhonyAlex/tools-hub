"use client";
import { useState } from "react";
import { FileText, FileAudio, Trash2, Download, Loader2, AlertCircle, CheckCircle2, ClipboardPaste, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AurisDocument } from "../lib/useDocuments";
import { UploadDropzone } from "./UploadDropzone";

interface DocumentListProps {
  documents: AurisDocument[];
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  onUpload: (files: File[]) => Promise<boolean>;
  onDelete: (id: string) => void;
  onDownload: (id: string, name: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAudioType(mimeType: string): boolean {
  return mimeType.startsWith("audio/") || mimeType.startsWith("video/webm");
}

function StatusBadge({ status, errorMessage }: { status: AurisDocument["status"]; errorMessage?: string | null }) {
  if (status === "processing") {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
        <Loader2 className="size-3 animate-spin" />
        Procesando
      </Badge>
    );
  }
  if (status === "ready") {
    return (
      <Badge className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-transparent">
        <CheckCircle2 className="size-3" />
        Listo
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="flex items-center gap-1 text-xs" title={errorMessage ?? ""}>
      <AlertCircle className="size-3" />
      Error
    </Badge>
  );
}

export function DocumentList({
  documents,
  loading,
  uploading,
  uploadProgress,
  onUpload,
  onDelete,
  onDownload,
}: DocumentListProps) {
  // ── Tabs: "file" or "text"
  const [tab, setTab] = useState<"file" | "text">("file");
  // ── Text paste state
  const [textTitle, setTextTitle] = useState("");
  const [textBody, setTextBody] = useState("");
  const [addingText, setAddingText] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAddText = async () => {
    const body = textBody.trim();
    if (!body) return;
    const title = textTitle.trim() || "Texto pegado";
    const fileName = title.replace(/[^a-z0-9_\-. ]/gi, "_").slice(0, 60) + ".txt";
    const file = new File([body], fileName, { type: "text/plain" });
    setAddingText(true);
    setUploadError(null);
    const ok = await onUpload([file]);
    setAddingText(false);
    if (ok) {
      setTextTitle("");
      setTextBody("");
      setTab("file");
    } else {
      setUploadError("No se pudo guardar el texto. Revisa la conexión e intenta de nuevo.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Tab switcher */}
      <div className="flex rounded-lg border bg-muted/30 p-0.5 text-xs font-medium">
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors",
            tab === "file"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => { setTab("file"); setUploadError(null); }}
        >
          <Upload className="size-3" />
          Archivo
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors",
            tab === "text"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => { setTab("text"); setUploadError(null); }}
        >
          <ClipboardPaste className="size-3" />
          Texto
        </button>
      </div>

      {/* Tab: file upload */}
      {tab === "file" && (
        <>
          <UploadDropzone
            onFiles={async (files) => {
              setUploadError(null);
              const ok = await onUpload(files);
              if (!ok) setUploadError("No se pudo subir el archivo. Revisa la conexión e intenta de nuevo.");
            }}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
          {uploadError && (
            <p className="text-xs text-destructive">{uploadError}</p>
          )}
        </>
      )}

      {/* Tab: paste text */}
      {tab === "text" && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Título (ej: Notas reunión, Política interna…)"
            value={textTitle}
            onChange={(e) => setTextTitle(e.target.value)}
            maxLength={80}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          <textarea
            placeholder="Pega o escribe el texto aquí…"
            value={textBody}
            onChange={(e) => setTextBody(e.target.value)}
            rows={7}
            className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          {uploadError && tab === "text" && (
            <p className="text-xs text-destructive">{uploadError}</p>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {textBody.trim().length > 0
                ? `${textBody.trim().length.toLocaleString()} caracteres`
                : ""}
            </span>
            <Button
              size="sm"
              onClick={() => void handleAddText()}
              disabled={!textBody.trim() || addingText}
            >
              {addingText ? (
                <><Loader2 className="size-3.5 animate-spin mr-1" />Añadiendo…</>
              ) : (
                <><ClipboardPaste className="size-3.5 mr-1" />Añadir fuente</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Document list */}
      {loading && documents.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando documentos…
        </div>
      ) : documents.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground text-center">
          Sube documentos o pega texto para comenzar a chatear.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-0.5">
            {documents.length} fuente{documents.length !== 1 ? "s" : ""}
          </p>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors",
                doc.status === "error" && "border-destructive/40 bg-destructive/5"
              )}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0 text-muted-foreground">
                {isAudioType(doc.mimeType) ? (
                  <FileAudio className="size-4" />
                ) : (
                  <FileText className="size-4" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">
                  {doc.originalName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(doc.fileSize)}
                  </span>
                  <StatusBadge status={doc.status} errorMessage={doc.errorMessage} />
                </div>
                {doc.status === "error" && doc.errorMessage && (
                  <p className="text-xs text-destructive mt-1 line-clamp-2">
                    {doc.errorMessage}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="icon-xs"
                  variant="ghost"
                  title="Descargar"
                  onClick={() => onDownload(doc.id, doc.originalName)}
                >
                  <Download />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  title="Eliminar"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(doc.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
