"use client";
import { useState, useCallback, useRef } from "react";

export interface ChatSource {
  docName: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  webSearchUsed: boolean;
  sources?: ChatSource[];
  isStreaming?: boolean;
}

export function useChat(spaceId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const toggleWebSearch = useCallback(() => setWebSearch((v) => !v), []);

  const clearHistory = useCallback(() => setMessages([]), []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!spaceId || !text.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        webSearchUsed: false,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      const assistantId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        webSearchUsed: webSearch,
        sources: [],
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      abortRef.current = new AbortController();

      try {
        const res = await fetch(`/api/auris-lm/spaces/${spaceId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            webSearch,
            history: messages.slice(-8).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error("Error en la respuesta del servidor");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let sources: ChatSource[] = [];
        let usedWebSearch = false;

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
              const event = JSON.parse(raw) as {
                type: string;
                delta?: string;
                sources?: ChatSource[];
                webSearchUsed?: boolean;
              };

              if (event.type === "delta" && event.delta) {
                fullContent += event.delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              } else if (event.type === "sources") {
                sources = event.sources ?? [];
                usedWebSearch = event.webSearchUsed ?? false;
              }
            } catch {
              // ignore parse errors
            }
          }
        }

        // Finalize message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: fullContent,
                  sources,
                  webSearchUsed: usedWebSearch,
                  isStreaming: false,
                }
              : m
          )
        );
      } catch (err: unknown) {
        const isAbort =
          err instanceof Error && err.name === "AbortError";
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
    [spaceId, isStreaming, webSearch, messages]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    isStreaming,
    webSearch,
    toggleWebSearch,
    sendMessage,
    stopStreaming,
    clearHistory,
  };
}
