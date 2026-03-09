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
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CallMadeIcon from "@mui/icons-material/CallMade";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import RefreshIcon from "@mui/icons-material/Refresh";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { useThemeMode } from "@/lib/ThemeContext";
import { usePrices, formatUsd } from "@/lib/usePrices";
import ChainSwitcher from "@/components/wallet/ChainSwitcher";
import TokenList from "@/components/wallet/TokenList";
import SendModal, { type SendPrefill } from "@/components/wallet/SendModal";
import ReceiveModal from "@/components/wallet/ReceiveModal";
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
  const { address, isConnected: isWagmiConnected } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({ address });
  const { prices, loading: pricesLoading, canRefresh, fetchPrices } = usePrices();

  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [sendPrefill, setSendPrefill] = useState<SendPrefill | null>(null);
  const [tokenTotalUsd, setTokenTotalUsd] = useState(0);

  const isConnected = isWeb3AuthConnected || isWagmiConnected;

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
    refetchBalance();
  };

  const handleScanResult = useCallback((data: { address: string; token?: string; amount?: string }) => {
    setSendPrefill({
      address: data.address,
      token: data.token,
      amount: data.amount,
    });
    setSendOpen(true);
  }, []);

  const handleSendClose = () => {
    setSendOpen(false);
    setSendPrefill(null);
  };

  if (!isConnected || !address) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const displayName = userInfo?.name || userInfo?.email || shortenAddress(address);
  const ethBalance = Number(formatUnits(balance?.value ?? 0n, balance?.decimals ?? 18));
  const ethUsd = ethBalance * (prices["ETH"] || 0);
  const totalUsd = ethUsd + tokenTotalUsd;

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

        {/* Total USD balance */}
        <Typography variant="h3" fontWeight={800} letterSpacing={-1}>
          {balanceLoading || pricesLoading ? (
            <CircularProgress size={28} />
          ) : (
            formatUsd(totalUsd)
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.3}>
          {balanceLoading ? "" : `${ethBalance.toFixed(4)} ETH`}
        </Typography>

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
            onClick={() => setReceiveOpen(true)}
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
        <TokenList prices={prices} onTotalUsd={setTokenTotalUsd} />
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
      <ReceiveModal open={receiveOpen} onClose={() => setReceiveOpen(false)} />
      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanResult}
      />
    </Box>
  );
}
