/*
  Warnings:

  - A unique constraint covering the columns `[code,company_id]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "stores_name_company_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "stores_code_company_id_key" ON "stores"("code", "company_id");
