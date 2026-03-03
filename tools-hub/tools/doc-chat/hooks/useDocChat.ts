"use client";

import { useState, useCallback, useRef } from "react";
import type { DocChatMessageData, DocChatSessionData } from "../types";

interface UploadResult {
    sessionId: string;
    fileName: string;
    text: string;
}

interface StreamEvent {
    type: string;
    delta?: string;
}

export function useDocChat() {
    const [session, setSession] = useState<DocChatSessionData | null>(null);
    const [messages, setMessages] = useState<DocChatMessageData[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isAnalyzingRole, setIsAnalyzingRole] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Upload file
    const uploadFile = useCallback(async (file: File) => {
        setIsUploading(true);
        setError(null);
        setMessages([]);
        setSystemPrompt(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/tools/doc-chat/upload", {
                method: "POST",
                body: formData,
            });

            const data = (await res.json()) as UploadResult & { error?: string };

            if (!res.ok) {
                throw new Error(data.error || "Error al subir el archivo.");
            }

            setSession({
                id: data.sessionId,
                fileName: data.fileName,
                mimeType: file.type || "application/octet-stream",
                extractedText: data.text,
                systemPrompt: null,
                createdAt: new Date().toISOString(),
            });

            // Analyze role in background
            setIsAnalyzingRole(true);
            void analyzeRole(data.sessionId);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al subir el archivo.";
            setError(msg);
        } finally {
            setIsUploading(false);
        }
    }, []);

    // Analyze document role (background)
    const analyzeRole = async (sessionId: string) => {
        try {
            const res = await fetch("/api/tools/doc-chat/analyze-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            });

            const data = (await res.json()) as { systemPrompt?: string; error?: string };

            if (res.ok && data.systemPrompt) {
                setSystemPrompt(data.systemPrompt);
                setSession((prev) =>
                    prev ? { ...prev, systemPrompt: data.systemPrompt ?? null } : null
                );
            }
        } catch {
            // Role analysis is non-critical, just continue without it
            console.warn("[DocChat] Role analysis failed, continuing without role.");
        } finally {
            setIsAnalyzingRole(false);
        }
    };

    // Send chat message
    const sendMessage = useCallback(
        async (text: string) => {
            if (!session || !text.trim() || isStreaming) return;

            const userMsg: DocChatMessageData = {
                id: crypto.randomUUID(),
                role: "user",
                content: text.trim(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setIsStreaming(true);
            setError(null);

            const assistantId = crypto.randomUUID();
            const assistantMsg: DocChatMessageData = {
                id: assistantId,
                role: "assistant",
                content: "",
                isStreaming: true,
            };
            setMessages((prev) => [...prev, assistantMsg]);

            abortRef.current = new AbortController();

            try {
                const res = await fetch("/api/tools/doc-chat/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: session.id,
                        message: text.trim(),
                        history: messages.slice(-8).map((m) => ({
                            role: m.role,
                            content: m.content,
                        })),
                    }),
                    signal: abortRef.current.signal,
                });

                if (!res.ok || !res.body) {
                    throw new Error("Error en la respuesta del servidor.");
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                let fullContent = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() ?? "";

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const raw = line.slice(6).trim();
                        if (raw === "[DONE]") continue;

                        try {
                            const event = JSON.parse(raw) as StreamEvent;
                            if (event.type === "delta" && event.delta) {
                                fullContent += event.delta;
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantId ? { ...m, content: fullContent } : m
                                    )
                                );
                            }
                        } catch {
                            // ignore
                        }
                    }
                }

                // Finalize
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? { ...m, content: fullContent, isStreaming: false }
                            : m
                    )
                );
            } catch (err: unknown) {
                const isAbort = err instanceof Error && err.name === "AbortError";
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? {
                                ...m,
                                content: isAbort
                                    ? "*(Respuesta cancelada)*"
                                    : "*(Error al obtener respuesta. Intenta de nuevo.)*",
                                isStreaming: false,
                            }
                            : m
                    )
                );
            } finally {
                setIsStreaming(false);
                abortRef.current = null;
            }
        },
        [session, isStreaming, messages]
    );

    const stopStreaming = useCallback(() => {
        abortRef.current?.abort();
    }, []);

    const clearHistory = useCallback(() => {
        setMessages([]);
    }, []);

    const clearSession = useCallback(() => {
        setSession(null);
        setMessages([]);
        setSystemPrompt(null);
        setError(null);
    }, []);

    return {
        session,
        messages,
        isUploading,
        isStreaming,
        isAnalyzingRole,
        systemPrompt,
        error,
        uploadFile,
        sendMessage,
        stopStreaming,
        clearHistory,
        clearSession,
    };
}
