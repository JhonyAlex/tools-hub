-- Remove duplicated documents per (userId, spaceId, checksum), keeping the most recent row.
WITH ranked_docs AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "spaceId", checksum
      ORDER BY "createdAt" DESC, id DESC
    ) AS rn
  FROM "AurisLMDocument"
  WHERE checksum IS NOT NULL
),
removed_docs AS (
  SELECT id
  FROM ranked_docs
  WHERE rn > 1
)
DELETE FROM "AurisLMChunk" c
USING removed_docs r
WHERE c."documentId" = r.id;

WITH ranked_docs AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "spaceId", checksum
      ORDER BY "createdAt" DESC, id DESC
    ) AS rn
  FROM "AurisLMDocument"
  WHERE checksum IS NOT NULL
)
DELETE FROM "AurisLMDocument" d
USING ranked_docs r
WHERE d.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "AurisLMDocument_userId_spaceId_checksum_key"
  ON "AurisLMDocument"("userId", "spaceId", checksum);
