import React from "react";
import { IoClose } from "react-icons/io5";

function SendModal({
  onClose,
  onSend,
  transaction,
  onInputChange,
  activeAccount,
}) {
  return (
    <div className="absolute left-0 right-0 top-36 bg-gray-100 bg-opacity-50 flex justify-center items-center z-[100]">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="flex justify-center text-2xl mx-[6vw] text-gray-700 font-bold items-center">
            Send Funds{" "}
          </h2>
          <button onClick={onClose}>
            <IoClose className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-700" />
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Sending from:
          <span className="font-semibold text-black block">
            {activeAccount}
          </span>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address:
          </label>
          <input
            type="text"
            name="receipt"
            value={transaction.recipient}
            onChange={onInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount:
          </label>
          <input
            type="number"
            name="amount"
            value={transaction.amount}
            onChange={onInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <button
          onClick={onSend}
          className="flex justify-center items-center overflow-hidden cursor-pointer text-lg bg-gray-400 text-white font-bold rounded-full p-2  hover:bg-gray-700 transition duration-150"
        >
          Confirm Send
        </button>
      </div>
    </div>
  );
}

export default SendModal;
