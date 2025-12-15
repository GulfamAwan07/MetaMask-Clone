import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa";

function ReceiveModal({
  onClose,
  activeAccountName,
  activeAddress,
  onSimulateReceive,
}) {
  const [senderInput, setSenderInput] = useState("");
  const [amountInput, setAmountInput] = useState("");

  const handleCopy = () => {
    alert(`Address copied: ${activeAddress}`);
  };

  const handleStageRequest = () => {
    const amountValue = parseFloat(amountInput);

    if (!senderInput || amountValue <= 0 || isNaN(amountValue)) {
      alert(
        "Please enter a valid sender address and amount to stage a request."
      );
      return;
    }

    onSimulateReceive(senderInput, amountValue);

    setSenderInput("");
    setAmountInput("");
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex justify-center items-center z-[100]">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Request Funds</h2>
          <button onClick={onClose}>
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <p className="text-center text-gray-600 mb-2">
          Your Address ({activeAccountName}):
        </p>

        <div className="flex items-center bg-gray-100 p-3 rounded-lg mb-6">
          <span className="text-sm font-mono flex-grow truncate">
            {activeAddress}
          </span>
          <button
            onClick={handleCopy}
            className="ml-3 text-blue-600 hover:text-blue-800"
          >
            <FaRegCopy className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-bold text-gray-700 mb-3">
          Stage an Incoming Request:
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Sender Address
          </label>
          <input
            type="text"
            value={senderInput}
            onChange={(e) => setSenderInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount Requested (ETH)
          </label>
          <input
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="0.00"
          />
        </div>

        <button
          onClick={handleStageRequest}
          className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition duration-150"
        >
          Stage Request
        </button>
      </div>
    </div>
  );
}

export default ReceiveModal;
