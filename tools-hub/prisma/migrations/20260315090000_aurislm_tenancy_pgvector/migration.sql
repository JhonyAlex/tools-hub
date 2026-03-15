-- Try to create pgvector extension; silently skip if unavailable on this host.
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgvector not available — embedding features will be disabled';
END $$;

-- ── AurisLMSpace: add userId ─────────────────────────────────────────────────
ALTER TABLE "AurisLMSpace"
  ADD COLUMN IF NOT EXISTS "userId" TEXT;

UPDATE "AurisLMSpace"
SET "userId" = 'legacy-local'
WHERE "userId" IS NULL;

ALTER TABLE "AurisLMSpace"
  ALTER COLUMN "userId" SET NOT NULL;

-- ── AurisLMDocument: add userId + checksum ───────────────────────────────────
ALTER TABLE "AurisLMDocument"
  ADD COLUMN IF NOT EXISTS "userId" TEXT,
  ADD COLUMN IF NOT EXISTS "checksum" TEXT;

UPDATE "AurisLMDocument" d
SET "userId" = s."userId"
FROM "AurisLMSpace" s
WHERE d."spaceId" = s."id" AND d."userId" IS NULL;

ALTER TABLE "AurisLMDocument"
  ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "AurisLMDocument"
  ALTER COLUMN "status" SET DEFAULT 'queued';

-- ── AurisLMChunk: add userId + metadata columns ──────────────────────────────
ALTER TABLE "AurisLMChunk"
  ADD COLUMN IF NOT EXISTS "userId"     TEXT,
  ADD COLUMN IF NOT EXISTS "modality"   TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS "sourceKind" TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS "sourcePage" INTEGER;

-- Add embedding column only when pgvector type is available.
DO $$ BEGIN
  ALTER TABLE "AurisLMChunk"
    ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
EXCEPTION WHEN undefined_object THEN
  RAISE NOTICE 'vector type unavailable — embedding column skipped';
END $$;

UPDATE "AurisLMChunk" c
SET "userId" = d."userId"
FROM "AurisLMDocument" d
WHERE c."documentId" = d."id" AND c."userId" IS NULL;

ALTER TABLE "AurisLMChunk"
  ALTER COLUMN "userId" SET NOT NULL;

-- ── AurisLMChatMessage: add userId + grounded ────────────────────────────────
ALTER TABLE "AurisLMChatMessage"
  ADD COLUMN IF NOT EXISTS "userId"   TEXT,
  ADD COLUMN IF NOT EXISTS "grounded" BOOLEAN;

UPDATE "AurisLMChatMessage" m
SET "userId" = s."userId"
FROM "AurisLMSpace" s
WHERE m."spaceId" = s."id" AND m."userId" IS NULL;

ALTER TABLE "AurisLMChatMessage"
  ALTER COLUMN "userId" SET NOT NULL;

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "AurisLMSpace_userId_updatedAt_idx"
  ON "AurisLMSpace"("userId", "updatedAt");

CREATE INDEX IF NOT EXISTS "AurisLMDocument_userId_spaceId_idx"
  ON "AurisLMDocument"("userId", "spaceId");

CREATE INDEX IF NOT EXISTS "AurisLMChunk_userId_spaceId_idx"
  ON "AurisLMChunk"("userId", "spaceId");

CREATE INDEX IF NOT EXISTS "AurisLMChatMessage_userId_spaceId_createdAt_idx"
  ON "AurisLMChatMessage"("userId", "spaceId", "createdAt");

-- HNSW index — only when pgvector is available.
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS "AurisLMChunk_embedding_hnsw_idx"
    ON "AurisLMChunk" USING hnsw ("embedding" vector_cosine_ops)
    WHERE "embedding" IS NOT NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'HNSW index skipped — pgvector unavailable';
END $$;
