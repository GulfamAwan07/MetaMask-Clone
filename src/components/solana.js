import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const SOLANA_RPC =
  import.meta.env.VITE_SOLANA_RPC || "https://api.testnet.solana.com";

const solanaConnection = new Connection(SOLANA_RPC, "confirmed");

/**
 * Get Solana balance for an adress
 * @param {string} address - Solana public key address
 * @returns {Promise<number>} - Balance in SOL
 */
export const getSolanaBalance = async (address) => {
  try {

    const publicKey = new PublicKey(address);

    const balance = await solanaConnection.getBalance(publicKey);

  
    const balanceInSol = balance / LAMPORTS_PER_SOL;

    console.log(`Solana balance for ${address}: ${balanceInSol} SOL`);

    return parseFloat(balanceInSol);
  } catch (error) {
    console.error("Error fetching Solana balance:", error);

    
    if (error.message?.includes("Invalid public key")) {
      console.error("Invalid Solana address format");
    }

    throw error;
  }
};

/**
 * Execute a Solana transfer
 * @param {string} toAddress - Recipient's Solana address
 * @param {number} amount - Amount in SOL to send
 * @returns {Promise<object>} - Transaction result
 */
export const executeSolanaTransfer = async (toAddress, amount) => {
  try {
    // Get private key from environment
    const privateKeyString = import.meta.env.VITE_SOLANA_KEY;

    if (!privateKeyString) {
      throw new Error("Solana private key not found in environment variables");
    }

    // Create keypair from private key
    // The private key should be in base58 format
    let fromKeypair;
    try {
      // Try to decode as base58
      const secretKey = bs58.decode(privateKeyString);
      fromKeypair = Keypair.fromSecretKey(secretKey);
    } catch (e) {
      // If base58 decode fails, try as array
      const secretKey = Uint8Array.from(JSON.parse(privateKeyString));
      fromKeypair = Keypair.fromSecretKey(secretKey);
    }

    console.log(`Sending from: ${fromKeypair.publicKey.toString()}`);
    console.log(`Sending to: ${toAddress}`);
    console.log(`Amount: ${amount} SOL`);

    // Validate recipient address
    const toPublicKey = new PublicKey(toAddress);

    // Check sender balance
    const senderBalance = await solanaConnection.getBalance(
      fromKeypair.publicKey
    );
    const requiredLamports = amount * LAMPORTS_PER_SOL;

    if (senderBalance < requiredLamports) {
      throw new Error(
        `Insufficient balance. You have ${
          senderBalance / LAMPORTS_PER_SOL
        } SOL but need ${amount} SOL`
      );
    }

    // Create transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: requiredLamports,
      })
    );

    // Send and confirm transaction
    console.log("Sending transaction...");
    const signature = await sendAndConfirmTransaction(
      solanaConnection,
      transaction,
      [fromKeypair],
      {
        commitment: "confirmed",
      }
    );

    console.log(`Transaction successful! Signature: ${signature}`);

    return {
      success: true,
      hash: signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=testnet`,
    };
  } catch (error) {
    console.error("Solana transfer error:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Get Solana public key from private key
 * @returns {string} - Public key address
 */
export const getSolanaAddress = () => {
  try {
    const privateKeyString = import.meta.env.VITE_SOLANA_KEY;

    if (!privateKeyString) {
      throw new Error("Solana private key not found");
    }

    let keypair;
    try {
      const secretKey = bs58.decode(privateKeyString);
      keypair = Keypair.fromSecretKey(secretKey);
    } catch (e) {
      const secretKey = Uint8Array.from(JSON.parse(privateKeyString));
      keypair = Keypair.fromSecretKey(secretKey);
    }

    return keypair.publicKey.toString();
  } catch (error) {
    console.error("Error getting Solana address:", error);
    return null;
  }
};

/**
 * Validate if a string is a valid Solana address
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid
 */
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Request airdrop (testnet only)
 * @param {string} address - Address to receive airdrop
 * @param {number} amount - Amount in SOL
 * @returns {Promise<object>} - Airdrop result
 */
export const requestAirdrop = async (address, amount = 1) => {
  try {
    const publicKey = new PublicKey(address);
    const lamports = amount * LAMPORTS_PER_SOL;

    console.log(`Requesting ${amount} SOL airdrop for ${address}...`);

    const signature = await solanaConnection.requestAirdrop(
      publicKey,
      lamports
    );
    await solanaConnection.confirmTransaction(signature, "confirmed");

    console.log(`Airdrop successful! Signature: ${signature}`);

    return {
      success: true,
      signature,
      message: `Successfully airdropped ${amount} SOL`,
    };
  } catch (error) {
    console.error("Airdrop error:", error);
    return {
      success: false,
      error: error.message || "Airdrop failed",
    };
  }
};

export { solanaConnection };
