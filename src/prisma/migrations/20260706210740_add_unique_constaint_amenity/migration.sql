/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `amenities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");
