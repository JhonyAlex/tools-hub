"use client";

import React, { useState } from "react";
import { Send, AlertCircle } from "lucide-react";
import { useDocChat } from "../hooks/useDocChat";
import { ViewerPanel } from "./ViewerPanel";
import { ChatPanel } from "./ChatPanel";
import { ExportToAurisModal } from "./ExportToAurisModal";

export function DocChatApp() {
    const {
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
    } = useDocChat();

    const [showExportModal, setShowExportModal] = useState(false);

    const handleSelectionAction = (instruction: string, selectedText: string) => {
        const combinedMessage = `${instruction}\n\n"${selectedText}"`;
        sendMessage(combinedMessage);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Action bar */}
            {session && (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2 rounded-md border border-border/50 bg-background px-3
                       py-1.5 text-sm font-medium text-muted-foreground
                       transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Llevar a AurisLM
                    </button>
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main split layout */}
            <div className="grid h-[calc(100vh-220px)] min-h-[500px] grid-cols-1 gap-4 lg:grid-cols-5">
                {/* Left panel: Document viewer (60%) */}
                <div className="lg:col-span-3">
                    <ViewerPanel
                        text={session?.extractedText ?? null}
                        fileName={session?.fileName ?? null}
                        isLoading={isUploading}
                        onSelectionAction={handleSelectionAction}
                        onFileUpload={uploadFile}
                    />
                </div>

                {/* Right panel: Chat (40%) */}
                <div className="lg:col-span-2">
                    <ChatPanel
                        messages={messages}
                        isStreaming={isStreaming}
                        systemPrompt={systemPrompt}
                        isAnalyzingRole={isAnalyzingRole}
                        hasDocument={!!session}
                        onSendMessage={sendMessage}
                        onStopStreaming={stopStreaming}
                        onClearHistory={clearHistory}
                    />
                </div>
            </div>

            {/* Export modal */}
            {session && (
                <ExportToAurisModal
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    fileName={session.fileName}
                    extractedText={session.extractedText}
                    mimeType={session.mimeType}
                />
            )}
        </div>
    );
}
