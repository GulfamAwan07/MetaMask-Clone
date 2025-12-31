import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";

const TESTNET_RPC = "https://api.testnet.solana.com";
export const solanaConnection = new Connection(TESTNET_RPC, "confirmed");

export function generateSolanaWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey),
  };
}

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
  if (!wallet || !wallet.privateKey || typeof wallet.privateKey !== "string") {
    throw new Error("Invalid wallet or private key");
  }

  const sender = Keypair.fromSecretKey(bs58.decode(wallet.privateKey));

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: new PublicKey(recipientAddress),
      lamports: Math.floor(amount * LAMPORTS_PER_SOL),
    })
  );

  const signature = await solanaConnection.sendTransaction(tx, [sender]);
  await solanaConnection.confirmTransaction(signature);

  return { success: true, hash: signature };
}
