"use client";
import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useDocuments } from "../lib/useDocuments";
import { useChat } from "../lib/useChat";
import { DocumentList } from "./DocumentList";
import { ChatPanel } from "./ChatPanel";
import type { AurisSpace } from "../lib/useSpaces";
import { cn } from "@/lib/utils";

interface SpaceViewProps {
  space: AurisSpace;
}

export function SpaceView({ space }: SpaceViewProps) {
  const {
    documents,
    loading: docsLoading,
    uploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    downloadDocument,
  } = useDocuments(space.id);

  const {
    messages,
    isStreaming,
    webSearch,
    toggleWebSearch,
    sendMessage,
    stopStreaming,
    clearHistory,
  } = useChat(space.id);

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      await uploadDocument(file);
    }
  };

  const readyDocs = documents.filter((d) => d.status === "ready");
  const [docsOpen, setDocsOpen] = useState(true);

  return (
    <div className="flex h-full gap-0 rounded-xl border bg-card overflow-hidden">
      {/* Left panel: Documents */}
      <div
        className={cn(
          "shrink-0 border-r flex flex-col overflow-hidden transition-all duration-300",
          docsOpen ? "w-72" : "w-10"
        )}
      >
        {/* Toggle button row */}
        <div className={cn(
          "flex items-center border-b px-2 py-2",
          docsOpen ? "justify-between" : "justify-center"
        )}>
          {docsOpen && (
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-1">
              Documentos
            </span>
          )}
          <button
            onClick={() => setDocsOpen((v) => !v)}
            title={docsOpen ? "Ocultar panel" : "Mostrar documentos"}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {docsOpen ? (
              <PanelLeftClose className="size-3.5" />
            ) : (
              <PanelLeftOpen className="size-3.5" />
            )}
          </button>
        </div>

        {/* Content */}
        {docsOpen && (
          <div className="flex flex-col flex-1 p-4 overflow-y-auto">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {space.name}
              </h3>
              {space.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {space.description}
                </p>
              )}
            </div>
            <DocumentList
              documents={documents}
              loading={docsLoading}
              uploading={uploading}
              uploadProgress={uploadProgress}
              onUpload={handleUpload}
              onDelete={(id) => void deleteDocument(id)}
              onDownload={downloadDocument}
            />
          </div>
        )}

        {/* Collapsed: doc count badge */}
        {!docsOpen && documents.length > 0 && (
          <div className="flex flex-col items-center gap-1 pt-3">
            <span className="text-xs font-semibold text-muted-foreground">{documents.length}</span>
          </div>
        )}
      </div>

      {/* Right panel: Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          webSearch={webSearch}
          onToggleWebSearch={toggleWebSearch}
          onSendMessage={(text) => void sendMessage(text)}
          onStopStreaming={stopStreaming}
          onClearHistory={clearHistory}
          hasDocuments={readyDocs.length > 0}
        />
      </div>
    </div>
  );
}
