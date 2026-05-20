-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
