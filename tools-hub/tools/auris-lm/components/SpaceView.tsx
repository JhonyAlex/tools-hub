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

  const handleUpload = async (files: File[]): Promise<boolean> => {
    let allOk = true;
    for (const file of files) {
      const ok = await uploadDocument(file);
      if (!ok) allOk = false;
    }
    return allOk;
  };

  const readyDocs = documents.filter((d) => d.status === "ready");
  const [docsOpen, setDocsOpen] = useState(true);

  return (
    <div className="flex h-full gap-0 rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
      {/* Left panel: Documents */}
      <div
        className={cn(
          "shrink-0 border-r flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-muted/5",
          docsOpen ? "w-80" : "w-12"
        )}
      >
        {/* Toggle button row */}
        <div className={cn(
          "flex items-center border-b px-3 h-14 bg-card/50",
          docsOpen ? "justify-between" : "justify-center"
        )}>
          {docsOpen && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                Fuentes de Datos
              </span>
            </div>
          )}
          <button
            onClick={() => setDocsOpen((v) => !v)}
            title={docsOpen ? "Ocultar panel" : "Mostrar documentos"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all hover:scale-105"
          >
            {docsOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </button>
        </div>

        {/* Content */}
        {docsOpen && (
          <div className="flex flex-col flex-1 p-5 overflow-y-auto custom-scrollbar">
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                {space.name}
              </h3>
              {space.description && (
                <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {space.description}
                </p>
              )}
            </div>
            <DocumentList
              spaceId={space.id}
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
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
              {documents.length}
            </div>
          </div>
        )}
      </div>

      {/* Right panel: Chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50">
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
