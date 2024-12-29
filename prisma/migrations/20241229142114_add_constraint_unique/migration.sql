/*
  Warnings:

  - A unique constraint covering the columns `[name,owner_id]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,company_id]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "companies_name_owner_id_key" ON "companies"("name", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "stores_name_company_id_key" ON "stores"("name", "company_id");
