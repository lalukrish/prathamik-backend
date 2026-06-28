-- CreateEnum
CREATE TYPE "ExamCategory" AS ENUM ('UPSC', 'SSC', 'IBPS', 'RRB', 'NEET', 'JEE', 'PSC', 'OTHER');

-- CreateEnum
CREATE TYPE "AccessMode" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "StudyGroupCategory" AS ENUM ('UPSC', 'SSC', 'IBPS', 'RRB', 'NEET', 'JEE', 'PSC', 'OTHER');

-- CreateEnum
CREATE TYPE "TopicImportance" AS ENUM ('IMPORTANT', 'MEDIUM_IMPORTANT', 'LESS_IMPORTANT');

-- AlterTable
ALTER TABLE "MockTest" ADD COLUMN     "accessMode" "AccessMode" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "category" "ExamCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "price" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "UserTestEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mockTestId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserTestEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mockTestId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyTopic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "StudyGroupCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "importance" "TopicImportance" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTestEnrollment_userId_mockTestId_key" ON "UserTestEnrollment"("userId", "mockTestId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_mockTestId_idx" ON "Transaction"("mockTestId");

-- CreateIndex
CREATE INDEX "StudyTopic_userId_idx" ON "StudyTopic"("userId");

-- CreateIndex
CREATE INDEX "StudyTopic_category_idx" ON "StudyTopic"("category");

-- CreateIndex
CREATE INDEX "TopicVote_topicId_idx" ON "TopicVote"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicVote_userId_topicId_key" ON "TopicVote"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "UserTestEnrollment" ADD CONSTRAINT "UserTestEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestEnrollment" ADD CONSTRAINT "UserTestEnrollment_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTopic" ADD CONSTRAINT "StudyTopic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVote" ADD CONSTRAINT "TopicVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVote" ADD CONSTRAINT "TopicVote_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "StudyTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
