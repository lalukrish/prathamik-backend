/*
  Warnings:

  - The `processingStatus` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `overallScore` on the `Interview` table. All the data in the column will be lost.
  - The `status` column on the `Interview` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `correct` on the `InterviewQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `questionText` on the `InterviewQuestion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessToken]` on the table `Interview` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `InterviewQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `InterviewQuestion` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `InterviewQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'MULTIPLE_SELECT', 'RADIO', 'VOICE_SPEAK', 'VOICE_TYPE');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('TAB_SWITCH', 'WINDOW_BLUR', 'WINDOW_MINIMIZE', 'FULLSCREEN_EXIT', 'COPY_PASTE', 'RIGHT_CLICK', 'MULTIPLE_MONITORS', 'DEVTOOLS_OPEN', 'NETWORK_DISCONNECT', 'LONG_INACTIVITY', 'MULTIPLE_FACES', 'VOICE_MISMATCH', 'RAPID_ANSWERING', 'SUSPICIOUS_TYPING');

-- CreateEnum
CREATE TYPE "SecuritySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "processingStatus",
ADD COLUMN     "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'QUEUED';

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "overallScore",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "riskLevel" "SecuritySeverity",
ADD COLUMN     "scheduledEndAt" TIMESTAMP(3),
ADD COLUMN     "scheduledStartAt" TIMESTAMP(3),
ADD COLUMN     "startedByCandidateAt" TIMESTAMP(3),
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "submittedBySystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspiciousEvents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "totalQuestions" INTEGER,
ADD COLUMN     "totalScore" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "InterviewStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "InterviewQuestion" DROP COLUMN "correct",
DROP COLUMN "questionText",
ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "correctAnswer" JSONB,
ADD COLUMN     "difficulty" "DifficultyLevel",
ADD COLUMN     "expectedAnswer" TEXT,
ADD COLUMN     "maxScore" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "question" TEXT NOT NULL,
ADD COLUMN     "questionBankId" TEXT,
ADD COLUMN     "skillTags" TEXT[],
ADD COLUMN     "timeLimitSeconds" INTEGER,
DROP COLUMN "type",
ADD COLUMN     "type" "QuestionType" NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "InterviewAnswer" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "selectedOptions" JSONB,
    "audioAnswerUrl" TEXT,
    "transcription" TEXT,
    "score" INTEGER,
    "aiFeedback" TEXT,
    "cheatingFlag" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER,

    CONSTRAINT "InterviewAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "jobId" TEXT,
    "title" TEXT,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "skillTags" TEXT[],
    "options" JSONB,
    "correctAnswer" JSONB,
    "expectedAnswer" TEXT,
    "audioUrl" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewTemplate" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "jobId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER,
    "totalQuestions" INTEGER,
    "aiQuestionCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewTemplateQuestion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "questionBankId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 10,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InterviewTemplateQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSecurityEvent" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "type" "SecurityEventType" NOT NULL,
    "severity" "SecuritySeverity" NOT NULL DEFAULT 'LOW',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewSecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewAnswer_interviewId_idx" ON "InterviewAnswer"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewAnswer_questionId_idx" ON "InterviewAnswer"("questionId");

-- CreateIndex
CREATE INDEX "QuestionBank_jobId_idx" ON "QuestionBank"("jobId");

-- CreateIndex
CREATE INDEX "QuestionBank_orgId_idx" ON "QuestionBank"("orgId");

-- CreateIndex
CREATE INDEX "InterviewTemplateQuestion_templateId_idx" ON "InterviewTemplateQuestion"("templateId");

-- CreateIndex
CREATE INDEX "InterviewTemplateQuestion_questionBankId_idx" ON "InterviewTemplateQuestion"("questionBankId");

-- CreateIndex
CREATE INDEX "InterviewSecurityEvent_interviewId_idx" ON "InterviewSecurityEvent"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewSecurityEvent_type_idx" ON "InterviewSecurityEvent"("type");

-- CreateIndex
CREATE INDEX "Application_processingStatus_idx" ON "Application"("processingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_accessToken_key" ON "Interview"("accessToken");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE INDEX "Interview_scheduledStartAt_idx" ON "Interview"("scheduledStartAt");

-- CreateIndex
CREATE INDEX "InterviewQuestion_interviewId_idx" ON "InterviewQuestion"("interviewId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InterviewTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewTemplate" ADD CONSTRAINT "InterviewTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewTemplate" ADD CONSTRAINT "InterviewTemplate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewTemplateQuestion" ADD CONSTRAINT "InterviewTemplateQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InterviewTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewTemplateQuestion" ADD CONSTRAINT "InterviewTemplateQuestion_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSecurityEvent" ADD CONSTRAINT "InterviewSecurityEvent_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
