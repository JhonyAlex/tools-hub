// ============================================================
// DocChat Types
// ============================================================

export interface DocChatSessionData {
  id: string;
  fileName: string;
  mimeType: string;
  extractedText: string;
  systemPrompt: string | null;
  createdAt: string;
}

export interface DocChatMessageData {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

export interface SelectionAction {
  type: "explain" | "summarize" | "query";
  label: string;
  instruction: string;
}

export interface TextSelectionState {
  selectedText: string;
  position: { x: number; y: number };
  isVisible: boolean;
}

export const SELECTION_ACTIONS: SelectionAction[] = [
  {
    type: "explain",
    label: "Explicar",
    instruction: "Explica de forma clara y detallada el siguiente fragmento del documento:",
  },
  {
    type: "summarize",
    label: "Resumir",
    instruction: "Resume de forma concisa el siguiente fragmento del documento:",
  },
  {
    type: "query",
    label: "Consultar",
    instruction: "Responde sobre el siguiente fragmento del documento:",
  },
];
