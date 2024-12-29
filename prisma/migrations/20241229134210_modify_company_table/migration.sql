/*
  Warnings:

  - Added the required column `owner_id` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "owner_id" UUID NOT NULL;
