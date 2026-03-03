-- CreateTable
CREATE TABLE "ToolUsageLog" (
    "id" TEXT NOT NULL,
    "toolSlug" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceReport" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "csvFileName" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolUsageLog_toolSlug_idx" ON "ToolUsageLog"("toolSlug");

-- CreateIndex
CREATE INDEX "MaintenanceReport_reportDate_idx" ON "MaintenanceReport"("reportDate");
