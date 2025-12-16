import { toast } from "react-toastify";
import { ethers } from "ethers";

const POLYGON_RPC = import.meta.env.VITE_POLYGON_RPC_URL;
const POLYGON_PRIVATE = import.meta.env.VITE_POLYGON_PRIVATE_KEY;

if (!POLYGON_PRIVATE) {
  toast.error("PRIVATE_KEY is not defined. Cannot send transactions.");
}

const provider = new ethers.JsonRpcProvider(POLYGON_RPC, 80001); // Mumbai testnet

const signer = new ethers.Wallet(POLYGON_PRIVATE, provider);

export const switchToPolygon = (setProvider, setSigner, setChain) => {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC, 80001);
    const signer = new ethers.Wallet(POLYGON_PRIVATE, provider);

    setProvider(provider);
    setSigner(signer);
    setChain("Polygon");

    toast.success("Switched to Polygon!");
  } catch (error) {
    toast.error("Failed to switch to Polygon: " + error.message);
    console.error(error);
  }
};


export async function getPolygonBalance(address) {
  if (!polygonProvider) return 0; 
  try {
    const balanceWei = await polygonProvider.getBalance(address);
    return parseFloat(ethers.formatEther(balanceWei));
  } catch (error) {
    console.error("Error fetching Polygon balance:", error);
    return 0;
  }
}

export async function executePolygonTransfer(recipientAddress, amountEth) {
  if (!recipientAddress || !amountEth) {
    return { success: false, error: "Missing recipient address or amount." };
  }

  try {
    const tx = {
      to: recipientAddress,
      value: ethers.parseEther(String(amountEth)),
    };

    const txResponse = await signer.sendTransaction(tx);
    const receipt = await txResponse.wait();

    return { success: true, hash: txResponse.hash, receipt };
  } catch (error) {
    toast.error("Transaction failed: " + error.message);
    return { success: false, error: error.message };
  }
}
