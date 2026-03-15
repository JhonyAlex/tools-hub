CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "AurisLMSpace"
ADD COLUMN "userId" TEXT;

UPDATE "AurisLMSpace"
SET "userId" = 'legacy-local'
WHERE "userId" IS NULL;

ALTER TABLE "AurisLMSpace"
ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "AurisLMDocument"
ADD COLUMN "userId" TEXT,
ADD COLUMN "checksum" TEXT;

UPDATE "AurisLMDocument" d
SET "userId" = s."userId"
FROM "AurisLMSpace" s
WHERE d."spaceId" = s."id" AND d."userId" IS NULL;

ALTER TABLE "AurisLMDocument"
ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "AurisLMDocument"
ALTER COLUMN "status" SET DEFAULT 'queued';

ALTER TABLE "AurisLMChunk"
ADD COLUMN "userId" TEXT,
ADD COLUMN "modality" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN "sourceKind" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN "sourcePage" INTEGER,
ADD COLUMN "embedding" vector(1536);

UPDATE "AurisLMChunk" c
SET "userId" = d."userId"
FROM "AurisLMDocument" d
WHERE c."documentId" = d."id" AND c."userId" IS NULL;

ALTER TABLE "AurisLMChunk"
ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "AurisLMChatMessage"
ADD COLUMN "userId" TEXT,
ADD COLUMN "grounded" BOOLEAN;

UPDATE "AurisLMChatMessage" m
SET "userId" = s."userId"
FROM "AurisLMSpace" s
WHERE m."spaceId" = s."id" AND m."userId" IS NULL;

ALTER TABLE "AurisLMChatMessage"
ALTER COLUMN "userId" SET NOT NULL;

CREATE INDEX "AurisLMSpace_userId_updatedAt_idx" ON "AurisLMSpace"("userId", "updatedAt");
CREATE INDEX "AurisLMDocument_userId_spaceId_idx" ON "AurisLMDocument"("userId", "spaceId");
CREATE INDEX "AurisLMChunk_userId_spaceId_idx" ON "AurisLMChunk"("userId", "spaceId");
CREATE INDEX "AurisLMChatMessage_userId_spaceId_createdAt_idx" ON "AurisLMChatMessage"("userId", "spaceId", "createdAt");

CREATE INDEX "AurisLMChunk_embedding_hnsw_idx"
ON "AurisLMChunk" USING hnsw ("embedding" vector_cosine_ops)
WHERE "embedding" IS NOT NULL;
