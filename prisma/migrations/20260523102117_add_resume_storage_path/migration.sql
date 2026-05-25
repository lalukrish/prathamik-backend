/*
  Warnings:

  - Made the column `fileName` on table `Resume` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fileSize` on table `Resume` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mimeType` on table `Resume` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "storagePath" TEXT,
ALTER COLUMN "fileName" SET NOT NULL,
ALTER COLUMN "fileSize" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "mimeType" SET NOT NULL;
