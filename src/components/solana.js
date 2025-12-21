import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  Keypair,
} from "@solana/web3.js";
import bs58 from "bs58";

// Connect to Solana testnet
const SOLANA_RPC =
  import.meta.env.VITE_SOLANA_RPC || "https://api.testnet.solana.com";
const connection = new Connection(SOLANA_RPC, "confirmed");

// Get Solana balance
export async function getSolanaBalance(publicKeyString) {
  try {
    const publicKey = new PublicKey(publicKeyString);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;

    console.log(`Solana Balance for ${publicKeyString}:`, solBalance, "SOL");
    return solBalance;
  } catch (error) {
    console.error("Error getting Solana balance:", error.message);
    throw error;
  }
}

// Validate Solana address
export function isValidSolanaAddress(address) {
  try {
    const publicKey = new PublicKey(address);
    return PublicKey.isOnCurve(publicKey.toBuffer());
  } catch (error) {
    return false;
  }
}

// Get Solana address from account (for compatibility)
export function getSolanaAddress(account) {
  return account.solAddress || null;
}

// Execute Solana transfer
export async function executeSolanaTransfer(recipientAddress, amount) {
  try {
    // Get private key from environment variable
    const privateKeyString = import.meta.env.VITE_SOLANA_PRIVATE_KEY;

    if (!privateKeyString) {
      throw new Error("Solana private key not found in environment variables");
    }

    // Import keypair from private key (base58 format)
    let fromKeypair;
    try {
      const secretKey = bs58.decode(privateKeyString);
      fromKeypair = Keypair.fromSecretKey(secretKey);
    } catch (error) {
      console.error("Error decoding private key:", error);
      throw new Error("Invalid Solana private key format");
    }

    // Validate recipient address
    if (!isValidSolanaAddress(recipientAddress)) {
      throw new Error("Invalid recipient Solana address");
    }

    const toPublicKey = new PublicKey(recipientAddress);
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    console.log(`Sending ${amount} SOL to ${recipientAddress}...`);
    console.log(`From: ${fromKeypair.publicKey.toString()}`);

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");

    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromKeypair.publicKey,
    }).add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: lamports,
      })
    );

    // Sign transaction
    transaction.sign(fromKeypair);

    // Send transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    console.log("Transaction sent with signature:", signature);

    // Confirm transaction
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      "confirmed"
    );

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
      );
    }

    console.log("Transaction confirmed!");
    console.log(
      "View on Solana Explorer:",
      `https://explorer.solana.com/tx/${signature}?cluster=testnet`
    );

    return {
      success: true,
      hash: signature,
    };
  } catch (error) {
    console.error("Error sending Solana transaction:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Request airdrop (testnet only)
export async function requestAirdrop(publicKeyString, amount = 1) {
  try {
    const publicKey = new PublicKey(publicKeyString);
    console.log(`Requesting ${amount} SOL airdrop to ${publicKeyString}...`);

    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(signature, "confirmed");

    console.log("Airdrop successful!");
    console.log("Transaction signature:", signature);

    return {
      success: true,
      signature,
    };
  } catch (error) {
    console.error("Error requesting airdrop:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Monitor incoming transactions
export function monitorIncomingTransactions(publicKeyString, callback) {
  try {
    const publicKey = new PublicKey(publicKeyString);
    console.log(`Monitoring transactions for ${publicKeyString}...`);

    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo, context) => {
        const balance = accountInfo.lamports / LAMPORTS_PER_SOL;
        console.log("Balance changed! New balance:", balance, "SOL");

        if (callback) {
          callback(balance, accountInfo);
        }
      },
      "confirmed"
    );

    return subscriptionId;
  } catch (error) {
    console.error("Error setting up transaction monitor:", error);
    return null;
  }
}

// Generate new Solana wallet
export function generateSolanaWallet() {
  const keypair = Keypair.generate();

  return {
    publicKey: keypair.publicKey.toString(),
    privateKey: bs58.encode(keypair.secretKey),
    keypair: keypair,
  };
}

// Import wallet from private key
export function importSolanaWallet(privateKeyBase58) {
  try {
    const secretKey = bs58.decode(privateKeyBase58);
    const keypair = Keypair.fromSecretKey(secretKey);

    return {
      publicKey: keypair.publicKey.toString(),
      keypair: keypair,
    };
  } catch (error) {
    console.error("Error importing Solana wallet:", error);
    throw new Error("Invalid private key format");
  }
}
