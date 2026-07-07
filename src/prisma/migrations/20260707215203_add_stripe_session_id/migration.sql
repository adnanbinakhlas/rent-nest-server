/*
  Warnings:

  - A unique constraint covering the columns `[stripe_session_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripe_session_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "stripe_session_id" TEXT NOT NULL,
ALTER COLUMN "stripe_payment_intent_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_session_id_key" ON "payments"("stripe_session_id");
