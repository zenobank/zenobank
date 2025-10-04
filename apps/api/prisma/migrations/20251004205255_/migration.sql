-- CreateEnum
CREATE TYPE "public"."PaymentRail" AS ENUM ('ONCHAIN', 'CUSTODIAL');

-- CreateEnum
CREATE TYPE "public"."Provider" AS ENUM ('BINANCE_PAY');

-- CreateEnum
CREATE TYPE "public"."CheckoutStatus" AS ENUM ('OPEN', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AttemptStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."NetworkType" AS ENUM ('EVM', 'SOLANA');

-- CreateEnum
CREATE TYPE "public"."TokenStandard" AS ENUM ('NATIVE', 'ERC20', 'SPL');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Store',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "apiKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StoreCredential" (
    "id" TEXT NOT NULL,
    "provider" "public"."Provider" NOT NULL,
    "accountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "StoreCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Checkout" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "priceCurrency" TEXT NOT NULL,
    "priceAmount" TEXT NOT NULL,
    "status" "public"."CheckoutStatus" NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3) DEFAULT now() + interval '1 hour',
    "storeId" TEXT NOT NULL,
    "enabledRails" "public"."PaymentRail"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentAttempt" (
    "id" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "rail" "public"."PaymentRail" NOT NULL,
    "status" "public"."AttemptStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnchainAttempt" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "transactionHash" TEXT,
    "tokenId" TEXT NOT NULL,
    "tokenPayAmount" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "depositWalletId" TEXT NOT NULL,

    CONSTRAINT "OnchainAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BinancePayPayment" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "tokenPayAmount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BinancePayPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attemptId" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "priceCurrency" TEXT NOT NULL,
    "priceAmount" TEXT NOT NULL,
    "rail" "public"."PaymentRail" NOT NULL,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Network" (
    "id" TEXT NOT NULL,
    "networkType" "public"."NetworkType" NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isTestnet" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmationRetryDelay" INTEGER NOT NULL DEFAULT 1000,
    "maxConfirmationAttempts" INTEGER NOT NULL DEFAULT 100,
    "minBlockConfirmations" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProviderToken" (
    "id" TEXT NOT NULL,
    "provider" "public"."Provider" NOT NULL,
    "providerTokenId" TEXT NOT NULL,
    "canonicalTokenId" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "checkoutId" TEXT,

    CONSTRAINT "ProviderToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Token" (
    "id" TEXT NOT NULL,
    "canonicalTokenId" TEXT NOT NULL,
    "standard" "public"."TokenStandard" NOT NULL,
    "address" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "networkId" TEXT NOT NULL,
    "checkoutId" TEXT,
    "logoUrl" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeId" TEXT,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_apiKey_key" ON "public"."Store"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "StoreCredential_storeId_provider_key" ON "public"."StoreCredential"("storeId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_storeId_orderId_key" ON "public"."Checkout"("storeId", "orderId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_checkoutId_status_idx" ON "public"."PaymentAttempt"("checkoutId", "status");

-- CreateIndex
CREATE INDEX "PaymentAttempt_rail_status_idx" ON "public"."PaymentAttempt"("rail", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OnchainAttempt_attemptId_key" ON "public"."OnchainAttempt"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "BinancePayPayment_attemptId_key" ON "public"."BinancePayPayment"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_attemptId_key" ON "public"."Payment"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutId_key" ON "public"."Payment"("checkoutId");

-- CreateIndex
CREATE INDEX "Payment_storeId_status_idx" ON "public"."Payment"("storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Network_name_key" ON "public"."Network"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderToken_provider_providerTokenId_key" ON "public"."ProviderToken"("provider", "providerTokenId");

-- CreateIndex
CREATE INDEX "Token_canonicalTokenId_idx" ON "public"."Token"("canonicalTokenId");

-- CreateIndex
CREATE INDEX "Token_networkId_symbol_idx" ON "public"."Token"("networkId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Token_networkId_address_key" ON "public"."Token"("networkId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_networkId_address_key" ON "public"."Wallet"("networkId", "address");

-- AddForeignKey
ALTER TABLE "public"."Store" ADD CONSTRAINT "Store_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreCredential" ADD CONSTRAINT "StoreCredential_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Checkout" ADD CONSTRAINT "Checkout_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnchainAttempt" ADD CONSTRAINT "OnchainAttempt_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."PaymentAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnchainAttempt" ADD CONSTRAINT "OnchainAttempt_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnchainAttempt" ADD CONSTRAINT "OnchainAttempt_depositWalletId_fkey" FOREIGN KEY ("depositWalletId") REFERENCES "public"."Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnchainAttempt" ADD CONSTRAINT "OnchainAttempt_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BinancePayPayment" ADD CONSTRAINT "BinancePayPayment_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."PaymentAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BinancePayPayment" ADD CONSTRAINT "BinancePayPayment_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "public"."StoreCredential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."PaymentAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderToken" ADD CONSTRAINT "ProviderToken_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Token" ADD CONSTRAINT "Token_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Token" ADD CONSTRAINT "Token_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
