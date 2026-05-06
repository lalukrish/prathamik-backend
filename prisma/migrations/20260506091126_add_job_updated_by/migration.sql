-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "updatedBy" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
