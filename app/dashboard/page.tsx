"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Fab,
  Tooltip,
  Avatar,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CallMadeIcon from "@mui/icons-material/CallMade";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import RefreshIcon from "@mui/icons-material/Refresh";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser, useSwitchChain } from "@web3auth/modal/react";
import { useAccount, useDisconnect, useSwitchChain as useWagmiSwitchChain } from "wagmi";
import { useThemeMode } from "@/lib/ThemeContext";
import { usePrices, formatUsd } from "@/lib/usePrices";
import { useAllBalances } from "@/lib/useAllBalances";
import { ARBITRUM_CHAIN_ID, ETHEREUM_CHAIN_ID, type TokenInfo } from "@/lib/tokens";
import ChainSwitcher from "@/components/wallet/ChainSwitcher";
import TokenList from "@/components/wallet/TokenList";
import SendModal, { type SendPrefill } from "@/components/wallet/SendModal";
import ReceiveModal, { type ReceiveTokenInfo } from "@/components/wallet/ReceiveModal";
import QrScannerModal from "@/components/wallet/QrScannerModal";

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { mode, toggleTheme } = useThemeMode();
  const { isConnected: isWeb3AuthConnected } = useWeb3AuthConnect();
  const { disconnect: disconnectWeb3Auth } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address, isConnected: isWagmiConnected, chain } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();
  const { switchChain: web3AuthSwitch } = useSwitchChain();
  const { switchChain: wagmiSwitch } = useWagmiSwitchChain();
  const { prices, loading: pricesLoading, canRefresh, fetchPrices } = usePrices();
  const {
    ethBalances,
    tokenBalances,
    loading: balancesLoading,
    refetch: refetchBalances,
  } = useAllBalances(address);

  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [sendPrefill, setSendPrefill] = useState<SendPrefill | null>(null);
  const [tokenTotalUsd, setTokenTotalUsd] = useState(0);
  const [receiveTokenInfo, setReceiveTokenInfo] = useState<ReceiveTokenInfo | null>(null);

  const isConnected = isWeb3AuthConnected || isWagmiConnected;
  const chainId = chain?.id || ARBITRUM_CHAIN_ID;

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleDisconnect = async () => {
    try {
      if (isWeb3AuthConnected) await disconnectWeb3Auth();
      if (isWagmiConnected) disconnectWagmi();
    } catch {
      // ignore
    }
    router.push("/");
  };

  const copyAddress = () => {
    if (address) navigator.clipboard.writeText(address);
  };

  const handleRefresh = () => {
    if (!canRefresh) return;
    fetchPrices();
    refetchBalances();
  };

  // Pending scan data — deferred until chain switch completes
  const [pendingScan, setPendingScan] = useState<SendPrefill | null>(null);

  const handleScanResult = useCallback(async (data: { address: string; token?: string; amount?: string; chainId?: number }) => {
    const prefill: SendPrefill = {
      address: data.address,
      token: data.token,
      amount: data.amount,
    };

    // Auto switch chain if QR specifies a different chain
    const needsSwitch = data.chainId && data.chainId !== chain?.id;
    if (needsSwitch) {
      const chainMap: Record<number, string> = {
        [ETHEREUM_CHAIN_ID]: "0x1",
        [ARBITRUM_CHAIN_ID]: "0xa4b1",
      };
      const hexChainId = chainMap[data.chainId!];
      if (hexChainId) {
        // Store prefill, open modal after chain switch propagates
        setPendingScan(prefill);
        try {
          await web3AuthSwitch(hexChainId);
        } catch {
          try {
            wagmiSwitch({ chainId: data.chainId! });
          } catch {
            // ignore
          }
        }
        return; // Don't open modal yet — useEffect below handles it
      }
    }

    // No chain switch needed — open immediately
    setSendPrefill(prefill);
    setSendOpen(true);
  }, [chain?.id, web3AuthSwitch, wagmiSwitch]);

  // Open SendModal after chain switch has propagated to React state
  useEffect(() => {
    if (pendingScan && chain?.id) {
      setSendPrefill(pendingScan);
      setPendingScan(null);
      setSendOpen(true);
    }
  }, [chain?.id, pendingScan]);

  const handleSendClose = () => {
    setSendOpen(false);
    setSendPrefill(null);
  };

  const handleTokenClick = useCallback((token: TokenInfo) => {
    setReceiveTokenInfo({
      token,
      chainId,
      chainName: chain?.name || "Ethereum",
    });
    setReceiveOpen(true);
  }, [chainId, chain?.name]);

  const handleReceiveClose = () => {
    setReceiveOpen(false);
    setReceiveTokenInfo(null);
  };

  if (!isConnected || !address) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const displayName = userInfo?.name || userInfo?.email || shortenAddress(address);

  // Current chain ETH balance (for wallet card display)
  const ethBalance = ethBalances[chainId] || 0;
  const ethUsd = ethBalance * (prices["ETH"] || 0);

  // Total USD for current chain (ETH is already included in tokenBalances)
  let totalUsd = 0;
  const bals = tokenBalances[chainId] || {};
  for (const [symbol, amount] of Object.entries(bals)) {
    totalUsd += amount * (prices[symbol] || 0);
  }

  return (
    <Box minHeight="100vh" px={2} py={2} pb={12} maxWidth={480} mx="auto">
      {/* Top bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={800}>
          PepePag
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <ChainSwitcher />
          <IconButton size="small" onClick={toggleTheme}>
            {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
          <IconButton size="small" onClick={handleDisconnect} color="error">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Wallet card */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          background: (t) =>
            t.palette.mode === "dark"
              ? "linear-gradient(135deg, #1E2329, #2B3139)"
              : "linear-gradient(135deg, #FFFFFF, #F0F0F0)",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {displayName}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                {shortenAddress(address)}
              </Typography>
              <IconButton size="small" onClick={copyAddress} sx={{ p: 0.3 }}>
                <ContentCopyIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Total USD balance (all chains combined) */}
        <Typography variant="h3" fontWeight={800} letterSpacing={-1}>
          {balancesLoading && pricesLoading ? (
            <CircularProgress size={28} />
          ) : (
            formatUsd(totalUsd)
          )}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.8} mt={0.3}>
          <Avatar
            src="/tokens/eth.png"
            alt="ETH"
            sx={{ width: 18, height: 18 }}
          />
          <Typography variant="body2" color="text.secondary">
            {`${ethBalance.toFixed(4)} ETH`}
            {ethUsd > 0 && ` ≈ ${formatUsd(ethUsd)}`}
          </Typography>
        </Box>

        {/* Send / Receive buttons */}
        <Stack direction="row" spacing={1.5} mt={2.5}>
          <Button
            variant="contained"
            startIcon={<CallMadeIcon />}
            onClick={() => setSendOpen(true)}
            sx={{ flex: 1, borderRadius: 2, py: 1, fontWeight: 600 }}
          >
            Send
          </Button>
          <Button
            variant="outlined"
            startIcon={<CallReceivedIcon />}
            onClick={() => { setReceiveTokenInfo(null); setReceiveOpen(true); }}
            sx={{
              flex: 1,
              borderRadius: 2,
              py: 1,
              fontWeight: 600,
              borderColor: "divider",
              color: "text.primary",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            Receive
          </Button>
        </Stack>
      </Paper>

      {/* Token balances */}
      <Paper sx={{ p: 2, borderRadius: 3, mt: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} px={0.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Tokens
          </Typography>
          <Tooltip title={canRefresh ? "Refresh prices & balances" : "Wait 1 min between refreshes"}>
            <span>
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={!canRefresh || pricesLoading}
              >
                <RefreshIcon
                  fontSize="small"
                  sx={{
                    animation: pricesLoading ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <TokenList
          prices={prices}
          tokenBalances={tokenBalances}
          loading={balancesLoading}
          onTotalUsd={setTokenTotalUsd}
          onTokenClick={handleTokenClick}
        />
      </Paper>

      {/* Placeholder for AI chat — Step 4 */}
      <Paper sx={{ p: 3, borderRadius: 3, mt: 2, opacity: 0.4 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          AI Chat + Swap — coming soon
        </Typography>
      </Paper>

      {/* Bottom Nav — Scan QR button */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pb: 3,
          pt: 1,
          background: (t) =>
            `linear-gradient(transparent, ${t.palette.background.default} 40%)`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <Fab
          color="primary"
          onClick={() => setScannerOpen(true)}
          sx={{
            pointerEvents: "auto",
            width: 56,
            height: 56,
            boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
          }}
        >
          <QrCodeScannerIcon />
        </Fab>
      </Box>

      {/* Modals */}
      <SendModal open={sendOpen} onClose={handleSendClose} prefill={sendPrefill} />
      <ReceiveModal open={receiveOpen} onClose={handleReceiveClose} tokenInfo={receiveTokenInfo} />
      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanResult}
      />
    </Box>
  );
}
