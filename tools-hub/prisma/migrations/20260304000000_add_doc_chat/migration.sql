-- CreateTable
CREATE TABLE "DocChatSession" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL,
    "systemPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocChatMessage_sessionId_idx" ON "DocChatMessage"("sessionId");

-- AddForeignKey
ALTER TABLE "DocChatMessage" ADD CONSTRAINT "DocChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DocChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
