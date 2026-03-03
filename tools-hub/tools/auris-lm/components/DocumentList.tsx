"use client";
import { useState } from "react";
import { FileText, FileAudio, Trash2, Download, Loader2, AlertCircle, CheckCircle2, ClipboardPaste, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AurisDocument } from "../lib/useDocuments";
import { UploadDropzone } from "./UploadDropzone";
import { DocumentPreviewModal } from "./DocumentPreviewModal";

interface DocumentListProps {
  spaceId: string;
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
      <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border-amber-500/20">
        <Loader2 className="size-2.5 animate-spin" />
        Procesando
      </Badge>
    );
  }
  if (status === "ready") {
    return (
      <Badge className="flex items-center gap-1.5 px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none">
        <CheckCircle2 className="size-2.5" />
        Listo
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="flex items-center gap-1.5 px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider shadow-none" title={errorMessage ?? ""}>
      <AlertCircle className="size-2.5" />
      Error
    </Badge>
  );
}

export function DocumentList({
  spaceId,
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
  // ── Preview modal
  const [previewDoc, setPreviewDoc] = useState<AurisDocument | null>(null);

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
      setUploadError("No se pudo guardar el texto.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tab switcher */}
      <div className="flex p-1 rounded-xl bg-muted/50 border shadow-inner">
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all",
            tab === "file"
              ? "bg-card text-primary shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => { setTab("file"); setUploadError(null); }}
        >
          <Upload className="size-3.5" />
          Subir Archivo
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all",
            tab === "text"
              ? "bg-card text-primary shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => { setTab("text"); setUploadError(null); }}
        >
          <ClipboardPaste className="size-3.5" />
          Pegar Texto
        </button>
      </div>

      {/* Tab: file upload */}
      {tab === "file" && (
        <div className="animate-in fade-in duration-300">
          <UploadDropzone
            onFiles={async (files) => {
              setUploadError(null);
              const ok = await onUpload(files);
              if (!ok) setUploadError("Error al subir el archivo.");
            }}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
          {uploadError && (
            <p className="mt-2 text-[11px] font-medium text-destructive flex items-center gap-1">
              <AlertCircle className="size-3" /> {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Tab: paste text */}
      {tab === "text" && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-300">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Título descriptivo..."
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              maxLength={80}
              className="w-full rounded-xl border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <textarea
              placeholder="Pega el contenido aquí..."
              value={textBody}
              onChange={(e) => setTextBody(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-xl border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all custom-scrollbar"
            />
          </div>
          {uploadError && (
            <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
              <AlertCircle className="size-3" /> {uploadError}
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {textBody.trim().length > 0 ? `${textBody.trim().length} CARACTERES` : ""}
            </span>
            <Button
              size="sm"
              onClick={() => void handleAddText()}
              disabled={!textBody.trim() || addingText}
              className="rounded-full shadow-md"
            >
              {addingText ? (
                <><Loader2 className="size-3.5 animate-spin mr-1.5" />Guardando</>
              ) : (
                <><CheckCircle2 className="size-3.5 mr-1.5" />Guardar Fuente</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Document list */}
      <div className="mt-2 space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {documents.length} FUENTE{documents.length !== 1 ? "S" : ""} CARGADAS
          </p>
          {loading && <Loader2 className="size-3 animate-spin text-primary" />}
        </div>
        
        {documents.length === 0 && !loading ? (
          <div className="py-8 px-4 rounded-2xl border border-dashed text-center bg-muted/5">
            <FileText className="size-8 mx-auto mb-2 text-muted-foreground/20" />
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tighter">
              Sin fuentes activas
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "group relative flex flex-col gap-2 rounded-xl border bg-card p-3 transition-all duration-200 shadow-sm",
                  doc.status === "error" ? "border-destructive/30 bg-destructive/5" : "hover:border-primary/30 hover:shadow-md",
                  doc.status === "ready" && "cursor-pointer"
                )}
                onClick={() => doc.status === "ready" && setPreviewDoc(doc)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    doc.status === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    {isAudioType(doc.mimeType) ? (
                      <FileAudio className="size-4.5" />
                    ) : (
                      <FileText className="size-4.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-none mb-1.5">
                      {doc.originalName}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground/60">
                        {formatBytes(doc.fileSize)}
                      </span>
                      <StatusBadge status={doc.status} errorMessage={doc.errorMessage} />
                    </div>
                  </div>
                </div>

                {/* Hover actions */}
                <div className="flex items-center justify-end gap-1 mt-1 pt-2 border-t border-dashed opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {doc.status === "ready" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-md"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-md"
                    onClick={() => onDownload(doc.id, doc.originalName)}
                  >
                    <Download className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(doc.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document preview modal */}
      <DocumentPreviewModal
        document={previewDoc}
        spaceId={spaceId}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
