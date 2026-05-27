/*
  Warnings:

  - You are about to drop the column `expectedAnswer` on the `InterviewQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `questionBankId` on the `InterviewQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `questionBankId` on the `InterviewTemplateQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `audioUrl` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the column `correctAnswer` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the column `expectedAnswer` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the column `skillTags` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `QuestionBank` table. All the data in the column will be lost.
  - Added the required column `questionId` to the `InterviewTemplateQuestion` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `QuestionBank` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "QuestionBankMode" AS ENUM ('MANUAL', 'AI');

-- DropForeignKey
ALTER TABLE "InterviewQuestion" DROP CONSTRAINT "InterviewQuestion_questionBankId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewTemplateQuestion" DROP CONSTRAINT "InterviewTemplateQuestion_questionBankId_fkey";

-- DropIndex
DROP INDEX "InterviewTemplateQuestion_questionBankId_idx";

-- AlterTable
ALTER TABLE "InterviewQuestion" DROP COLUMN "expectedAnswer",
DROP COLUMN "questionBankId",
ADD COLUMN     "questionId" TEXT;

-- AlterTable
ALTER TABLE "InterviewTemplateQuestion" DROP COLUMN "questionBankId",
ADD COLUMN     "questionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuestionBank" DROP COLUMN "audioUrl",
DROP COLUMN "correctAnswer",
DROP COLUMN "difficulty",
DROP COLUMN "expectedAnswer",
DROP COLUMN "options",
DROP COLUMN "question",
DROP COLUMN "skillTags",
DROP COLUMN "type",
DROP COLUMN "version",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "mode" "QuestionBankMode",
ADD COLUMN     "totalQuestions" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "title" SET NOT NULL;

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionBankId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "skillTags" TEXT[],
    "options" JSONB,
    "correctAnswer" JSONB,
    "audioUrl" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_questionBankId_idx" ON "Question"("questionBankId");

-- CreateIndex
CREATE INDEX "InterviewTemplateQuestion_questionId_idx" ON "InterviewTemplateQuestion"("questionId");

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewTemplateQuestion" ADD CONSTRAINT "InterviewTemplateQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
