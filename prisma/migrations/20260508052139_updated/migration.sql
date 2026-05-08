/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Resume` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[candidateId,jobId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `resumeUrl` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApplyMethod" AS ENUM ('MANUAL', 'RESUME_AUTOFILL');

-- DropIndex
DROP INDEX "Application_jobId_candidateId_key";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "applyMethod" "ApplyMethod" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "confidenceScore" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "embedding" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "currentCompany" TEXT,
ADD COLUMN     "currentRole" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "previousCompanies" JSONB,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "totalExperience" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "fileUrl",
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "resumeUrl" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_processing_idx" ON "Application"("processing");

-- CreateIndex
CREATE UNIQUE INDEX "Application_candidateId_jobId_key" ON "Application"("candidateId", "jobId");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_phone_idx" ON "Candidate"("phone");

-- CreateIndex
CREATE INDEX "Candidate_orgId_idx" ON "Candidate"("orgId");

-- CreateIndex
CREATE INDEX "ProcessingLog_applicationId_idx" ON "ProcessingLog"("applicationId");
