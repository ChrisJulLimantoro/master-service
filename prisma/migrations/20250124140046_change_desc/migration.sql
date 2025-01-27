/*
  Warnings:

  - You are about to drop the column `information` on the `stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stores" DROP COLUMN "information",
ADD COLUMN     "description" TEXT;
