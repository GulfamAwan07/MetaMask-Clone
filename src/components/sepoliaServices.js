import { ethers } from "ethers";
import { toast } from "react-toastify";
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL;
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY ;
// const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const SEPOLIA_CHAIN_ID = 11155111;
const sepoliaNetwork = new ethers.Network(
    "sepolia",
    SEPOLIA_CHAIN_ID
)
    const provider = new ethers.JsonRpcProvider(
        SEPOLIA_RPC_URL, sepoliaNetwork
    );

if (!PRIVATE_KEY) {
  console.error(
    "CRITICAL ERROR: RPRIVATE_KEY is not defined. Cannot send transactions."
  );
}

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

export async function getEthBalance(address) {
    if (!provider) return 0;
  try {
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);
    return parseFloat(balanceEth);
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}

export async function executeTransfer(recipientAddress, amountEth) {
  if (!recipientAddress || !amountEth) {
    return { success: false, error: "Missing recipient address or amount." };
  }

  const amountString = String(amountEth);

  try {
    const tx = {
      to: recipientAddress,
      value: ethers.parseEther(amountString),
    };

    const transactionResponse = await signer.sendTransaction(tx);
    console.log("Transaction hash:", transactionResponse.hash);    //chking hash val

    const receipt = await transactionResponse.wait();

    return { success: true, hash: transactionResponse.hash, receipt };
  } catch (error) {
    toast.error("Transaction failed:", error);
    return { success: false, error: error.message };
  }
}
