/**
 * Global AI Provider resolution.
 * All tools should use getActiveAIProvider() to get the current provider config.
 * Falls back to OPENROUTER_API_KEY env var if no custom provider is configured.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { db } from "@/core/lib/db";

const prisma = db as any;

function getEncryptionKey() {
  const secret =
    process.env.ORCHESTRATOR_SETTINGS_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "tools-hub-dev-only-key-change-me";

  return createHash("sha256").update(secret).digest();
}

function decryptValue(payload: string): string | null {
  const [ivRaw, encryptedRaw, tagRaw] = payload.split(":");
  if (!ivRaw || !encryptedRaw || !tagRaw) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivRaw, "base64")
    );
    decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedRaw, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

export function encryptValue(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${encrypted.toString("base64")}:${tag.toString("base64")}`;
}

export interface ResolvedAIProvider {
  baseUrl: string;
  apiKey: string;
  model: string;
  name: string;
  source: "global-custom" | "env-openrouter";
}

/**
 * Normalizes a base URL by:
 * - Removing trailing slashes
 * - Stripping /chat/completions, /v1/chat/completions suffixes (user may have pasted the full endpoint)
 * - Ensuring no double slashes
 */
function normalizeBaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "");
  // If user pasted the full chat endpoint, strip it
  url = url.replace(/\/chat\/completions$/i, "");
  // If user pasted the embeddings endpoint, strip it
  url = url.replace(/\/embeddings$/i, "");
  return url;
}

/**
 * Resolves the active AI provider for use by any tool.
 * Priority: GlobalAIProvider (isDefault=true or first) > OPENROUTER_API_KEY env var.
 */
export async function getActiveAIProvider(): Promise<ResolvedAIProvider> {
  // Try global custom provider first
  try {
    const providers = await prisma.globalAIProvider.findMany({
      orderBy: { isDefault: "desc" },
    });

    if (providers.length > 0) {
      const cp = providers[0];
      const apiKey = decryptValue(cp.encryptedApiKey);
      if (apiKey) {
        return {
          baseUrl: normalizeBaseUrl(cp.baseUrl),
          apiKey,
          model: cp.defaultModel,
          name: cp.name,
          source: "global-custom",
        };
      }
    }
  } catch {
    // Table may not exist yet during first deploy — fall through to env
  }

  // Fallback: OPENROUTER_API_KEY env var
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    return {
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey: orKey,
      model: "deepseek/deepseek-chat",
      name: "OpenRouter (env)",
      source: "env-openrouter",
    };
  }

  throw new Error(
    "No hay proveedor de IA configurado. Agrega uno en Configuración > Proveedores de IA o define OPENROUTER_API_KEY."
  );
}
