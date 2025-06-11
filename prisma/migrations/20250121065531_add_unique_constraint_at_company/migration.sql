/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `companies` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "is_flex_price" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_float_price" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "poin_config" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");
