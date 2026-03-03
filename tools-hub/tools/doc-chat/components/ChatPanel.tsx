"use client";

import React, { useRef, useEffect, useState } from "react";
import { Send, Square, Trash2, Bot, User, Sparkles } from "lucide-react";
import type { DocChatMessageData } from "../types";

interface ChatPanelProps {
    messages: DocChatMessageData[];
    isStreaming: boolean;
    systemPrompt: string | null;
    isAnalyzingRole: boolean;
    hasDocument: boolean;
    onSendMessage: (text: string) => void;
    onStopStreaming: () => void;
    onClearHistory: () => void;
}

export function ChatPanel({
    messages,
    isStreaming,
    systemPrompt,
    isAnalyzingRole,
    hasDocument,
    onSendMessage,
    onStopStreaming,
    onClearHistory,
}: ChatPanelProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;
        onSendMessage(input.trim());
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Chat con el Documento</span>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={onClearHistory}
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                        title="Limpiar historial"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Role indicator */}
            {isAnalyzingRole && (
                <div className="flex items-center gap-2 border-b border-border/30 bg-amber-500/5 px-4 py-2">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-500" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                        Analizando el documento para determinar el rol...
                    </span>
                </div>
            )}
            {systemPrompt && !isAnalyzingRole && (
                <div className="flex items-center gap-2 border-b border-border/30 bg-primary/5 px-4 py-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="line-clamp-1 text-xs text-primary/80">
                        Rol activo: {systemPrompt.slice(0, 100)}...
                    </span>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50">
                {!hasDocument ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-center text-sm text-muted-foreground">
                            Sube un documento para empezar a chatear.
                        </p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <Bot className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-center text-sm text-muted-foreground">
                            Haz una pregunta sobre el documento
                            <br />
                            <span className="text-xs">o selecciona texto en el visor.</span>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex gap-3">
                                <div
                                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                    ${msg.role === "user" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                                >
                                    {msg.role === "user" ? (
                                        <User className="h-3.5 w-3.5" />
                                    ) : (
                                        <Bot className="h-3.5 w-3.5" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="mb-0.5 text-xs font-medium text-muted-foreground">
                                        {msg.role === "user" ? "Tú" : "DocChat"}
                                    </p>
                                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words text-sm leading-relaxed">
                                        {msg.content}
                                        {msg.isStreaming && (
                                            <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-primary" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="border-t border-border/40 bg-muted/10 p-3">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={hasDocument ? "Escribe tu pregunta..." : "Sube un documento primero"}
                        disabled={!hasDocument || isStreaming}
                        rows={1}
                        className="flex-1 resize-none rounded-md border border-border/50 bg-background px-3 py-2
                       text-sm placeholder:text-muted-foreground/60 focus:border-primary/50
                       focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                    />
                    {isStreaming ? (
                        <button
                            type="button"
                            onClick={onStopStreaming}
                            className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive text-destructive-foreground
                         transition-colors hover:bg-destructive/90"
                            title="Detener"
                        >
                            <Square className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim() || !hasDocument}
                            className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground
                         transition-colors hover:bg-primary/90 disabled:opacity-50"
                            title="Enviar"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
