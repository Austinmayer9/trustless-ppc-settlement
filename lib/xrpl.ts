import xrpl from 'xrpl';

export interface FinishEscrowParams {
  seed: string;
  ownerAddress: string;
  escrowSequence: number;
  condition: string;
  fulfillment: string;
}

export interface FinishEscrowResult {
  txHash: string;
  resultCode: string;
  resultMessage?: string;
}

/**
 * Finish an XRP Ledger escrow on Testnet using a crypto-condition.
 *
 * This helper connects to the public Testnet, derives the wallet from the
 * provided seed, submits an EscrowFinish transaction, and waits for validation.
 *
 * Note: In production, consider dependency-injecting the client or reusing a
 * shared connection instead of creating a new one per call.
 */
export async function finishEscrow({
  seed,
  ownerAddress,
  escrowSequence,
  condition,
  fulfillment,
}: FinishEscrowParams): Promise<FinishEscrowResult> {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');

  try {
    await client.connect();

    const wallet = xrpl.Wallet.fromSeed(seed);

    if (wallet.address !== ownerAddress) {
      // In many flows, the finisher is *not* necessarily the owner,
      // so skip strict equality here if your flow differs.
      // For now, we just log a warning via thrown error to avoid silent misuse.
      throw new Error('Provided seed does not correspond to the ownerAddress');
    }

    const tx: xrpl.EscrowFinish = {
      TransactionType: 'EscrowFinish',
      Account: wallet.address,
      Owner: ownerAddress,
      OfferSequence: escrowSequence,
      Condition: condition.toUpperCase(),
      Fulfillment: fulfillment.toUpperCase(),
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);

    const submitResult = await client.submitAndWait(signed.tx_blob);

    const meta = submitResult.result.meta as xrpl.TransactionMetadata | undefined;
    const resultCode = meta?.TransactionResult ?? submitResult.result.engine_result;
    const resultMessage =
      (submitResult.result.engine_result_message as string | undefined) ??
      (meta as any)?.delivered_amount;

    return {
      txHash: signed.hash,
      resultCode,
      resultMessage,
    };
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
}

