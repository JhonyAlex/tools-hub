-- CreateTable
CREATE TABLE "OrchestratorCustomProvider" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "encryptedApiKey" TEXT NOT NULL,
    "defaultModel" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrchestratorCustomProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrchestratorCustomProvider_settingsId_idx" ON "OrchestratorCustomProvider"("settingsId");

-- AddForeignKey
ALTER TABLE "OrchestratorCustomProvider" ADD CONSTRAINT "OrchestratorCustomProvider_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "OrchestratorSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
