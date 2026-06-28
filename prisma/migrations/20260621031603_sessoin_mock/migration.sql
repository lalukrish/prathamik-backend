/*
  Warnings:

  - You are about to drop the column `duration` on the `MockTest` table. All the data in the column will be lost.
  - Added the required column `durationMinutes` to the `MockTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMarks` to the `MockTest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'SUBMITTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "MockTest" DROP COLUMN "duration",
ADD COLUMN     "durationMinutes" INTEGER NOT NULL,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalMarks" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserAnswer" ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mockTestId" TEXT NOT NULL,
    "status" "TestStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "remainingSeconds" INTEGER NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionActivity" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_refreshTokenHash_key" ON "AuthSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "TestSession_userId_idx" ON "TestSession"("userId");

-- CreateIndex
CREATE INDEX "TestSession_mockTestId_idx" ON "TestSession"("mockTestId");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionActivity" ADD CONSTRAINT "SessionActivity_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
