"use client";

import { useState, useEffect } from "react";
import { X, FolderOpen, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { getAurisSpaces, exportToAuris } from "../actions/exportToAuris";

interface AurisSpace {
    id: string;
    name: string;
    description: string | null;
    documentCount: number;
}

interface ExportToAurisModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    extractedText: string;
    mimeType: string;
}

export function ExportToAurisModal({
    isOpen,
    onClose,
    fileName,
    extractedText,
    mimeType,
}: ExportToAurisModalProps) {
    const [spaces, setSpaces] = useState<AurisSpace[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setResult(null);
        setLoading(true);

        getAurisSpaces()
            .then(setSpaces)
            .catch(() => setSpaces([]))
            .finally(() => setLoading(false));
    }, [isOpen]);

    const handleExport = async (spaceId: string) => {
        setExporting(true);
        setResult(null);

        const res = await exportToAuris(spaceId, fileName, extractedText, mimeType);

        if (res.success) {
            setResult({
                success: true,
                message: `Exportado correctamente: ${res.chunksCreated} fragmentos creados.`,
            });
        } else {
            setResult({
                success: false,
                message: res.error || "Error al exportar.",
            });
        }

        setExporting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 mx-4 w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                    <h2 className="text-lg font-semibold">Llevar a AurisLM</h2>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <p className="mb-4 text-sm text-muted-foreground">
                        Exportar <strong className="text-foreground">{fileName}</strong> a un espacio de AurisLM.
                        El documento será chunkeado e indexado automáticamente.
                    </p>

                    {/* Result banner */}
                    {result && (
                        <div
                            className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${result.success
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-destructive/10 text-destructive"
                                }`}
                        >
                            {result.success ? (
                                <CheckCircle className="h-4 w-4 shrink-0" />
                            ) : (
                                <AlertCircle className="h-4 w-4 shrink-0" />
                            )}
                            <span>{result.message}</span>
                        </div>
                    )}

                    {/* Spaces list */}
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : spaces.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No hay espacios en AurisLM. Crea uno primero desde la herramienta AurisLM.
                        </div>
                    ) : (
                        <div className="max-h-64 space-y-2 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50">
                            {spaces.map((space) => (
                                <button
                                    key={space.id}
                                    onClick={() => handleExport(space.id)}
                                    disabled={exporting || (result?.success ?? false)}
                                    className="flex w-full items-center gap-3 rounded-lg border border-border/50 px-4 py-3
                             text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
                                >
                                    <FolderOpen className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{space.name}</p>
                                        {space.description && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {space.description}
                                            </p>
                                        )}
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {space.documentCount} docs
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-border/50 px-6 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground
                       transition-colors hover:bg-muted hover:text-foreground"
                    >
                        {result?.success ? "Cerrar" : "Cancelar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
