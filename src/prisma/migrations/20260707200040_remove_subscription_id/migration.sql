/*
  Warnings:

  - You are about to drop the column `stripe_customer_id` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "stripe_customer_id";
