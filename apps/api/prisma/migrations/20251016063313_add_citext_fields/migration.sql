-- AlterTable
ALTER TABLE "public"."Checkout" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 hour';

-- AlterTable
ALTER TABLE "public"."Wallet" ALTER COLUMN "address" SET DATA TYPE CITEXT;
