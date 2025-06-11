-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "wa_number" TEXT,
ALTER COLUMN "income_tax" SET DEFAULT 0,
ALTER COLUMN "tax_purchase" SET DEFAULT 0;
