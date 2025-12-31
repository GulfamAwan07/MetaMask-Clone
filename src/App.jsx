import React from "react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import Metamask from "./components/Metamask.jsx";

const wallets = []; 

function App() {
  return (
    <ConnectionProvider endpoint={clusterApiUrl("testnet")}>
      <WalletProvider wallets={wallets} autoConnect>
        <Metamask />
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
