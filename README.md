# Trustless Pay-Per-Close Settlement Layer

![Status](https://img.shields.io/badge/Status-Prototype-green)
![Stack](https://img.shields.io/badge/Stack-Next.js_|_Prisma_|_XRPL-blue)

## Overview
I run an AI SEO agency (aiseosolutions.co), and I needed a way to automate "Pay-Per-Close" billing without relying on manual invoices or trusting clients to pay after the fact.

This project is a settlement layer that locks client funds in a cryptographic escrow on the **XRP Ledger**. The funds are programmatically released only when my AI agent verifies a specific conversion event (e.g., a "Closed-Won" lead in the CRM).

## Tech Stack
* **Frontend:** Next.js 14 (App Router), Tailwind CSS
* **Backend:** Server Actions (Node.js runtime)
* **Database:** PostgreSQL (Neon Cloud) via Prisma ORM
* **Blockchain:** XRP Ledger (Testnet)
* **Libraries:** `xrpl.js`, `five-bells-condition`, `crypto`

## Security Architecture
Since this app handles unlocking keys for real funds, I implemented a strict security model:

1.  **AES-256 Encryption:** Private key fulfillments are generated server-side and immediately encrypted using `AES-256-CBC` before hitting the database.
2.  **Crypto-Conditions:** Uses SHA-256 Preimages to generate the on-chain lock condition.
3.  **Ephemeral Decryption:** Keys are only decrypted in memory during the precise execution window of the `EscrowFinish` transaction.

## Workflow
1.  **Lock:** Client initiates a campaign. The app generates a lock/key pair and the client signs an `EscrowCreate` transaction on the XRPL.
2.  **Monitor:** The application listens for webhook events from the CRM (simulated in this demo).
3.  **Settlement:** Upon verification, the backend retrieves the encrypted key, decrypts it, and broadcasts the fulfillment to the ledger to claim the funds.

## Local Setup

### 1. Clone & Install
```bash
git clone [https://github.com/YOUR_USERNAME/trustless-ppc-settlement.git](https://github.com/YOUR_USERNAME/trustless-ppc-settlement.git)
cd trustless-ppc-settlement
npm install