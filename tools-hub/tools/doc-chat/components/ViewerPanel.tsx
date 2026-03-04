"use client";

import React, { useRef } from "react";
import { FileText, Upload, Send } from "lucide-react";
import { useTextSelection } from "../hooks/useTextSelection";
import { SelectionPopup } from "./SelectionPopup";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ViewerPanelProps {
    text: string | null;
    fileName: string | null;
    pdfUrl: string | null;
    isLoading: boolean;
    onSelectionAction: (instruction: string, selectedText: string) => void;
    onFileUpload: (file: File) => void;
    onExportDocument?: () => void;
}

export function ViewerPanel({
    text,
    fileName,
    pdfUrl,
    isLoading,
    onSelectionAction,
    onFileUpload,
    onExportDocument,
}: ViewerPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { selectedText, position, isVisible, clear } = useTextSelection(containerRef);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onFileUpload(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileUpload(file);
    };

    // Upload zone (no document loaded)
    if (!text && !isLoading) {
        return (
            <div
                className="flex h-full flex-col items-center justify-center rounded-lg border-2
                   border-dashed border-border/60 bg-muted/20 p-8 transition-colors
                   hover:border-primary/40 hover:bg-muted/30"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="mb-4 rounded-full bg-muted/50 p-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">Sube un documento</h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                    Arrastra un archivo aquí o haz clic para seleccionar.
                    <br />
                    <span className="text-xs">PDF, TXT, MD, JS, TS, CSV, JSON...</span>
                </p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
                     transition-colors hover:bg-primary/90"
                >
                    Seleccionar archivo
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.md,.markdown,.csv,.js,.jsx,.ts,.tsx,.html,.css,.xml,.json,.yaml,.yml,.toml,.py,.rb,.go,.rs,.java,.sql,.log,.sh,.bash,.c,.cpp,.h"
                    onChange={handleFileInput}
                />
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center rounded-lg border border-border/40 bg-muted/20">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Extrayendo texto...</p>
                </div>
            </div>
        );
    }

    // PDF native viewer
    if (pdfUrl) {
        return (
            <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-background">
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-4 py-2.5">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate text-sm font-medium">{fileName}</span>
                    <div className="ml-auto flex items-center gap-2">
                        {onExportDocument && (
                            <button
                                onClick={onExportDocument}
                                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <Send className="h-3 w-3" />
                                Llevar a AurisLM
                            </button>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Cambiar archivo
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt,.md,.markdown,.csv,.js,.jsx,.ts,.tsx,.html,.css,.xml,.json,.yaml,.yml,.toml,.py,.rb,.go,.rs,.java,.sql,.log,.sh,.bash,.c,.cpp,.h"
                        onChange={handleFileInput}
                    />
                </div>

                {/* PDF iframe */}
                <iframe
                    src={pdfUrl}
                    title={fileName ?? "Visor PDF"}
                    className="flex-1 border-0"
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
        );
    }

    // Text document viewer
    return (
        <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-4 py-2.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate text-sm font-medium">{fileName}</span>
                <div className="ml-auto flex items-center gap-2">
                    {onExportDocument && (
                        <button
                            onClick={onExportDocument}
                            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <Send className="h-3 w-3" />
                            Llevar a AurisLM
                        </button>
                    )}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Cambiar archivo
                    </button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.md,.markdown,.csv,.js,.jsx,.ts,.tsx,.html,.css,.xml,.json,.yaml,.yml,.toml,.py,.rb,.go,.rs,.java,.sql,.log,.sh,.bash,.c,.cpp,.h"
                    onChange={handleFileInput}
                />
            </div>

            {/* Text content with selection support */}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-y-auto px-5 py-4
                   scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50"
            >
                <SelectionPopup
                    position={position}
                    isVisible={isVisible}
                    selectedText={selectedText}
                    onAction={onSelectionAction}
                    onClose={clear}
                />
                {fileName && /\.(md|markdown)$/i.test(fileName) ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none select-text leading-relaxed text-foreground/90">
                        <MarkdownRenderer content={text!} />
                    </div>
                ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none select-text whitespace-pre-wrap
                            break-words font-mono text-[13px] leading-relaxed text-foreground/90">
                        {text}
                    </div>
                )}
            </div>
        </div>
    );
}
