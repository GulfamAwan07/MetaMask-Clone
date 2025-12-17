export const tokenss = [
  {
    symbol: "ETH",
    name: "Ethereum",
    chain: "Ethereum",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    isNative: true,
  },
  {
    symbol: "POL",
    name: "Polygon",
    chain: "Polygon",
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    decimals: 18,
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  },
  {
    symbol: "SOL",
    name: "Solana",
    chain: "Solana",
    address: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
  },

  // {
  //   symbol: "BNB",
  //   name: "Binance Coin",
  //   chain: "BNB Smart Chain",
  //   address: "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  //   decimals: 18,
  //   logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  // },

  // {
  //   symbol: "USDC",
  //   name: "USD Coin",
  //   chain: "Ethereum",
  //   address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  //   decimals: 6,
  //   logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  // },
  // {
  //   symbol: "USDT",
  //   name: "Tether USD",
  //   chain: "Ethereum",
  //   address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  //   decimals: 6,
  //   logo: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  // },
  // {
  //   symbol: "DAI",
  //   name: "Dai Stablecoin",
  //   chain: "Ethereum",
  //   address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  //   decimals: 18,
  //   logo: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
  // },
  // {
  //   symbol: "WBTC",
  //   name: "Wrapped Bitcoin",
  //   chain: "Ethereum",
  //   address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  //   decimals: 8,
  //   logo: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
  // },

  // {
  //   symbol: "WBNB",
  //   name: "Wrapped BNB",
  //   chain: "Ethereum",
  //   address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
  //   decimals: 18,
  //   logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  // },
];

export function getUniswapAddress(token) {
  if (
    token.address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  ) {
    return "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  }
  return token.address;
}
