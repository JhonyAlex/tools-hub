"use client";
import { useCallback, useRef, useState } from "react";
import { Upload, FileAudio, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadDropzoneProps {
  onFiles: (files: File[]) => Promise<void>;
  uploading: boolean;
  uploadProgress: number;
}

const ACCEPT = ".pdf,.txt,.mp3,.wav,.m4a,.ogg,.webm";
const MAX_SIZE_MB = 50;

export function UploadDropzone({
  onFiles,
  uploading,
  uploadProgress,
}: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setSizeError(null);
      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setSizeError(`"${file.name}" supera el límite de ${MAX_SIZE_MB}MB.`);
          return;
        }
        validFiles.push(file);
      }
      await onFiles(validFiles);
    },
    [onFiles]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      await handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-2">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/30",
          uploading && "pointer-events-none opacity-60"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => void handleDrop(e)}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && !uploading && inputRef.current?.click()
        }
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <FileText className="size-5" />
          <Upload className="size-6 text-primary" />
          <FileAudio className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Arrastra archivos aquí
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, TXT, MP3, WAV, M4A, OGG, WEBM · máx. {MAX_SIZE_MB}MB
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            !uploading && inputRef.current?.click();
          }}
          disabled={uploading}
        >
          <Upload className="size-3.5 mr-1" />
          Seleccionar archivo
        </Button>

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          multiple
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subiendo…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Size error */}
      {sizeError && (
        <p className="text-xs text-destructive">{sizeError}</p>
      )}
    </div>
  );
}
