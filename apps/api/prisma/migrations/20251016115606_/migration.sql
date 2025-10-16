-- DropIndex
DROP INDEX "public"."Store_userId_name_key";

-- AlterTable
ALTER TABLE "public"."Checkout" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 hour';
