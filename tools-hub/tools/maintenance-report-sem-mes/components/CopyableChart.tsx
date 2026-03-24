"use client";

import { useRef, useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import html2canvas from "html2canvas";

const CAPTURE_THEME_VARS: Record<string, string> = {
    "--background": "#ffffff",
    "--foreground": "#111827",
    "--card": "#ffffff",
    "--card-foreground": "#111827",
    "--popover": "#ffffff",
    "--popover-foreground": "#111827",
    "--primary": "#2563eb",
    "--primary-foreground": "#ffffff",
    "--secondary": "#f3f4f6",
    "--secondary-foreground": "#111827",
    "--muted": "#f3f4f6",
    "--muted-foreground": "#6b7280",
    "--accent": "#eff6ff",
    "--accent-foreground": "#111827",
    "--destructive": "#dc2626",
    "--border": "#e5e7eb",
    "--input": "#d1d5db",
    "--ring": "#93c5fd",
    "--chart-1": "#2563eb",
    "--chart-2": "#16a34a",
    "--chart-3": "#f59e0b",
    "--chart-4": "#dc2626",
    "--chart-5": "#7c3aed",
    "--color-gray-100": "#f3f4f6",
    "--color-gray-300": "#d1d5db",
    "--color-gray-700": "#374151",
    "--color-gray-900": "#111827",
    "--color-slate-400": "#94a3b8",
    "--color-slate-500": "#64748b",
    "--color-slate-600": "#475569",
    "--color-zinc-500": "#71717a",
};

const COLOR_PROPERTIES = [
    "color",
    "background-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "outline-color",
    "text-decoration-color",
    "fill",
    "stroke",
    "stop-color",
    "flood-color",
    "lighting-color",
    "caret-color",
    "-webkit-text-fill-color",
    "-webkit-text-stroke-color",
] as const;

const UNSUPPORTED_COLOR_FUNCTION = /(oklch|oklab|lab|lch|color-mix)\(/i;

interface InlineStyleSnapshot {
    property: string;
    priority: string;
    value: string;
}

interface ElementStyleSnapshot {
    element: HTMLElement | SVGElement;
    styles: InlineStyleSnapshot[];
}

interface CopyableChartProps {
    children: React.ReactNode;
    /** Label shown in el tooltip del botón (opcional). */
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

    const normalizeColor = useCallback((value: string) => {
        if (!value || !UNSUPPORTED_COLOR_FUNCTION.test(value)) {
            return value;
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
            return "";
        }

        context.fillStyle = "#000000";
        const previous = context.fillStyle;

        try {
            context.fillStyle = value;
        } catch {
            return "";
        }

        if (context.fillStyle === previous && value !== previous) {
            return "";
        }

        return context.fillStyle;
    }, []);

    const sanitizeClonedColors = useCallback((sourceRoot: HTMLDivElement, clonedRoot: HTMLElement) => {
        const sourceElements = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll("*"))];
        const clonedElements = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll("*"))];

        sourceElements.forEach((sourceElement, index) => {
            const clonedElement = clonedElements[index];
            if (!(clonedElement instanceof HTMLElement) && !(clonedElement instanceof SVGElement)) {
                return;
            }

            const computedStyle = window.getComputedStyle(sourceElement);
            COLOR_PROPERTIES.forEach((property) => {
                const rawValue = computedStyle.getPropertyValue(property).trim();
                if (!UNSUPPORTED_COLOR_FUNCTION.test(rawValue)) {
                    return;
                }

                const safeColor = normalizeColor(rawValue);
                if (!safeColor) {
                    return;
                }

                clonedElement.style.setProperty(property, safeColor, "important");
            });
        });
    }, [normalizeColor]);

    const applySafeCaptureStyles = useCallback((root: HTMLDivElement) => {
        const elements = [root, ...Array.from(root.querySelectorAll("*"))];
        const snapshots: ElementStyleSnapshot[] = [];

        elements.forEach((element) => {
            if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) {
                return;
            }

            const computedStyle = window.getComputedStyle(element);
            const changedStyles: InlineStyleSnapshot[] = [];

            COLOR_PROPERTIES.forEach((property) => {
                const rawValue = computedStyle.getPropertyValue(property).trim();
                if (!UNSUPPORTED_COLOR_FUNCTION.test(rawValue)) {
                    return;
                }

                const safeColor = normalizeColor(rawValue);
                if (!safeColor) {
                    return;
                }

                changedStyles.push({
                    property,
                    value: element.style.getPropertyValue(property),
                    priority: element.style.getPropertyPriority(property),
                });

                element.style.setProperty(property, safeColor, "important");
            });

            if (changedStyles.length > 0) {
                snapshots.push({ element, styles: changedStyles });
            }
        });

        return () => {
            snapshots.forEach(({ element, styles }) => {
                styles.forEach(({ property, value, priority }) => {
                    if (value) {
                        element.style.setProperty(property, value, priority);
                    } else {
                        element.style.removeProperty(property);
                    }
                });
            });
        };
    }, [normalizeColor]);

    const wait = useCallback((ms: number) => {
        return new Promise<void>((resolve) => {
            window.setTimeout(resolve, ms);
        });
    }, []);

    const waitForChartRender = useCallback(async (element: HTMLDivElement) => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        const svg = element.querySelector("svg");
        if (svg) {
            const box = svg.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) {
                await wait(120);
            }
        } else {
            await wait(120);
        }
    }, [wait]);

    const hasMeaningfulPixels = useCallback((canvas: HTMLCanvasElement) => {
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context || canvas.width === 0 || canvas.height === 0) {
            return false;
        }

        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        for (let index = 0; index < data.length; index += 4) {
            const alpha = data[index + 3];
            if (alpha !== 0) {
                return true;
            }
        }

        return false;
    }, []);

    const canvasToBlob = useCallback((canvas: HTMLCanvasElement) => {
        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/png");
        });
    }, []);

    const handleCopy = useCallback(async () => {
        if (!wrapperRef.current || copying) return;
        setCopying(true);

        try {
            const target = wrapperRef.current;
            const bounds = target.getBoundingClientRect();

            if (bounds.width === 0 || bounds.height === 0) {
                throw new Error("El gráfico todavía no terminó de renderizarse.");
            }

            let canvas: HTMLCanvasElement | null = null;
            const restoreCaptureStyles = applySafeCaptureStyles(target);

            try {
                for (let attempt = 0; attempt < 3; attempt += 1) {
                    await waitForChartRender(target);

                    const capturedCanvas = await html2canvas(target, {
                        backgroundColor: null,
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        width: Math.ceil(bounds.width),
                        height: Math.ceil(bounds.height),
                        onclone: (clonedDocument, el) => {
                            Object.entries(CAPTURE_THEME_VARS).forEach(([name, value]) => {
                                clonedDocument.documentElement.style.setProperty(name, value);
                            });

                            clonedDocument.documentElement.style.colorScheme = "light";
                            clonedDocument.body.style.backgroundColor = "#ffffff";

                            el.style.boxShadow = "none";
                            el.style.border = "none";
                            el.style.borderRadius = "0";
                            el.style.overflow = "visible";
                            el.style.backgroundColor = "#ffffff";
                            el.style.color = "#111827";

                            sanitizeClonedColors(target, el);

                            el.querySelectorAll("svg").forEach((svgElement) => {
                                const svg = svgElement as SVGSVGElement;
                                svg.style.overflow = "visible";
                                if (!svg.getAttribute("width")) {
                                    svg.setAttribute("width", `${Math.ceil(bounds.width)}`);
                                }
                                if (!svg.getAttribute("height")) {
                                    svg.setAttribute("height", `${Math.ceil(bounds.height)}`);
                                }
                            });
                        },
                    });

                    if (hasMeaningfulPixels(capturedCanvas)) {
                        canvas = capturedCanvas;
                        break;
                    }

                    await wait(120 * (attempt + 1));
                }
            } finally {
                restoreCaptureStyles();
            }

            if (!canvas) {
                throw new Error("No se pudo capturar el gráfico completo.");
            }

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
    }, [applySafeCaptureStyles, canvasToBlob, copying, hasMeaningfulPixels, sanitizeClonedColors, wait, waitForChartRender]);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 3000)}
        >
            {/* El ref apunta aquí: captura el gráfico sin bordes externos */}
            <div ref={wrapperRef} data-copyable-chart-root="true">{children}</div>

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
