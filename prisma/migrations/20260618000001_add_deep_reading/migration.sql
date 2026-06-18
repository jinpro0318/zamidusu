-- CreateTable
CREATE TABLE "DeepReading" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeepReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeepReading_chartId_section_idx" ON "DeepReading"("chartId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "DeepReading_chartId_section_modelVersion_promptVersion_key" ON "DeepReading"("chartId", "section", "modelVersion", "promptVersion");

-- AddForeignKey
ALTER TABLE "DeepReading" ADD CONSTRAINT "DeepReading_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
