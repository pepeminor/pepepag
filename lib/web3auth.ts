import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/no-modal";
import type { Web3AuthContextConfig } from "@web3auth/modal/react";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

export const chainConfigs = [
  {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget:
      process.env.NEXT_PUBLIC_ETH_RPC_URL || "https://1rpc.io/eth",
    displayName: "Ethereum Mainnet",
    blockExplorerUrl: "https://etherscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0xa4b1",
    rpcTarget:
      process.env.NEXT_PUBLIC_ARB_RPC_URL || "https://arb1.arbitrum.io/rpc",
    displayName: "Arbitrum One",
    blockExplorerUrl: "https://arbiscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
  },
];

export const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    chains: chainConfigs,
    defaultChainId: "0xa4b1",
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};
