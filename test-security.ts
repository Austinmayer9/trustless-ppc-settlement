import 'dotenv/config';
import { generateEscrowCondition, encryptKey, decryptKey } from './lib/security';

async function test() {
  console.log("--- 🔐 STARTING SECURITY TEST ---");

  // 1. Generate Lock & Key
  const { fulfillmentHex, conditionHex } = generateEscrowCondition();
  console.log("✅ GENERATED:");
  console.log("   Lock (Public):", conditionHex.substring(0, 20) + "...");
  console.log("   Key (Secret): ", fulfillmentHex.substring(0, 20) + "...");

  // 2. Encrypt the Key (Corrected variable names: ciphertextHex, ivHex)
  const { ciphertextHex, ivHex } = encryptKey(fulfillmentHex);
  
  console.log("\n🔒 ENCRYPTED (What goes in DB):");
  console.log("   IV:      ", ivHex);
  console.log("   Content: ", ciphertextHex.substring(0, 20) + "...");

  // 3. Decrypt the Key (Pass arguments directly, not as an object)
  const decrypted = decryptKey(ciphertextHex, ivHex);
  
  console.log("\n🔓 DECRYPTED:");
  console.log("   Key: ", decrypted.substring(0, 20) + "...");

  if (decrypted === fulfillmentHex) {
    console.log("\n✅ SUCCESS: Keys match! Encryption is working.");
  } else {
    console.log("\n❌ FAILURE: Keys do not match.");
  }
}

test();