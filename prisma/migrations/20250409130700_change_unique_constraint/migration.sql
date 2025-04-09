/*
  Warnings:

  - A unique constraint covering the columns `[code,owner_id]` on the table `companies` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "companies_name_owner_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_owner_id_key" ON "companies"("code", "owner_id");
