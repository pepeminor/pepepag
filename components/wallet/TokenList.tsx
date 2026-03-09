"use client";

import { Box, Typography, Skeleton, Avatar, Stack } from "@mui/material";
import { useAccount } from "wagmi";
import { TOKENS } from "@/lib/tokens";
import { type Prices, formatUsd } from "@/lib/usePrices";
import type { AllBalances } from "@/lib/useAllBalances";

interface TokenListProps {
  prices: Prices;
  tokenBalances: AllBalances;
  loading: boolean;
  onTotalUsd?: (total: number) => void;
}

export default function TokenList({ prices, tokenBalances, loading, onTotalUsd }: TokenListProps) {
  const { chain } = useAccount();
  const chainId = chain?.id;

  const tokensOnChain = TOKENS.filter((t) => chainId && t.addresses[chainId]);
  const balances = chainId ? tokenBalances[chainId] || {} : {};

  let tokenTotalUsd = 0;
  const tokenValues = tokensOnChain.map((token) => {
    const formatted = balances[token.symbol] || 0;
    const usdValue = formatted * (prices[token.symbol] || 0);
    tokenTotalUsd += usdValue;
    return { token, formatted, usdValue };
  });

  if (onTotalUsd && !loading) {
    queueMicrotask(() => onTotalUsd(tokenTotalUsd));
  }

  return (
    <Stack spacing={0}>
      {tokenValues.map(({ token, formatted, usdValue }, i) => (
        <Box
          key={token.symbol}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          py={1.5}
          px={0.5}
          sx={{
            borderBottom: (t) =>
              i < tokenValues.length - 1
                ? `1px solid ${t.palette.divider}`
                : "none",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              src={token.logoUrl}
              alt={token.symbol}
              sx={{ width: 32, height: 32 }}
            />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {token.symbol}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {token.name}
              </Typography>
            </Box>
          </Box>

          <Box textAlign="right">
            <Typography variant="body2" fontWeight={600} fontFamily="monospace">
              {loading ? (
                <Skeleton width={60} />
              ) : formatted > 0 ? (
                formatted < 0.0001 ? "<0.0001" : formatted.toFixed(4)
              ) : (
                "0"
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {loading ? (
                <Skeleton width={40} />
              ) : usdValue > 0 ? (
                formatUsd(usdValue)
              ) : (
                "$0.00"
              )}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
