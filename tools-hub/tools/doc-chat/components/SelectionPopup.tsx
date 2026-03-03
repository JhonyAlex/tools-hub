"use client";

import React from "react";
import { Sparkles, AlignLeft, MessageCircle } from "lucide-react";
import { SELECTION_ACTIONS } from "../types";
import type { SelectionAction } from "../types";

const ACTION_ICONS: Record<SelectionAction["type"], React.ReactNode> = {
    explain: <Sparkles className="h-3.5 w-3.5" />,
    summarize: <AlignLeft className="h-3.5 w-3.5" />,
    query: <MessageCircle className="h-3.5 w-3.5" />,
};

interface SelectionPopupProps {
    position: { x: number; y: number };
    isVisible: boolean;
    onAction: (instruction: string, selectedText: string) => void;
    selectedText: string;
    onClose: () => void;
}

export function SelectionPopup({
    position,
    isVisible,
    onAction,
    selectedText,
    onClose,
}: SelectionPopupProps) {
    if (!isVisible || !selectedText) return null;

    return (
        <div
            className="absolute z-50 flex items-center gap-1 rounded-lg border border-border
                 bg-popover px-1.5 py-1 shadow-lg animate-in fade-in-0 zoom-in-95"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: "translate(-50%, -100%)",
            }}
        >
            {SELECTION_ACTIONS.map((action) => (
                <button
                    key={action.type}
                    onClick={() => {
                        onAction(action.instruction, selectedText);
                        onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium
                     text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title={action.label}
                >
                    {ACTION_ICONS[action.type]}
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    );
}
