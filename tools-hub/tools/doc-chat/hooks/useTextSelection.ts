"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import type { TextSelectionState } from "../types";

export function useTextSelection(containerRef: React.RefObject<HTMLDivElement | null>) {
    const [selection, setSelection] = useState<TextSelectionState>({
        selectedText: "",
        position: { x: 0, y: 0 },
        isVisible: false,
    });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clear = useCallback(() => {
        setSelection({ selectedText: "", position: { x: 0, y: 0 }, isVisible: false });
    }, []);

    const handleSelectionChange = useCallback(() => {
        // Small delay to let the browser finalize the selection
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || !sel.toString().trim()) {
                clear();
                return;
            }

            // Verify selection is inside our container
            const container = containerRef.current;
            if (!container) return;

            const anchorNode = sel.anchorNode;
            if (!anchorNode || !container.contains(anchorNode)) {
                return;
            }

            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Position relative to container
            const x = rect.left - containerRect.left + rect.width / 2;
            const y = rect.top - containerRect.top - 10;

            setSelection({
                selectedText: sel.toString().trim(),
                position: { x, y },
                isVisible: true,
            });
        }, 150);
    }, [containerRef, clear]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("mouseup", handleSelectionChange);
        container.addEventListener("touchend", handleSelectionChange);

        // Clear on click outside
        const handleClickOutside = (e: MouseEvent) => {
            if (!container.contains(e.target as Node)) {
                clear();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            container.removeEventListener("mouseup", handleSelectionChange);
            container.removeEventListener("touchend", handleSelectionChange);
            document.removeEventListener("mousedown", handleClickOutside);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [containerRef, handleSelectionChange, clear]);

    return { ...selection, clear };
}
