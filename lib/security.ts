import crypto from 'crypto';
import type { Condition } from 'five-bells-condition';
import FiveBellsCondition = require('five-bells-condition');

const { PreimageSha256 } = FiveBellsCondition;

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // bytes

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Support both raw 32-byte key and hex-encoded key
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }

  // Derive a 32-byte key from the provided string
  return crypto.createHash('sha256').update(key, 'utf8').digest();
}

export interface EscrowConditionResult {
  fulfillmentHex: string;
  conditionHex: string;
}

/**
 * Generate a preimage-based escrow condition and its fulfillment.
 * The preimage (fulfillment) is random; the returned condition is the hash
 * that can be used on-ledger.
 */
export function generateEscrowCondition(): EscrowConditionResult {
  const preimage = crypto.randomBytes(32); // 256-bit random preimage

  const fulfillment: Condition = new PreimageSha256();
  fulfillment.setPreimage(preimage);

  const conditionBinary = fulfillment.getConditionBinary();

  const fulfillmentHex = preimage.toString('hex');
  const conditionHex = Buffer.from(conditionBinary).toString('hex');

  return { fulfillmentHex, conditionHex };
}

export interface EncryptedKeyResult {
  ciphertextHex: string;
  ivHex: string;
}

/**
 * Encrypt a secret (e.g. escrow fulfillment) using AES-256-CBC.
 * Returns ciphertext and IV as hex strings.
 */
export function encryptKey(plainHex: string): EncryptedKeyResult {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const plaintext = Buffer.from(plainHex, 'hex');

  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return {
    ciphertextHex: encrypted.toString('hex'),
    ivHex: iv.toString('hex'),
  };
}

/**
 * Decrypt a key previously encrypted with `encryptKey`.
 */
export function decryptKey(ciphertextHex: string, ivHex: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return decrypted.toString('hex');
}

