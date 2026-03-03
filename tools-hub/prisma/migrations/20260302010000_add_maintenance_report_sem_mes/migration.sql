-- CreateTable
CREATE TABLE "MaintenanceReportSemMes" (
    "id" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "dateRangeStart" TIMESTAMP(3) NOT NULL,
    "dateRangeEnd" TIMESTAMP(3) NOT NULL,
    "csvFileName" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceReportSemMes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaintenanceReportSemMes_dateRangeStart_idx" ON "MaintenanceReportSemMes"("dateRangeStart");

-- CreateIndex
CREATE INDEX "MaintenanceReportSemMes_periodType_idx" ON "MaintenanceReportSemMes"("periodType");
