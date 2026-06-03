-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'SELECTED';

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailSentAt" TIMESTAMP(3),
ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "title" TEXT;
