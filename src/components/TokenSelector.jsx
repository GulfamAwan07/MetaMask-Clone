import React from "react";
import { tokenss } from "../data/tokenss";

function TokenSelector({ onSelectToken, close }) {
  return (
    <div className="absolute left-0 right-0 top-0 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-50 mx-2 mt-2">
      <div className="max-h-[450px] overflow-y-auto p-3">
        <div className="flex justify-between items-center mb-3 sticky top-0 bg-white pb-2">
          <h2 className="text-lg font-semibold">Select Token</h2>
          <button
            onClick={close}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {tokenss.map((token) => (
          <div
            key={token.symbol}
            onClick={() => {
              onSelectToken(token);
              close();
            }}
            className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img
                src={token.logo}
                alt={token.name}
                className="max-w-full max-h-full object-contain rounded-full"
              />
            </div>

            <div className="overflow-hidden flex-1">
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
