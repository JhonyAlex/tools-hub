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
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SourcesPanel } from "./SourcesPanel";
import { MarkdownRenderer } from "@/tools/doc-chat/components/MarkdownRenderer";
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className={cn(
        "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 size-8 rounded-xl flex items-center justify-center mt-1 shadow-sm transition-transform hover:scale-105",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground border"
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-none whitespace-pre-wrap"
              : "bg-card border text-foreground rounded-tl-none"
          )}
        >
          {isUser ? msg.content : <MarkdownRenderer content={msg.content} />}
          {msg.isStreaming && (
            <span className="inline-block ml-1 animate-pulse font-bold text-primary">|</span>
          )}
        </div>
        {/* Actions – only for completed assistant messages */}
        {!isUser && !msg.isStreaming && msg.content && (
          <div className="mt-1.5 flex items-center gap-1">
            <button
              onClick={() => void handleCopy()}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              title="Copiar respuesta"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>
          </div>
        )}
        {/* Sources – only for assistant messages */}
        {!isUser && (msg.sources?.length ?? 0) > 0 && (
          <div className="mt-2 w-full">
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
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/5">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="size-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Asistente Auris</h3>
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">En línea</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleWebSearch}
            className={cn(
              "h-8 gap-2 rounded-full px-3 text-xs font-medium transition-all",
              webSearch
                ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 ring-1 ring-blue-500/20"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Globe className="size-3.5" />
            <span className="hidden sm:inline">{webSearch ? "Web activa" : "Búsqueda web"}</span>
          </Button>

          {messages.length > 0 && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onClearHistory}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Limpiar chat"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
              <Bot className="relative size-16 text-primary/30" />
            </div>
            <h4 className="text-lg font-bold tracking-tight mb-2">
              {hasDocuments ? "¿Cómo puedo ayudarte hoy?" : "Configuración necesaria"}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {hasDocuments
                ? "Pregúntame cualquier cosa sobre tus documentos cargados. Estoy listo para analizarlos."
                : "Para empezar, sube algunos documentos en el panel lateral. Analizaré su contenido para responderte."}
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-card/80 to-transparent">
        <div className="max-w-4xl mx-auto">
          {!hasDocuments && (
            <div className="mb-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-600 dark:text-amber-400 animate-bounce">
              <AlertCircle className="size-3.5" />
              Sube documentos para activar las respuestas basadas en contenido.
            </div>
          )}

          <div className="relative group transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? "Auris está pensando..." : "Escribe tu pregunta aquí..."}
              disabled={isStreaming}
              className={cn(
                "w-full resize-none rounded-2xl border bg-card/50 backdrop-blur-sm px-5 py-4 pr-14 text-sm outline-none transition-all shadow-lg",
                "placeholder:text-muted-foreground/60",
                "focus:border-primary focus:ring-4 focus:ring-primary/10",
                "disabled:opacity-50",
                "min-h-[56px] max-h-[200px]"
              )}
            />

            <div className="absolute right-2.5 bottom-2.5">
              {isStreaming ? (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={onStopStreaming}
                  className="h-10 w-10 rounded-xl shadow-lg animate-pulse"
                >
                  <Square className="size-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={cn(
                    "h-10 w-10 rounded-xl shadow-lg transition-all",
                    input.trim() ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0 pointer-events-none"
                  )}
                >
                  <Send className="size-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="mt-3 text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter opacity-50">
            AurisLM puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>
  );
}
