/*
  Warnings:

  - You are about to drop the column `stripe_session_id` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "stripe_session_id";
