/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Checkout" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 hour';

-- CreateIndex
CREATE UNIQUE INDEX "Store_userId_name_key" ON "public"."Store"("userId", "name");
