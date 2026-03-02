// ============================================================
// COPY REPORT HOOK - Copies report as rich HTML for email
// Converts charts (SVG) to inline images, inlines styles
// ============================================================
import { useCallback, useState } from "react";

/** CSS properties to inline for email compatibility */
const STYLE_PROPS = [
  "color",
  "backgroundColor",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "lineHeight",
  "textAlign",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderRadius",
  "display",
  "gap",
  "width",
  "maxWidth",
  "verticalAlign",
] as const;

/**
 * Convert an SVG element to a PNG data URI
 */
async function svgToDataURIAsync(svg: SVGSVGElement): Promise<string | null> {
  try {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const origChildren = svg.querySelectorAll("*");
    const cloneChildren = clone.querySelectorAll("*");
    origChildren.forEach((origEl, i) => {
      const computed = window.getComputedStyle(origEl);
      const cloneEl = cloneChildren[i] as SVGElement | HTMLElement;
      if (!cloneEl) return;
      const fill = computed.getPropertyValue("fill");
      const stroke = computed.getPropertyValue("stroke");
      const fontSize = computed.getPropertyValue("font-size");
      const fontFamily = computed.getPropertyValue("font-family");
      if (fill) cloneEl.setAttribute("fill", fill);
      if (stroke && stroke !== "none") cloneEl.setAttribute("stroke", stroke);
      if (fontSize) cloneEl.style.fontSize = fontSize;
      if (fontFamily) cloneEl.style.fontFamily = fontFamily;
    });

    const rect = svg.getBoundingClientRect();
    clone.setAttribute("width", String(rect.width));
    clone.setAttribute("height", String(rect.height));

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(clone);
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.scale(scale, scale);

    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

/**
 * Inline computed styles on an element (recursive)
 */
function inlineStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source);
  const el = target as HTMLElement;

  const styles: string[] = [];
  for (const prop of STYLE_PROPS) {
    const val = computed.getPropertyValue(
      prop.replace(/([A-Z])/g, "-$1").toLowerCase()
    );
    if (val && val !== "normal" && val !== "none" && val !== "auto" && val !== "0px") {
      styles.push(`${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}:${val}`);
    }
  }
  if (styles.length > 0) {
    el.setAttribute("style", styles.join(";"));
  }
  el.removeAttribute("class");

  const sourceChildren = source.children;
  const targetChildren = target.children;
  for (let i = 0; i < sourceChildren.length; i++) {
    if (targetChildren[i] && !(sourceChildren[i] instanceof SVGElement)) {
      inlineStyles(sourceChildren[i], targetChildren[i]);
    }
  }
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
      // 1. Clone the report DOM
      const clone = reportRef.current.cloneNode(true) as HTMLDivElement;

      // 2. Convert all SVG charts to inline PNG images
      const originalSvgs = reportRef.current.querySelectorAll(
        ".recharts-wrapper svg"
      );
      const clonedSvgs = clone.querySelectorAll(".recharts-wrapper svg");

      for (let i = 0; i < originalSvgs.length; i++) {
        const svg = originalSvgs[i] as SVGSVGElement;
        const dataURI = await svgToDataURIAsync(svg);
        if (dataURI && clonedSvgs[i]) {
          const img = document.createElement("img");
          img.src = dataURI;
          const rect = svg.getBoundingClientRect();
          img.style.width = `${rect.width}px`;
          img.style.height = `${rect.height}px`;
          img.style.maxWidth = "100%";
          // Replace the entire recharts-wrapper div with just the image
          const wrapper = clonedSvgs[i].closest(".recharts-wrapper");
          if (wrapper?.parentNode) {
            wrapper.parentNode.replaceChild(img, wrapper);
          }
        }
      }

      // 3. Inline computed styles from original to clone
      inlineStyles(reportRef.current, clone);

      // 4. Wrap in an email-friendly container
      const html = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;max-width:800px;">${clone.innerHTML}</div>`;

      // 5. Copy as rich HTML + plain text fallback
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
      // Fallback: copy plain text
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
