-- CreateEnum
CREATE TYPE "public"."MethodType" AS ENUM ('ONCHAIN', 'BINANCE_PAY');

-- CreateEnum
CREATE TYPE "public"."CheckoutStatus" AS ENUM ('OPEN', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AttemptStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."NetworkType" AS ENUM ('EVM', 'SOLANA');

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
CREATE TABLE "public"."Checkout" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "priceCurrency" TEXT NOT NULL,
    "priceAmount" TEXT NOT NULL,
    "status" "public"."CheckoutStatus" NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3) DEFAULT now() + interval '1 hour',
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onchainTokenId" TEXT,
    "binancePayTokenId" TEXT,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnChainPaymentAttempt" (
    "id" TEXT NOT NULL,
    "status" "public"."AttemptStatus" NOT NULL DEFAULT 'PENDING',
    "transactionHash" TEXT,
    "tokenPayAmount" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "depositWalletId" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnChainPaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BinancePayPaymentAttempt" (
    "id" TEXT NOT NULL,
    "status" "public"."AttemptStatus" NOT NULL DEFAULT 'PENDING',
    "tokenPayAmount" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "transactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BinancePayPaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onchainAttemptId" TEXT,
    "binanceAttemptId" TEXT,
    "checkoutId" TEXT NOT NULL,
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
    "chainId" INTEGER,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnchainToken" (
    "id" TEXT NOT NULL,
    "canonicalTokenId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnchainToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BinancePayCredential" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "BinancePayCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BinancePayToken" (
    "id" TEXT NOT NULL,
    "canonicalTokenId" TEXT NOT NULL,
    "binanceTokenId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BinancePayToken_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "OnChainPaymentAttempt_checkoutId_tokenId_key" ON "public"."OnChainPaymentAttempt"("checkoutId", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "BinancePayPaymentAttempt_checkoutId_tokenId_key" ON "public"."BinancePayPaymentAttempt"("checkoutId", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_onchainAttemptId_key" ON "public"."Payment"("onchainAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_binanceAttemptId_key" ON "public"."Payment"("binanceAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutId_key" ON "public"."Payment"("checkoutId");

-- CreateIndex
CREATE INDEX "Payment_storeId_status_idx" ON "public"."Payment"("storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Network_name_key" ON "public"."Network"("name");

-- CreateIndex
CREATE INDEX "OnchainToken_canonicalTokenId_idx" ON "public"."OnchainToken"("canonicalTokenId");

-- CreateIndex
CREATE INDEX "OnchainToken_networkId_symbol_idx" ON "public"."OnchainToken"("networkId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "OnchainToken_networkId_address_key" ON "public"."OnchainToken"("networkId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "BinancePayCredential_storeId_key" ON "public"."BinancePayCredential"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "BinancePayToken_canonicalTokenId_key" ON "public"."BinancePayToken"("canonicalTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_networkId_address_key" ON "public"."Wallet"("networkId", "address");

-- AddForeignKey
ALTER TABLE "public"."Store" ADD CONSTRAINT "Store_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Checkout" ADD CONSTRAINT "Checkout_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Checkout" ADD CONSTRAINT "Checkout_onchainTokenId_fkey" FOREIGN KEY ("onchainTokenId") REFERENCES "public"."OnchainToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Checkout" ADD CONSTRAINT "Checkout_binancePayTokenId_fkey" FOREIGN KEY ("binancePayTokenId") REFERENCES "public"."BinancePayToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnChainPaymentAttempt" ADD CONSTRAINT "OnChainPaymentAttempt_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnChainPaymentAttempt" ADD CONSTRAINT "OnChainPaymentAttempt_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."OnchainToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnChainPaymentAttempt" ADD CONSTRAINT "OnChainPaymentAttempt_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnChainPaymentAttempt" ADD CONSTRAINT "OnChainPaymentAttempt_depositWalletId_fkey" FOREIGN KEY ("depositWalletId") REFERENCES "public"."Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BinancePayPaymentAttempt" ADD CONSTRAINT "BinancePayPaymentAttempt_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BinancePayPaymentAttempt" ADD CONSTRAINT "BinancePayPaymentAttempt_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."BinancePayToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_onchainAttemptId_fkey" FOREIGN KEY ("onchainAttemptId") REFERENCES "public"."OnChainPaymentAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_binanceAttemptId_fkey" FOREIGN KEY ("binanceAttemptId") REFERENCES "public"."BinancePayPaymentAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnchainToken" ADD CONSTRAINT "OnchainToken_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BinancePayCredential" ADD CONSTRAINT "BinancePayCredential_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
