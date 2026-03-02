"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";

interface UploadSectionProps {
  onFile: (content: string, fileName: string) => void;
  isLoading: boolean;
}

export function UploadSection({ onFile, isLoading }: UploadSectionProps) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        onFile((e.target?.result as string) ?? "", file.name);
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
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Upload size={28} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">
          Arrastra el CSV aquí o{" "}
          <label className="cursor-pointer text-primary underline underline-offset-2">
            selecciona archivo
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onInputChange}
              disabled={isLoading}
            />
          </label>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Exportación Primavera · CSV con separador punto y coma (;)
        </p>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80">
          <svg
            className="h-8 w-8 animate-spin text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
