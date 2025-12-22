import React from "react";
import { tokenss } from "../data/tokenss";

function TokenSelector({ onSelectToken, close }) {
  return (
    <div className="absolute inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-80 max-h-[420px] overflow-y-auto rounded-2xl p-3">
        <h2 className="text-xl font-semibold mb-3">Select Token</h2>

        {tokenss.map((token) => (
          <div
            key={token.symbol}
            onClick={() => {
              onSelectToken(token);
              close();
            }}
            className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-xl"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img
                src={token.logo}
                alt={token.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="overflow-hidden">
              <h2 className="font-bold truncate">{token.symbol}</h2>
              <p className="text-sm text-gray-500 truncate">{token.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TokenSelector;
