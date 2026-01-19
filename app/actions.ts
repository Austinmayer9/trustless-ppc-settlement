'use server'

import { prisma } from '@/lib/prisma' // We need to create this helper next
import { generateEscrowCondition, encryptKey } from '@/lib/security'

export async function createEscrowOrder(clientEmail: string, amountXRP: number) {
  // 1. Generate the Lock (Condition) and Key (Fulfillment)
  const { fulfillmentHex, conditionHex } = generateEscrowCondition();
  
  // 2. Encrypt the Key before touching the DB
  const { ciphertextHex, ivHex } = encryptKey(fulfillmentHex);

  // 3. Save to Neon Database
  // We create a "Pending" escrow. We don't have the Transaction Hash yet 
  // because the user hasn't signed it.
  const escrow = await prisma.escrow.create({
    data: {
      amountXRP: amountXRP,
      condition: conditionHex,
      fulfillmentEnc: ciphertextHex,
      iv: ivHex,
      status: "PENDING",
      client: {
        connectOrCreate: {
          where: { email: clientEmail },
          create: { email: clientEmail, company: "New Client Co." }
        }
      }
    }
  });

  // 4. Return ONLY the public info to the frontend
  return {
    success: true,
    escrowId: escrow.id,
    condition: conditionHex,
    amount: amountXRP
  };
}

import { decryptKey } from '@/lib/security'
import { finishEscrow } from '@/lib/xrpl'

// ... existing createEscrowOrder function ...

export async function releaseFunds(escrowId: string) {
  // 1. Get the Escrow from DB
  const escrow = await prisma.escrow.findUnique({
    where: { id: escrowId }
  });

  if (!escrow) throw new Error("Escrow not found");

  // 2. Decrypt the Secret Key (The "Fulfillment")
  const fulfillment = decryptKey(escrow.fulfillmentEnc, escrow.iv);

  // 3. Submit to XRP Ledger
  // Note: On testnet, we often just use the admin wallet as both owner/fulfiller for simplicity
  // In prod, the Client is the Owner, and You are the Fulfiller.
  try {
    const result = await finishEscrow({
      seed: process.env.ADMIN_WALLET_SEED!, // Your new .env secret
      ownerAddress: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe", // Use a faucet address here for the "Client" for now
      escrowSequence: 123, // We mock this for the demo unless we really create the tx
      condition: escrow.condition,
      fulfillment: fulfillment
    });

    // 4. Update DB
    await prisma.escrow.update({
      where: { id: escrowId },
      data: { status: "RELEASED" }
    });

    return { success: true, txHash: result.txHash };
  } catch (error: any) {
    console.error("Ledger Error:", error);
    return { success: false, error: error.message };
  }
}