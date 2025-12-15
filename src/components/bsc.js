import { toast } from "react-toastify";

export const BSC_TESTNET_PARAMS = {
  chainId: "0x61", 
  chainName: "BNB Smart Chain Testnet",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: [
    import.meta.env.VITE_BSC_RPC_URL ||
      "https://data-seed-prebsc-1-s1.binance.org:8545/",
  ],
  blockExplorerUrls: ["https://testnet.bscscan.com"],
};

export const switchToBnb = async () => {
  if (!window.ethereum) {
    toast.warn("MetaMask not found");
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BSC_TESTNET_PARAMS.chainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BSC_TESTNET_PARAMS],
        });
      } catch (addError) {
        toast.warn("User denied network addition");
        console.error(addError);
      }
    } else {
      console.error(error);
    }
  }
};
