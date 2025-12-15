import React from 'react';
import { IoClose } from 'react-icons/io5';

function SendModal({ onClose, onSend, transaction, onInputChange, activeAccount }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Send Funds (Simulated)</h2>
                    <button onClick={onClose}><IoClose className="w-6 h-6 text-gray-500" /></button>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                    Sending from: 
                    <span className="font-semibold text-black block">{activeAccount}</span>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address (Local Account)</label>
                    <input
                        type="text"
                        name="recipient"
                        value={transaction.recipient}
                        onChange={onInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 0a2b4...09d30ff"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETH)</label>
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
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition duration-150"
                >
                    Confirm Send
                </button>
            </div>
        </div>
    );
}

export default SendModal;