CREATE EXTENSION IF NOT EXISTS citext;
-- AlterTable
ALTER TABLE "public"."Checkout" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 hour';

-- AlterTable
ALTER TABLE "public"."OnchainToken" ALTER COLUMN "address" SET DATA TYPE CITEXT;
