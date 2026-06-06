/*
  Warnings:

  - You are about to drop the column `performedBy` on the `InterviewActivity` table. All the data in the column will be lost.
  - Changed the type of `action` on the `InterviewActivity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InterviewAction" AS ENUM ('INVITED', 'SCHEDULED', 'RESCHEDULED', 'STARTED', 'COMPLETED', 'SUBMITTED', 'CANCELLED', 'EXPIRED', 'AUTO_SUBMITTED');

-- AlterTable
ALTER TABLE "InterviewActivity" DROP COLUMN "performedBy",
ADD COLUMN     "candidateId" TEXT,
ADD COLUMN     "userId" TEXT,
DROP COLUMN "action",
ADD COLUMN     "action" "InterviewAction" NOT NULL;

-- CreateIndex
CREATE INDEX "InterviewActivity_userId_idx" ON "InterviewActivity"("userId");

-- CreateIndex
CREATE INDEX "InterviewActivity_candidateId_idx" ON "InterviewActivity"("candidateId");

-- CreateIndex
CREATE INDEX "InterviewActivity_action_idx" ON "InterviewActivity"("action");

-- AddForeignKey
ALTER TABLE "InterviewActivity" ADD CONSTRAINT "InterviewActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewActivity" ADD CONSTRAINT "InterviewActivity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
