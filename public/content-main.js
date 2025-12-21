// This runs in the "Main World" and can see MetaMask
if (window.ethereum) {
  console.log("MetaMask detected!", window.ethereum);
  // Listen for account changes and send them to the extension
  window.ethereum.on('accountsChanged', (accounts) => {
    window.postMessage({ type: "ETH_ACCOUNTS", accounts }, "*");
  });
}
