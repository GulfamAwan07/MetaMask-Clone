// public/background.js

// 1. Listen for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Metamask Extension Project Installed');
});

// 2. Listen for messages from your React popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "connect_wallet") {
    // Background scripts cannot access window.ethereum directly.
    // You must use content scripts to interact with the page's provider.
    console.log("Wallet connection requested from popup");
    sendResponse({ status: "Received" });
  }
  return true; // Required for asynchronous response
});
