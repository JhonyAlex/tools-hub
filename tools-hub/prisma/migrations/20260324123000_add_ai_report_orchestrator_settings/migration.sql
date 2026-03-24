-- CreateEnum
CREATE TYPE "AgentRole" AS ENUM ('orchestrator', 'organizer', 'visualizer', 'writer');

-- CreateTable
CREATE TABLE "OrchestratorSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "globalProvider" TEXT NOT NULL DEFAULT 'openrouter',
    "encryptedApiKeys" JSONB NOT NULL DEFAULT '{}',
    "defaultPreferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrchestratorSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentConfig" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "role" "AgentRole" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrchestratorSettings_userId_key" ON "OrchestratorSettings"("userId");

-- CreateIndex
CREATE INDEX "OrchestratorSettings_updatedAt_idx" ON "OrchestratorSettings"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentConfig_settingsId_role_key" ON "AgentConfig"("settingsId", "role");

-- CreateIndex
CREATE INDEX "AgentConfig_settingsId_idx" ON "AgentConfig"("settingsId");

-- AddForeignKey
ALTER TABLE "AgentConfig" ADD CONSTRAINT "AgentConfig_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "OrchestratorSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
