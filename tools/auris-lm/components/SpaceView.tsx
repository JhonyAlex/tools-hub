"use client";
import { useDocuments } from "../lib/useDocuments";
import { useChat } from "../lib/useChat";
import { DocumentList } from "./DocumentList";
import { ChatPanel } from "./ChatPanel";
import type { AurisSpace } from "../lib/useSpaces";

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

  return (
    <div className="flex h-full gap-0 rounded-xl border bg-card overflow-hidden">
      {/* Left panel: Documents */}
      <div className="w-72 shrink-0 border-r flex flex-col p-4 overflow-y-auto">
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
