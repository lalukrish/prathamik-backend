/*
  Warnings:

  - You are about to drop the column `jdContent` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "jdContent",
ADD COLUMN     "jdHtml" TEXT;
