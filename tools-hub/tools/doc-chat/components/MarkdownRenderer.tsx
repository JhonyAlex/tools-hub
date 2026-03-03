"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                // Paragraph
                p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                ),
                // Headings
                h1: ({ children }) => (
                    <h1 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="mb-1.5 mt-2.5 text-sm font-bold first:mt-0">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="mb-1 mt-2 text-sm font-semibold first:mt-0">{children}</h3>
                ),
                // Lists
                ul: ({ children }) => (
                    <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>
                ),
                li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                ),
                // Inline code
                code: ({ children, className }) => {
                    const isBlock = className?.includes("language-");
                    if (isBlock) {
                        return (
                            <code className={`block overflow-x-auto rounded-md bg-muted/60 p-3 text-xs font-mono ${className ?? ""}`}>
                                {children}
                            </code>
                        );
                    }
                    return (
                        <code className="rounded bg-muted/60 px-1 py-0.5 text-xs font-mono">
                            {children}
                        </code>
                    );
                },
                // Code block wrapper
                pre: ({ children }) => (
                    <pre className="mb-2 last:mb-0">{children}</pre>
                ),
                // Strong / em
                strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                    <em className="italic">{children}</em>
                ),
                // Blockquote
                blockquote: ({ children }) => (
                    <blockquote className="mb-2 border-l-2 border-primary/30 pl-3 text-muted-foreground last:mb-0">
                        {children}
                    </blockquote>
                ),
                // Table
                table: ({ children }) => (
                    <div className="mb-2 overflow-x-auto last:mb-0">
                        <table className="w-full border-collapse text-xs">{children}</table>
                    </div>
                ),
                th: ({ children }) => (
                    <th className="border border-border/50 bg-muted/30 px-2 py-1 text-left font-medium">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="border border-border/50 px-2 py-1">{children}</td>
                ),
                // Link
                a: ({ href, children }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:text-primary/80"
                    >
                        {children}
                    </a>
                ),
                // Horizontal rule
                hr: () => <hr className="my-3 border-border/40" />,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
