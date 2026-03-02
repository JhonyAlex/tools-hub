// ============================================================
// COPY REPORT HOOK - Copies report as rich HTML for email
// Uses html2canvas for chart screenshots, builds clean email HTML
// ============================================================
import { useCallback, useState } from "react";

/**
 * Capture a DOM element as a PNG data URI using html2canvas
 */
async function elementToDataURI(
  el: HTMLElement,
  maxWidth: number
): Promise<string | null> {
  try {
    const html2canvas = (await import("html2canvas-pro")).default;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    // Resize if wider than maxWidth
    const ratio = canvas.width / canvas.height;
    const targetW = Math.min(canvas.width, maxWidth * 2); // *2 for scale
    const targetH = targetW / ratio;

    const resized = document.createElement("canvas");
    resized.width = targetW;
    resized.height = targetH;
    const ctx = resized.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(canvas, 0, 0, targetW, targetH);

    return resized.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Extract text content from an element, preserving structure
 */
function getTextStyle(source: Element): string {
  const computed = window.getComputedStyle(source);
  const parts: string[] = [];

  const color = computed.color;
  if (color && color !== "rgb(0, 0, 0)") parts.push(`color:${color}`);

  const fw = computed.fontWeight;
  if (fw && parseInt(fw) >= 600) parts.push(`font-weight:${fw}`);

  const fs = computed.fontSize;
  if (fs) parts.push(`font-size:${fs}`);

  const ta = computed.textAlign;
  if (ta && ta !== "start" && ta !== "left") parts.push(`text-align:${ta}`);

  return parts.join(";");
}

/**
 * Build email-friendly HTML from the report DOM.
 * Replaces chart containers with images, strips borders,
 * and preserves text formatting with semantic HTML.
 */
async function buildEmailHTML(reportEl: HTMLDivElement): Promise<string> {
  const sections: string[] = [];

  // Process each top-level section in the report
  const topChildren = reportEl.children;

  for (let s = 0; s < topChildren.length; s++) {
    const section = topChildren[s] as HTMLElement;
    const sectionHTML = await processSection(section, reportEl);
    if (sectionHTML) sections.push(sectionHTML);
  }

  return sections.join('<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">');
}

async function processSection(
  section: HTMLElement,
  _root: HTMLDivElement
): Promise<string> {
  const parts: string[] = [];

  // Walk through all elements in this section
  const walker = document.createTreeWalker(section, NodeFilter.SHOW_ELEMENT);
  const processed = new Set<Node>();

  let node = walker.currentNode as HTMLElement;
  while (node) {
    if (processed.has(node)) {
      node = walker.nextNode() as HTMLElement;
      if (!node) break;
      continue;
    }

    // --- Charts: capture entire recharts-responsive-container ---
    const rechartsContainer = node.closest(".recharts-responsive-container");
    if (
      rechartsContainer &&
      !processed.has(rechartsContainer) &&
      node === rechartsContainer
    ) {
      processed.add(rechartsContainer);
      const dataURI = await elementToDataURI(
        rechartsContainer as HTMLElement,
        500
      );
      if (dataURI) {
        parts.push(
          `<div style="margin:12px 0;"><img src="${dataURI}" style="max-width:500px;width:100%;height:auto;" /></div>`
        );
      }
      // Skip all children of this container
      skipChildren(rechartsContainer, processed);
      node = walker.nextNode() as HTMLElement;
      if (!node) break;
      continue;
    }

    // Skip if inside an already-processed recharts container
    if (node.closest(".recharts-responsive-container") && processed.has(node.closest(".recharts-responsive-container")!)) {
      node = walker.nextNode() as HTMLElement;
      if (!node) break;
      continue;
    }

    // --- Section headers (h2, h3) ---
    if (node.tagName === "H2" || node.tagName === "H3") {
      processed.add(node);
      const size = node.tagName === "H2" ? "20px" : "16px";
      parts.push(
        `<${node.tagName.toLowerCase()} style="font-size:${size};font-weight:600;margin:16px 0 8px 0;color:#111;">${node.textContent}</${node.tagName.toLowerCase()}>`
      );
      node = walker.nextNode() as HTMLElement;
      if (!node) break;
      continue;
    }

    // --- Tables ---
    if (node.tagName === "TABLE" && !processed.has(node)) {
      processed.add(node);
      parts.push(buildEmailTable(node as HTMLTableElement));
      skipChildren(node, processed);
      node = walker.nextNode() as HTMLElement;
      if (!node) break;
      continue;
    }

    // --- Lists (ul, ol) ---
    if (
      (node.tagName === "UL" || node.tagName === "OL") &&
      !processed.has(node)
    ) {
      processed.add(node);
      parts.push(buildEmailList(node));
      skipChildren(node, processed);
      node = walker.nextNode() as HTMLElement;
      if (!node) break;
      continue;
    }

    // --- Paragraphs and text blocks ---
    if (node.tagName === "P" && !processed.has(node)) {
      processed.add(node);
      const style = getTextStyle(node);
      const text = node.textContent?.trim();
      if (text) {
        parts.push(
          `<p style="margin:6px 0;line-height:1.6;${style}">${text}</p>`
        );
      }
      node = walker.nextNode() as HTMLElement;
      if (!node) break;
      continue;
    }

    // --- Stat cards (detect by structure: icon + label + value) ---
    // These have class patterns like "rounded-xl border" with a number value
    if (
      node.tagName === "DIV" &&
      !processed.has(node) &&
      node.querySelector("p") &&
      node.children.length <= 3
    ) {
      const pEl = node.querySelector("p");
      const spans = node.querySelectorAll("span");
      if (
        pEl &&
        spans.length > 0 &&
        pEl.textContent &&
        /^\d|^\w{2,}/.test(pEl.textContent.trim())
      ) {
        // Check if this looks like a stat card
        const label = spans[spans.length - 1]?.textContent?.trim() || "";
        const value = pEl.textContent.trim();
        if (label && value && label.length < 30) {
          processed.add(node);
          skipChildren(node, processed);
          parts.push(
            `<div style="display:inline-block;padding:8px 16px;margin:4px;background:#f9fafb;border-radius:8px;"><span style="font-size:12px;color:#6b7280;">${label}</span><br/><strong style="font-size:18px;">${value}</strong></div>`
          );
          node = walker.nextNode() as HTMLElement;
          if (!node) break;
          continue;
        }
      }
    }

    // --- Section title with icon (div > svg + h3/span) ---
    if (node.tagName === "DIV" && !processed.has(node)) {
      const heading = node.querySelector("h3, h2");
      const hasIcon = node.querySelector("svg");
      if (
        heading &&
        hasIcon &&
        node.children.length <= 3 &&
        !node.querySelector("table") &&
        !node.querySelector(".recharts-responsive-container")
      ) {
        processed.add(node);
        skipChildren(node, processed);
        const text = heading.textContent?.trim();
        if (text) {
          parts.push(
            `<h3 style="font-size:16px;font-weight:600;margin:20px 0 8px 0;color:#111;">${text}</h3>`
          );
        }
        node = walker.nextNode() as HTMLElement;
        if (!node) break;
        continue;
      }
    }

    node = walker.nextNode() as HTMLElement;
    if (!node) break;
  }

  return parts.join("\n");
}

function skipChildren(node: Node, processed: Set<Node>) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
  let child = walker.nextNode();
  while (child) {
    processed.add(child);
    child = walker.nextNode();
  }
}

function buildEmailTable(table: HTMLTableElement): string {
  let html =
    '<table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;">';

  const thead = table.querySelector("thead");
  if (thead) {
    html += "<thead>";
    const rows = thead.querySelectorAll("tr");
    rows.forEach((row) => {
      html += "<tr>";
      row.querySelectorAll("th").forEach((th) => {
        const align = th.style.textAlign || (th.className.includes("text-right") ? "right" : "left");
        html += `<th style="padding:8px 12px;text-align:${align};font-weight:600;font-size:12px;color:#6b7280;background:#f9fafb;border-bottom:2px solid #e5e7eb;">${th.textContent}</th>`;
      });
      html += "</tr>";
    });
    html += "</thead>";
  }

  const tbody = table.querySelector("tbody");
  if (tbody) {
    html += "<tbody>";
    const rows = tbody.querySelectorAll("tr");
    rows.forEach((row) => {
      html += "<tr>";
      row.querySelectorAll("td").forEach((td, ci) => {
        const computed = window.getComputedStyle(td);
        const align = computed.textAlign === "right" ? "right" : "left";
        const fw = ci === 0 ? "font-weight:500;" : "";
        html += `<td style="padding:8px 12px;text-align:${align};${fw}border-bottom:1px solid #f3f4f6;color:#374151;">${td.textContent}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody>";
  }

  html += "</table>";
  return html;
}

function buildEmailList(listEl: Element): string {
  const tag = listEl.tagName.toLowerCase();
  let html = `<${tag} style="margin:8px 0;padding-left:24px;">`;

  listEl.querySelectorAll(":scope > li").forEach((li) => {
    // Check for bullet dot spans (the colored dots used in ConclusionsPanel)
    const dot = li.querySelector("span");
    const text = li.textContent?.trim() || "";
    if (text) {
      html += `<li style="margin:4px 0;line-height:1.6;color:#374151;font-size:14px;">${text}</li>`;
    }
  });

  html += `</${tag}>`;
  return html;
}

export function useCopyReport(
  reportRef: React.RefObject<HTMLDivElement | null>
) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAll = useCallback(async () => {
    if (!reportRef.current) return;
    setCopying(true);
    try {
      const emailHTML = await buildEmailHTML(reportRef.current);

      const html = `<div style="font-family:Segoe UI,system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;max-width:700px;">${emailHTML}</div>`;

      const htmlBlob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([reportRef.current.innerText], {
        type: "text/plain",
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
      const text = reportRef.current?.innerText ?? "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setCopying(false);
    }
  }, [reportRef]);

  return { copyAll, copying, copied };
}
