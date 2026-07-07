/*
  Warnings:

  - You are about to drop the column `propertyId` on the `property_images` table. All the data in the column will be lost.
  - Added the required column `property_id` to the `property_images` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "property_images" DROP CONSTRAINT "property_images_propertyId_fkey";

-- AlterTable
ALTER TABLE "property_images" DROP COLUMN "propertyId",
ADD COLUMN     "property_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
