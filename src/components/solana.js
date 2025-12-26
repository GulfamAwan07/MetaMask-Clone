import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";

// Setup Testnet Connection (2025)
const TESTNET_RPC = "https://api.testnet.solana.com";
export const solanaConnection = new Connection(TESTNET_RPC, "confirmed");

export function generateSolanaWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey),
  };
}

/**
 * Gets the balance of any Solana address
 */
export async function getSolanaBalance(publicKeyString) {
  try {
    if (!publicKeyString) return 0;
    const publicKey = new PublicKey(publicKeyString);
    const balance = await solanaConnection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error getting Solana balance:", error);
    return 0;
  }
}

/**
 * Validates if a string is a legitimate Solana address
 */
export function isValidSolanaAddress(address) {
  try {
    const publicKey = new PublicKey(address);
    return PublicKey.isOnCurve(publicKey.toBuffer());
  } catch (error) {
    return false;
  }
}

/**
 * The core transfer function used by your handleSend
 * @param {string} recipientAddress - The address to send to
 * @param {number} amount - Flexible amount of SOL
 * @param {object} wallet - The wallet object from useWallet() hook
 */
export async function executeSolanaTransfer(recipientAddress, amount, wallet) {
  try {
    // 1. Validation
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected! Please connect your wallet.");
    }
    if (!isValidSolanaAddress(recipientAddress)) {
      throw new Error("Invalid recipient address.");
    }

    const fromPubkey = wallet.publicKey;
    const toPubkey = new PublicKey(recipientAddress);
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    // 2. Create Transaction Instructions
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPubkey,
        toPubkey: toPubkey,
        lamports: lamports,
      })
    );

    // 3. Set Blockhash & Fee Payer
    const { blockhash, lastValidBlockHeight } =
      await solanaConnection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // 4. Send Transaction (Triggers Browser Wallet Approval Popup)
    // wallet.sendTransaction automatically handles the signing process
    const signature = await wallet.sendTransaction(
      transaction,
      solanaConnection
    );

    // 5. Confirm Transaction on Testnet
    const confirmation = await solanaConnection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      "confirmed"
    );

    if (confirmation.value.err) {
      throw new Error("Transaction simulation failed on chain.");
    }

    return {
      success: true,
      hash: signature, // Returning signature as 'hash' to match your handleSend logic
    };
  } catch (error) {
    console.error("Solana Transfer Error:", error);
    return {
      success: false,
      error:
        error.message ||
        "An unknown error occurred during the Solana transfer.",
    };
  }
}
