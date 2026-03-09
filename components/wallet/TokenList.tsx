"use client";

import { Box, Typography, Skeleton, Avatar, Stack } from "@mui/material";
import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { TOKENS, ERC20_ABI } from "@/lib/tokens";
import { type Prices, formatUsd } from "@/lib/usePrices";

interface TokenListProps {
  prices: Prices;
  onTotalUsd?: (total: number) => void;
}

export default function TokenList({ prices, onTotalUsd }: TokenListProps) {
  const { address, chain } = useAccount();
  const chainId = chain?.id;

  const contracts = TOKENS
    .filter((t) => chainId && t.addresses[chainId])
    .map((t) => ({
      address: t.addresses[chainId!],
      abi: ERC20_ABI,
      functionName: "balanceOf" as const,
      args: [address!],
    }));

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: !!address && !!chainId },
  });

  const tokensOnChain = TOKENS.filter((t) => chainId && t.addresses[chainId]);

  // Calculate total USD for tokens and report up
  let tokenTotalUsd = 0;
  const tokenValues = tokensOnChain.map((token, i) => {
    const result = data?.[i];
    const rawBalance = result?.status === "success" ? (result.result as bigint) : 0n;
    const formatted = Number(formatUnits(rawBalance, token.decimals));
    const usdValue = formatted * (prices[token.symbol] || 0);
    tokenTotalUsd += usdValue;
    return { token, formatted, usdValue };
  });

  // Report total to parent (non-blocking)
  if (onTotalUsd && !isLoading && data) {
    // Use queueMicrotask to avoid setState during render warning
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
              {isLoading ? (
                <Skeleton width={60} />
              ) : formatted > 0 ? (
                formatted < 0.0001 ? "<0.0001" : formatted.toFixed(4)
              ) : (
                "0"
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isLoading ? (
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
