-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "parsedData" JSONB,
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "processingStatus" TEXT NOT NULL DEFAULT 'queued';

-- CreateIndex
CREATE INDEX "Application_processingStatus_idx" ON "Application"("processingStatus");
