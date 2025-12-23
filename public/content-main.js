if (window.ethereum) {
  console.log("MetaMask detected!", window.ethereum);
  window.ethereum.on("accountsChanged", (accounts) => {
    window.postMessage({ type: "ETH_ACCOUNTS", accounts }, "*");
  });
}
