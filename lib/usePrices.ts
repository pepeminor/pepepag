"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  USDC: "usd-coin",
  USDT: "tether",
  WETH: "ethereum",
  ARB: "arbitrum",
};

export type Prices = Record<string, number>;

const REFRESH_COOLDOWN = 60_000; // 1 minute

export function usePrices() {
  const [prices, setPrices] = useState<Prices>({});
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);
  const fetchingRef = useRef(false);

  const canRefresh = Date.now() - lastFetch >= REFRESH_COOLDOWN;

  const fetchPrices = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      const ids = [...new Set(Object.values(COINGECKO_IDS))].join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
      );
      const data = await res.json();

      const mapped: Prices = {};
      for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
        mapped[symbol] = data[geckoId]?.usd ?? 0;
      }
      setPrices(mapped);
      setLastFetch(Date.now());
    } catch {
      // keep old prices on error
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Auto-fetch on mount and every 60s
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading, canRefresh, fetchPrices };
}

export function formatUsd(value: number): string {
  if (value < 0.01 && value > 0) return "<$0.01";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
