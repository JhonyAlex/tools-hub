import path from "path";

/**
 * Base directory for file uploads.
 * - In Docker: set UPLOADS_DIR=/app/uploads
 * - In local dev: defaults to ./uploads relative to project root
 */
export const UPLOADS_BASE =
  process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
