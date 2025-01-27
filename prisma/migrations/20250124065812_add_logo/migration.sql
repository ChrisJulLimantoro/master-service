/*
  Warnings:

  - Added the required column `logo` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "logo" TEXT NOT NULL;
