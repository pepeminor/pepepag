"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPublicClient, http, formatUnits, type PublicClient } from "viem";
import { mainnet, arbitrum } from "viem/chains";
import { TOKENS, ERC20_ABI, ETHEREUM_CHAIN_ID, ARBITRUM_CHAIN_ID, NATIVE_ETH_ADDRESS } from "./tokens";

// Token balance per chain: { [chainId]: { [symbol]: number } }
export type AllBalances = Record<number, Record<string, number>>;
// ETH balance per chain
export type EthBalances = Record<number, number>;

function getClient(chainId: number): PublicClient {
  if (chainId === ETHEREUM_CHAIN_ID) {
    return createPublicClient({
      chain: mainnet,
      transport: http(process.env.NEXT_PUBLIC_ETH_RPC_URL || "https://1rpc.io/eth"),
      batch: { multicall: true },
    });
  }
  return createPublicClient({
    chain: arbitrum,
    transport: http(process.env.NEXT_PUBLIC_ARB_RPC_URL || "https://arb1.arbitrum.io/rpc"),
    batch: { multicall: true },
  });
}

async function fetchChainBalances(
  chainId: number,
  address: `0x${string}`
): Promise<{ eth: number; tokens: Record<string, number> }> {
  const client = getClient(chainId);
  // Only fetch ERC20 tokens (skip native ETH placeholder)
  const erc20Tokens = TOKENS.filter(
    (t) => t.addresses[chainId] && t.addresses[chainId] !== NATIVE_ETH_ADDRESS
  );

  const [ethBal, ...tokenResults] = await Promise.all([
    client.getBalance({ address }),
    ...erc20Tokens.map((t) =>
      client
        .readContract({
          address: t.addresses[chainId],
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        })
        .catch(() => 0n as bigint)
    ),
  ]);

  const ethBalance = Number(formatUnits(ethBal, 18));

  const tokens: Record<string, number> = {};
  // Include native ETH in token balances
  tokens["ETH"] = ethBalance;
  erc20Tokens.forEach((t, i) => {
    tokens[t.symbol] = Number(formatUnits(tokenResults[i] as bigint, t.decimals));
  });

  return {
    eth: ethBalance,
    tokens,
  };
}

export function useAllBalances(address: `0x${string}` | undefined) {
  const [ethBalances, setEthBalances] = useState<EthBalances>({});
  const [tokenBalances, setTokenBalances] = useState<AllBalances>({});
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchAll = useCallback(async () => {
    if (!address) return;
    setLoading(true);

    try {
      // Fetch both chains in parallel
      const [ethData, arbData] = await Promise.all([
        fetchChainBalances(ETHEREUM_CHAIN_ID, address),
        fetchChainBalances(ARBITRUM_CHAIN_ID, address),
      ]);

      setEthBalances({
        [ETHEREUM_CHAIN_ID]: ethData.eth,
        [ARBITRUM_CHAIN_ID]: arbData.eth,
      });
      setTokenBalances({
        [ETHEREUM_CHAIN_ID]: ethData.tokens,
        [ARBITRUM_CHAIN_ID]: arbData.tokens,
      });
      fetchedRef.current = true;
    } catch {
      // keep old data
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Fetch once on mount
  useEffect(() => {
    if (address && !fetchedRef.current) {
      fetchAll();
    }
  }, [address, fetchAll]);

  return { ethBalances, tokenBalances, loading, refetch: fetchAll };
}
