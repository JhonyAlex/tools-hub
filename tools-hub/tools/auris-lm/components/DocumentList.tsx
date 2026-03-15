"use client";
import { useState } from "react";
import { FileText, FileAudio, Trash2, Download, Loader2, AlertCircle, CheckCircle2, ClipboardPaste, Upload, Eye, Pencil, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  onRename: (id: string, name: string) => Promise<boolean>;
  onSuggestName: (id: string) => Promise<boolean>;
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
  if (status === "queued") {
    return (
      <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-600 border-slate-500/20">
        <Loader2 className="size-2.5 animate-spin" />
        En cola
      </Badge>
    );
  }
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
  if (status === "partial") {
    return (
      <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 border-amber-500/20" title={errorMessage ?? ""}>
        <AlertCircle className="size-2.5" />
        Parcial
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
  onRename,
  onSuggestName,
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
  const [expandedNameDocId, setExpandedNameDocId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [suggestingDocId, setSuggestingDocId] = useState<string | null>(null);
  const editingDoc = documents.find((doc) => doc.id === editingDocId) ?? null;

  const startRename = (doc: AurisDocument) => {
    setEditingDocId(doc.id);
    setDraftName(doc.originalName);
  };

  const cancelRename = () => {
    setEditingDocId(null);
    setDraftName("");
    setRenamingDocId(null);
  };

  const submitRename = async (doc: AurisDocument) => {
    const nextName = draftName.trim();
    if (!nextName || nextName === doc.originalName) {
      cancelRename();
      return;
    }

    setRenamingDocId(doc.id);
    const ok = await onRename(doc.id, nextName);
    setRenamingDocId(null);

    if (ok) {
      setEditingDocId(null);
      setDraftName("");
      return;
    }

    setUploadError("No se pudo renombrar la fuente.");
  };

  const handleSuggestName = async (doc: AurisDocument) => {
    setUploadError(null);
    setSuggestingDocId(doc.id);
    const ok = await onSuggestName(doc.id);
    setSuggestingDocId(null);

    if (!ok) {
      setUploadError("No se pudo generar un nombre según el contenido.");
    }
  };

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
          <div className="space-y-1.5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "group relative rounded-xl border bg-card px-2.5 py-2 transition-all duration-200 shadow-sm",
                  doc.status === "error"
                    ? "border-destructive/30 bg-destructive/5"
                    : doc.status === "partial"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : doc.status === "queued"
                        ? "border-slate-500/20 bg-slate-500/5"
                      : "hover:border-primary/30 hover:shadow-md",
                  (doc.status === "ready" || doc.status === "error" || doc.status === "partial") && "cursor-pointer"
                )}
                onClick={() => (doc.status === "ready" || doc.status === "error" || doc.status === "partial") && setPreviewDoc(doc)}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    doc.status === "error"
                      ? "bg-destructive/10 text-destructive"
                      : doc.status === "partial"
                        ? "bg-amber-500/10 text-amber-700"
                        : doc.status === "queued"
                          ? "bg-slate-500/10 text-slate-600"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    {isAudioType(doc.mimeType) ? (
                      <FileAudio className="size-4.5" />
                    ) : (
                      <FileText className="size-4.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        className={cn(
                          "min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-foreground",
                          expandedNameDocId === doc.id ? "whitespace-normal break-words" : "truncate"
                        )}
                        title={doc.originalName}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedNameDocId((current) => (current === doc.id ? null : doc.id));
                        }}
                      >
                        {doc.originalName}
                      </button>
                      <span className="shrink-0 text-[10px] font-bold text-muted-foreground/60">
                        {formatBytes(doc.fileSize)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={doc.status} errorMessage={doc.errorMessage} />
                    </div>
                    {(doc.status === "error" || doc.status === "partial") && doc.errorMessage && (
                      <p className="mt-1 text-[11px] leading-snug text-destructive line-clamp-2" title={doc.errorMessage}>
                        {doc.errorMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="mt-2 flex items-center justify-end gap-0.5 border-t border-dashed pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(doc.status === "ready" || doc.status === "error" || doc.status === "partial") && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-md"
                      onClick={() => setPreviewDoc(doc)}
                      title="Abrir fuente"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-md"
                    onClick={() => void handleSuggestName(doc)}
                    title="Nombrar según contenido"
                    disabled={
                      suggestingDocId === doc.id ||
                      doc.status === "queued" ||
                      doc.status === "processing"
                    }
                  >
                    {suggestingDocId === doc.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-md"
                    onClick={() => startRename(doc)}
                    title="Renombrar fuente"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-md"
                    onClick={() => onDownload(doc.id, doc.originalName)}
                    title="Descargar"
                  >
                    <Download className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(doc.id)}
                    title="Eliminar"
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

      {editingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={cancelRename}
        >
          <div
            className="w-full max-w-md rounded-2xl border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Renombrar fuente</p>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {editingDoc.originalName}
                </p>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                className="h-8 w-8 rounded-md"
                onClick={cancelRename}
                title="Cerrar"
              >
                <X className="size-3.5" />
              </Button>
            </div>

            <div className="space-y-3 px-4 py-4">
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submitRename(editingDoc);
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelRename();
                  }
                }}
                className="h-10 rounded-xl text-sm"
                maxLength={160}
                autoFocus
                placeholder="Nuevo nombre de la fuente"
              />
              <p className="text-[11px] text-muted-foreground">
                Este cambio se guardará en la nube para este espacio.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <Button variant="outline" onClick={cancelRename} className="rounded-lg">
                Cancelar
              </Button>
              <Button
                onClick={() => void submitRename(editingDoc)}
                className="rounded-lg"
                disabled={renamingDocId === editingDoc.id || !draftName.trim()}
              >
                {renamingDocId === editingDoc.id ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Guardando
                  </>
                ) : (
                  "Guardar nombre"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
