-- AlterTable
ALTER TABLE "public"."Checkout" ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "webhookUrl" TEXT,
ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 hour';
