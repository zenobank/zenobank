-- AlterTable
ALTER TABLE "public"."Checkout" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 hour';

-- Add CHECK constraint for Token.decimals
ALTER TABLE "public"."Token" ADD CONSTRAINT "Token_decimals_check" CHECK ("decimals" > 6);
