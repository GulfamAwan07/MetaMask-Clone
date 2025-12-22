import { useCallback, useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import TokenSelector from "./TokenSelector";
import { tokenss } from "../data/tokenss";
import { TiPlus } from "react-icons/ti";
import { toast, ToastContainer } from "react-toastify";
import SendModal from "./SendModal";
import ReceiveModal from "./ReceiveModal";
import { IoMenu } from "react-icons/io5";
import { TbCurrencyDollar } from "react-icons/tb";
import { MdOutlineSwapVert } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { MdOutlineCallReceived } from "react-icons/md";
import { IoFilterOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { ethers } from "ethers";
import { getEthBalance, executeTransfer } from "./sepoliaServices";
import { MdNotificationsNone } from "react-icons/md";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { GiLevelFourAdvanced } from "react-icons/gi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { IoIosGitNetwork } from "react-icons/io";
import { HiOutlineCube } from "react-icons/hi";
import { LuShieldQuestion } from "react-icons/lu";
import { getPolygonBalance, executePolygonTransfer } from "./polygon";
import bs58 from "bs58";
import { Keypair, Connection } from "@solana/web3.js";

import {
  executeSolanaTransfer,
  getSolanaBalance,
  isValidSolanaAddress,
  generateSolanaWallet,
} from "./solana";

function Metamask() {
  const [menu, showMenu] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [openSelector, setOpenSelector] = useState(false);
  const [selectedItems, setSelectedItems] = useState(tokenss[0]);

  const Public_Address = "0x33570eB7525d6e9375FbDbE9BdB8f3437435f860";
  const SEPOLIA_RPC = import.meta.env.VITE_SEPOLIA_RPC_URL;
  const SEPOLIA_PRIVATE = import.meta.env.VITE_PRIVATE_KEY;
  const sepoliaProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC, 11155111);
  const sepoliaSigner = new ethers.Wallet(SEPOLIA_PRIVATE, sepoliaProvider);

  const [currentProvider, setCurrentProvider] = useState(sepoliaProvider);
  const [currentSigner, setCurrentSigner] = useState(sepoliaSigner);
  const [currentChain, setCurrentChain] = useState("Ethereum");

  const [account, setAccount] = useState([]);
  const [activeAccount, setActiveAccount] = useState("");
  const [accDropDown, setAccDropDown] = useState(false);
  const [balances, setBalances] = useState({});

  const balanceRequestId = useRef(0);
  const currentBalance = balances[`${currentChain}:${activeAccount}`] || 0;

  const getAddress = useCallback(() => {
    const acc = account.find((a) => a.name === activeAccount);
    if (!acc) {
      console.log("No account found for:", activeAccount);
      return null;
    }

    const address = currentChain === "Solana" ? acc.solAddress : acc.ethAddress;
    console.log(`Getting address for ${currentChain}:`, address);
    return address || null;
  }, [account, activeAccount, currentChain]);

  const fetchCurrentBalance = useCallback(
    async (address, chain) => {
      if (!address) {
        console.log("No address provided for balance fetch");
        return;
      }

      const key = `${chain}:${activeAccount}`;
      let balance = 0;

      try {
        console.log(`Fetching ${chain} balance for address:`, address);

        if (chain === "Ethereum") {
          balance = await getEthBalance(address, currentProvider);
        } else if (chain === "Polygon") {
          balance = await getPolygonBalance(address, currentProvider);
        } else if (chain === "Solana") {
          balance = await getSolanaBalance(address);
        }

        console.log(`Balance fetched for ${chain}:`, balance);

        setBalances((prev) => ({
          ...prev,
          [key]: balance,
        }));
      } catch (err) {
        console.error(`Error fetching ${chain} balance:`, err);
        setBalances((prev) => ({
          ...prev,
          [key]: 0,
        }));
      }
    },
    [activeAccount, currentProvider]
  );

  useEffect(() => {
    try {
      const savedAccounts = localStorage.getItem("metamask-accounts");
      if (savedAccounts) {
        const parsedAccounts = JSON.parse(savedAccounts);

        const normalizedAccounts = parsedAccounts.map((acc) => {
          if (acc.address && !acc.ethAddress) {
            return { ...acc, ethAddress: acc.address };
          }
          return acc;
        });

        setAccount(normalizedAccounts);

        const savedActiveAccount = localStorage.getItem(
          "metamask-active-account"
        );
        if (savedActiveAccount) {
          setActiveAccount(savedActiveAccount);
        } else if (normalizedAccounts.length > 0) {
          setActiveAccount(normalizedAccounts[0].name);
        }
      } else {
        const defaultAccount = [
          {
            id: "1",
            name: "Account 1",
            ethAddress: Public_Address,
            balance: 0.0,
          },
        ];
        setAccount(defaultAccount);
        setActiveAccount(defaultAccount[0].name);
        localStorage.setItem(
          "metamask-accounts",
          JSON.stringify(defaultAccount)
        );
        localStorage.setItem("metamask-active-account", defaultAccount[0].name);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
      const defaultAccount = [
        {
          id: "1",
          name: "Account 1",
          ethAddress: Public_Address,
          balance: 0.0,
        },
      ];
      setAccount(defaultAccount);
      setActiveAccount(defaultAccount[0].name);
    }
  }, []);

  useEffect(() => {
    if (account.length > 0) {
      try {
        localStorage.setItem("metamask-accounts", JSON.stringify(account));
      } catch (error) {
        console.error("Error saving accounts:", error);
      }
    }
  }, [account]);

  useEffect(() => {
    if (activeAccount) {
      try {
        localStorage.setItem("metamask-active-account", activeAccount);
      } catch (error) {
        console.error("Error saving active account:", error);
      }
    }
  }, [activeAccount]);

  useEffect(() => {
    const address = getAddress();

    if (address) {
      fetchCurrentBalance(address, currentChain);

      const intervalId = setInterval(() => {
        fetchCurrentBalance(address, currentChain);
      }, 60000);

      return () => clearInterval(intervalId);
    }
  }, [activeAccount, getAddress, fetchCurrentBalance, currentChain]);

  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [staggedTransfer, setStaggedTransfer] = useState([]);
  const [transaction, setTransaction] = useState({
    receipt: "",
    amount: "",
    token: "ETH",
  });

  const accountToggle = () => {
    setAccDropDown((prevState) => !prevState);
  };

  const tokenToggle = () => {
    setShowToken((prevState) => !prevState);
  };

  const selectAccount = (name) => {
    setActiveAccount(name);
    setAccDropDown(false);
  };

  const addEvmAccount = () => {
    const wallet = ethers.Wallet.createRandom();

    const newId = (account.length + 1).toString();
    const newName = `Account ${newId}`;

    toast.info(`EVM Account Created\nSAVE PRIVATE KEY:\n${wallet.privateKey}`, {
      autoClose: false,
    });

    setAccount((prev) => [
      ...prev,
      {
        id: newId,
        name: newName,
        ethAddress: wallet.address,
      },
    ]);

    setActiveAccount(newName);
    setAccDropDown(false);
  };

  const addSolanaAccount = () => {
    const walletData = generateSolanaWallet();

    const newId = (account.length + 1).toString();
    const newName = `Solana Account ${newId}`;

    toast.info(
      `Solana Account Created\nPublic Key: ${walletData.publicKey}\nSAVE PRIVATE KEY:\n${walletData.privateKey}`,
      {
        autoClose: false,
      }
    );

    setAccount((prev) => [
      ...prev,
      {
        id: newId,
        name: newName,
        solAddress: walletData.publicKey,
      },
    ]);

    setActiveAccount(newName);
    setAccDropDown(false);
  };

  const addAccount = () => {
    if (currentChain === "Solana") {
      addSolanaAccount();
    } else {
      addEvmAccount();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransaction((prev) => ({
      ...prev,
      [name]: name === "amount" ? value.replace(/[^\d.]/g, "") : value,
    }));
  };

  const handleSend = async () => {
    const senderAddress = getAddress();
    const receiptAddress = transaction.receipt;
    const amountFloat = parseFloat(transaction.amount);

    if (
      !senderAddress ||
      !receiptAddress ||
      amountFloat <= 0 ||
      isNaN(amountFloat)
    ) {
      toast.error("Invalid Sender, Recipient, or Amount.");
      return;
    }

    if (currentBalance < amountFloat) {
      toast.error(
        `Insufficient ${
          currentChain === "Ethereum"
            ? "ETH"
            : currentChain === "Polygon"
            ? "POL"
            : "SOL"
        } balance for the transfer amount.`
      );
      return;
    }

    toast.info(
      `Sending transaction on ${currentChain}. Waiting for confirmation...`
    );

    let result;

    if (currentChain === "Ethereum") {
      result = await executeTransfer(receiptAddress, amountFloat);
    } else if (currentChain === "Polygon") {
      result = await executePolygonTransfer(receiptAddress, amountFloat);
    } else if (currentChain === "Solana") {
      result = await executeSolanaTransfer(receiptAddress, amountFloat);
    } else {
      toast.error("Unsupported chain");
      return;
    }

    if (result.success) {
      toast.success(
        `Transaction confirmed! Hash: ${result.hash}. Balance updating...`
      );
      setTimeout(() => {
        fetchCurrentBalance(senderAddress, currentChain);
      }, 3000);
    } else {
      toast.error(
        `Transaction failed: ${result.error || "Check console for details."}`
      );
    }

    setShowSendModal(false);
    setTransaction({
      receipt: "",
      amount: "",
      token:
        currentChain === "Ethereum"
          ? "ETH"
          : currentChain === "Polygon"
          ? "POL"
          : "SOL",
    });
  };

  const handleStimulateReceive = (senderInput, amountValue) => {
    const activeAddress = getAddress();
    const amountFloat = parseFloat(amountValue);
    const recipientAddress = activeAddress;

    if (!activeAddress) {
      toast.error("No active account selected.");
      return;
    }
    if (amountFloat <= 0 || isNaN(amountFloat)) {
      toast.error("Invalid Amount. Please enter a positive number.");
      return;
    }
    if (!senderInput || senderInput.trim() === "") {
      toast.error("Please enter a sender address.");
      return;
    }

    let isValidAddress = false;
    if (currentChain === "Solana") {
      isValidAddress = isValidSolanaAddress(senderInput);
    } else {
      isValidAddress =
        senderInput.startsWith("0x") && senderInput.length === 42;
    }

    if (!isValidAddress) {
      toast.error(`Invalid ${currentChain} address format.`);
      return;
    }

    if (senderInput.toLowerCase() === recipientAddress.toLowerCase()) {
      toast.error(
        "Cannot receive from your own account. Please enter a different sender address."
      );
      return;
    }

    const newRequest = {
      id: Date.now(),
      sender: senderInput,
      recipient: recipientAddress,
      amount: amountFloat,
      status: "staged",
      chain: currentChain,
    };

    setStaggedTransfer((prevQueue) => [...prevQueue, newRequest]);
    toast.info(
      `Request staged! Switch to the account with address ${senderInput} to approve and send the transaction.`
    );
    setShowReceiveModal(false);
  };

  const handleFinalizeTransfer = async (
    txId,
    senderAddress,
    recipientAddress,
    txAmount
  ) => {
    const finalAmount = parseFloat(txAmount);

    if (!recipientAddress) {
      toast.error("Recipient address missing.");
      return;
    }
    if (isNaN(finalAmount) || finalAmount <= 0) {
      toast.error("Invalid transfer amount.");
      return;
    }

    if (currentBalance < finalAmount) {
      toast.error(
        `Insufficient balance. You have ${currentBalance} but need ${finalAmount}.`
      );
      return;
    }

    toast.info(
      `Sending transaction on ${currentChain}. Waiting for confirmation...`
    );

    let result;

    if (currentChain === "Ethereum") {
      result = await executeTransfer(recipientAddress, finalAmount);
    } else if (currentChain === "Solana") {
      result = await executeSolanaTransfer(recipientAddress, finalAmount);
    } else if (currentChain === "Polygon") {
      result = await executePolygonTransfer(recipientAddress, finalAmount);
    } else {
      toast.error("Chain not supported for transfers yet");
      return;
    }

    if (result.success) {
      toast.success(
        `Transaction confirmed! Hash: ${result.hash}. Balance updating...`
      );

      setStaggedTransfer((prevQueue) =>
        prevQueue.map((tx) =>
          tx.id === txId ? { ...tx, status: "received" } : tx
        )
      );
      setTimeout(() => {
        fetchCurrentBalance(senderAddress, currentChain);
      }, 3000);
    } else {
      toast.error(
        `Transaction failed: ${result.error || "Check console for details."}`
      );
    }
  };

  const switchToEthereum = () => {
    try {
      const provider = new ethers.JsonRpcProvider(
        import.meta.env.VITE_SEPOLIA_RPC_URL,
        11155111
      );

      const signer = new ethers.Wallet(
        import.meta.env.VITE_PRIVATE_KEY,
        provider
      );

      setCurrentProvider(provider);
      setCurrentSigner(signer);
      setCurrentChain("Ethereum");

      toast.success("Switched to Ethereum (Sepolia)!");

      setTimeout(() => {
        const address = getAddress();
        console.log("Ethereum address:", address);
        if (address) {
          fetchCurrentBalance(address, "Ethereum");
        }
      }, 100);
    } catch (error) {
      toast.error("Failed to switch to Ethereum: " + error.message);
      console.error(error);
    }
  };

  const switchToPolygon = () => {
    try {
      const provider = new ethers.JsonRpcProvider(
        import.meta.env.VITE_POLYGON_RPC_URL,
        80002
      );

      const signer = new ethers.Wallet(
        import.meta.env.VITE_POLYGON_PRIVATE_KEY,
        provider
      );

      setCurrentProvider(provider);
      setCurrentSigner(signer);
      setCurrentChain("Polygon");

      toast.success("Switched to Polygon!");

      setTimeout(() => {
        const address = getAddress();
        console.log("Polygon address:", address);
        if (address) {
          fetchCurrentBalance(address, "Polygon");
        }
      }, 100);
    } catch (error) {
      toast.error("Failed to switch to Polygon: " + error.message);
      console.error(error);
    }
  };

  const switchToSolana = () => {
    try {
      const connection = new Connection(
        import.meta.env.VITE_SOLANA_RPC || "https://api.testnet.solana.com",
        "confirmed"
      );
      setCurrentProvider(connection);
      setCurrentSigner(null);
      setCurrentChain("Solana");

      toast.success("Switched to Solana (Testnet)!");

      setTimeout(() => {
        const address = getAddress();
        console.log("Solana address:", address);
        if (address) {
          fetchCurrentBalance(address, "Solana");
        }
      }, 100);
    } catch (error) {
      toast.error("Failed to switch to Solana: " + error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    const address = getAddress();
    if (address) {
      fetchCurrentBalance(address, currentChain);
    }
  }, [currentProvider, currentChain, getAddress, fetchCurrentBalance]);

  const handleAcceptReceivedFunds = (txId) => {
    setStaggedTransfer((prevQueue) => prevQueue.filter((tx) => tx.id !== txId));
    toast.info("Funds accepted. Transaction history updated.");
  };

  const handleTokenSelection = (token) => {
    setSelectedItems(token);
    setOpenSelector(false);

    if (token.symbol === "Polygon" || token.chain === "Polygon") {
      switchToPolygon();
    } else if (token.symbol === "Ethereum" || token.chain === "Ethereum") {
      switchToEthereum();
    } else if (token.symbol === "Solana" || token.chain === "Solana") {
      switchToSolana();
    }
  };

  const menuBar = () => {
    showMenu((prevMenuState) => !prevMenuState);
  };

  const closeSelector = () => {
    setOpenSelector(false);
  };

  const displayTokens = [
    {
      symbol: "ETH",
      name: "Ethereum",
      chain: "Ethereum",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
      logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      chain: "Ethereum",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      chain: "Ethereum",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
      logo: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      chain: "Ethereum",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
      logo: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
    },
  ];

  const activeAddress = getAddress();

  const outgoingRequest = staggedTransfer.find(
    (tx) => tx.sender === activeAddress && tx.status === "staged"
  );

  const incomingReceivedTx = staggedTransfer.find(
    (tx) => tx.recipient === activeAddress && tx.status === "received"
  );

  return (
    <div>
      {openSelector && (
        <TokenSelector
          close={closeSelector}
          onSelectToken={handleTokenSelection}
        />
      )}

      {showSendModal && (
        <SendModal
          onClose={() => setShowSendModal(false)}
          onSend={handleSend}
          transaction={transaction}
          onInputChange={handleInputChange}
          activeAccount={activeAccount}
        />
      )}

      {showReceiveModal && (
        <ReceiveModal
          onClose={() => setShowReceiveModal(false)}
          activeAccountName={activeAccount}
          activeAddress={getAddress()}
          onSimulateReceive={handleStimulateReceive}
        />
      )}

      <div
        className="flex flex-col items-center bg-[#F3F5F9]  overflow-x-hidden "
        style={{ width: "360px", height: "600px" }}
      >
        <div className="text-xl font-bold text-black font-sans mt-5">
          <h1>Meta</h1>
          <h1>Mask</h1>
        </div>

        <div className="bg-[#FFFFFF] mt-4 w-full max-w-sm md:max-w-md shadow-lg rounded-lg">
          <nav className="flex flex-row justify-between items-center p-4">
            <div className="flex flex-col justify-start relative">
              <div
                className="flex flex-row items-center gap-1 cursor-pointer"
                onClick={accountToggle}
              >
                <h1 className="text-black text-lg font-semibold">
                  {activeAccount}
                </h1>
                <IoIosArrowDown
                  className={`cursor-pointer w-5 h-5 mt-0.5 transition-transform duration-200 ${
                    accDropDown ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
              {accDropDown && (
                <div className="absolute top-full left-0 mt-2 w-80 max-h-[260px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                  {account.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => selectAccount(acc.name)}
                      className={`p-2 text-sm rounded-lg cursor-pointer transition-colors ${
                        acc.name === activeAccount
                          ? "bg-blue-100 text-blue-700 font-bold"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-bold">{acc.name}</div>

                      <div className="text-xs text-gray-500 break-all">
                        {currentChain === "Solana"
                          ? acc.solAddress
                          : acc.ethAddress}
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 my-1"></div>

                  <div
                    onClick={addAccount}
                    className="p-2 text-lg text-blue-600 font-bold hover:bg-green-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex gap-2">
                      <TiPlus className="w-7 h-7" />
                      <h1>Add Account</h1>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-row ">
                {displayTokens.map((token, index) => (
                  <div
                    key={token.symbol}
                    className={`
                      w-5 h-5 rounded-full border-2 border-white bg-gray-100
                      ${index > 0 ? "ml-[-8px]" : ""} 
                      relative
                    `}
                    style={{ zIndex: index + 1 }}
                  >
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full shrink-0 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <IoMenu
                onClick={menuBar}
                className="w-8 h-8 cursor-pointer relative text-gray-700"
                title={menu ? "Close Menu" : "open Menu"}
              />
            </div>

            {menu && (
              <div className="flex flex-col gap-6 cursor-pointer absolute top-40 right-[30%] bg-white border rounded-2xl shadow-2xl border-gray-200 p-2 shadow-gray-200">
                <div className="flex gap-3 hover:bg-gray-100">
                  <MdNotificationsNone className="w-5 h-5 mt-1 text-gray-700" />
                  <h1 className="text-lg text-gray-700 font-semibold">
                    Notifications
                  </h1>
                </div>
                <div className="border-b-2 border-gray-300"></div>
                <div className="flex gap-3 hover:bg-gray-100">
                  <BsBoxArrowUpRight className="w-4 h-4 mt-1 text-gray-700" />
                  <h1 className="text-lg text-gray-700 font-semibold">
                    Discover
                  </h1>
                </div>

                <div className="flex gap-3 hover:bg-gray-100">
                  <GiLevelFourAdvanced className="w-5 h-5 mt-1 text-gray-700 font-semibold" />
                  <h1 className="text-lg text-gray-700 font-semibold">
                    Account details
                  </h1>
                </div>
                <div className="border-b-2 border-gray-300"></div>

                <div className="flex gap-3 hover:bg-gray-100">
                  <IoShieldCheckmarkOutline className="w-5 h-5 mt-1 text-gray-700 font-semibold" />
                  <h1 className="text-lg text-gray-700 font-semibold">
                    Permissions
                  </h1>
                </div>

                <div className="flex gap-3 hover:bg-gray-100">
                  <IoIosGitNetwork className="w-5 h-5 mt-1 text-gray-700 font-semibold" />
                  <h1 className="text-lg text-gray-700 font-semibold">
                    Networks
                  </h1>
                </div>

                <div className="flex gap-3 hover:bg-gray-100">
                  <HiOutlineCube className="w-5 h-5 mt-1 text-gray-700 font-semibold" />
                  <h1 className="text-lg text-gray-700 font-semibold">Snaps</h1>
                </div>

                <div className="flex gap-3 hover:bg-gray-100">
                  <LuShieldQuestion className="w-5 h-5 mt-1 text-gray-700 font-semibold" />
                  <h1 className="text-lg text-gray-700 font-semibold">
                    Support
                  </h1>
                </div>

                <div className="flex gap-3 hover:bg-gray-100">
                  <IoSettingsOutline className="w-5 h-5 mt-1 text-gray-700 font-semibold" />
                  <h1 className="text-lg text-gray-700 font-semibold">
                    Settings
                  </h1>
                </div>
              </div>
            )}
          </nav>
          <div className="border-b-1 border-gray-400 mx-4"></div>
          <div className="flex flex-col justify-center items-center mt-2 gap-1">
            <h1 className="text-4xl font-semibold text-black">
              <p>
                {currentBalance ? currentBalance.toFixed(4) : "0.0000"}{" "}
                {currentChain === "Ethereum"
                  ? "ETH"
                  : currentChain === "Polygon"
                  ? "POL"
                  : "SOL"}
              </p>
            </h1>
            <h1 className="text-lg font-semibold">+$0.00(+0.00%)</h1>
          </div>

          {incomingReceivedTx && (
            <div
              className="bg-green-100 border-l-4 border-green-600 text-green-700 p-4 mx-4 mt-4 rounded-md flex justify-between items-center"
              role="alert"
            >
              <div>
                <p className="font-bold">Funds Available!</p>
                <p className="text-sm">
                  You have received {incomingReceivedTx.amount} from{" "}
                  {incomingReceivedTx.sender}.
                </p>
              </div>
              <button
                onClick={() => handleAcceptReceivedFunds(incomingReceivedTx.id)}
                className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded text-sm transition"
              >
                Confirm Receipt
              </button>
            </div>
          )}
          {outgoingRequest && (
            <div
              className="bg-blue-100 w-96 flex-col border-l-4 border-blue-500 text-blue-700 p-4 mx-4 mt-4 rounded-md flex justify-between items-center"
              role="alert"
            >
              <div>
                <p className="font-bold">Outgoing Request Pending!</p>
                <p className="text-sm">
                  {outgoingRequest.recipient} requested {outgoingRequest.amount}{" "}
                  from you.
                </p>
              </div>
              <button
                onClick={() =>
                  handleFinalizeTransfer(
                    outgoingRequest.id,
                    outgoingRequest.sender,
                    outgoingRequest.recipient,
                    outgoingRequest.amount
                  )
                }
                className="bg-gray-400 mt-2 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full text-sm transition"
              >
                Approve Send
              </button>
            </div>
          )}
          <div className="flex flex-row justify-center items-center gap-6 mt-5 mb-4">
            <button className="flex flex-col rounded-2xl p-4 bg-gray-100 pr-6 hover:bg-gray-200 cursor-pointer">
              <TbCurrencyDollar className="w-5 h-5 text-gray-500 mx-2" />
              <h1 className="text-md font-semibold">Buy</h1>
            </button>

            <button className="flex flex-col rounded-2xl p-4 bg-gray-100 pr-6 hover:bg-gray-200 cursor-pointer">
              <MdOutlineSwapVert className="w-5 h-5 text-gray-500 mx-2" />
              <h1 className="text-md font-semibold">Swap</h1>
            </button>

            <button
              className="flex flex-col rounded-2xl p-4 bg-gray-100 pr-6 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                setShowSendModal(true);
              }}
            >
              <IoMdSend className="w-5 h-5 text-gray-500 mx-2" />
              <h1 className="text-md font-semibold">Send</h1>
            </button>

            <button
              className="flex flex-col rounded-2xl p-4 bg-gray-100 pr-4 hover:bg-gray-200 cursor-pointer"
              onClick={() => setShowReceiveModal(true)}
            >
              <MdOutlineCallReceived className="w-5 h-5 text-gray-500 mx-4" />
              <h1 className="text-md font-semibold">Receive</h1>
            </button>
          </div>

          <div className="flex gap-4 mx-2 text-lg text-gray-500 font-semibold focus:underline cursor-pointer mb-2">
            <h1
              className="hover:text-black  active:underline focus:underline"
              onClick={() => tokenToggle()}
            >
              Tokens
            </h1>
            <h1 className="hover:text-black no-underline active:underline">
              Defi
            </h1>
            <h1 className="hover:text-black no-underline active:underline">
              NFTs
            </h1>
            <h1 className="hover:text-black no-underline active:underline">
              Activity
            </h1>
          </div>
          <div className="flex justify-between">
            <div
              className="border-2 rounded-full flex border-gray-200 p-1 gap-1 mx-3 mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setOpenSelector(true)}
            >
              <div className="text-gray-500 font-semibold flex items-center gap-1 px-2">
                {selectedItems && selectedItems.logo && (
                  <img
                    src={selectedItems.logo}
                    alt={selectedItems.symbol}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span>
                  {selectedItems ? selectedItems.symbol : "Select Token"}
                </span>
              </div>

              <IoIosArrowDown className="w-4 h-4 mt-1 text-gray-500" />
            </div>

            <div className="flex gap-4 cursor-pointer">
              <IoFilterOutline className="w-6 h-6 hover:bg-gray-200 rounded-full text-gray-500" />
              <BsThreeDotsVertical className="w-6 h-6 hover:bg-gray-200 rounded-full text-gray-500" />
            </div>
          </div>

          {showToken && (
            <div className="mt-2 mx-2 mb-2 flex gap-8 ">
              <div className="relative">
                <div className=" flex justify-center items-center rounded-full bg-gray-200 w-12 h-12">
                  <h1 className="text-2xl font-semibold  text-gray-700">
                    {currentChain.charAt(0)}
                  </h1>
                </div>
                <div className="flex items-center justify-center rounded-full absolute bottom-0 left-7 w-5 h-5 bg-white">
                  <p>
                    {currentChain === "Ethereum"
                      ? "S"
                      : "Solana"
                      ? "T"
                      : "Polygon"
                      ? "A"
                      : " "}
                  </p>
                </div>
              </div>

              <div>
                <h1 className="font-semibold text-xl text-gray-700 mt-1">
                  {currentChain.slice(0, 3).toUpperCase()}
                </h1>
              </div>

              <div className="flex sm:mx-5 md:mx-10 mt-1 flex-col ">
                <p className="test-sm text-gray-700">
                  No conversion rate available
                </p>
                <p className="text-sm text-gray-700 flex justify-end">
                  {currentBalance.toFixed(4)}{" "}
                  {currentChain.toUpperCase().slice(0, 3)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={7000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default Metamask;
