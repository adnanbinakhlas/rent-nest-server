-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "failed_at" TIMESTAMP(3),
ADD COLUMN     "failure_code" TEXT,
ADD COLUMN     "failure_decline_code" TEXT;
