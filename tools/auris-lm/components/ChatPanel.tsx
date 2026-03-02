"use client";
import { useEffect, useRef, useState } from "react";
import {
  Send,
  Square,
  Globe,
  Trash2,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SourcesPanel } from "./SourcesPanel";
import type { ChatMessage } from "../lib/useChat";

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  onSendMessage: (text: string) => void;
  onStopStreaming: () => void;
  onClearHistory: () => void;
  hasDocuments: boolean;
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 size-7 rounded-full flex items-center justify-center mt-0.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed max-w-[88%]",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {msg.content}
          {msg.isStreaming && (
            <span className="inline-block ml-1 animate-pulse">▋</span>
          )}
        </div>
        {/* Sources – only for assistant messages */}
        {!isUser && (msg.sources?.length ?? 0) > 0 && (
          <div className="mt-1 max-w-[88%] w-full">
            <SourcesPanel
              sources={msg.sources ?? []}
              webSearchUsed={msg.webSearchUsed}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPanel({
  messages,
  isStreaming,
  webSearch,
  onToggleWebSearch,
  onSendMessage,
  onStopStreaming,
  onClearHistory,
  hasDocuments,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="size-4 text-primary" />
          <span className="font-medium text-foreground">Chat</span>
          {webSearch && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-500 bg-blue-500/10 rounded-full px-2 py-0.5">
              <Globe className="size-3" />
              Búsqueda web activa
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Web search toggle */}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onToggleWebSearch}
            title={webSearch ? "Desactivar búsqueda web" : "Activar búsqueda web"}
            className={cn(
              "transition-colors",
              webSearch
                ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                : "text-muted-foreground"
            )}
          >
            <Globe />
          </Button>
          {/* Clear history */}
          {messages.length > 0 && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onClearHistory}
              title="Limpiar conversación"
              className="text-muted-foreground"
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 pb-8">
            <Bot className="size-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {hasDocuments
                  ? "¿Qué quieres saber sobre tus documentos?"
                  : "Sube documentos para comenzar"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasDocuments
                  ? "Las respuestas se basarán exclusivamente en los documentos del espacio."
                  : "AurisLM responde con base en los documentos que subas."}
              </p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-3">
        {!hasDocuments && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
            <Loader2 className="size-3" />
            Sube al menos un documento para obtener respuestas precisas.
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-grow
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? "Esperando respuesta…"
                : "Escribe tu pregunta (Enter para enviar, Shift+Enter para salto de línea)"
            }
            disabled={isStreaming}
            className={cn(
              "flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all",
              "placeholder:text-muted-foreground",
              "focus:border-primary focus:ring-1 focus:ring-primary/30",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[42px] max-h-[120px]"
            )}
          />
          {isStreaming ? (
            <Button
              size="icon"
              variant="destructive"
              onClick={onStopStreaming}
              title="Detener"
            >
              <Square />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              title="Enviar (Enter)"
            >
              <Send />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
