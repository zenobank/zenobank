<img width="422" height="86.3" alt="logo black" src="https://github.com/user-attachments/assets/113a8851-4272-40e2-8ac0-56e0343327e2#gh-light-mode-only" />
<img width="422" height="86.3" alt="logo white" src="https://github.com/user-attachments/assets/2b54a340-5fe0-41e5-a18b-add15ca6f8d5#gh-dark-mode-only" />

# Zeno Bank — Open-source Crypto Payment Gateway

**Zeno Bank** is an **open-source crypto payment gateway** that can be **self-hosted** or used via our **managed cloud platform** with **0% fees**.  
You can try our hosted version at [dashboard.zenobank.io](https://dashboard.zenobank.io).

Learn how we sustain the project [here](https://zenobank.io/how-does-zeno-bank-make-money-if-we-offer-free-services/).

---

## Key Features

- **Self-hosted or Cloud** — Run on your own servers or use our managed platform at [dashboard.zenobank.io](https://dashboard.zenobank.io).
- **0% fees** — No transaction or gateway fees.
- **Fair License** — Distributed under the [Fair Source License](https://fair.io/).
- **Multi-chain support** — Works across **EVM-based blockchains** (Ethereum, Polygon, BSC, Arbitrum, etc.), with **Solana** and others coming soon.
- **Developer-friendly** — REST API powered by OpenAPI, automatic frontend clients via **Orval**.

---

## System Overview

Zeno Bank is structured as a **monorepo** containing three applications:

1. **Dashboard (Next.js)**  
   Used by merchants to:
   - Add wallets to receive funds and configure payment methods (e.g., Binance Pay)
   - View orders and transaction status

2. **Pay Frontend (React + Vitest)**  
   The public payment page where customers complete crypto payments.  
   Handles checkout UI and token selection.

3. **Backend (NestJS)**  
   Manages all business logic, API endpoints, payment creation, webhook handling, and blockchain monitoring.

---

## Payment Flow

### 1. Merchant setup

A merchant **creates an account** on the [Dashboard](https://dashboard.zenobank.io).  
Inside **Integrations**, they can connect their store — for example, **WooCommerce**.

Once connected, the store is ready to accept crypto payments.

---

### 2. Customer checkout

When a customer selects **“Pay with crypto”**, the store sends a `POST` request to the backend to **create a checkout**.

This `POST` request is handled automatically by the store’s plugin or app.  
For example, for WooCommerce stores, this is managed through our [official Zeno Bank WooCommerce plugin](https://wordpress.org/plugins/zeno-crypto-payment-gateway).

The backend generates a **unique checkout URL** and returns it to the store, which then redirects the user to the checkout page to complete the payment.

---

### 3. Checkout behavior

On the checkout page:

- The customer chooses the **token** (e.g., USDT, USDC) and **method** (e.g., Arbitrum, Binance Pay).
- If the store has not configured any wallets nor Binance Pay accounts, the list will be empty.

Each time a user selects a token and network and clicks **Next**,  
a **PaymentAttempt** is created in the database.

If the user goes back and selects the same combination again, **no new attempt** is created.

---

### 4. Wallet monitoring

When a merchant adds a wallet, it immediately starts being **monitored via Alchemy webhooks**.

Each checkout is assigned a **unique amount** — we add **six random decimal digits** to differentiate transactions, since all payments are received in the same wallet.

When a new blockchain transaction arrives:

1. The backend checks if the received amount matches any pending payment in the database.
2. If it does, the payment is marked as **completed**.
3. A **webhook** is then sent back to the store to notify successful payment.

A background **cron job** runs every few minutes to mark old pending payments as **expired**.

---

## Requirements

To run Zeno Bank locally or self-hosted, you’ll need:

- **Alchemy account** — to register webhooks and listen for blockchain transactions.
- **Clerk account** — for authentication and user management.
- **PostgreSQL + Redis** — for persistent storage and job queues.

---

## Environment Setup

Each app includes a `.env.example` file.

1. For each app copy `.env.example` → `.env`
2. Fill in all required variables (Alchemy, Clerk, Database, etc.). Check the examples in:
   - `apps/api/.env.example`
   - `apps/pay/.env.example`
   - `apps/dashboard/.env.example`
