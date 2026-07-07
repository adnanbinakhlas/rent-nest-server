/*
  Warnings:

  - Added the required column `stripe_session_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "stripe_session_id" TEXT NOT NULL;
