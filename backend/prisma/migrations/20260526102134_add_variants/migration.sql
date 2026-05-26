/*
  Warnings:

  - Changed the type of `colors` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "variants" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "colors",
ADD COLUMN     "colors" JSONB NOT NULL;
