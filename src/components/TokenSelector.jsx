import React from "react";
import { tokenss } from "../data/tokenss";

function TokenSelector({ onSelectToken, close , tokenList}) {
    const handleItemClick =(tokenSymbol ) => {
            onSelectToken(tokenSymbol);
            close();
    }
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-80 rounded-2xl p-3">
        <h2 className="text-xl font-semibold mb-3">Select Token</h2>

        {tokenss.map((token) => (
          <div
            key={token}
            onClick={() => {
              onSelectToken(token) ;
              close();
            }}
            className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-xl"
          >
            <img src={token.logo} alt="" className="w-4 h-4" />
            <div>
              <h2 className="font-bold">{token.symbol}</h2>
              <p className="text-sm text-gray-500">{token.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TokenSelector;
