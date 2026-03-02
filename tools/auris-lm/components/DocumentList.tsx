"use client";
import { FileText, FileAudio, Trash2, Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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
  onUpload: (files: File[]) => Promise<void>;
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
  return (
    <div className="flex flex-col gap-4">
      {/* Upload zone */}
      <UploadDropzone
        onFiles={onUpload}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />

      {/* Document list */}
      {loading && documents.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando documentos…
        </div>
      ) : documents.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground text-center">
          Sube documentos para comenzar a chatear.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-0.5">
            {documents.length} documento{documents.length !== 1 ? "s" : ""}
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
                  <p className="text-xs text-destructive mt-1 truncate">
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
