import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

// ---------------------------
// 1. Connect to Solana Devnet (more reliable than testnet)
// ---------------------------
const connection = new Connection(
  import.meta.env.VITE_SOLANA_RPC || "https://api.devnet.solana.com",
  "confirmed"
);

// ---------------------------
// 2. Generate new wallet
// ---------------------------
export function getSolanaAddress() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey), // Store as base58 string
  };
}

// ---------------------------
// 3. Load wallet from secret key (supports both formats)
// ---------------------------
function loadWalletFromSecret(secretKey) {
  try {
    // If it's a base58 string
    if (typeof secretKey === "string") {
      const decoded = bs58.decode(secretKey);
      return Keypair.fromSecretKey(decoded);
    }
    
    // If it's an array
    if (Array.isArray(secretKey)) {
      return Keypair.fromSecretKey(Uint8Array.from(secretKey));
    }
    
    throw new Error("Invalid secret key format");
  } catch (err) {
    console.error("Error loading wallet:", err);
    throw new Error("Failed to load wallet from secret key");
  }
}

// ---------------------------
// 4. Get balance of any account
// ---------------------------
export async function getSolanaBalance(address) {
  try {
    if (!address) {
      console.log("No address provided to getSolanaBalance");
      return 0;
    }
    
    console.log("Fetching Solana balance for:", address);
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    const balanceInSOL = balance / LAMPORTS_PER_SOL;
    console.log("Solana balance:", balanceInSOL);
    return balanceInSOL;
  } catch (err) {
    console.error("Error getting Solana balance:", err);
    return 0;
  }
}

// ---------------------------
// 5. Send SOL - FIXED VERSION
// ---------------------------
export async function executeSolanaTransfer(receiverAddress, amountSOL) {
  try {
    console.log("Starting Solana transfer:", { receiverAddress, amountSOL });

    // Get the sender's private key from environment variable
    const senderPrivateKey = import.meta.env.VITE_SOLANA_PRIVATE_KEY;
    
    if (!senderPrivateKey) {
      throw new Error("VITE_SOLANA_PRIVATE_KEY not found in environment variables");
    }

    // Load sender wallet
    const sender = loadWalletFromSecret(senderPrivateKey);
    console.log("Sender public key:", sender.publicKey.toBase58());

    if (!receiverAddress) {
      throw new Error("Receiver address is required");
    }

    // Validate receiver address
    if (!isValidSolanaAddress(receiverAddress)) {
      throw new Error("Invalid receiver address");
    }

    const receiver = new PublicKey(receiverAddress);
    const lamportsToSend = Math.floor(amountSOL * LAMPORTS_PER_SOL);

    console.log("Lamports to send:", lamportsToSend);

    // Check sender balance
    const senderBalance = await connection.getBalance(sender.publicKey);
    console.log("Sender balance (lamports):", senderBalance);

    if (senderBalance < lamportsToSend) {
      throw new Error(
        `Insufficient balance. Have ${senderBalance / LAMPORTS_PER_SOL} SOL, need ${amountSOL} SOL`
      );
    }

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Create transaction
    const transaction = new Transaction({
      feePayer: sender.publicKey,
      blockhash,
      lastValidBlockHeight,
    }).add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: receiver,
        lamports: lamportsToSend,
      })
    );

    // Sign and send transaction
    console.log("Sending transaction...");
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [sender],
      {
        commitment: "confirmed",
        maxRetries: 3,
      }
    );

    console.log("Transaction confirmed:", signature);

    return {
      success: true,
      hash: signature,
    };
  } catch (err) {
    console.error("Solana transfer error:", err);
    return {
      success: false,
      error: err.message || "Transaction failed",
    };
  }
}

// ---------------------------
// 6. Request airdrop (devnet only)
// ---------------------------
export async function requestAirdrop(address, amountSOL = 1) {
  try {
    console.log(`Requesting ${amountSOL} SOL airdrop for ${address}`);
    const publicKey = new PublicKey(address);

    const signature = await connection.requestAirdrop(
      publicKey,
      amountSOL * LAMPORTS_PER_SOL
    );

    console.log("Airdrop signature:", signature);

    // Wait for confirmation
    await connection.confirmTransaction(signature, "confirmed");
    
    console.log("Airdrop confirmed!");
    return signature;
  } catch (err) {
    console.error("Airdrop error:", err);
    throw err;
  }
}

// ---------------------------
// 7. Validate Solana address
// ---------------------------
export function isValidSolanaAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch (err) {
    return false;
  }
}

// ---------------------------
// 8. Export connection for use in components
// ---------------------------
export { connection };