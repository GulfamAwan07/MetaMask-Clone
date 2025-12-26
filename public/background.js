
chrome.runtime.onInstalled.addListener(() => {
  console.log('Metamask Extension Project Installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "connect_wallet") {
  
    console.log("Wallet connection requested from popup");
    sendResponse({ status: "Received" });
  }
  return true; 
});
