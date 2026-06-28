-- DropForeignKey
ALTER TABLE "AuthSession" DROP CONSTRAINT "AuthSession_userId_fkey";

-- DropIndex
DROP INDEX "AuthSession_userId_idx";

-- AlterTable
ALTER TABLE "AuthSession" ADD COLUMN     "lastActiveAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
