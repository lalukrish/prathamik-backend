/*
  Warnings:

  - You are about to drop the column `templateId` on the `Interview` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_templateId_fkey";

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "templateId",
ADD COLUMN     "questionBankId" TEXT;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
