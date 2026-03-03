"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadSectionProps {
  onFile: (content: string, fileName: string) => void;
  isLoading: boolean;
}

export function UploadSection({ onFile, isLoading }: UploadSectionProps) {
  const [dragging, setDragging] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;
      setFileSelected(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        onFile((e.target?.result as string) ?? "", file.name);
        setTimeout(() => setFileSelected(false), 1000);
      };
      reader.readAsText(file, "utf-8");
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
        dragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
        isLoading && "pointer-events-none opacity-60",
        fileSelected && "border-green-500 bg-green-500/5"
      )}
    >
      {/* Background gradient animation on drag */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300",
          dragging && "opacity-100"
        )}
      />

      {/* Ripple effect container */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-primary/5 transform scale-0 rounded-full transition-transform duration-500",
            dragging && "scale-[3]"
          )}
          style={{ transformOrigin: "center" }}
        />
      </div>

      <div className="relative flex flex-col items-center justify-center gap-4 p-10 sm:p-12">
        {/* Icon container */}
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
            dragging
              ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25"
              : fileSelected
              ? "bg-green-500 text-white scale-110 shadow-lg shadow-green-500/25"
              : "bg-background text-primary shadow-md border border-border"
          )}
        >
          {fileSelected ? (
            <CheckCircle2 className="h-8 w-8 animate-scale-in" />
          ) : dragging ? (
            <Upload className="h-8 w-8 animate-bounce-soft" />
          ) : (
            <FileText className="h-8 w-8" />
          )}
        </div>

        {/* Text content */}
        <div className="text-center space-y-2">
          <p className="text-base font-medium">
            {dragging ? (
              <span className="text-primary">Suelta el archivo aquí</span>
            ) : fileSelected ? (
              <span className="text-green-600">¡Archivo cargado!</span>
            ) : (
              <>
                Arrastra tu archivo CSV aquí o{" "}
                <label className="cursor-pointer text-primary hover:text-primary/80 underline underline-offset-4 transition-colors">
                  selecciónalo
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={onInputChange}
                    disabled={isLoading}
                  />
                </label>
              </>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            Exportación Primavera · Separador punto y coma (;)
          </p>
        </div>

        {/* File format badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            CSV
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            UTF-8
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Primavera
          </span>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm">
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full border border-primary/30 opacity-20" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Procesando archivo...
          </p>
        </div>
      )}
    </div>
  );
}

// Error state component
export function UploadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10 p-4 animate-in">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Error al procesar el archivo
          </p>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
