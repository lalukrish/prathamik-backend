/*
  Warnings:

  - Added the required column `subjectId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `eventType` on the `SessionActivity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SessionEvent" AS ENUM ('START', 'PAUSE', 'RESUME', 'SUBMIT', 'AUTO_SUBMIT');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "marks" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SessionActivity" DROP COLUMN "eventType",
ADD COLUMN     "eventType" "SessionEvent" NOT NULL;

-- AlterTable
ALTER TABLE "UserAnswer" ADD COLUMN     "isVisited" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
