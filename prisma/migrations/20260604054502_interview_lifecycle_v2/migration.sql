/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the `InterviewTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterviewTemplateQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InterviewCancelledBy" AS ENUM ('RECRUITER', 'CANDIDATE', 'SYSTEM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InterviewStatus" ADD VALUE 'SCHEDULED';
ALTER TYPE "InterviewStatus" ADD VALUE 'EXPIRED';

-- DropForeignKey
ALTER TABLE "InterviewTemplate" DROP CONSTRAINT "InterviewTemplate_jobId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewTemplate" DROP CONSTRAINT "InterviewTemplate_orgId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewTemplateQuestion" DROP CONSTRAINT "InterviewTemplateQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewTemplateQuestion" DROP CONSTRAINT "InterviewTemplateQuestion_templateId_fkey";

-- DropIndex
DROP INDEX "Interview_applicationId_key";

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "createdBy",
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledById" TEXT,
ADD COLUMN     "cancelledByType" "InterviewCancelledBy",
ADD COLUMN     "cancelledReason" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "emailError" TEXT,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "rescheduledFromId" TEXT;

-- DropTable
DROP TABLE "InterviewTemplate";

-- DropTable
DROP TABLE "InterviewTemplateQuestion";

-- CreateTable
CREATE TABLE "InterviewActivity" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewActivity_interviewId_idx" ON "InterviewActivity"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewActivity_action_idx" ON "InterviewActivity"("action");

-- CreateIndex
CREATE INDEX "InterviewActivity_createdAt_idx" ON "InterviewActivity"("createdAt");

-- CreateIndex
CREATE INDEX "Interview_applicationId_idx" ON "Interview"("applicationId");

-- CreateIndex
CREATE INDEX "Interview_scheduledEndAt_idx" ON "Interview"("scheduledEndAt");

-- CreateIndex
CREATE INDEX "Interview_expiresAt_idx" ON "Interview"("expiresAt");

-- CreateIndex
CREATE INDEX "Interview_questionBankId_idx" ON "Interview"("questionBankId");

-- CreateIndex
CREATE INDEX "Interview_rescheduledFromId_idx" ON "Interview"("rescheduledFromId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewActivity" ADD CONSTRAINT "InterviewActivity_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
