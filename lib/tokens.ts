export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  addresses: Record<number, `0x${string}`>;
  logoUrl: string;
}

// Chain IDs
export const ETHEREUM_CHAIN_ID = 1;
export const ARBITRUM_CHAIN_ID = 42161;

export const TOKENS: TokenInfo[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    addresses: {
      [ETHEREUM_CHAIN_ID]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      [ARBITRUM_CHAIN_ID]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    },
    logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=040",
  },
  {
    symbol: "USDT",
    name: "Tether",
    decimals: 6,
    addresses: {
      [ETHEREUM_CHAIN_ID]: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      [ARBITRUM_CHAIN_ID]: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    },
    logoUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=040",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    addresses: {
      [ETHEREUM_CHAIN_ID]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      [ARBITRUM_CHAIN_ID]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    },
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040",
  },
  {
    symbol: "PEPE",
    name: "Pepe",
    decimals: 18,
    addresses: {
      [ETHEREUM_CHAIN_ID]: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    },
    logoUrl: "https://cryptologos.cc/logos/pepe-pepe-logo.png?v=040",
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    decimals: 18,
    addresses: {
      [ARBITRUM_CHAIN_ID]: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    },
    logoUrl: "https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=040",
  },
];

export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
