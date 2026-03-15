import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/lib/db";
import { getRequestUserId, unauthorizedResponse } from "@/core/lib/requestUser";

interface OpenRouterMessage {
  content?: string;
}

interface OpenRouterChoice {
  message?: OpenRouterMessage;
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
}

const MODEL = "google/gemini-2.5-flash-lite";

const STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "en",
  "a", "con", "por", "para", "del", "al", "que", "se", "su", "sus", "es", "son",
]);

const BANNED_TITLE_TOKENS = new Set([
  "documento",
  "contenido",
  "fuente",
  "archivo",
  "texto",
  "informacion",
  "información",
]);

function normalizeSuggestedName(raw: string, fallback: string): string {
  const cleaned = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/[\[\]{}()]/g, " ")
    .replace(/[`"'_*#]/g, " ")
    .replace(/[;:!?.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const short = cleaned
    .split(" ")
    .filter(Boolean)
    .slice(0, 6)
    .join(" ")
    .trim();

  return short || fallback;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\u00c0-\u017f]/gi, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function truncateChars(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trim()}...`;
}

function toTitleCase(input: string): string {
  return input
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function stripFileExtension(name: string): string {
  return name.replace(/\.[a-z0-9]{1,8}$/i, "").trim();
}

function normalizeForComparison(text: string): string {
  return stripFileExtension(text)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s\u00c0-\u017f]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMeaningfulKeywords(text: string): string[] {
  const tokens = tokenize(text).filter(
    (w) => w.length >= 4 && !STOPWORDS.has(w) && !BANNED_TITLE_TOKENS.has(w)
  );

  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function extractHeadingCandidate(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);

  for (const line of lines) {
    const normalized = normalizeSuggestedName(line, "");
    if (!normalized) continue;

    const words = normalized.split(" ").filter(Boolean);
    if (words.length < 2 || words.length > 7) continue;

    const hasLetter = /[a-z\u00c0-\u017f]/i.test(normalized);
    if (!hasLetter) continue;

    // Avoid generic labels as titles.
    const allGeneric = words.every((word) =>
      BANNED_TITLE_TOKENS.has(word.toLowerCase()) || STOPWORDS.has(word.toLowerCase())
    );
    if (allGeneric) continue;

    return normalized;
  }

  return null;
}

function buildDistributedExcerpt(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return "";

  if (compact.length <= 3000) {
    return compact;
  }

  const third = Math.floor(compact.length / 3);
  const start = truncateChars(compact.slice(0, 850).trim(), 850);
  const middle = truncateChars(
    compact.slice(Math.max(0, third - 425), Math.min(compact.length, third + 425)).trim(),
    850
  );
  const end = truncateChars(compact.slice(Math.max(0, compact.length - 850)).trim(), 850);

  return [
    `Inicio: ${start}`,
    `Parte media: ${middle}`,
    `Cierre: ${end}`,
  ].join("\n\n");
}

function buildKeywordTitle(keywords: string[]): string {
  if (keywords.length === 0) return "";
  if (keywords.length === 1) return toTitleCase(keywords[0]);
  if (keywords.length === 2) return toTitleCase(`${keywords[0]} y ${keywords[1]}`);
  return toTitleCase(`${keywords[0]} ${keywords[1]} ${keywords[2]}`);
}

function buildAlternativeKeywordTitle(keywords: string[]): string {
  if (keywords.length >= 4) {
    return toTitleCase(`${keywords[1]} ${keywords[2]} ${keywords[3]}`);
  }
  if (keywords.length >= 3) {
    return toTitleCase(`${keywords[1]} y ${keywords[2]}`);
  }
  return buildKeywordTitle(keywords);
}

function relevanceScore(title: string, keywords: string[]): number {
  if (!title.trim()) return 0;
  if (keywords.length === 0) return 0;

  const titleTokens = new Set(
    tokenize(title).filter((w) => !STOPWORDS.has(w) && !BANNED_TITLE_TOKENS.has(w))
  );

  let score = 0;
  for (const kw of keywords.slice(0, 8)) {
    if (titleTokens.has(kw)) score += 1;
  }

  return score;
}

function isPrefixOfSourceTitle(title: string, sourceText: string): boolean {
  const titleTokens = tokenize(title).filter((w) => !STOPWORDS.has(w));
  const sourceTokens = tokenize(sourceText).filter((w) => !STOPWORDS.has(w));
  if (titleTokens.length < 2 || sourceTokens.length < titleTokens.length) return false;

  return titleTokens.every((token, index) => token === sourceTokens[index]);
}

function generateLocalSuggestion(extractedText: string, fallback: string): string {
  const heading = extractHeadingCandidate(extractedText);
  if (heading) {
    return normalizeSuggestedName(heading, fallback);
  }

  const keywords = getMeaningfulKeywords(extractedText);
  const candidate = buildKeywordTitle(keywords.slice(0, 3));
  return normalizeSuggestedName(candidate, fallback);
}

function isSameName(a: string, b: string): boolean {
  return normalizeForComparison(a) === normalizeForComparison(b);
}

function ensureDifferentSuggestion(
  suggestion: string,
  originalName: string,
  keywords: string[]
): string {
  if (!isSameName(suggestion, originalName)) return suggestion;

  const primary = normalizeSuggestedName(buildKeywordTitle(keywords.slice(0, 3)), originalName);
  if (!isSameName(primary, originalName)) return primary;

  const alternative = normalizeSuggestedName(
    buildAlternativeKeywordTitle(keywords.slice(0, 4)),
    originalName
  );
  if (!isSameName(alternative, originalName)) return alternative;

  const sourceTokens = tokenize(suggestion);
  const extraKeyword = keywords.find((keyword) => !sourceTokens.includes(keyword));
  if (extraKeyword) {
    return normalizeSuggestedName(`${suggestion} ${toTitleCase(extraKeyword)}`, originalName);
  }

  return suggestion;
}

function isHighQualitySuggestion(
  suggestion: string,
  originalName: string,
  keywords: string[],
  sourceText: string
): boolean {
  if (!suggestion.trim()) return false;
  if (isSameName(suggestion, originalName)) return false;
  if (isPrefixOfSourceTitle(suggestion, sourceText)) return false;

  const words = suggestion.split(" ").filter(Boolean);
  if (words.length < 2 || words.length > 6) return false;

  // Avoid mostly generic titles.
  const meaningfulWords = words.filter(
    (w) => !STOPWORDS.has(w.toLowerCase()) && !BANNED_TITLE_TOKENS.has(w.toLowerCase())
  );
  if (meaningfulWords.length < 1) return false;

  const overlapScore = relevanceScore(suggestion, keywords);
  if (overlapScore >= 1) return true;

  // Accept semantically plausible titles even without literal token overlap.
  return meaningfulWords.length >= 2;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const userId = await getRequestUserId(req);
    if (!userId) return unauthorizedResponse();

    const { id: spaceId, docId } = await params;

    const document = await db.aurisLMDocument.findFirst({
      where: { id: docId, spaceId, userId },
      select: {
        id: true,
        spaceId: true,
        originalName: true,
        storedPath: true,
        mimeType: true,
        fileSize: true,
        status: true,
        errorMessage: true,
        extractedText: true,
        createdAt: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    if (!document.extractedText?.trim()) {
      return NextResponse.json(
        { error: "La fuente aún no tiene contenido procesado para sugerir un nombre" },
        { status: 409 }
      );
    }

    const excerpt = buildDistributedExcerpt(document.extractedText);
    const keywords = getMeaningfulKeywords(document.extractedText);
    let suggestedName = document.originalName;
    let usedFallback = false;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: MODEL,
            temperature: 0,
            max_tokens: 32,
            messages: [
              {
                role: "system",
                content:
                  [
                    "Genera un titulo corto y natural en espanol para una fuente documental.",
                    "Reglas estrictas:",
                    "1) Entre 2 y 6 palabras.",
                    "2) Debe representar el tema global de TODA la fuente, no solo el inicio.",
                    "3) Debe sonar como titulo real, no lista de keywords.",
                    "4) No copies literalmente las primeras palabras del documento.",
                    "5) Integra la idea principal considerando inicio, parte media y cierre.",
                    "6) Sin comillas, sin punto final, sin prefijos como 'Documento'.",
                    "7) Debe reutilizar al menos una palabra clave del contenido o un concepto equivalente claro.",
                    "8) Responde SOLO con el titulo.",
                  ].join("\n"),
              },
              {
                role: "user",
                content: [
                  `Nombre actual: ${document.originalName}`,
                  `Tipo MIME: ${document.mimeType}`,
                  `Palabras clave: ${keywords.slice(0, 8).join(", ") || "sin palabras clave claras"}`,
                  "Panorama de la fuente:",
                  excerpt,
                ].join("\n\n"),
              },
            ],
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          console.error("[AurisLM] Suggest name OpenRouter error:", response.status, body);
          usedFallback = true;
        } else {
          const payload = (await response.json()) as OpenRouterResponse;
          const rawSuggestion = payload.choices?.[0]?.message?.content?.trim() ?? "";
          const normalized = ensureDifferentSuggestion(
            normalizeSuggestedName(rawSuggestion, document.originalName),
            document.originalName,
            keywords
          );
          if (isHighQualitySuggestion(normalized, document.originalName, keywords, document.extractedText)) {
            suggestedName = normalized;
          } else {
            usedFallback = true;
          }
        }
      } catch (providerError) {
        console.error("[AurisLM] Suggest name provider call failed:", providerError);
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    if (usedFallback) {
      suggestedName = ensureDifferentSuggestion(
        generateLocalSuggestion(document.extractedText, document.originalName),
        document.originalName,
        keywords
      );
      if (!isHighQualitySuggestion(suggestedName, document.originalName, keywords, document.extractedText)) {
        suggestedName = ensureDifferentSuggestion(
          normalizeSuggestedName(buildKeywordTitle(keywords.slice(0, 2)), document.originalName),
          document.originalName,
          keywords
        );
      }
    }

    if (isSameName(suggestedName, document.originalName)) {
      return NextResponse.json(
        {
          code: "NO_NAME_CHANGE",
          error:
            "No se pudo generar un nombre diferente. Intenta nuevamente cuando el contenido esté más completo.",
        },
        { status: 409 }
      );
    }

    const updated = await db.aurisLMDocument.update({
      where: { id: document.id },
      data: { originalName: suggestedName },
      select: {
        id: true,
        spaceId: true,
        originalName: true,
        storedPath: true,
        mimeType: true,
        fileSize: true,
        status: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      document: updated,
      suggestedName,
      source: usedFallback ? "fallback" : "openrouter",
    });
  } catch (error) {
    console.error("[AurisLM] Suggest name:", error);
    return NextResponse.json({ error: "Error al sugerir el nombre de la fuente" }, { status: 500 });
  }
}