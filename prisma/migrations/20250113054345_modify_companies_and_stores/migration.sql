/*
  Warnings:

  - Added the required column `code` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `npwp` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `open_date` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "latitude" DECIMAL(65,20) NOT NULL,
ADD COLUMN     "longitude" DECIMAL(65,20) NOT NULL,
ADD COLUMN     "npwp" TEXT NOT NULL,
ADD COLUMN     "open_date" DATE NOT NULL;
