-- CreateTable: AurisLM Tool
CREATE TABLE "AurisLMSpace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AurisLMSpace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AurisLMDocument" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "extractedText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AurisLMDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AurisLMChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AurisLMChunk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AurisLMChatMessage" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "webSearchUsed" BOOLEAN NOT NULL DEFAULT false,
    "sources" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AurisLMChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AurisLMDocument_spaceId_idx" ON "AurisLMDocument"("spaceId");
CREATE INDEX "AurisLMDocument_status_idx" ON "AurisLMDocument"("status");
CREATE INDEX "AurisLMChunk_spaceId_idx" ON "AurisLMChunk"("spaceId");
CREATE INDEX "AurisLMChunk_documentId_idx" ON "AurisLMChunk"("documentId");
CREATE INDEX "AurisLMChatMessage_spaceId_idx" ON "AurisLMChatMessage"("spaceId");
CREATE INDEX "AurisLMChatMessage_createdAt_idx" ON "AurisLMChatMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "AurisLMDocument" ADD CONSTRAINT "AurisLMDocument_spaceId_fkey"
    FOREIGN KEY ("spaceId") REFERENCES "AurisLMSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AurisLMChunk" ADD CONSTRAINT "AurisLMChunk_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "AurisLMDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AurisLMChatMessage" ADD CONSTRAINT "AurisLMChatMessage_spaceId_fkey"
    FOREIGN KEY ("spaceId") REFERENCES "AurisLMSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
