"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useDocChat } from "../hooks/useDocChat";
import { ViewerPanel } from "./ViewerPanel";
import { ChatPanel } from "./ChatPanel";
import { ExportToAurisModal } from "./ExportToAurisModal";

export function DocChatApp() {
    const {
        session,
        messages,
        pdfBlobUrl,
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
    const [exportContent, setExportContent] = useState<string | null>(null);

    const handleSelectionAction = (instruction: string, selectedText: string) => {
        const combinedMessage = `${instruction}\n\n"${selectedText}"`;
        sendMessage(combinedMessage);
    };

    const handleExportDocument = () => {
        setExportContent(null); // null = export full document
        setShowExportModal(true);
    };

    const handleExportMessage = (content: string) => {
        setExportContent(content);
        setShowExportModal(true);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main split layout */}
            <div className="grid h-[calc(100vh-220px)] min-h-[500px] grid-cols-1 gap-4 overflow-hidden lg:grid-cols-5">
                {/* Left panel: Document viewer (60%) */}
                <div className="min-h-0 lg:col-span-3">
                    <ViewerPanel
                        text={session?.extractedText ?? null}
                        fileName={session?.fileName ?? null}
                        pdfUrl={pdfBlobUrl}
                        isLoading={isUploading}
                        onSelectionAction={handleSelectionAction}
                        onFileUpload={uploadFile}
                        onExportDocument={session ? handleExportDocument : undefined}
                    />
                </div>

                {/* Right panel: Chat (40%) */}
                <div className="min-h-0 lg:col-span-2">
                    <ChatPanel
                        messages={messages}
                        isStreaming={isStreaming}
                        systemPrompt={systemPrompt}
                        isAnalyzingRole={isAnalyzingRole}
                        hasDocument={!!session}
                        onSendMessage={sendMessage}
                        onStopStreaming={stopStreaming}
                        onClearHistory={clearHistory}
                        onExportMessage={handleExportMessage}
                    />
                </div>
            </div>

            {/* Export modal */}
            {session && (
                <ExportToAurisModal
                    isOpen={showExportModal}
                    onClose={() => {
                        setShowExportModal(false);
                        setExportContent(null);
                    }}
                    fileName={session.fileName}
                    extractedText={session.extractedText}
                    mimeType={session.mimeType}
                    contentOverride={exportContent}
                />
            )}
        </div>
    );
}
