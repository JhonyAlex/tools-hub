"use client";

import { useRef, useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import html2canvas from "html2canvas";

interface CopyableChartProps {
    children: React.ReactNode;
    /** Label shown in el tooltip del botón (opcional) */
    label?: string;
}

/**
 * Envuelve un gráfico (Card) y muestra un botón flotante al hacer hover
 * para copiar la imagen del área del gráfico al portapapeles como PNG.
 *
 * Captura solo el nodo interno (el contenido del gráfico), sin bordes de card.
 */
export function CopyableChart({ children, label = "Copiar imagen" }: CopyableChartProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [copying, setCopying] = useState(false);
    const [copied, setCopied] = useState(false);

    const canvasToBlob = useCallback((canvas: HTMLCanvasElement) => {
        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/png");
        });
    }, []);

    const handleCopy = useCallback(async () => {
        if (!wrapperRef.current || copying) return;
        setCopying(true);

        try {
            // Capturamos el nodo wrapper directamente (sin bordes ni sombras de la card)
            const canvas = await html2canvas(wrapperRef.current, {
                backgroundColor: null,
                scale: 2, // mayor resolución para que quede nítido
                useCORS: true,
                logging: false,
                // Quitamos sombras y bordes del wrapper antes de capturar
                onclone: (doc, el) => {
                    el.style.boxShadow = "none";
                    el.style.border = "none";
                    el.style.borderRadius = "0";
                },
            });

            const blob = await canvasToBlob(canvas);
            if (!blob) {
                throw new Error("No se pudo generar la imagen del gráfico.");
            }

            try {
                const canWriteImage =
                    typeof window !== "undefined" &&
                    window.isSecureContext &&
                    typeof navigator.clipboard?.write === "function" &&
                    typeof ClipboardItem !== "undefined";

                if (!canWriteImage) {
                    throw new Error("Clipboard API de imagen no disponible");
                }

                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob }),
                ]);
            } catch {
                // Fallback confiable si copiar imagen no está soportado por el navegador.
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "grafico-mantenimiento.png";
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
            }

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("[CopyableChart] Error al copiar imagen:", error);
        } finally {
            setCopying(false);
        }
    }, [canvasToBlob, copying]);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 3000)}
        >
            {/* El ref apunta aquí: captura el gráfico sin bordes externos */}
            <div ref={wrapperRef}>{children}</div>

            {/* Botón flotante */}
            <button
                onClick={handleCopy}
                aria-label={label}
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    cursor: copying ? "wait" : "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    backgroundColor: copied
                        ? "rgba(34,197,94,0.85)"
                        : "rgba(0,0,0,0.55)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    opacity: isHovered ? 1 : 0,
                    pointerEvents: isHovered ? "auto" : "none",
                    transition: "opacity 0.18s ease, background-color 0.2s ease",
                }}
            >
                {copied ? (
                    <>
                        <Check size={13} strokeWidth={2.5} />
                        ¡Copiado!
                    </>
                ) : (
                    <>
                        <Copy size={13} strokeWidth={2} />
                        {copying ? "Capturando..." : label}
                    </>
                )}
            </button>
        </div>
    );
}
