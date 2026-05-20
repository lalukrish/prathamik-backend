/*
  Warnings:

  - Added the required column `branch_name` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "branch_name" TEXT NOT NULL;
