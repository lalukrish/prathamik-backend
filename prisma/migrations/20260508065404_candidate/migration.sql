/*
  Warnings:

  - You are about to drop the column `applyMethod` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `confidenceScore` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `parsedData` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `processing` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `currentCompany` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `previousCompanies` on the `Candidate` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Application_processing_idx";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "applyMethod",
DROP COLUMN "confidenceScore",
DROP COLUMN "embedding",
DROP COLUMN "parsedData",
DROP COLUMN "processing",
DROP COLUMN "source";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "currentCompany",
DROP COLUMN "languages",
DROP COLUMN "previousCompanies",
ADD COLUMN     "currentCTC" DOUBLE PRECISION,
ADD COLUMN     "expectedSalary" DOUBLE PRECISION,
ADD COLUMN     "isOnNoticePeriod" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noticePeriod" INTEGER;

-- DropEnum
DROP TYPE "ApplyMethod";
